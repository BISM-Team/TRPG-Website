<script lang="ts">
  import { goto } from "$app/navigation";
  import type { LayoutData } from "./$types";
  export let data: LayoutData;

  async function logout() {
    const response = await fetch("/api/logout", { method: "POST" });
    if(response.ok) await goto("/", { invalidateAll: true })
  }
</script>

<header class="w3-container w3-center w3-teal">
  <h1>BISM Website</h1>
  <nav>
    <a href="/" class="w3-block w3-button">Home</a>
    <a href="/Characters" class="w3-block w3-button">Characters</a>
    <a href="/Campaign" class="w3-block w3-button">Campaign</a>
    {#if data.auth}
      <a href="/logout" data-sveltekit-preload-data="tap" data-sveltekit-preload-code="hover" class="w3-block w3-button" on:click={logout}>Logout</a>
    {:else}
      <a href="/login" class="w3-block w3-button">Login/Signup</a>
    {/if}
  </nav>
</header>

<main>
  <slot />
</main>

<style>
  header {
    padding: 1em;
    padding-bottom: 0;
  }

  h1 {
    margin-top: 0;
  }

  a {
    text-decoration: none;
  }

  nav {
    display: flex;
    flex-direction: row;
    height: 20%;
    width: 100%;
    justify-content: space-evenly;
  }

  :global(form label) {
    display: block;
    margin-bottom: 0.5em;
  }

  :global(form input) {
    display: block;
    margin-bottom: 1em;
  }

  :global(form button) {
    width: 6em;
    margin: 0 1.5em;
    margin-top: 0.5em;
  }

  :global(.cards) {
    width: 100%;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-evenly;
    margin-top: 4em;
    padding: 3em;
  }
</style>
