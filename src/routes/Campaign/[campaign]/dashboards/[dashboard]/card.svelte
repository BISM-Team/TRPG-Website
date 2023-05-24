<script lang="ts">
  import type { CardData } from "@prisma/client";
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  const default_width = "auto";
  const default_height = "auto";

  export let card: CardData & { mod_source: string };
  export let picked: boolean;
  export let edit: boolean;

  function pick(ev: MouseEvent) {
    if(edit) {
      ev.preventDefault();
      ev.stopPropagation();
      const element = document.getElementById("content" + card.id);
      if (!element) throw new Error("Could not find root element of Card");
      let computedGeometry: DOMRect = element.getBoundingClientRect();
      dispatch("pick", {
        id: card.id,
        geometry: computedGeometry,
        mousepos: { x: ev.pageX, y: ev.pageY },
      });
    }
  }

  function resize(ev: MouseEvent) {
    if(edit) {
      ev.preventDefault();
      ev.stopPropagation();
      const element = document.getElementById("content" + card.id);
      if (!element) throw new Error("Could not find root element of Card");
      let computedGeometry: DOMRect = element.getBoundingClientRect();
      dispatch("resize", {
        id: card.id,
        geometry: computedGeometry,
        mousepos: { x: ev.pageX, y: ev.pageY },
      });
    }
  }
</script>

<div
  id="content{card.id}"
  class="card-content w3-card-4"
  style="{picked ? 'cursor: grabbing;' : ''}; touch-action: {edit ? 'none' : 'auto'};"
>
  {#if edit}
  <button id="removeButton" class="w3-button" on:click={() => { dispatch("remove", { id: card.id }) }}><span class="material-symbols-outlined">close</span></button>
  <div id="resizeArea" on:pointerdown={resize} />
  {/if}

  <div class="content" 
       style="width:{card.width ? Math.max(6, card.width) + 'px' : default_width}; 
              height:{card.height ? Math.max(6, card.height) + 'px' : default_height};
              cursor: {edit ? picked ? 'cursor: grabbing;' : 'grab' : 'default'}; touch-action: {edit ? 'none' : 'auto'};"
              on:pointerdown={pick}>
    <p>{card.source}</p>
    <p>{card.mod_source}</p>
  </div>
</div>

<style>
  .card-content {
    position: relative;
    background-color: white;
    box-sizing: border-box;
  }

  .content {
    padding: 2em;
    overflow: auto;
  }

  #pickArea:hover {
    background-color: #ccc;
  }

  #removeButton {
    position: absolute;
    top: 0em;
    right: 0em;
    transform: translateX(40%) translateY(-40%);
    padding: 0.1em;
    border-radius: 0.7em;
    background-color: transparent;
    z-index: 1;
  }

  #removeButton > span {
    display: block;
  }

  #resizeArea {
    position: absolute;
    bottom: 0;
    right: 0;
    height: 1em;
    width: 1em;
    cursor: se-resize;
    z-index: 1;
    background: linear-gradient(to top left, rgb(190, 190, 190) 0 40%, transparent 60% 100%);
  }

  ::-webkit-scrollbar {
    width: 0.75em;
    height: 0.75em;
  }

  /* Track */
  ::-webkit-scrollbar-track {
    background: #f1f1f1;
  }

  /* Handle */
  ::-webkit-scrollbar-thumb {
    background: #ccc;
  }

  /* Handle on hover */
  ::-webkit-scrollbar-thumb:hover {
    background: #9e9e9e;
  }
</style>
