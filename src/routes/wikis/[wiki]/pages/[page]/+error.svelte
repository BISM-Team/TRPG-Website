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
      goto(`/`);
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

<div id="content" class="text-center">
  {#if actualStatus === 200}
    <span />
  {:else if actualStatus === 404}
    <h2 class="m-xxl h2">Page not yet created</h2>
    <p class="mt-l mb-m">Would you like to create it?</p>
    <form id="btnContainer" method="post" action="?/create" use:enhance={createPage}>
      <button {disabled} class="btn-secondary" type="button" on:click={goBack}>No</button>
      <button {disabled} class="btn-primary" type="submit">Yes</button>
    </form>
  {:else if actualStatus === 403}
    <h2 class="m-xxl h2">You are not allowed to view this page!</h2>
    <button {disabled} class="btn-secondary" type="button" on:click={goBack}>Go back</button>
  {:else if actualStatus === 500}
    <h2 class="m-xxl h2">Server Error, please try again.</h2>
  {:else if actualStatus === 400 && $page.error}
    <h2 class="m-xxl h2">{$page.error.message}</h2>
  {:else}
    <h2>Unknown Error, please try again.</h2>
    <p>{actualStatus}: {JSON.stringify($page.form)}</p>
  {/if}
</div>
