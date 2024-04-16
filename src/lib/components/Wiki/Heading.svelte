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

<ShadowHead>
  <div class="heading-root">
    <svelte:element this={tag} {id} class:modifiable>
      <slot />
    </svelte:element>
    <div class="toolbox">
      <button class="btn" on:click={copyRef}
        ><span class="material-symbols-outlined">tag</span></button
      >
      {#if modifiable}
        <div id="visibilityContainer">
          <button class="btn"><span class="material-symbols-outlined">visibility</span></button>
          <div id="popup">
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
</ShadowHead>

<style lang="postcss">
  .heading-root {
    @apply flex flex-row gap-x-8;
    align-items: center;
  }

  .toolbox {
    @apply flex flex-row justify-center;
    align-items: center;
  }

  .toolbox .btn {
    @apply border-none bg-transparent;
  }

  .toolbox > * {
    @apply z-50 opacity-0 transition-[opacity];
    visibility: hidden;
  }

  .heading-root:hover > .toolbox > * {
    @apply visible opacity-20;
  }

  .heading-root:hover > .toolbox > *:hover {
    @apply opacity-100;
  }

  #visibilityContainer > #popup {
    @apply bg-surface-200-700-token absolute m-2 px-8 py-2 opacity-0 shadow-xl transition-[opacity];
    transform: translateX(-40%);
    visibility: hidden;
  }

  #visibilityContainer:hover > #popup {
    visibility: visible;
    opacity: 0.95;
  }
</style>
