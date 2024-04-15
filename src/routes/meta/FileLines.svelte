<script>
  import * as d3 from 'd3';
  export let lines;

  let files = [];
  $: {
    files = d3
      .groups(lines, (d) => d.file)
      .map(([name, lines]) => {
        return { name, lines };
      });
  }
</script>

<dl class="files">
  {#each files as file (file.name)}
    <div>
      <dt>
        <code>{file.name}</code>
      </dt>
      <dd>
        {file.lines.length} lines
      </dd>
    </div>
    {#each file.lines as line (line.line)}
      <div class="line"></div>
    {/each}
  {/each}
</dl>

<style>
  dl {
    display: grid;

    & > div {
      grid-column: 1 / -1;
      display: grid;
      grid-template-columns: subgrid;
    }
  }

  .line {
    display: flex;
    width: 0.5em;
    aspect-ratio: 1;
    background: steelblue;
    border-radius: 50%;
  }
</style>
