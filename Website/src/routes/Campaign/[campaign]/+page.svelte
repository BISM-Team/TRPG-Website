<script lang="ts">
  import type { PageData } from "./$types";
  import Modal from "$lib/components/modal.svelte";
  import Card from "$lib/components/card.svelte";
  import { enhance, type SubmitFunction } from "$app/forms";
  import { page } from "$app/stores";

  export let data: PageData;

  let show_modal = false;
  let disable = false;

  function toggleCreateDialog() {
    show_modal = !show_modal;
  }

  const handleSubmit: SubmitFunction = async function () {
    disable = true;
    return async ({ result, update }) => {
      if (result.type === "success") show_modal = false;
      disable = false;
      await update();
    };
  };
</script>

{#if show_modal}
  <Modal {disable} on:close={toggleCreateDialog}>
    <div id="modalContent">
      <form method="post" action="?/create" use:enhance={handleSubmit}>
        <label for="nameInput">Name</label>
        <input
          type="text"
          name="name"
          id="nameInput"
          class="w3-input w3-border w3-margin-bottom"
        />
        <button
          disabled={disable}
          type="button"
          on:click={toggleCreateDialog}
          class="w3-margin-top w3-button w3-block">Cancel</button
        >
        <button
          disabled={disable}
          type="submit"
          class="w3-margin-top w3-button w3-teal w3-block">Create</button
        >
      </form>
    </div>
  </Modal>
{/if}

<div id="cards">
  {#each data.dashboards as dashboard}
    <Card link={"./" + $page.params.campaign + "/dashboards/" + dashboard.id}>
      <h3 class="w3-padding-32">{dashboard.name}</h3>
    </Card>
  {/each}
  <Card on:buttonClick={toggleCreateDialog}>
    <h3 class="w3-padding-32">New Dashboard</h3>
  </Card>
</div>

<Card link={"./" + $page.params.campaign + "/wiki/index"}>
  <h3 class="w3-padding-32">Wiki</h3>
</Card>

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
