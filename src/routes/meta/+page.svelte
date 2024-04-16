<script>
  import * as d3 from 'd3';
  import { onMount } from 'svelte';
  import Stats from '$lib/components/Stats.svelte';
  import Pie from '$lib/components/Pie.svelte';

  import FileLines from './FileLines.svelte';
  import Scatterplot from './Scatterplot.svelte';

  import Scrolly from 'svelte-scrolly';

  let blameData = [];
  let commits = [];
  let selectedCommits = [];

  let colors = d3.scaleOrdinal(d3.schemeTableau10);

  onMount(async () => {
    blameData = await d3.csv('loc.csv', (row) => ({
      ...row,
      line: +row.line,
      depth: +row.depth,
      length: +row.length,
      date: new Date(row.date + 'T00:00' + row.timezone),
      datetime: new Date(row.datetime),
    }));

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

  $: hasSelection = selectedCommits.length;

  $: selectedLines = (hasSelection ? selectedCommits : commits).flatMap(
    (d) => d.lines,
  );

  $: filteredLines = selectedLines.filter(
    (d) => d.datetime <= timeScale.invert(commitProgress),
  );

  $: languageBreakdown = d3.rollup(
    filteredLines,
    (amount) => amount.length,
    (lang) => lang.type,
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

<FileLines lines={filteredLines} {colors} />

<Stats
  stats={Array.from(languageBreakdown).map(([language, lines]) => ({
    label: language,
    value: lines,
  }))}
/>

<Scrolly bind:progress={commitProgress}>
  {#each commits as commit, index}
    <p>
      On {commit.datetime.toLocaleString('en', {
        dateStyle: 'full',
        timeStyle: 'short',
      })}, I made
      <a href={commit.url} target="_blank"
        >{index > 0
          ? 'another glorious commit'
          : 'my first commit, and it was glorious'}</a
      >. I edited {commit.totalLines} lines across {d3.rollups(
        commit.lines,
        (D) => D.length,
        (d) => d.file,
      ).length} files. Then I looked over all I had made, and I saw that it was very
      good. This part of the lab demonstrates using scrollytelling to tell a narrative.
      The accompanying visualization describes how the commits change over time.
    </p>
  {/each}
  <svelte:fragment slot="viz">
    <Scatterplot commits={filteredCommits} bind:selectedCommits />

    <p>{hasSelection ? selectedCommits.length : 'No'} commits selected</p>

    <Pie
      pieData={Array.from(languageBreakdown).map(([language, lines]) => ({
        label: language,
        value: lines,
      }))}
      {colors}
    />
    <!-- Visualizations here -->
  </svelte:fragment>
</Scrolly>

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
</style>
