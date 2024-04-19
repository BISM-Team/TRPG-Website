<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Toolbar from './toolbar.svelte';
  const dispatch = createEventDispatcher();

  export let disabled: boolean;
  let wrapper: HTMLElement;

  function closeModal() {
    if (!disabled && wrapper) dispatch('close');
  }

  function clickOutside(event: MouseEvent) {
    if (event.target == wrapper) closeModal();
  }

  function keyUp(ev: KeyboardEvent) {
    if (ev.key === 'Escape') closeModal();
  }
</script>

<svelte:document on:click={clickOutside} on:keyup={keyUp} />

<div bind:this={wrapper} id="modalWrapper">
  <div id="modalContent" class="bg-surface-100-800-token border-surface-400-500-token text-center">
    <Toolbar>
      <svelte:fragment slot="left">
        <slot name="left-toolbar" />
      </svelte:fragment>
      <svelte:fragment slot="center">
        <slot name="center-toolbar" />
      </svelte:fragment>
      <svelte:fragment slot="right">
        <slot name="right-toolbar" />
        <button id="closeButton" class="btn" {disabled} on:click={closeModal}
          ><span class="material-symbols-outlined">close</span></button
        >
      </svelte:fragment>
    </Toolbar>
    <div id="modalActualContent" class="p-xl">
      <slot />
    </div>
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
    border-width: 1px;
    margin: auto;
    min-height: 20vh;
    overflow: auto;
    max-height: 100%;
  }

  #closeButton {
    padding: 0.7rem 1rem;
  }

  #closeButton > span {
    display: block;
  }
</style>
