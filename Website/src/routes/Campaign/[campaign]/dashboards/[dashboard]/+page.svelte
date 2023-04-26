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

  export let data: PageData;
  export let form: ActionData;
  const transition_delay = 0, transition_duration = 300;
  const animate_delay = 0, animate_duration = 20;
  const stiffness = 0.6, damping = 1.0;
  const trace_refractary_perioid = 200, drag_refractary_period = 500;
  
  let edit = false;
  let edited = false;
  let showSaveDialog = false;
  let removeDialog = { show: false, id: "" };
  let showCreateDialog = false;
  let disable = false;

  let picked: {
        startingIndex: number;
        index: number;
        id: string;
        geometry: DOMRect;
        data: CardData;
        refractary: boolean;
      } | undefined = undefined;

  let resizing: {
        index: number;
        id: string;
        starting_top_left: { top: number; left: number };
      } | undefined = undefined;

  let actionData: Spring<{ x_or_width: number; y_or_height: number }> = spring(
    { x_or_width: 0, y_or_height: 0 },
    { stiffness, damping }
  );

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
      toggleSaveDialog();
    } else edit=!edit;
  }

  function toggleSaveDialog() {
    showSaveDialog=!showSaveDialog;
  }

  function toggleCreateDialog() {
    showCreateDialog = !showCreateDialog;
  }

  function toggleRemoveDialog(ev: any) {
    removeDialog = removeDialog.show
      ? { show: false, id: "" }
      : { show: true, id: ev.detail.id };
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
      data: data.dashboard.cards[index],
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
      data.dashboard.cards[resizing.index].width = $actionData.x_or_width;
      data.dashboard.cards[resizing.index].height = $actionData.y_or_height;
      resizing = undefined;
    }
    if(picked) {
      picked.data.index=picked.index;
    }
    picked = undefined;
    edited=true;
  }

  function keydown(ev: KeyboardEvent) {
    if (
      (picked || resizing) &&
      (ev.key === "Escape" || ev.key === "Delete" || ev.key === "Backspace")
    ) {
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
      if (index === -1) throw new Error("Id not found in cards");
      if (index !== picked.index) {
        arraymove(data.dashboard.cards, picked.index, index);
        picked.index = index;
      }
    }
  }

  const submitSave: SubmitFunction = async function(request) {
    request.data.set("cards", stringify(data.dashboard.cards));
    disable=true;
    return async ({ result, update }) => {
      if (result.type === "success") { 
        toggleSaveDialog();
        edited=false;
        edit=false;
      }
      disable=false;
      await update();
    }
  }

  const submitCreateCard: SubmitFunction = async function (request) {
    disable = true;
    request.data.set("index", data.dashboard.cards.length.toString());
    return async ({ result, update }) => {
      if (result.type === "success") toggleCreateDialog();
      disable = false;
      await update();
      const new_dashboard = form?.dashboard;
      if (new_dashboard) data.dashboard = new_dashboard;
    };
  };

  const submitRemoveCard: SubmitFunction = async function () {
    disable = true;
    return async ({ result, update }) => {
      if (result.type === "success") toggleRemoveDialog({});
      disable = false;
      await update();
      const new_dashboard = form?.dashboard;
      if (new_dashboard) data.dashboard = new_dashboard;
    };
  };
</script>

<Toolbar>
  <button disabled={disable} id="editButton" class="w3-button" on:click={toggleEdit}>
    <span class="material-symbols-outlined w3-text-white">{edit ? "visibility" : "edit"}</span>
  </button>
  <button disabled={disable} id="newButton" class="w3-button" on:click={toggleCreateDialog}>
    <span class="material-symbols-outlined w3-text-white">add</span>
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
      <button disabled={disable} class="w3-button w3-margin w3-grey" type="button" on:click={toggleSaveDialog}>No</button>
      <button disabled={disable} class="w3-button w3-margin w3-teal" type="submit">Yes</button>
    </form>
  </Modal>
{/if}

{#if showCreateDialog}
  <Modal {disable} on:close={toggleCreateDialog}>
    <h3 class="w3-center">Create Card</h3>
    <form action="?/createCard" method="post" use:enhance={submitCreateCard}>
      <label for="heightInput">Height (px)</label>
      <input type="number" name="height" id="heightInput" class="w3-input w3-border w3-margin-bottom" value={form?.height || 200} />
      
      <label for="widthInput">Width (px)</label>
      <input type="number" name="width" id="widthInput" class="w3-input w3-border w3-margin-bottom" value={form?.width || 200} />
      
      <input type="hidden" name="zoom" id="nameInput" value={1} class="w3-input w3-border w3-margin-bottom"/>
      
      <label for="sourceInput">Source</label>
      <input type="text" name="source" id="sourceInput" class="w3-input w3-border w3-margin-bottom" value={form?.source || ""}/>
      
      <label for="typeInput">Type</label>
      <input type="text" name="type" id="typeInput" class="w3-input w3-border w3-margin-bottom" value={form?.type || "text"}/>
      
      <input type="hidden" name="dashboardId" class="w3-input w3-border w3-margin-bottom" value={data.dashboard.id}/>
      
      <button type="button" on:click={toggleCreateDialog} class="w3-margin-top w3-button">Cancel</button>
      <button type="submit" class="w3-margin-top w3-button w3-teal">Create</button>
    </form>
  </Modal>
{/if}

{#if removeDialog.show}
  <Modal {disable} on:close={toggleRemoveDialog}>
    <h3 class="w3-center">Remove Card</h3>
    <form action="?/removeCard" id="removeForm" method="post" use:enhance={submitRemoveCard}>
      <input type="hidden" name="cardId" value={removeDialog.id} />
      <input type="hidden" name="dashboardId" value={data.dashboard.id} />
      <button type="button" on:click={toggleRemoveDialog} class="w3-margin-top w3-button">Cancel</button>
      <button type="submit" class="w3-margin-top w3-button w3-teal">Remove</button>
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
        <Card {card} picked={false} {edit} on:pick={startDragElement} on:resize={startResizeElement} on:remove={toggleRemoveDialog} />
      {/if}
    </div>
  {/each}
</div>

{#if picked}
  <div class="pickedCard" style="top:{$actionData.y_or_height}px; left:{$actionData.x_or_width}px;">
    <Card card={picked.data} picked={true} {edit}/>
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
