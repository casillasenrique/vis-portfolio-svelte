<script>
  import Project from '$lib/components/Project.svelte';
  import projects from '$lib/assets/projects.json';
  import Stats from '../lib/components/Stats.svelte';
  import { onMount } from 'svelte';

  export let data;
</script>

<h1>Enrique Casillas</h1>
<p>This is my portfolio website. So cool!</p>
<img src="./images/cat.png" alt="Nerdy cat" />

<Stats
  stats={[
    { name: 'Followers', value: data.githubData.followers },
    { name: 'Following', value: data.githubData.following },
    { name: 'Repositories', value: data.githubData.public_repos },
  ]}
/>
<!-- 
{#if githubDataPromise}
  {#await githubDataPromise}
    <p>Loading...</p>
  {:then response}
    {#await response.json()}
      <p>Decoding...</p>
    {:then data}
      <Stats
        stats={[
          { name: 'Followers', value: data.followers },
          { name: 'Following', value: data.following },
          { name: 'Repositories', value: data.public_repos },
        ]}
      />
    {:catch error}
      <p class="error">
        Something went wrong: {error.message}
      </p>
    {/await}
  {:catch error}
    <p class="error">
      Something went wrong: {error.message}
    </p>
  {/await}
{/if} -->

<h2>Featured Projects</h2>
<div class="projects">
  {#each projects.slice(0, 3) as projectData (projectData.title)}
    <Project {projectData} hLevel={3} />
  {/each}
</div>
