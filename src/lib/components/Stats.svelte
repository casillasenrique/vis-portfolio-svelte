<script>
  export let stats;
</script>

<dl>
  {#each stats as stat (stat.name)}
    <dt>
      {stat.name}
    </dt>
    <dd>{stat.value}</dd>
  {/each}
</dl>

<style>
  dl {
    display: grid;
  }

  dt {
    display: grid;
    grid-row: -1;
    
    text-transform: uppercase;
  }
  
  dd {
    font-weight: lighter;
    margin: 0;
    font-size: 2rem;
  }
</style>
