<script lang="ts">
  import type { LayoutData } from "./$types";
  export let data: LayoutData;

  import { onMount } from 'svelte'
  import { pwaInfo } from 'virtual:pwa-info'
  
  onMount(async () => {
    if (pwaInfo) {
      const { registerSW } = await import('virtual:pwa-register')
      registerSW({
        immediate: true,
        onRegistered(r) {
          // uncomment following code if you want check for updates
          // r && setInterval(() => {
          //    console.log('Checking for sw update')
          //    r.update()
          // }, 20000 /* 20s for testing purposes */)
          console.log(`SW Registered: ${r}`)
        },
        onRegisterError(error) {
          console.log('SW registration error', error)
        }
      })
    }
  })
  
  $: webManifest = pwaInfo ? pwaInfo.webManifest.linkTag : ''
</script>

<svelte:head>
    {@html webManifest}
</svelte:head>

<header class="w3-container w3-center w3-teal">
  <h1>BISM Website</h1>
  <nav>
    <a href="/" class="w3-block w3-button">Home</a>
    <a href="/GameWiki" class="w3-block w3-button">Game Wiki</a>
    <a href="/Campaign" class="w3-block w3-button">Campaign</a>
    {#if data.auth}
      <a href="/logout" data-sveltekit-preload-data="tap" data-sveltekit-preload-code="hover" class="w3-block w3-button">Logout</a>
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
</style>
