<script lang="ts">
  import type { ActionData, PageData } from "./$types";
  import Toolbar from "$lib/components/toolbar.svelte";
  import { enhance } from "$app/forms";
  import DashboardGrid from "$lib/components/Dashboard/dashboardGrid.svelte";
  import Menu from "$lib/components/Dashboard/menu.svelte";
  import Create from "$lib/components/Dashboard/create.svelte";
  import Save from "$lib/components/Dashboard/save.svelte";
  import Modal from "$lib/components/modal.svelte";
  import ErrorBar from "$lib/components/error_bar.svelte";

  export let data: PageData;
  export let form: ActionData;

  let menu: Menu;
  let create: Create;
  let save: Save;
  
  let edit = false;
  let edited = false;
  let disable = false;
  let removedCards: string[] = [];
  let removedNumVar: string[] = [];
  let removedStrVar: string[] = [];

  function closeError() {
    if(form?.client_error) form.client_error = false;
    if(form?.server_error) form.server_error = false;
  }
</script>

<Toolbar>
  {#if edit}
    <form action="?/save" style="display: none" id="hiddenSaveForm" method="post" use:enhance={save.submitSave}>
      <input type="hidden" name="dashboardId" value={data.dashboard.id} />
      <input type="hidden" name="switch" value="false">
    </form>
    <button disabled={disable || !edited} id="saveButton" class="w3-button" type="submit" form="hiddenSaveForm">
      <span class="material-symbols-outlined w3-text-white">save</span>
    </button>
    <button disabled={disable} id="newButton" class="w3-button" on:click={create.toggle}>
      <span class="material-symbols-outlined w3-text-white">add</span>
    </button>
  {/if}
  <button disabled={disable} id="editButton" class="w3-button" on:click={save.toggleEdit}>
    <span class="material-symbols-outlined w3-text-white">{edit ? "visibility" : "edit"}</span>
  </button>
  <button disabled={disable} id="menuButton" class="w3-button" on:click={menu.toggle}>
    <span class="material-symbols-outlined w3-text-white">more_horiz</span>
  </button>
</Toolbar>

<Save   dashboard={data.dashboard} bind:edit={edit} bind:edited={edited} bind:disable={disable} 
        bind:removedCards={removedCards} bind:removedNumVar={removedNumVar} bind:removedStrVar={removedStrVar} bind:this={save}/>

<Create bind:dashboard={data.dashboard} dashboardId={data.params.dashboard} bind:edited={edited} bind:disable={disable} bind:this={create}/>

<Menu   dashboard={data.dashboard} bind:disable={disable} bind:this={menu} bind:edited={edited}  bind:edit={edit} deleteRedirectUrl={`/campaign/${data.params.campaign}/dashboards`}
        bind:removedCards={removedCards} bind:removedNumVar={removedNumVar} bind:removedStrVar={removedStrVar}/>

<DashboardGrid bind:dashboard={data.dashboard} bind:edited={edited} bind:disable={disable} bind:removedCards={removedCards} {edit}/>

{#if form?.client_error || form?.server_error}
  <Modal disable={disable} on:close={closeError}>
    {#if form?.client_error}
    <ErrorBar text={'Client Error, please try again or contact us!'}/>
    {:else if form?.server_error}
    <ErrorBar text={'Server Error, please contact us!'}/>
    {/if}
  </Modal>
{/if}