<script lang="ts">
  import type { ActionData, PageData } from "./$types";
  import Modal from "$lib/components/modal.svelte";
  import Toolbar from "$lib/components/toolbar.svelte";
  import { enhance, type SubmitFunction } from "$app/forms";
  import type { CardData, DashboardTemplate } from "@prisma/client";
  import { stringify } from "devalue";
  import { invalidateAll, goto } from "$app/navigation";
  import DashboardGrid from "./dashboardGrid.svelte";
  import { propagateErrors } from "$lib/utils";
  import Card from "$lib/components/card.svelte";

  export let data: PageData;
  export let form: ActionData;
  
  let edit = false;
  let edited = false;
  let showSaveDialog = false;
  let showCreateDialog = false;
  let menuDialog: { 
    show: boolean, 
    save_as: { value: string } | undefined, 
    load_from_template: { value: string } | undefined 
  } = {
    show: false,
    save_as: undefined,
    load_from_template: undefined
  };
  let showDeleteDialog = false;
  let disable = false;
  let removed: string[] = [];
  let templates: DashboardTemplate[] = [];

  function toggleEdit() {
    if(edit && edited) {
      showSaveDialog=true;
    } else edit=!edit;
  }

  function toggleSaveDialog() {
    showSaveDialog=!showSaveDialog;
  }

  function toggleCreateDialog() {
    showCreateDialog = !showCreateDialog;
  }

  function toggleMenuDialog() {
    menuDialog = menuDialog.show ? { show: false, save_as: undefined, load_from_template: undefined } : { show: true, save_as: undefined, load_from_template: undefined };
  }

  function toggleDeleteDialog() {
    showDeleteDialog = !showDeleteDialog;
  }

  const submitSave: SubmitFunction = async function(request) {
    disable=true;

    request.data.set("cards", stringify(data.dashboard.cards.map((card, index) => { card.index=index; return card; })));
    request.data.set("removed", stringify(removed));
    const save = request.data.get("save")?.toString();
    const _switch = request.data.get("switch")?.toString();

    if(save && save === "false") {
      request.cancel();
      await invalidateAll();
      showSaveDialog=false;
      edit=false;
      edited=false;
      disable=false;
    } else {
      return async ({ result, update }) => {
        await update({reset: false});
        if (result.type === "success") { 
          showSaveDialog=false;
          edited=false;
          if(_switch && _switch==="true") edit=false;
        }
        disable=false;
      }
    }
  }

  const submitCreateCard: SubmitFunction = async function (request) {
    disable = true;

    const width = request.data.get("width")?.toString();
    const height = request.data.get("height")?.toString();
    const zoom = request.data.get("zoom")?.toString();
    const source = request.data.get("source")?.toString();
    const type = request.data.get("type")?.toString();
    const dashboardId = request.data.get("dashboardId")?.toString();

    if (!width || !height || !zoom || !source || !type || !dashboardId) {
      request.cancel();
      disable = false;
      return;
    }

    let randomId = crypto.randomUUID();
    while(data.dashboard.cards.findIndex((card) => card.id===randomId) !== -1) 
      randomId = crypto.randomUUID();

    const card: CardData = {
      id: randomId,
      index: data.dashboard.cards.length,
      width: parseInt(width),
      height: parseInt(height),
      zoom: parseInt(zoom),
      source: source,
      type: type,
      dashboardId: dashboardId,
      templateId: null
    };
    request.cancel();
    edited = true;
    data.dashboard.cards.push(card);
    data.dashboard.cards = data.dashboard.cards;
    showCreateDialog = false;
    disable = false;
  };

  const submitDelete: SubmitFunction = function() {
    disable = true;
    return async ({ result, update }) => {
      if (result.type === "success") { 
        await goto(`/Campaign/${data.params.campaign}/dashboards`);
        showDeleteDialog = false;
        edit = false; 
      } else {
        await update({ reset: false });
      }
      disable = false;
    };
  }

  const submitMenu: SubmitFunction = async function () {
    disable = true;
    return async ({ result, update }) => {
      await update({reset: false});
      if (result.type === "success") menuDialog = { show: false, save_as: undefined, load_from_template: undefined };
      disable = false;
    };
  };

  async function loadTemplates() {
    disable = true;
    const response = await fetch("/api/DashboardTemplates");
    await propagateErrors(response, new URL(window.location.href));
    if(!response.ok) throw new Error("unexpected error")
    templates = (await response.json()).map(template => {
      const { createdAt, ...rest } = template;
      console.log(createdAt, typeof createdAt);
      return {
        ...rest,
        createdAt: new Date(createdAt)
      }
    });
    disable = false;
  }

  async function openSaveTo() {
    await loadTemplates();
    menuDialog = { show: true, save_as: { value: "" }, load_from_template: undefined };
  }

  async function openLoadFrom() {
    await loadTemplates();
    menuDialog = { show: true, save_as: undefined, load_from_template: { value: "" } };
  }

  function menuBack() {
    menuDialog = { show: true, save_as: undefined, load_from_template: undefined };
  }
