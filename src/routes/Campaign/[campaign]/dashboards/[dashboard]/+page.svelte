<script lang="ts">
  import type { ActionData, PageData } from "./$types";
  import { scale } from "svelte/transition";
  import { flip } from "$lib/Campaign/better_animations";
  import Card from "./card.svelte";
  import Prototype from "./prototype.svelte";
  import Modal from "$lib/components/modal.svelte";
  import Toolbar from "$lib/components/toolbar.svelte";
  import { spring, type Spring } from "svelte/motion";
  import { onMount } from "svelte";
  import { arraymove } from "$lib/utils";
  import { enhance, type SubmitFunction } from "$app/forms";
  import type { CardData } from "@prisma/client";
  import { stringify } from "devalue";
  import { invalidateAll } from "$app/navigation";

  export let data: PageData;
  export let form: ActionData;
  const transition_delay = 0, transition_duration = 300;
  const animate_delay = 0, animate_duration = 20;
  const stiffness = 0.6, damping = 1.0;
  const trace_refractary_perioid = 200, drag_refractary_period = 500;
  
  let edit = false;
  let edited = false;
  let showSaveDialog = false;
  let showCreateDialog = false;
  let disable = false;

  let picked: {
        startingIndex: number;
        index: number;
        id: string;
        geometry: DOMRect;
        card: CardData;
        refractary: boolean;
      } | undefined = undefined;

  let resizing: {
        index: number;
        id: string;
        card: CardData;
        starting_top_left: { top: number; left: number };
      } | undefined = undefined;

  let actionData: Spring<{ x_or_width: number; y_or_height: number }> = spring(
    { x_or_width: 0, y_or_height: 0 },
    { stiffness, damping }
  );
  let removed: string[] = [];

  onMount(() => {
    document.addEventListener("mousemove", moveWhileDragging);
    document.addEventListener("mouseup", endAction);
    document.addEventListener("keydown", keydown);
    document.addEventListener("mouseleave", cancelAction);

    return () => {
      document.removeEventListener("mousemove", moveWhileDragging);
      document.removeEventListener("mouseup", endAction);
      document.removeEventListener("keydown", keydown);
    };
  });

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

  function startDragElement(ev: any) {
    cancelAction();
    const index = data.dashboard.cards.findIndex(
      (element) => element.id === ev.detail.id
    );
    if (index === -1) throw new Error("Id not found in cards");
    picked = {
      startingIndex: index,
      index: index,
      id: ev.detail.id,
      geometry: ev.detail.geometry,
      card: data.dashboard.cards[index],
      refractary: false,
    };
    actionData = spring(
      {
        x_or_width: ev.detail.geometry.x + window.scrollX,
        y_or_height: ev.detail.geometry.y + window.scrollY,
      },
      { stiffness, damping }
    );
    const mousepos = ev.detail.mousepos;
    actionData.set({
      x_or_width: mousepos.x - picked.geometry.width / 2,
      y_or_height: mousepos.y - picked.geometry.height / 2,
    });
  }

  function startResizeElement(ev: any) {
    cancelAction();
    const index = data.dashboard.cards.findIndex(
      (element) => element.id === ev.detail.id
    );
    if (index === -1) throw new Error("Id not found in cards");
    resizing = {
      index: index,
      id: ev.detail.id,
      card: data.dashboard.cards[index],
      starting_top_left: {
        top: ev.detail.geometry.top + window.scrollY,
        left: ev.detail.geometry.left + window.scrollX,
      },
    };
    actionData = spring(
      {
        x_or_width: ev.detail.geometry.width,
        y_or_height: ev.detail.geometry.height,
      },
      { stiffness, damping }
    );
  }

  function cancelAction() {
    if (picked) {
      if (picked.index !== picked.startingIndex) {
        arraymove(data.dashboard.cards, picked.index, picked.startingIndex);
      }
      picked = undefined;
    }
    if (resizing) {
      resizing = undefined;
    }
  }

  function confirmAction() {
    if (resizing) {
      resizing.card.width = $actionData.x_or_width;
      resizing.card.height = $actionData.y_or_height;
      resizing = undefined;
    }
    picked = undefined;
    edited = true;
  }

  function keydown(ev: KeyboardEvent) {
    if ((picked || resizing) && (ev.key === "Escape" || ev.key === "Delete" || ev.key === "Backspace")) {
      ev.preventDefault();
      ev.stopPropagation();
      cancelAction();
    } else if ((picked || resizing) && ev.key === "Enter") {
      ev.preventDefault();
      ev.stopPropagation();
      confirmAction();
    }
  }

  function moveWhileDragging(ev: MouseEvent) {
    if (picked) {
      ev.preventDefault();
      ev.stopPropagation();
      const mousepos = { x: ev.pageX, y: ev.pageY };
      actionData.set({
        x_or_width: mousepos.x - picked.geometry.width / 2,
        y_or_height: mousepos.y - picked.geometry.height / 2,
      });
      if (!picked.refractary) {
        const element = document.elementsFromPoint(mousepos.x - window.scrollX,mousepos.y - window.scrollY)
          .find((element) => {
            return (
              picked &&
              element.id.startsWith("content") &&
              !element.id.endsWith(`${picked.id}`)
            );
          });
        if (element && element.id.startsWith("content")) {
          picked.refractary = true;
          hoverWhileDragging(element.id.replace("content", ""));
          setTimeout(() => {
            if (picked) picked.refractary = false;
          }, drag_refractary_period);
        } else {
          picked.refractary = true;
          setTimeout(() => {
            if (picked) picked.refractary = false;
          }, trace_refractary_perioid);
        }
      }
    } else if (resizing) {
      ev.preventDefault();
      ev.stopPropagation();
      const mousepos = { x: ev.pageX, y: ev.pageY };
      actionData.set({
        x_or_width: mousepos.x - resizing.starting_top_left.left,
        y_or_height: mousepos.y - resizing.starting_top_left.top,
      });
    }
  }

  function endAction(ev: any) {
    if (picked || resizing) {
      ev.preventDefault();
      ev.stopPropagation();
      confirmAction();
    }
  }

  function hoverWhileDragging(id: string) {
    if (picked) {
      const index = data.dashboard.cards.findIndex(
        (element) => element.id === id
      );
      if (index === -1) throw new Error("Id not found in cards" + id + ";\n " + data.dashboard.cards);
      if (index !== picked.index) {
        arraymove(data.dashboard.cards, picked.index, index);
        picked.index = index;
      }
    }
  }

  const submitSave: SubmitFunction = async function(request) {
    disable=true;

    request.data.set("cards", stringify(data.dashboard.cards.map((card, index) => { card.index=index; return card; })));
    request.data.set("removed", stringify(removed));
    const save = request.data.get("save")?.toString();
    const _switch = request.data.get("switch")?.toString();

    if(save && save === "false") {
      request.cancel();
      showSaveDialog=false;
      edit=false;
      edited=false;
      disable=false;
      await invalidateAll();
    } else {
      return async ({ result, update }) => {
        if (result.type === "success") { 
          showSaveDialog=false;
          edited=false;
          if(_switch && _switch==="true") edit=false;
        }
        disable=false;
        await update();
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
    showCreateDialog=false;
    disable = false;
  };

  function removeCard(ev: any) {
    disable=true;
    const id = ev.detail.id;
    const index = data.dashboard.cards.findIndex((card) => card.id===id);
    if(index !== -1) {
      removed.push(id);
      edited = true;
      data.dashboard.cards.splice(index, 1);
      data.dashboard.cards = data.dashboard.cards;
    } else {
      console.error(id, data.dashboard.cards);
    }
    disable=false;
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
  <button disabled={disable} id="newButton" class="w3-button" on:click={toggleCreateDialog}>
    <span class="material-symbols-outlined w3-text-white">add</span>
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
      <button disabled={disable} class="w3-button w3-margin w3-grey" name="save" value="false" type="submit">No</button>
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

<div id="grid">
  {#each data.dashboard.cards as card (card.id)}
    <div class="card"
      in:scale={{ delay: transition_delay, duration: transition_duration }}
      out:scale={{ delay: transition_delay, duration: transition_duration }}
      animate:flip={{ delay: animate_delay, duration: (d) => Math.sqrt(d) * animate_duration }}>
      {#if picked && card.id === picked.id}
        <Prototype data={{ id: card.id, width: picked.geometry.width, height: picked.geometry.height, }} />
      {:else if resizing && card.id === resizing.id}
        <Prototype data={{ id: card.id, width: $actionData.x_or_width, height: $actionData.y_or_height }}/>
      {:else}
        <Card {card} picked={false} {edit} on:pick={startDragElement} on:resize={startResizeElement} on:remove={removeCard} />
      {/if}
    </div>
  {/each}
</div>

{#if picked}
  <div class="pickedCard" style="top:{$actionData.y_or_height}px; left:{$actionData.x_or_width}px;">
    <Card card={picked.card} picked={true} {edit}/>
  </div>
{/if}

<style>
  #grid {
    display: flex;
    flex-flow: row wrap;
    align-items: flex-start;
    gap: 2em;
    margin: 4em;
  }

  .pickedCard {
    position: absolute;
    z-index: 100;
  }
</style>
