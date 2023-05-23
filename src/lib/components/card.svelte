<script lang="ts">
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  export let link = "";
  function onClick() {
    dispatch("buttonClick");
  }
</script>

<div id="container" class="card-container w3-card-4 w3-margin w3-center">
  {#if link}
    <a href={link} class="w3-container">
      <slot />
    </a>
  {:else}
    <button on:click={onClick} class="w3-container w3-block">
      <slot />
    </button>
  {/if}
</div>

<style>
  #container {
    min-width: 20%;
    transition: ease-out 200ms;
  }

  #container:hover {
    transform: scale(110%);
  }

  a {
    display: block;
    text-decoration: none;
  }

  button {
    background-color: transparent;
    border: none;
    cursor: pointer;
    margin: 0;
  }
</style>
