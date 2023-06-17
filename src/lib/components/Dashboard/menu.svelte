<script lang="ts">
  import Card from "$lib/components/card.svelte";
  import Modal from "$lib/components/modal.svelte";
  import { propagateErrors } from "$lib/utils";
  import type { CardData, Character, Dashboard, DashboardTemplate, NumericVariable, StringVariable } from "@prisma/client";
  import { enhance } from "$app/forms";
  import { stringify } from "devalue";
  import { invalidateAll } from "$app/navigation";
  import { createId } from "@paralleldrive/cuid2"
  import type { SubmitFunction } from "@sveltejs/kit"
  import Delete from "./delete.svelte";
  import RemoveFromCampaign from "./removeFromCampaign.svelte";

  export let dashboard: Dashboard & {
    cards: (CardData & { mod_properties: any }) [],
    stringVariables: StringVariable[],
    numericVariables: NumericVariable[],
    character: Character | null
  };
  export let deleteRedirectUrl: string;
  export let disabled: boolean;
  export let edited: boolean;
  export let edit: boolean;
  export let removedCards: string[];
  export let removedNumVar: string[] = [];
  export let removedStrVar: string[] = [];
  export let removeFromCampaign: boolean = false;

  let menuDialog: { 
    show: boolean, 
    save_as: { value: string } | undefined, 
    load_from_template: { value: string } | undefined,
    settings: boolean
  } = {
    show: false,
    save_as: undefined,
    load_from_template: undefined,
    settings: false
  };

  let deleteDialog: Delete;
  let removeFromCampaignDialog: RemoveFromCampaign;

  let templates: DashboardTemplate[] = [];

  export function toggle() {
    menuDialog = menuDialog.show ? 
                    { show: false, save_as: undefined, load_from_template: undefined, settings: false } 
                  : { show: true, save_as: undefined, load_from_template: undefined, settings: false };
  }

  const submitSaveTo: SubmitFunction = async function (request) {
    disabled = true;
    if(!request.formData.has("templateId")) request.formData.set("templateId", "");
    if(!request.formData.has("name")) {
      const templateName = templates.find(template => template.id === request.formData.get("templateId"))?.name;
      if(!templateName) { 
        disabled = false;
        request.cancel();
        throw new Error("Could not find selected template ??");
      }
      request.formData.set("name", templateName);
    }

    request.formData.set("cards", stringify(dashboard.cards.map((card, index) => { card.index=index; const {mod_properties, ...other_card} = card; return other_card;})));
    request.formData.set("numVars", stringify(dashboard.numericVariables));
    request.formData.set("strVars", stringify(dashboard.stringVariables));
    request.formData.set("removedCards", stringify(removedCards));
    request.formData.set("removedNumVar", stringify(removedNumVar));
    request.formData.set("removedStrVar", stringify(removedStrVar));
    return await submitTemplateAction(request);
  } 

  const submitTemplateAction: SubmitFunction = async function ({ formData }) {
    disabled = true;
    formData.set("options_numVar", "true")
    formData.set("options_strVar", "true")
    formData.set("options_cards", "true")
    return async ({ result, update }) => {
      await update({reset: false});
      if (result.type === "success") { 
        menuDialog = { show: false, save_as: undefined, load_from_template: undefined, settings: false };
        edited = false;
        removedCards = [];
      }
      disabled = false;
    };
  };

  const submitSettings: SubmitFunction = async function (request) {
    disabled = true;
    request.formData.set("numVars", stringify(dashboard.numericVariables));
    request.formData.set("strVars", stringify(dashboard.stringVariables));
    request.formData.set("removedNumVars", stringify(removedNumVar));
    request.formData.set("removedStrVars", stringify(removedStrVar));
    return async ({ result, update }) => {
      if (result.type === "success") { 
        menuDialog = { show: false, save_as: undefined, load_from_template: undefined, settings: false };
        if(!edited) await update({reset: false});
      } else {
        await update({reset: false});
      }
      disabled = false;
    };
  }

  async function loadTemplates() {
    disabled = true;
    const response = await fetch("/api/dashboardTemplates?type=dashboard");
    await propagateErrors(response, new URL(window.location.href));
    if(!response.ok) throw new Error("unexpected error")
    // @ts-ignore
    templates = (await response.json()).map((template) => {
      const { createdAt, ...rest } = template;
      return {
        ...rest,
        createdAt: new Date(createdAt)
      }
    });
    disabled = false;
  }

  async function openSaveTo() {
    await loadTemplates();
    menuDialog = { show: true, save_as: { value: "" }, load_from_template: undefined, settings: false };
  }

  async function openLoadFrom() {
    await loadTemplates();
    menuDialog = { show: true, save_as: undefined, load_from_template: { value: "" }, settings: false };
  }

  function openSettings() {
    menuDialog = { show: true, save_as: undefined, load_from_template: undefined, settings: true };
  }

  function menuBack() {
    menuDialog = { show: true, save_as: undefined, load_from_template: undefined, settings: false };
  }

  function addVariable(type: "string" | "numeric") {
      if(type === "string") {
        dashboard.stringVariables.push({
          id: createId(),
          name: "New variable",
          value: "",
          show: false,
          dashboardId: dashboard.id,
          templateId: null
        });
        dashboard.stringVariables = dashboard.stringVariables;
      }
      else {
        dashboard.numericVariables.push({
        id: createId(),
        name: "New variable",
        value: 0,
        show: false,
        dashboardId: dashboard.id,
        templateId: null
      });
      dashboard.numericVariables = dashboard.numericVariables;
    }
  }

  function deleteVariable(id: string, type: "string" | "numeric") {
    if(type === "string") {
      dashboard.stringVariables = dashboard.stringVariables.filter(variable => variable.id !== id);
      removedStrVar.push(id);
    } else {
      dashboard.numericVariables = dashboard.numericVariables.filter(variable => variable.id !== id);
      removedNumVar.push(id);
    }
  }

  async function discard() {
    disabled = true;
    toggle();
    await invalidateAll();
    disabled = false;
  }
