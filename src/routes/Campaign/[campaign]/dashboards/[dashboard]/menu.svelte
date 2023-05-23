<script lang="ts">
  import Card from "$lib/components/card.svelte";
  import Modal from "$lib/components/modal.svelte";
  import { propagateErrors } from "$lib/utils";
  import type { DashboardTemplate } from "@prisma/client";
  import { enhance, type SubmitFunction } from "$app/forms";

  export let disable: boolean;

  let menuDialog: { 
    show: boolean, 
    save_as: { value: string } | undefined, 
    load_from_template: { value: string } | undefined 
  } = {
    show: false,
    save_as: undefined,
    load_from_template: undefined
  };

  let templates: DashboardTemplate[] = [];

  export function toggle() {
    menuDialog = menuDialog.show ? { show: false, save_as: undefined, load_from_template: undefined } : { show: true, save_as: undefined, load_from_template: undefined };
  }

  const submitMenu: SubmitFunction = async function ({ data }) {
    disable = true;
    data.set("options_numVar", "true")
    data.set("options_strVar", "true")
    data.set("options_cards", "true")
    if(!data.has("templateId")) data.set("templateId", "");
    return async ({ result, update }) => {
      await update({reset: false});
      if (result.type === "success") { 
        menuDialog = { show: false, save_as: undefined, load_from_template: undefined };
      }
      disable = false;
    };
  };

  async function loadTemplates() {
    disable = true;
    const response = await fetch("/api/DashboardTemplates");
    await propagateErrors(response, new URL(window.location.href));
    if(!response.ok) throw new Error("unexpected error")
    templates = (await response.json()).map((template) => {
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

{#if menuDialog.show}
  <Modal {disable} on:close={toggle}>
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
            <Card button={{role: "submit", name: "templateId", value: template.id}}>
              <h5 class="w3-padding-16">{template.name}</h5>
            </Card>
          {/each}
          {#if menuDialog.save_as.value && !templates.find(template => (menuDialog.save_as && (template.name === menuDialog.save_as.value)))}
            <Card button={{role: "submit", name: "name", value: menuDialog.save_as.value}}>
              <h5 class="w3-padding-16">{menuDialog.save_as.value}</h5>
            </Card>
          {/if}
        </div>
      </form>
    {:else if menuDialog.load_from_template}
      <h3 class="w3-center w3-margin-bottom">Load from Template</h3>
      <button class="goBackBtn w3-button" on:click={menuBack}><span class="material-symbols-outlined">arrow_back</span></button>
      <form action="?/loadFromTemplate" method="POST" use:enhance={submitMenu}>
        <input type="text" name="saveAsText" id="saveAs" bind:value={menuDialog.load_from_template.value}/>
        <div class="cards">
          {#each templates.filter(template => (menuDialog.load_from_template && (!menuDialog.load_from_template.value || template.name.includes(menuDialog.load_from_template.value)))) as template}
            <Card button={{role: "submit", name: "templateId", value: template.id}}>
              <h5 class="w3-padding-16">{template.name}</h5>
            </Card>
          {/each}
        </div>
      </form>
    {/if}
  </Modal>
{/if}

<style>
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
</style>