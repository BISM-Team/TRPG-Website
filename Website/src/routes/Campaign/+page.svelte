<script lang="ts">
  import type { ActionData, PageData } from "./$types";
  import Card from "$lib/components/card.svelte";
  import Modal from "$lib/components/modal.svelte";
  import { enhance, type SubmitFunction } from "$app/forms";

  export let data: PageData;
  export let form: ActionData;
  let show_modal = false;
  let disable = false;

  function toggleCreateDialog() {
    show_modal = !show_modal;
  }

  const submitCreate: SubmitFunction = async function () {
    disable = true;
    return async ({ result, update }) => {
      if (result.type === "success") toggleCreateDialog();
      disable = false;
      await update();
    };
  };
</script>

{#if show_modal}
  <Modal {disable} on:close={toggleCreateDialog}>
    <form action="?/create" method="post" use:enhance={submitCreate}>
      <label for="nameInput">Name</label>
      <input
        type="text"
        name="name"
        id="nameInput"
        class="w3-input w3-border w3-margin-bottom"
        value={form?.name || ""}
      />

      <button
        type="button"
        on:click={toggleCreateDialog}
        class="w3-margin-top w3-button w3-block">Cancel</button
      >
      <button type="submit" class="w3-margin-top w3-button w3-teal w3-block"
        >Create</button
      >
    </form>
  </Modal>
{/if}

<div id="cards">
  {#each data.campaigns as campaign}
    <Card link={window.location.pathname + "/" + campaign.id}>
      <h3 class="w3-padding-32">{campaign.name}</h3>
    </Card>
  {/each}

  <Card on:buttonClick={toggleCreateDialog}
    ><h3 class="w3-padding-32">Create a campaign</h3></Card
  >
</div>

<style>
  #cards {
    width: 100%;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-evenly;
    margin-top: 4em;
  }

  form label {
    display: block;
    margin-bottom: 0.5em;
  }
  form input {
    display: block;
    margin-bottom: 1em;
  }
</style>
