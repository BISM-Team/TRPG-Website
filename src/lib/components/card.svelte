<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  export let links: { href: string; icon_name: string }[] = [];
  export let button: {
    type: 'button' | 'submit' | 'reset';
    name: string;
    value: string;
  } = {
    type: 'button',
    name: '',
    value: ''
  };
  function onClick() {
    dispatch('buttonClick');
  }
</script>

{#if links.length > 0}
  <div class="p-l card card-hover relative block">
    <div class="link-overlay">
      {#each links as link}
        <a href={link.href}><span class="material-symbols-outlined">{link.icon_name}</span></a>
      {/each}
    </div>
    {#if $$slots['card-header']}
      <div class="card-header">
        <slot name="card-header" />
      </div>
    {/if}
    <div class="card-content p-l">
      <slot />
    </div>
  </div>
{:else}
  <button
    on:click={onClick}
    type={button.type}
    name={button.name}
    value={button.value}
    class="p-l card card-hover block"
  >
    {#if $$slots['card-header']}
      <div class="card-header">
        <slot name="card-header" />
      </div>
    {/if}
    <div class="card-content p-l">
      <slot />
    </div>
  </button>
{/if}

<style lang="postcss">
  a {
    display: block;
    text-decoration: none;
  }

  button {
    background-color: inherit;
    border: none;
    cursor: pointer;
    margin: 0;
  }

  .link-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: var(--theme-rounded-container);
    background-color: transparent;
    display: flex;
    flex-direction: row;
    align-items: center;
    opacity: 0;
    @apply bg-surface-400-500-token transition-opacity;
  }

  .link-overlay:hover {
    opacity: 0.95;
  }

  .link-overlay a {
    margin: 0;
    height: 100%;
    flex-grow: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    @apply transition-colors;
  }

  .link-overlay a:first-child {
    border-top-left-radius: var(--theme-rounded-container);
    border-bottom-left-radius: var(--theme-rounded-container);
  }

  .link-overlay a:last-child {
    border-top-right-radius: var(--theme-rounded-container);
    border-bottom-right-radius: var(--theme-rounded-container);
  }

  .link-overlay a:hover {
    @apply bg-surface-300-600-token;
  }

  .link-overlay a span {
    display: block;
    font-size: xx-large;
  }

  .card-content {
    width: max-content;
  }
</style>
