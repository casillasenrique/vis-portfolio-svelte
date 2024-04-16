<script>
  import * as d3 from 'd3';
  import { fade } from 'svelte/transition';
  import { computePosition, autoPlacement, offset } from '@floating-ui/dom';

  export let commits;
  export let selectedCommits;

  let svg;
  const width = 1000,
    height = 600;

  const margin = { top: 10, right: 10, bottom: 30, left: 20 };

  const usableArea = {
    top: margin.top,
    right: width - margin.right,
    bottom: height - margin.bottom,
    left: margin.left,
  };
  usableArea.width = usableArea.right - usableArea.left;
  usableArea.height = usableArea.bottom - usableArea.top;

  $: yScale = d3.scaleLinear([0, 24], [usableArea.bottom, usableArea.top]);
  $: xScale = d3
    .scaleTime(
      d3.extent(commits, (d) => d.datetime),
      [usableArea.left, usableArea.right],
    )
    .nice();

  let xAxis, yAxis, yAxisGridlines;

  $: {
    d3.select(xAxis).call(d3.axisBottom(xScale));
    d3.select(yAxis).call(
      d3
        .axisLeft(yScale)
        .tickFormat((d) => String(d % 24).padStart(2, '0') + ':00'),
    );
  }
  $: {
    d3.select(yAxisGridlines).call(
      d3.axisLeft(yScale).tickFormat('').tickSize(-usableArea.width),
    );
  }

  /**
   * Tooltip Logic
   */
  let commitTooltip;
  let tooltipPosition = { x: 0, y: 0 };

  let hoveredIndex = -1;
  let hoveredCommit = {};
  $: {
    if (hoveredIndex != -1) {
      hoveredCommit = commits[hoveredIndex];
    }
  }

  async function dotInteraction(i, e) {
    if (e.type === 'mouseenter' || e.type === 'focus') {
      hoveredIndex = i;
      let hoveredDotElement = e.target;
      tooltipPosition = await computePosition(
        hoveredDotElement,
        commitTooltip,
        {
          strategy: 'fixed',
          middleware: [
            offset(5),
            autoPlacement(), // see https://floating-ui.com/docs/autoplacement
          ],
        },
      );
    } else if (e.type === 'mouseleave' || e.type === 'blur') {
      hoveredIndex = -1;
    } else if (e.type === 'click' || e.type === 'keyup') {
      selectedCommits = [commits[i]];
    }
  }

  /**
   * Circle area logic
   */
  $: radiusScale = d3.scaleSqrt(
    d3.extent(commits, (d) => d.totalLines),
    [2, 30],
  );

  /**
   * Brushing logic
   */

  function isCommitSelected(commit) {
    return selectedCommits.includes(commit);
  }

  function brushed(evt) {
    let brushSelection = evt.selection;
    selectedCommits = !brushSelection
      ? []
      : commits.filter((commit) => {
          let min = { x: brushSelection[0][0], y: brushSelection[0][1] };
          let max = { x: brushSelection[1][0], y: brushSelection[1][1] };
          let x = xScale(commit.date);
          let y = yScale(commit.hourFrac);

          return x >= min.x && x <= max.x && y >= min.y && y <= max.y;
        });
  }

  $: {
    d3.select(svg).call(d3.brush().on('start brush end', brushed));
    d3.select(svg).selectAll('.dots, .overlay ~ *').raise();
  }
</script>

<dl
  id="commit-tooltip"
  class="info tooltip"
  bind:this={commitTooltip}
  transition:fade
  role="tooltip"
  style="top: {tooltipPosition.y}px; left: {tooltipPosition.x}px"
  hidden={hoveredIndex === -1}
>
  <dt>Commit</dt>
  <dd><a href={hoveredCommit.url} target="_blank">{hoveredCommit.id}</a></dd>

  <dt>Date</dt>
  <dd>
    {hoveredCommit.datetime?.toLocaleString('en', { dateStyle: 'full' })}
  </dd>

  <!-- Add: Time, author, lines edited -->
  <dt>Time</dt>
  <dd>{hoveredCommit.time?.toLocaleString('en', { timeStyle: 'long' })}</dd>

  <dt>Author</dt>
  <dd>{hoveredCommit.author}</dd>

  <dt>Lines Edited</dt>
  <dd>{hoveredCommit.totalLines}</dd>
</dl>

<h2>Commits by time of day</h2>
<svg viewBox="0 0 {width} {height}" bind:this={svg}>
  <g
    class="gridlines"
    transform="translate({usableArea.left}, 0)"
    bind:this={yAxisGridlines}
  />
  <g transform="translate(0, {usableArea.bottom})" bind:this={xAxis} />
  <g transform="translate({usableArea.left}, 0)" bind:this={yAxis} />
  <g class="dots">
    {#each commits as commit, i (commit.id)}
      <circle
        cx={xScale(commit.datetime)}
        cy={yScale(commit.hourFrac)}
        r={radiusScale(commit.totalLines)}
        class:selected={isCommitSelected(commit)}
        fill="steelblue"
        aria-haspopup="true"
        aria-describedby="commit-tooltip"
        role="button"
        on:click={(e) => dotInteraction(i, e)}
        on:keyup={(e) => dotInteraction(i, e)}
        on:mouseenter={(e) => dotInteraction(i, e)}
        on:mouseleave={(e) => dotInteraction(i, e)}
        on:focus={(e) => dotInteraction(i, e)}
        on:blur={(e) => dotInteraction(i, e)}
        tabindex="0"
      />
    {/each}
  </g>
</svg>

<style>
  svg {
    overflow: visible;
  }

  .gridlines {
    stroke-opacity: 0.2;
  }

  dl.info {
    display: grid;
    grid-template-columns: auto 1fr;
    align-items: baseline;
    margin: 0;

    transition-duration: 500ms;
    transition-property: opacity, visibility;

    dt,
    dd {
      padding: 0.1em 0.5em;
    }

    dt {
      color: hsl(220 10 50);
      text-transform: uppercase;
      font-size: 85%;
      font-weight: 500;
      text-align: right;
    }

    dd {
      margin: 0;
    }

    &[hidden]:not(:hover, :focus-within) {
      opacity: 0;
      visibility: hidden;
    }
  }

  .tooltip {
    position: fixed;
    top: 1em;
    left: 1em;
    padding: 1em;

    background-color: oklch(100% 0% 0 / 80%);
    box-shadow: 0px 0px 5px oklch(0% 0% 0 / 50%);
    border-radius: 1rem;
    backdrop-filter: blur(1px);
  }

  circle {
    transition: 200ms;
    transform-origin: center;
    transform-box: fill-box;
    fill-opacity: 0.5;

    &:hover,
    &.selected {
      transform: scale(1.5);
      cursor: pointer;
      fill-opacity: 1;
    }

    &.selected {
      fill: rgba(255, 59, 59, 0.9);
    }

    @starting-style {
      r: 0;
    }
  }

  @keyframes marching-ants {
    to {
      stroke-dashoffset: -8; /* 5 + 3 */
    }
  }

  svg :global(.selection) {
    fill-opacity: 10%;
    stroke: black;
    stroke-opacity: 70%;
    stroke-dasharray: 5 3;
    animation: marching-ants 2s linear infinite;
  }
</style>
