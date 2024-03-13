<script>
  import * as d3 from 'd3';

  export let pieData;

  export let selectedIndex = -1;

  let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);

  let sliceGenerator = d3.pie().value((d) => d.value);

  let arcs;
  $: {
    let arcData = sliceGenerator(pieData);
    arcs = arcData.map((d) => arcGenerator(d));
  }

  let colors = d3.scaleOrdinal(d3.schemeTableau10);

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
</script>

<div class="container">
  <svg viewBox="-50 -50 100 100">
    {#each arcs as path, i}
      <path
        d={path}
        fill={selectedIndex === i ? 'oklch(60% 45% 0)' : colors(i)}
        on:click={() => toggleWedge(i)}
        on:keyup={(e) => toggleWedge(i, e)}
        tabindex="0"
        role="button"
        aria-label="Select"
      />
    {/each}
  </svg>

  <ul class="legend">
    {#each pieData as d, i}
      <li style="--color: {colors(i)}">
        <span class="swatch" style="background-color: {colors(i)};"></span>
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
    transition: 300ms;
    outline: none;
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
</style>
