<script lang="ts">
  import { onMount } from "svelte";
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  export let disable: boolean;
  let wrapper: HTMLElement;

  function closeModal(event: MouseEvent) {
    if (!disable && wrapper && event.target == wrapper) dispatch("close");
  }

  onMount(() => {
    window.addEventListener("click", closeModal);
    return () => {
      window.removeEventListener("click", closeModal);
    };
  });
</script>

<div bind:this={wrapper} id="modalWrapper">
  <div id="modalContent">
    <slot />
  </div>
</div>

<style>
  #modalWrapper {
    position: fixed; /* Stay in place */
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    align-items: flex-start;
    padding: 5vh;
    z-index: 1; /* Sit on top */
    left: 0;
    top: 0;
    width: 100%; /* Full width */
    height: 100%; /* Full height */
    overflow: auto; /* Enable scroll if needed */
    background-color: rgb(0, 0, 0); /* Fallback color */
    background-color: rgba(0, 0, 0, 0.4); /* Black w/ opacity */
  }

  #modalContent {
    background-color: #fefefe;
    border: 1px solid #888;
    padding: 2em;
    margin: auto;
    min-height: 20vh;
    width: 40vw;
  }
</style>
