<script lang="ts">
  import type { PageData } from "./$types";
  import Modal from "$lib/components/modal.svelte";
  import Card from "$lib/components/card.svelte";
  import { enhance } from "$app/forms";
  import type { SubmitFunction } from "@sveltejs/kit";

  export let data: PageData;

  let show_modal = false;
  let disabled = false;

  function toggleCreateDialog() {
    show_modal = !show_modal;
  }

  const handleSubmit: SubmitFunction = async function () {
    disabled = true;
    return async ({ result, update }) => {
      await update({reset: false});
      if (result.type === "success") show_modal = false;
      disabled = false;
    };
  };
</script>

{#if show_modal}
  <Modal {disabled} on:close={toggleCreateDialog}>
    <div id="modalContent">
      <form method="post" action="?/create" use:enhance={handleSubmit}>
        <label for="nameInput">Name</label>
        <input type="text" name="name" id="nameInput" class="w3-input w3-border w3-margin-bottom"/>
        <button {disabled} type="button" on:click={toggleCreateDialog} class="w3-margin-top w3-button">Cancel</button>
        <button {disabled} type="submit" class="w3-margin-top w3-button w3-teal">Create</button>
      </form>
    </div>
  </Modal>
{/if}

<div class="cards">
  {#each data.dashboards as dashboard}
    <Card link={"./dashboards/" + dashboard.id}>
      <h3 class="w3-padding-32">{dashboard.name}</h3>
    </Card>
  {/each}

  <Card on:buttonClick={toggleCreateDialog}>
    <h3 class="w3-padding-32">New Dashboard</h3>
  </Card>
</div>

<style>
</style>
