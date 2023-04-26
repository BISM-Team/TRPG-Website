<script lang="ts">
  import type { CardData } from "@prisma/client";
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  const default_width = "auto";
  const default_height = "auto";

  export let card: CardData;
  export let picked: boolean;
  export let edit: boolean;

  function pick(ev: MouseEvent) {
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

  function resize(ev: MouseEvent) {
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
</script>

<div
  id="content{card.id}"
  class="card-content w3-card-4"
  style="width:{card.width
    ? Math.max(6, card.width) + 'px'
    : default_width}; height:{card.height
    ? Math.max(6, card.height) + 'px'
    : default_height}; {picked ? 'cursor: grabbing;' : ''}"
>
  {#if edit}
  <div id="controlBar">
    <div id="pickArea" on:mousedown={pick} />
    <button on:click={() => { dispatch("remove", { id: card.id }) }} id="removeButton" class="w3-button"/>
  </div>
  <div id="resizeArea" on:mousedown={resize} />
  {/if}

  <p>{card.source}</p>
</div>

<style>
  .card-content {
    position: relative;
    padding: 2em;
    overflow: auto;
    background-color: white;
    box-sizing: border-box;
  }

  #controlBar {
    position: absolute;
    top: 1em;
    left: 0;
    width: 85%;
    margin-left: 10%;
    margin-right: 5%;
    display: flex;
    flex-flow: row nowrap;
    justify-content: space-evenly;
  }

  #pickArea {
    background-color: #f1f1f1;
    border-radius: 6px;
    height: 0.7em;
    width: 60%;
    cursor: grab;
  }

  #pickArea:hover {
    background-color: #ccc;
  }

  #removeButton {
    height: 0.7em;
    padding: 0;
    width: 15%;
    border-radius: 6px;
    background-color: #f1f1f1;
  }

  #resizeArea {
    position: absolute;
    bottom: 0;
    right: 0;
    background-color: #f1f1f1;
    border-radius: 6px;
    height: 0.7em;
    width: 0.7em;
    cursor: se-resize;
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
