<script>
  import '../style.css';
  import { page } from '$app/stores';
  import Navbar from '../lib/components/Navbar.svelte';

  let pages = [
    { url: './', title: 'Home' },
    { url: './projects', title: 'Projects' },
    { url: './resume', title: 'Resume' },
    { url: './contact', title: 'Contact' },
    { url: 'https://github.com/casillasenrique', title: 'GitHub' },
  ];
</script>

<label class="color-scheme">
  Theme:
  <select>
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
