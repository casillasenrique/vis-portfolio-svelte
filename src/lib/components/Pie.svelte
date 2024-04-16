<script>
  import * as d3 from 'd3';

  export let pieData;

  export let selectedIndex = -1;

  export let colors = d3.scaleOrdinal(d3.schemeTableau10);

  let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);

  let transitionDuration = 200;

  let wedges = {};

  let sliceGenerator = d3
    .pie()
    .value((d) => d.value)
    .sort(null);

  function toggleWedge(wedgeIndex, event) {
    if (event && event.key !== 'Enter') {
      return;
    }

    if (selectedIndex === wedgeIndex) {
      selectedIndex = -1;
    } else {
      selectedIndex = wedgeIndex;
    }
  }
  let cleanPieData;
  let oldPieData;
  $: {
    oldPieData = cleanPieData;
    cleanPieData = d3.sort(pieData, (d) => d.label);
    const arcData = sliceGenerator(cleanPieData);
    const arcs = arcData.map((d) => arcGenerator(d));
    cleanPieData = cleanPieData.map((d, i) => ({
      ...d,
      ...arcData[i],
      arc: arcs[i],
    }));
    transitionArcs();
  }

  function getEmptyArc(label, data = pieData) {
    // Union of old and new labels in the order they appear
    let labels = d3.sort(new Set([...oldData, ...pieData].map((d) => d.label)));
    let labelIndex = labels.indexOf(label);
    let sibling;
    for (let i = labelIndex - 1; i >= 0; i--) {
      sibling = data.find((d) => d.label === labels[i]);
      if (sibling) {
        break;
      }
    }

    let angle = sibling?.endAngle ?? 0;
    return { startAngle: angle, endAngle: angle };
  }

  function sameArc(arc1, arc2) {
    return (
      !(arc1 && arc2) ||
      (arc1.startAngle === arc2.startAngle && arc1.endAngle === arc2.endAngle)
    );
  }

  function transitionArc(wedge, label) {
    label ??= Object.entries(wedges).find(([label, w]) => w === wedge)[0];

    const d = cleanPieData.find((d) => d.label === label);
    const dOld = oldPieData.find((d) => d.label === label);

    if (sameArc(d, dOld)) {
      return null;
    }

    const type = d ? (dOld ? 'update' : 'in') : 'out';

    const from = dOld ? { ...dOld } : getEmptyArc(label, oldPieData);
    const to = d ? { ...d } : getEmptyArc(label, oldPieData);
    const angleInterpolator = d3.interpolate(from, to);
    const interpolator = (t) => `path("${arcGenerator(angleInterpolator(t))}")`;

    return { d, dOld, from, to, interpolator, type };
  }

  function transitionArcs() {
    const wedgeElements = Object.values(wedges);
    const wedgeLabels = Object.keys(wedges);

    d3.selectAll(wedgeElements)
      .transition('arc')
      .duration(transitionDuration)
      .styleTween('d', function (_, index) {
        const wedge = this;
        const label = wedgeLabels[index];
        const transition = transitionArc(wedge, label);
        return transition?.interpolator;
      });
  }

  function arc(wedge) {
    let transition = transitionArc(wedge);

    if (!transition || oldData.length === 0) {
      return;
    }

    return {
      easing: d3.easeCubic,
      duration: transitionDuration,
      css: (t, u) =>
        `d: ${transition.interpolator(transition.type === 'out' ? u : t)}`,
    };
  }
</script>

<div class="container">
  <svg viewBox="-50 -50 100 100">
    {#each cleanPieData as d, i (d.label)}
      <path
        d={d.arc}
        bind:this={wedges[d.label]}
        transition:arc
        fill={selectedIndex === i
          ? 'oklch(60% 45% 0)'
          : colors(d.id ?? d.label)}
        on:click={() => toggleWedge(i)}
        on:keyup={(e) => toggleWedge(i, e)}
        tabindex="0"
        role="button"
        aria-label="Select"
      />
    {/each}
  </svg>

  <ul class="legend">
    {#each cleanPieData as d, i}
      <li style="--color: {colors(d.label)}">
        <span class="swatch" style="background-color: {colors(d.label)};"
        ></span>
        {d.label} <em>({d.value})</em>
      </li>
    {/each}
  </ul>
</div>

<style>
  .container {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  svg {
    max-width: 20em;
    margin-block: 2em;

    /* Do not clip shapes outside the viewBox */
    overflow: visible;
  }

  svg:has(path:hover, path:focus-visible) {
    path:not(:hover, :focus-visible) {
      opacity: 50%;
    }
    cursor: pointer;
  }

  path {
    outline: none;
    fill-opacity: 75%;
    transition: 300ms;
    transition-property: transform, opacity, fill;
  }

  .legend {
    flex: 1;

    border: 1px solid gray;
    border-radius: 5px;
    padding: 1rem;
    list-style: none;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(9em, 1fr));
    gap: 0.5rem;

    li {
      display: flex;
      gap: 0.5rem;
      font-weight: bold;
    }

    em {
      font-weight: initial;
    }

    .swatch {
      width: 1.5em;
      height: 1.5em;
    }
  }

  :global(body) {
    max-width: min(120ch, 80vw);
  }
</style>
