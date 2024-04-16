<svelte:options customElement="wiki-heading" />

<script lang="ts">
  import ShadowHead from './Shadow_head.svelte';
  export let id: string;
  export let tag: string;
  export let viewers: string;
  export let modifiers: string;
  export let user_id: string;
  $: modifiable = modifiers.includes(user_id) ? true : undefined;

  $: _viewers = viewers.split(';').map((viewer: string) => {
    return viewer.trim();
  });

  $: _modifiers = modifiers.split(';').map((modifier: string) => {
    return modifier.trim();
  });

  function copyRef() {
    navigator.clipboard.writeText(id);
  }
</script>

<ShadowHead />

<div class="heading-root">
  <svelte:element this={tag} {id} class:modifiable>
    <slot />
  </svelte:element>
  <div class="toolbox">
    <button class="btn" on:click={copyRef}
      ><span class="material-symbols-outlined">tag</span></button
    >
    {#if modifiable}
      <div id="visibility-container">
        <button class="btn"><span class="material-symbols-outlined">visibility</span></button>
        <div class="popup">
          {#each _viewers as viewer}
            <div class="m-3">
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
    @apply flex flex-row justify-center;
  }

  .toolbox .btn {
    @apply border-none bg-transparent;
  }

  .toolbox > * {
    @apply opacity-0 transition-[opacity];
    visibility: hidden;
  }

  .heading-root:hover > .toolbox > * {
    @apply visible opacity-20;
  }

  .heading-root:hover > .toolbox > *:hover {
    @apply opacity-100;
  }

  #visibility-container > .popup {
    @apply bg-surface-200-700-token absolute m-2 px-8 py-2 opacity-0 shadow-xl transition-[opacity];
    visibility: hidden;
    transform: translate(-40%, 15%);
  }

  #visibility-container:hover > .popup {
    opacity: 0.9;
    visibility: visible;
  }
</style>
