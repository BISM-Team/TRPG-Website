<script lang="ts">
  import type { ActionData, PageData } from "./$types";
  import Toolbar from "$lib/components/toolbar.svelte";
  import { enhance } from "$app/forms";
  import DashboardGrid from "./dashboardGrid.svelte";
  import Menu from "./menu.svelte";
  import Delete from "./delete.svelte";
  import Create from "./create.svelte";
  import Save from "./save.svelte";

  export let data: PageData;
  export let form: ActionData;

  let menu: Menu;
  let create: Create;
  let deleteDialog: Delete;
  let save: Save;
  
  let edit = false;
  let edited = false;
  let disable = false;
  let removed: string[] = [];
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
    <button disabled={disable} id="deleteButton" class="w3-button" on:click={deleteDialog.toggle}>
      <span class="material-symbols-outlined w3-text-white">delete</span>
    </button>
    <button disabled={disable} id="newButton" class="w3-button" on:click={create.toggle}>
      <span class="material-symbols-outlined w3-text-white">add</span>
    </button>
    <button disabled={disable} id="menuButton" class="w3-button" on:click={menu.toggle}>
      <span class="material-symbols-outlined w3-text-white">more_horiz</span>
    </button>
  {/if}
  <button disabled={disable} id="editButton" class="w3-button" on:click={save.toggleEdit}>
    <span class="material-symbols-outlined w3-text-white">{edit ? "visibility" : "edit"}</span>
  </button>
</Toolbar>

<Save {data} {form} bind:edit={edit} bind:edited={edited} bind:disable={disable} bind:removed={removed} bind:this={save}/>
<Create {data} bind:edited={edited} bind:disable={disable} bind:this={create}/>
<Delete {data} bind:edit={edit} bind:disable={disable} bind:this={deleteDialog}/>
<Menu bind:disable={disable} bind:this={menu}/>

<DashboardGrid bind:data={data} bind:edited={edited} bind:disable={disable} bind:removed={removed} {edit}/>