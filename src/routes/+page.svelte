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

<h2>GitHub Stats</h2>
<Stats
  stats={[
    { name: 'Followers', value: data.githubData.followers },
    { name: 'Following', value: data.githubData.following },
    { name: 'Repositories', value: data.githubData.public_repos },
    { name: 'Bio', value: data.githubData.bio },
  ]}
/>

<h2>Featured Projects</h2>
<div class="projects">
  {#each projects.slice(0, 3) as projectData (projectData.title)}
    <Project {projectData} hLevel={3} />
  {/each}
</div>
