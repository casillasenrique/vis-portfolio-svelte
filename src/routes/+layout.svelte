<script>
  import '../style.css';
  import Navbar from '../lib/components/Navbar.svelte';

  let localStorage = globalThis.localStorage ?? {}
  let colorScheme = localStorage.colorScheme ?? 'light dark';
  $: globalThis.document?.documentElement.style.setProperty(
    'color-scheme',
    colorScheme,
    );
    
    $: localStorage.colorScheme = colorScheme;
  </script>

<label class="color-scheme">
  Theme:
  <select bind:value={colorScheme}>
    <option value="light dark">Automatic</option>
    <option value="dark">Dark</option>
    <option value="light">Light</option>
  </select>
</label>

<Navbar />
<slot />

<style>
  .color-scheme {
    position: absolute;
    top: 1rem;
    right: 1rem;

    font-size: 80%;
  }
</style>
