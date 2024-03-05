<script>
  export let projectData = {};
  export let hLevel = 2;

  const PLACEHOLDER_IMAGE =
    'https://vis-society.github.io/labs/2/images/empty.svg';
</script>

<article>
  <svelte:element this={`h${hLevel}`}>{projectData.title}</svelte:element>
  <img src={projectData.image ?? PLACEHOLDER_IMAGE} alt="Project screenshot" />
  <p>{projectData.description}</p>
</article>

<style>
  article {
    display: grid;
    grid-template-columns: subgrid;
    grid-row: span 3;

    h2 {
      margin: 0.5em;
    }
  }
</style>