</script>

{#if menuDialog.show}
  <Modal {disabled} on:close={toggle}>
    {#if !menuDialog.save_as && !menuDialog.load_from_template && !menuDialog.settings}
      <h3 class="h3 text-center w3-margin-bottom">Menu</h3>
      <button {disabled} id="gotoSaveTo" class="btn block" on:click={openSaveTo}>Save to template</button>
      <button {disabled} id="gotoLoadFrom" class="btn block" on:click={openLoadFrom}>Load from template</button>
      <button {disabled} id="gotoSettings" class="btn block" on:click={openSettings}>Settings</button>
      <button {disabled} id="deleteButton" class="btn block" on:click={deleteDialog.toggle}>Delete</button>
      {#if removeFromCampaign}
        <button {disabled} id="removeFromCampaignButton" class="btn block" on:click={removeFromCampaignDialog.toggle}>Remove from Campaign</button>
      {/if}
    {:else if menuDialog.save_as}
      <h3 class="h3 text-center w3-margin-bottom">Save to Template</h3>
      <button {disabled} class="goBackBtn btn" on:click={menuBack}><span class="material-symbols-outlined">arrow_back</span></button>
      <form action="?/saveToTemplate" method="POST" use:enhance={submitSaveTo}>
        <input type="hidden" name="dashboardId" id="dashboardIdInput" value={dashboard.id} class="input"/>
        <input {disabled} type="text" id="saveAs" bind:value={menuDialog.save_as.value} class="input"/>
        <div class="cards">
          {#each templates.filter(template => (menuDialog.save_as && (!menuDialog.save_as.value || template.name.toLowerCase().includes(menuDialog.save_as.value.trim().toLowerCase())))) as template}
            <Card button={{role: "submit", name: "templateId", value: template.id}}>
              <h5 class="p-1">{template.name}</h5>
            </Card>
          {/each}
          {#if menuDialog.save_as.value && !templates.find(template => (menuDialog.save_as && (template.name === menuDialog.save_as.value)))}
            <Card button={{role: "submit", name: "name", value: menuDialog.save_as.value}}>
              <h5 class="p-1">{menuDialog.save_as.value}</h5>
            </Card>
          {/if}
        </div>
      </form>
    {:else if menuDialog.load_from_template}
      <h3 class="h3 text-center w3-margin-bottom">Load from Template</h3>
      <button {disabled} class="goBackBtn btn" on:click={menuBack}><span class="material-symbols-outlined">arrow_back</span></button>
      <form action="?/loadFromTemplate" method="POST" use:enhance={submitTemplateAction}>
        <input type="hidden" name="dashboardId" id="dashboardIdInput" value={dashboard.id} class="input"/>
        <input {disabled} type="text" id="saveAs" bind:value={menuDialog.load_from_template.value} class="input"/>
        <div class="cards">
          {#each templates.filter(template => (menuDialog.load_from_template && (!menuDialog.load_from_template.value || template.name.toLowerCase().includes(menuDialog.load_from_template.value.trim().toLowerCase())))) as template}
            <Card button={{role: "submit", name: "templateId", value: template.id}}>
              <h5 class="p-1">{template.name}</h5>
            </Card>
          {/each}
        </div>
      </form>
    {:else if menuDialog.settings}
      <h3 class="h3 text-center w3-margin-bottom">Settings</h3>
      <button {disabled} class="goBackBtn btn" on:click={menuBack}><span class="material-symbols-outlined">arrow_back</span></button>
      <form action="?/settings" method="POST" use:enhance={submitSettings}>
        <input type="hidden" name="dashboardId" id="dashboardIdInput" value={dashboard.id} class="input"/>
        <label class="label" for="name">Name</label>
        <input {disabled} type="text" name="name" id="name" bind:value={dashboard.name} class="input"/>
        <h4 class="h4 w3-margin-top">Numeric Variables</h4>
        <div class="variablesContainer">
          {#each dashboard.numericVariables as numVar}
            <div class="variable">
              <input {disabled} type="checkbox" id="show_{numVar.id}" class="checkbox show_checkbox" bind:checked={numVar.show}>
              <input {disabled} type="text" bind:value={numVar.name} class="input" style="width: {numVar.name.length+1}ch" required/>
              <input {disabled} type="number" id={numVar.id} bind:value={numVar.value} class="input" style="width: {(numVar.value?.toString().length ?? 0)+4}ch" required>
              <button {disabled} type="button" on:click={() => {deleteVariable(numVar.id, "numeric")}}><span class="material-symbols-outlined">delete</span></button>
            </div>
          {/each}
          <button {disabled} type="button" class="btn variable" on:click={() => {addVariable("numeric")}}>Add</button>
        </div>
        <h4 class="h4 w3-margin-top">String Variables</h4>
        <div id="variablesContainer">
          {#each dashboard.stringVariables as strVar}
            <div class="variable">
              <input {disabled} type="checkbox" id="show_{strVar.id}" class="checkbox show_checkbox" bind:checked={strVar.show}>
              <input {disabled} type="text" bind:value={strVar.name} class="input" style="width: {strVar.name.length+1}ch" required/>
              <input {disabled} type="text" id={strVar.id} bind:value={strVar.value} class="input" style="width: {strVar.value.length+1}ch">
              <button {disabled} type="button" on:click={() => {deleteVariable(strVar.id, "string")}}><span class="material-symbols-outlined">delete</span></button>
            </div>
          {/each}
          <button {disabled} type="button" class="btn variable" on:click={() => {addVariable("string")}}>Add</button>
        </div>
        <button {disabled} type="button" on:click={discard} class="w3-margin-top btn-secondary">Discard</button>
        <button {disabled} type="submit" class="w3-margin-top btn-primary">Save</button>
      </form>
    {/if}
  </Modal>

  <Delete message="Do you want to delete this character?" redirectUrl={deleteRedirectUrl} dashboardId={dashboard.id} bind:edit bind:disabled bind:this={deleteDialog}/>
  {#if removeFromCampaign}
    <RemoveFromCampaign redirectUrl={deleteRedirectUrl} bind:disabled bind:this={removeFromCampaignDialog}/>
  {/if}
{/if}

<style lang="postcss">

  .goBackBtn {
    position: absolute;
    background-color: transparent;
    top: 0;
    left: 0;
    padding: 0.7em 1em; 
  }

  .cards {
    margin-top: 2em;
    padding: 0;
  }

  form {
    padding: 2em 1em;
  }

  form input {
    margin: auto
  }

  .variable {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: left;
    width: auto;
  }

  .variable > * {
    display: block;
    margin: 1em;
  }
</style>