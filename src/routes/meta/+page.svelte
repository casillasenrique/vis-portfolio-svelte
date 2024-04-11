<script>
  import * as d3 from 'd3';
  import { onMount } from 'svelte';
  import Stats from '$lib/components/Stats.svelte';
  import Pie from '$lib/components/Pie.svelte';
  import { fade } from 'svelte/transition';
  import { computePosition, autoPlacement, offset } from '@floating-ui/dom';
  import FileLines from './FileLines.svelte';

  let blameData = [];
  let svg;
  let commits = [];

  onMount(async () => {
    blameData = await d3.csv('loc.csv', (row) => ({
      ...row,
      line: +row.line,
      depth: +row.depth,
      length: +row.length,
      date: new Date(row.date + 'T00:00' + row.timezone),
      datetime: new Date(row.datetime),
    }));
    console.log(blameData);

    commits = d3
      .groups(blameData, (d) => d.commit)
      .map(([commit, lines]) => {
        let first = lines[0];
        let { author, date, time, timezone, datetime } = first;
        let ret = {
          id: commit,
          url:
            'https://github.com/casillasenrique/vis-portfolio-svelte/commit/' +
            commit,
          author,
          date,
          time,
          timezone,
          datetime,
          hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
          totalLines: lines.length,
        };

        // Like ret.lines = lines
        // but non-enumerable so it doesn’t show up in JSON.stringify
        Object.defineProperty(ret, 'lines', {
          value: lines,
          configurable: true,
          writable: true,
          enumerable: false,
        });

        return ret;
      });
  });

  $: d3.sort(commits, (d) => -d.totalLines);

  $: fileLengths = d3.rollups(
    blameData,
    (v) => d3.max(v, (v) => v.line),
    (d) => d.file,
  );
  $: meanFileLength = d3.mean(fileLengths, (d) => d[1]);

  $: files = d3.group(blameData, (d) => d.file);

  let maxPeriod = '';
  $: {
    let workByPeriod = d3.rollups(
      blameData,
      (v) => v.length,
      (d) => d.datetime.toLocaleString('en', { dayPeriod: 'short' }),
    );
    maxPeriod = d3.greatest(workByPeriod, (d) => d[1])?.[0];
  }

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
      d3.extent(filteredCommits, (d) => d.datetime),
      [usableArea.left, usableArea.right],
    )
    .nice();
  $: console.log(xScale());

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
      hoveredCommit = filteredCommits[hoveredIndex];
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

  let selectedCommits = [];

  function brushed(evt) {
    let brushSelection = evt.selection;
    selectedCommits = !brushSelection
      ? []
      : filteredCommits.filter((commit) => {
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

  $: hasSelection = selectedCommits.length;

  $: selectedLines = (hasSelection ? selectedCommits : commits).flatMap(
    (d) => d.lines,
  );
  $: languageBreakdown = d3.rollup(
    selectedLines,
    (amount) => amount.length,
    (lang) => lang.type,
  );

  // Lab 9
  let commitProgress = 100;

  $: timeScale = d3.scaleTime(
    d3.extent(commits, (d) => d.datetime),
    [0, 100],
  );
  $: commitMaxTime = timeScale.invert(commitProgress);

  $: filteredCommits = commits.filter(
    (d) => d.datetime <= timeScale.invert(commitProgress),
  );
</script>

<h1>Meta</h1>

<p>Metadata about this website's code</p>

<Stats
  stats={[
    { label: 'Total LOC', value: blameData.length },
    { label: 'Total Commits', value: commits.length },
    { label: 'Total Files', value: files.size },
    { label: 'Mean file length', value: Math.round(meanFileLength) },
    { label: 'Most work done', value: maxPeriod },
  ]}
/>

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
    {#each filteredCommits as commit, i}
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

<p>{hasSelection ? selectedCommits.length : 'No'} commits selected</p>

<!-- <Stats stats={languageBreakdown} /> -->

<Pie
  pieData={Array.from(languageBreakdown).map(([language, lines]) => ({
    label: language,
    value: lines,
  }))}
/>

<label class="time-filter">
  Max time: {commitProgress}
  <input type="range" bind:value={commitProgress} />
  <time
    >{commitMaxTime.toLocaleString('en', {
      dateStyle: 'long',
      timeStyle: 'short',
    })}</time
  >
</label>

<FileLines lines={selectedLines} />

<style>
  .time-filter {
    position: sticky;
    top: 1em;
    z-index: 1;
    background: white;
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 0.5em;
    margin-block: 1.5em;

    time {
      grid-column: 2;
      text-align: right;
    }
  }
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
