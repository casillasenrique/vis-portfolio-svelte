<script>
  import projects from '$lib/assets/projects.json';
  import Project from '$lib/components/Project.svelte';
  import Pie from '$lib/components/Pie.svelte';
  import * as d3 from 'd3';

  let query = '';
  let filteredProjects;
  $: filteredProjects = projects.filter((project) => {
    let values = Object.values(project).join('\n').toLowerCase();
    return values.includes(query.toLowerCase());
  });

  let pieData = {};
  $: {
    let rolledData = d3.rollups(
      filteredProjects,
      (v) => v.length,
      (d) => d.year,
    );
    pieData = rolledData.map(([year, count]) => {
      return { value: count, label: year };
    });
  }

  let selectedYearIndex = -1;
  let selectedYear;
  let filteredProjectsByYear;
  $:{ 
    selectedYear = pieData[selectedYearIndex]?.label
    if (selectedYear) {
      filteredProjectsByYear = filteredProjects.filter((project) => project.year === selectedYear)
    } else {
      filteredProjectsByYear = [...filteredProjects]
    }
  }
  
</script>

<h1>{projects.length} Projects</h1>

<Pie {pieData} bind:selectedIndex={selectedYearIndex} />
{selectedYear}

<input
  type="search"
  bind:value={query}
  aria-label="Search projects"
  placeholder="🔍 Search projects…"
/>

<div class="projects">
  {#each filteredProjectsByYear as project (project.title)}
    <Project projectData={project} />
  {/each}
</div>
