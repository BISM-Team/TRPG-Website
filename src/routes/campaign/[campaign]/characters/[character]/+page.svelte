<script lang="ts">
  import type { ActionData, PageData } from "./$types";
  import Toolbar from "$lib/components/toolbar.svelte";
  import { enhance } from "$app/forms";
  import DashboardGrid from "$lib/components/Dashboard/dashboardGrid.svelte";
  import Menu from "$lib/components/Dashboard/menu.svelte";
  import Delete from "$lib/components/Dashboard/delete.svelte";
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
  let disabled = false;
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
    <button disabled={disabled || !edited} id="saveButton" type="submit" form="hiddenSaveForm">
      <span class="material-symbols-outlined">save</span>
    </button>
    <button {disabled} id="newButton" on:click={create.toggle}>
      <span class="material-symbols-outlined">add</span>
    </button>
  {/if}
  <button {disabled} id="editButton" on:click={save.toggleEdit}>
    <span class="material-symbols-outlined">{edit ? "visibility" : "edit"}</span>
  </button>
  <button {disabled} id="menuButton" on:click={menu.toggle}>
    <span class="material-symbols-outlined">more_horiz</span>
  </button>
</Toolbar>

<Save   dashboard={data.dashboard} bind:edit bind:edited bind:disabled 
        bind:removedCards bind:removedNumVar bind:removedStrVar bind:this={save}/>

<Create bind:dashboard={data.dashboard} dashboardId={data.dashboard.id} bind:edited bind:disabled bind:this={create}/>

<Menu   dashboard={data.dashboard} bind:disabled bind:this={menu} bind:edited  bind:edit deleteRedirectUrl={`/campaign/${data.params.campaign}/characters`}
        bind:removedCards bind:removedNumVar bind:removedStrVar removeFromCampaign={true}/>

<DashboardGrid bind:dashboard={data.dashboard} bind:edited bind:disabled bind:removedCards {edit}/>

{#if form?.client_error || form?.server_error}
  <Modal {disabled} on:close={closeError}>
    {#if form?.client_error}
    <ErrorBar text={'Client Error, please try again or contact us!'}/>
    {:else if form?.server_error}
    <ErrorBar text={'Server Error, please contact us!'}/>
    {/if}
  </Modal>
{/if}