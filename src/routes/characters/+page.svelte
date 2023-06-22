<script lang="ts">
    import type { PageData } from './$types';
    import { enhance } from '$app/forms';
    import Card from '$lib/components/card.svelte';
    import Modal from '$lib/components/modal.svelte';
    import type { SubmitFunction } from '@sveltejs/kit';
    
    export let data: PageData;
    let show_modal = false;
    let disabled = false;

    function toggleCreateDialog() {
        show_modal = !show_modal;
    }

    const handleSubmit: SubmitFunction = function () {
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
        <label class="label" for="nameInput">Name</label>
        <input type="text" name="name" id="nameInput" class="input w3-border w3-margin-bottom"/>
        <button {disabled} type="button" on:click={toggleCreateDialog} class="w3-margin-top btn-secondary">Cancel</button>
        <button {disabled} type="submit" class="w3-margin-top btn-primary">Create</button>
      </form>
    </div>
  </Modal>
{/if}

<div class="cards">
    {#each data.characters as character}
        <Card link={"./characters/" + character.id}>
          <h3 class="h3 p-2">{character.name}</h3>
        </Card>
    {/each}

    <Card on:buttonClick={toggleCreateDialog}>
      <h3 class="h3 p-2">New Character</h3>
    </Card>
</div>