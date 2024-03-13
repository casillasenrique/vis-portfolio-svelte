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
    border: 1px solid gray;
    padding: 1rem;
    border-radius: 0.5rem;
    box-shadow: 0px 5px 3px hsl(0, 0%, 50%, 30%);
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
