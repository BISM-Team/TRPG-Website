<script lang="ts">
  import { onMount } from "svelte";
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  export let disabled: boolean;
  let wrapper: HTMLElement;

  function closeModal() {
    if(!disabled && wrapper) dispatch("close")
  }

  function clickOutside(event: MouseEvent) {
    if (event.target == wrapper) closeModal();
  }

  function keyUp(ev: KeyboardEvent) {
    if(ev.key === "Escape") closeModal();
  }
</script>

<svelte:document on:click={clickOutside} on:keyup={keyUp}/>

<div bind:this={wrapper} id="modalWrapper">
  <div id="modalContent" class="text-center w3-container">
    <button id="closeButton" class="btn" {disabled} on:click={closeModal}><span class="material-symbols-outlined">close</span></button>
    <slot />
  </div>
</div>

<style lang="postcss">

  #modalWrapper {
    position: fixed; /* Stay in place */
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    align-items: flex-start;
    padding: 5vh;
    padding-bottom: 15vh;
    z-index: 100; /* Sit on top */
    left: 0;
    top: 0;
    width: 100%; /* Full width */
    height: 100%; /* Full height */
    overflow: auto; /* Enable scroll if needed */
    background-color: rgb(0, 0, 0); /* Fallback color */
    background-color: rgba(0, 0, 0, 0.4); /* Black w/ opacity */
  }

  #modalContent {
    position: relative;
    background-color: #fefefe;
    border: 1px solid #888;
    padding: 1em 2em;
    margin: auto;
    min-height: 20vh;
    overflow: hidden;
  }

  #closeButton {
    position: absolute;
    background-color: transparent;
    top: 0;
    right: 0;
    padding: 0.7em 1em;
  }

  #closeButton > span {
    display: block;
  }
</style>
