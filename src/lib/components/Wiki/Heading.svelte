<svelte:options customElement={{tag: "wiki-heading", accessors: false}}/>

<script lang="ts">
  import ShadowHead from "./Shadow_head.svelte";

  export let id: string;
  export let tag: string;
  export let viewers: string[];
  export let modifiers: string[];
  export let user_id: string;

  let viewers_dropdown: boolean = false;
  let modifiers_dropdown: boolean = false;

  function copyRef() {
    navigator.clipboard.writeText(id);
  }
</script>

<ShadowHead/>

<div class="w3-border relative">
  <svelte:element this={tag} id={id} class:modifiable={modifiers.includes(user_id) ? true : undefined}>
    <slot/>
    <div class="toolbox">
      <button class="transition-[opacity]" on:click={copyRef}><span class="material-symbols-outlined">tag</span></button>
      <button class="transition-[opacity]"><span class="material-symbols-outlined">visibility</span></button>
    </div>
  </svelte:element>
</div>

<style lang="postcss">

  .toolbox {
    position: absolute;
    top: 0;
    right: 0;
    display: flex;
    flex-direction: row;
    justify-content: space-evenly;
  }

  .toolbox > * {
    opacity: 0.2;
  }

  .toolbox > *:hover {
    background-color: transparent !important;
    opacity: 1;
  }
</style>