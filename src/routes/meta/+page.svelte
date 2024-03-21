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

  const yScale = d3.scaleLinear([0, 24], [0, height]);
  $: xScale = d3
    .scaleTime(d3.extent(commits, (d) => d.datetime), [0, width])
    .nice();
  $: console.log(xScale());
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
</style>
