<script>
  import { page } from '$app/stores';

  let pages = [
    { url: './', title: 'Home' },
    { url: './projects', title: 'Projects' },
    { url: './resume', title: 'Resume' },
    { url: './contact', title: 'Contact' },
    { url: './meta', title: 'Meta' },
    { url: 'https://github.com/casillasenrique', title: 'GitHub' },
  ];
</script>

<nav>
  {#each pages as p}
    {#if p.url.startsWith('http')}
      <!-- Outgoing link -->
      <a href={p.url} target="_blank" rel="noopener noreferrer">
        {p.title}
      </a>
    {:else}
      <!-- Navigation link -->
      <a href={p.url} class:current={'.' + $page.route.id === p.url}>
        {p.title}
      </a>
    {/if}
  {/each}
</nav>

<style>
  nav {
    --border-color: oklch(50% 10% 200 / 40%);

    display: flex;

    margin-bottom: 0.5rem;
    border-bottom: 1px solid var(--border-color);

    a {
      flex: 1;

      text-decoration: none;
      color: inherit;
      text-align: center;
      padding: 0.5em;
      transition:
        border 0.1s ease,
        background-color 0.1s ease;
    }

    a:hover {
      border-bottom: 0.4em solid var(--accent-color);
      padding-bottom: 0.1em;
      font-weight: bold;
      background-color: color-mix(in oklch, var(--accent-color), canvas 85%);
    }

    .current {
      border-bottom: 0.4em solid var(--border-color);
      padding-bottom: 0.1em;
      font-weight: bold;
    }
  }
</style>
