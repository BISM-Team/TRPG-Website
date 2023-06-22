<script lang="ts">
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  export let link = "";
  export let button = {
    role: "button",
    name: "",
    value: ""
  }
  function onClick() {
    dispatch("buttonClick");
  }
</script>

{#if link}
  <a href={link} class="card block card-hover p-4">
    {#if $$slots["card-header"]}
      <div class="card-header">
        <slot name="card-header"/>
      </div>
    {/if}
    <div class="p-4">
      <slot />
    </div>
  </a>
{:else}
  <button on:click={onClick} role={button.role} name={button.name} value={button.value} class="card block card-hover p-4">
    {#if $$slots["card-header"]}
      <div class="card-header">
        <slot name="card-header"/>
      </div>
    {/if}
    <div class="p-4">
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
</style>
