<script lang="ts">
  import type { SubmitFunction } from "@sveltejs/kit";
  import { goto, afterNavigate } from "$app/navigation";
  import { page } from "$app/stores";
  import { enhance } from "$app/forms";

  let disable = false;
  let previousUrl: string | undefined = undefined;
  let actualStatus: number;
  $: actualStatus = $page.status === 204 ? 404 : $page.status;

  afterNavigate(({ from, to }) => {
    previousUrl = from !== to ? from?.url.toString() : "./index";
    console.log(from?.url.pathname.toString(), to?.url.pathname.toString());
    if (from?.url.pathname.toString().endsWith(`/index`) && to?.url.toString().endsWith(`/index`)) {
      goto("/campaign/" + $page.params.campaign);
    }
    if ($page.status === 401) goto("/login");
  });

  async function goBack() {
    await goto(previousUrl || "./index");
  }

  const createPage: SubmitFunction = async function () {
    disable = true;
    return async ({ update }) => {
      await update({reset: false});
      disable = false;
    };
  };
</script>

<div id="content" class="w3-center w3-padding-32">
  {#if actualStatus === 200}
    <span></span>
  {:else if actualStatus === 404}
    <h1 class="w3-section w3-padding">Page not yet created</h1>
    <p>Do you want to create it?</p>
    <form id="btnContainer" class="w3-container" method="post" action="?/create" use:enhance={createPage}>
      <button disabled={disable} class="w3-margin w3-button w3-grey" type="button" on:click={goBack}>No</button>
      <button disabled={disable} class="w3-margin w3-button w3-teal" type="submit">Yes</button>
    </form>
  {:else if actualStatus === 403}
    <h1 class="w3-section w3-padding">You are not allowed to view this page!</h1>
    <button disabled={disable} class="w3-margin w3-button w3-teal" type="submit">Yes</button>
  {:else if actualStatus === 500}
    <h1 class="w3-center">Server Error, please try again.</h1>
  {:else if actualStatus === 400 && $page.error}
    <h1 class="w3-center">{$page.error.message}</h1>
  {:else}
    <h1>Unknown Error, please try again.</h1>
    <p>{actualStatus}: {JSON.stringify($page.form)}</p>
  {/if}
</div>

<style>
  h1 {
    font-size: xx-large;
  }

  button {
    width: 4em;
  }
</style>
