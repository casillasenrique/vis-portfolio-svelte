<script>
  import * as d3 from 'd3';
  import { onMount } from 'svelte';
  import Stats from '$lib/components/Stats.svelte';

  let blameData = [];

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
  });

  $: commits = d3
    .groups(blameData, (d) => d.commit)
    .map(([commit, lines]) => {
      let first = lines[0];
      let { author, date, time, timezone, datetime } = first;
      let ret = {
        id: commit,
        url: 'https://github.com/vis-society/lab-7/commit/' + commit,
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

  $: console.log(commits);

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

  const yScale = d3.scaleLinear([0, 24], [usableArea.bottom, usableArea.top]);
  $: xScale = d3
    .scaleTime(
      d3.extent(commits, (d) => d.datetime),
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
</script>

<h1>Meta</h1>

<p>Metadata about this website's code</p>

<Stats
  stats={[
    { name: 'Total LOC', value: blameData.length },
    { name: 'Total Commits', value: commits.length },
    { name: 'Total Files', value: files.size },
    { name: 'Mean file length', value: meanFileLength },
    { name: 'Most work done', value: maxPeriod },
  ]}
/>

<svg viewBox="0 0 {width} {height}">
  <g
    class="gridlines"
    transform="translate({usableArea.left}, 0)"
    bind:this={yAxisGridlines}
  />
  <g transform="translate(0, {usableArea.bottom})" bind:this={xAxis} />
  <g transform="translate({usableArea.left}, 0)" bind:this={yAxis} />
  <g class="dots">
    {#each commits as commit, index}
      <circle
        cx={xScale(commit.datetime)}
        cy={yScale(commit.hourFrac)}
        r="5"
        fill="steelblue"
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
</style>
