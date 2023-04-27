<script lang="ts">
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  export let link = "";
  function onClick() {
    dispatch("buttonClick");
  }
</script>

<div id="container" class="card-container w3-container w3-card-4 w3-margin">
  {#if link}
    <a href={link}>
      <slot />
    </a>
  {:else}
    <button on:click={onClick}>
      <slot />
    </button>
  {/if}
</div>

<style>
  #container {
    max-width: 20%;
    transition: ease-out 200ms;
  }

  #container:hover {
    transform: scale(110%);
  }

  a {
    text-decoration: none;
  }

  button {
    background-color: transparent;
    border: none;
  }
</style>
