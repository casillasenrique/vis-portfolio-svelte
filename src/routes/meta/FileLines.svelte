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
  {/each}
</dl>
