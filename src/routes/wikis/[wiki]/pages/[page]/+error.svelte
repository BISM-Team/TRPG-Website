<script lang="ts">
  import type { SubmitFunction } from '@sveltejs/kit';
  import { goto, afterNavigate } from '$app/navigation';
  import { page } from '$app/stores';
  import { enhance } from '$app/forms';

  let disabled = false;
  let previousUrl: string | undefined = undefined;
  let actualStatus: number;
  $: actualStatus = $page.status === 204 ? 404 : $page.status;

  afterNavigate(({ from, to }) => {
    previousUrl = from !== to ? from?.url.toString() : './index';
    if (from?.url.pathname.toString().endsWith(`/index`) && to?.url.toString().endsWith(`/index`)) {
      goto(`/wikis/${$page.params.wiki}/pages/index`);
    }
    if ($page.status === 401) goto('/login');
  });

  async function goBack() {
    await goto(previousUrl || './index');
  }

  const createPage: SubmitFunction = async function () {
    disabled = true;
    return async ({ update }) => {
      await update({ reset: false });
      disabled = false;
    };
  };
</script>

<div id="content" class="p-2 text-center">
  {#if actualStatus === 200}
    <span />
  {:else if actualStatus === 404}
    <h1 class="w3-section w3-padding h1">Page not yet created</h1>
    <p>Do you want to create it?</p>
    <form
      id="btnContainer"
      class="w3-container"
      method="post"
      action="?/create"
      use:enhance={createPage}
    >
      <button {disabled} class="btn-secondary" type="button" on:click={goBack}>No</button>
      <button {disabled} class="btn-primary" type="submit">Yes</button>
    </form>
  {:else if actualStatus === 403}
    <h1 class="w3-section w3-padding h1">You are not allowed to view this page!</h1>
    <button {disabled} class="btn-primary" type="submit">Yes</button>
  {:else if actualStatus === 500}
    <h1 class="h1 text-center">Server Error, please try again.</h1>
  {:else if actualStatus === 400 && $page.error}
    <h1 class="h1 text-center">{$page.error.message}</h1>
  {:else}
    <h1>Unknown Error, please try again.</h1>
    <p>{actualStatus}: {JSON.stringify($page.form)}</p>
  {/if}
</div>

<style lang="postcss">
  h1 {
    font-size: xx-large;
  }

  button {
    width: 4em;
  }
</style>
