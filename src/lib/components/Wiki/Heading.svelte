<svelte:options customElement="wiki-heading"/>

<script lang="ts">
  import ShadowHead from "./Shadow_head.svelte";
  export let id: string;
  export let tag: string;
  export let viewers: string[];
  export let modifiers: string[];
  export let user_id: string;
  $: modifiable = modifiers.includes(user_id) ? true : undefined;

  let viewers_dropdown: boolean = false;
  let modifiers_dropdown: boolean = false;

  function copyRef() {
    navigator.clipboard.writeText(id);
  }

  let visibilityPopup: HTMLElement;

</script>

<ShadowHead/>

<div class="card p-4 variant-filled-primary" bind:this={visibilityPopup}>
  <p>Click Content</p>
  <div class="arrow variant-filled-primary">Ciao</div>
</div>

<div class="heading-root">
  <svelte:element this={tag} id={id} class:modifiable>
    <slot/>
  </svelte:element>
  <div class="toolbox">
    <button class="btn" on:click={copyRef}><span class="material-symbols-outlined">tag</span></button>
    {#if modifiable}
      <div>
        <button class="btn"><span class="material-symbols-outlined">visibility</span></button>
        <div class="popup">
          {#each viewers as viewer}
            <div class="">
              <p>{viewer}</p>
            </div>
          {/each}
        </div>
      </div>
      <button class="btn"><span class="material-symbols-outlined">edit</span></button>
    {/if}
  </div>
</div>

<style lang="postcss">
  .heading-root {
    @apply flex flex-row gap-x-8;
  }
  .toolbox {
    @apply flex flex-row justify-start;
  }

  .toolbox .btn {
    @apply border-none bg-transparent;
  }

  .toolbox > * {
    @apply transition-[opacity] opacity-0 relative;
    visibility: hidden;
  }

  .heading-root:hover > .toolbox > * {
    @apply visible opacity-20;
  }

  .heading-root:hover > .toolbox > *:hover {
    @apply opacity-100;
  }

  .popup {
    @apply p-4 shadow-xl absolute;
  }
</style>