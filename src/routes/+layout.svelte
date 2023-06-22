<script lang="ts">
  import '@skeletonlabs/skeleton/themes/theme-skeleton.css';
  import '@skeletonlabs/skeleton/styles/skeleton.css';
  import "../app.postcss";
  import "$lib/components/Wiki/Heading.svelte";
  import { LightSwitch, storePopup } from '@skeletonlabs/skeleton';
  import { computePosition, autoUpdate, offset, shift, flip, arrow } from '@floating-ui/dom';
  storePopup.set({ computePosition, autoUpdate, offset, shift, flip, arrow });

  import { goto } from "$app/navigation";
  import type { LayoutData } from "./$types";
  import { AppShell, AppBar } from "@skeletonlabs/skeleton";
  import { page } from '$app/stores';
  export let data: LayoutData;

  async function logout() {
    const response = await fetch("/api/logout", { method: "POST" });
    if (response.ok) await goto("/", { invalidateAll: true });
  }

  function isHome() {
    return $page.url.pathname === "/";
  }

  function isActiveRoute(path: string) {
    return $page.url.pathname.startsWith(path);
  }
</script>

<AppShell regionPage="relative" slotPageHeader="sticky top-0 z-10">
	<svelte:fragment slot="header">
    <AppBar >
      <svelte:fragment slot="lead">
        <h1 class="h2">BISM Website</h1>
      </svelte:fragment>
      <nav class="list-nav">
        <ul class="flex flex-row w-full justify-evenly">
          {#key $page.url}
            <li><a class="btn" href="/" class:bg-primary-active-token={isHome()}>Home</a></li>
            <li><a class="btn" href="/characters" class:bg-primary-active-token={isActiveRoute("/characters")}>Characters</a></li>
            <li><a class="btn" href="/campaign" class:bg-primary-active-token={isActiveRoute("/campaign")}>Campaign</a></li>
            <li>
              {#if data.auth}
                <button class="btn" on:click={logout}>Logout</button>
              {:else}
                <a class="btn" href="/login" class:bg-primary-active-token={isActiveRoute("/login")}>Login/Signup</a>
              {/if}
            </li>
          {/key}
        </ul>
      </nav>
      <svelte:fragment slot="trail">
        <LightSwitch />
      </svelte:fragment>
    </AppBar>
  </svelte:fragment>
	<slot />
</AppShell>

<style lang="postcss">
  li > a {
    text-decoration: none;
  }
</style>