</script>

<Toolbar>
  {#if edit}
    <form action="?/save" style="display: none" id="hiddenSaveForm" method="post" use:enhance={submitSave}>
      <input type="hidden" name="dashboardId" value={data.dashboard.id} />
      <input type="hidden" name="switch" value="false">
    </form>
    <button disabled={disable || !edited} id="saveButton" class="w3-button" type="submit" form="hiddenSaveForm">
      <span class="material-symbols-outlined w3-text-white">save</span>
    </button>
    <button disabled={disable} id="deleteButton" class="w3-button" on:click={toggleDeleteDialog}>
      <span class="material-symbols-outlined w3-text-white">delete</span>
    </button>
    <button disabled={disable} id="newButton" class="w3-button" on:click={toggleCreateDialog}>
      <span class="material-symbols-outlined w3-text-white">add</span>
    </button>
    <button disabled={disable} id="menuButton" class="w3-button" on:click={toggleMenuDialog}>
      <span class="material-symbols-outlined w3-text-white">more_horiz</span>
    </button>
  {/if}
  <button disabled={disable} id="editButton" class="w3-button" on:click={toggleEdit}>
    <span class="material-symbols-outlined w3-text-white">{edit ? "visibility" : "edit"}</span>
  </button>
</Toolbar>

{#if showSaveDialog}
  <Modal {disable} on:close={toggleSaveDialog}>
    <h3 class="w3-padding">Do you want to save your changes?</h3>
    <form action="?/save" method="post" use:enhance={submitSave}>
      {#if form?.save_error && form?.invalid_data}
        <p>Client Error, please contact us!</p>
      {:else if form?.save_error && form?.server_error}
        <p>Server Error, please contact us!</p>
      {/if}
      <input type="hidden" name="dashboardId" value={data.dashboard.id} />
      <input type="hidden" name="switch" value="true">
      <button disabled={disable} class="w3-button w3-margin w3-grey" name="save" value="false" type="submit">Discard</button>
      <button disabled={disable} class="w3-button w3-margin w3-teal" name="save" value="true" type="submit">Yes</button>
    </form>
  </Modal>
{/if}

{#if showCreateDialog}
  <Modal {disable} on:close={toggleCreateDialog}>
    <h3 class="w3-center">Create Card</h3>
    <form method="post" use:enhance={submitCreateCard}>
      <label for="heightInput">Height (px)</label>
      <input type="number" name="height" id="heightInput" class="w3-input w3-border w3-margin-bottom" value={200} />
      
      <label for="widthInput">Width (px)</label>
      <input type="number" name="width" id="widthInput" class="w3-input w3-border w3-margin-bottom" value={200} />
      
      <input type="hidden" name="zoom" id="nameInput" value={1} class="w3-input w3-border w3-margin-bottom"/>
      
      <label for="sourceInput">Source</label>
      <input type="text" name="source" id="sourceInput" class="w3-input w3-border w3-margin-bottom" value={""}/>
      
      <label for="typeInput">Type</label>
      <input type="text" name="type" id="typeInput" class="w3-input w3-border w3-margin-bottom" value={"text"}/>
      
      <input type="hidden" name="dashboardId" class="w3-input w3-border w3-margin-bottom" value={data.dashboard.id}/>
      
      <button disabled={disable} type="button" on:click={toggleCreateDialog} class="w3-margin-top w3-button">Cancel</button>
      <button disabled={disable} type="submit" class="w3-margin-top w3-button w3-teal">Create</button>
    </form>
  </Modal>
{/if}

{#if menuDialog.show}
  <Modal {disable} on:close={toggleMenuDialog}>
    {#if !menuDialog.save_as && !menuDialog.load_from_template}
      <h3 class="w3-center w3-margin-bottom">Menu</h3>
      <button id="gotoSaveTo" class="w3-button w3-block" on:click={openSaveTo}>Save to template</button>
      <button id="gotoLoadFrom" class="w3-button w3-block" on:click={openLoadFrom}>Load from template</button>
    {:else if menuDialog.save_as}
      <h3 class="w3-center w3-margin-bottom">Save to Template</h3>
      <button class="goBackBtn w3-button" on:click={menuBack}><span class="material-symbols-outlined">arrow_back</span></button>
      <form action="?/saveToTemplate" method="POST" use:enhance={submitMenu}>
        <input type="text" name="saveAsText" id="saveAs" bind:value={menuDialog.save_as.value}/>
        <div class="cards">
          {#each templates.filter(template => (menuDialog.save_as && (!menuDialog.save_as.value || template.name.includes(menuDialog.save_as.value)))) as template}
            <Card>
              <h5 class="w3-padding-16">{template.name}</h5>
            </Card>
          {/each}
          {#if menuDialog.save_as.value && !templates.find(template => (menuDialog.save_as && (template.name === menuDialog.save_as.value)))}
            <Card>
              <h5 class="w3-padding-16">{menuDialog.save_as.value}</h5>
            </Card>
          {/if}
        </div>
      </form>
    {:else if menuDialog.load_from_template}
      <h3 class="w3-center w3-margin-bottom">Load from Template</h3>
      <button class="goBackBtn w3-button" on:click={menuBack}><span class="material-symbols-outlined">arrow_back</span></button>
      <form action="?/saveToTemplate" method="POST" use:enhance={submitMenu}>
        <input type="text" name="saveAsText" id="saveAs" bind:value={menuDialog.load_from_template.value}/>
        <div class="cards">
          {#each templates.filter(template => (menuDialog.load_from_template && (!menuDialog.load_from_template.value || template.name.includes(menuDialog.load_from_template.value)))) as template}
            <Card>
              <h5 class="w3-padding-16">{template.name}</h5>
            </Card>
          {/each}
        </div>
      </form>
    {/if}
  </Modal>
{/if}

{#if showDeleteDialog}
  <Modal {disable} on:close={toggleDeleteDialog}>
    <h4 class="w3-padding">Do you want to delete this dashboard?</h4>
    <form action="?/delete" id="deleteConfirmationButtons" class="w3-container" method="post" use:enhance={submitDelete}>
      <button disabled={disable} class="w3-button w3-margin w3-grey" type="button" on:click={toggleDeleteDialog}>Cancel</button>
      <button disabled={disable} class="w3-button w3-margin w3-teal" type="submit">Yes</button>
    </form>
  </Modal>
{/if}

<DashboardGrid bind:data={data} bind:edited={edited} bind:disable={disable} bind:removed={removed} {edit}/>

<style>
  .goBackBtn {
    position: absolute;
    background-color: transparent;
    top: 0;
    left: 0;
    padding: 0.7em 1em; 
  }

  .cards {
    margin-top: 1em;
    padding: 1em 2em;
  }
</style>