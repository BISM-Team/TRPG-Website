<script lang="ts">
  import { enhance } from '$app/forms';
  import Card from '$lib/components/card.svelte';
  import Modal from '$lib/components/modal.svelte';
  import type { PageData, SubmitFunction } from './$types';

  let show_modal: {
    campaign: boolean;
    character: boolean;
    wiki: boolean;
  } = { campaign: false, character: false, wiki: false };
  let disabled = false;

  export let data: PageData;

  const toggleCreateDialog = (field: keyof typeof show_modal) =>
    function () {
      const tmp = show_modal[field];
      show_modal = {
        campaign: false,
        character: false,
        wiki: false
      };
      show_modal[field] = !tmp;
    };

  const submitCreate: (field: keyof typeof show_modal) => SubmitFunction = (field) =>
    async function () {
      disabled = true;
      return async ({ result, update }) => {
        await update({ reset: false });
        if (result.type === 'success') toggleCreateDialog(field)();
        disabled = false;
      };
    };
</script>

{#if show_modal.campaign}
  <Modal {disabled} on:close={toggleCreateDialog('campaign')}>
    <svelte:fragment slot="center-toolbar">
      <h3 class="h3 text-center">Create Campaign</h3>
    </svelte:fragment>
    <form action="?/createCampaign" method="post" use:enhance={submitCreate('campaign')}>
      <label class="label" for="nameInput">Name</label>
      <input type="text" name="name" id="nameInput" class="w3-border w3-margin-bottom input" />

      <button
        {disabled}
        type="button"
        on:click={toggleCreateDialog('campaign')}
        class="btn-secondary">Cancel</button
      >
      <button {disabled} type="submit" class="btn-primary">Create</button>
    </form>
  </Modal>
{/if}

{#if show_modal.character}
  <Modal {disabled} on:close={toggleCreateDialog('character')}>
    <svelte:fragment slot="center-toolbar">
      <h3 class="h3 text-center">Create Character</h3>
    </svelte:fragment>
    <form action="?/createCharacter" method="post" use:enhance={submitCreate('character')}>
      <label class="label" for="nameInput">Name</label>
      <input type="text" name="name" id="nameInput" class="w3-border w3-margin-bottom input" />

      <button
        {disabled}
        type="button"
        on:click={toggleCreateDialog('character')}
        class="btn-secondary">Cancel</button
      >
      <button {disabled} type="submit" class="btn-primary">Create</button>
    </form>
  </Modal>
{/if}

{#if show_modal.wiki}
  <Modal {disabled} on:close={toggleCreateDialog('wiki')}>
    <svelte:fragment slot="center-toolbar">
      <h3 class="h3 text-center">Create Wiki</h3>
    </svelte:fragment>
    <form action="?/createWiki" method="post" use:enhance={submitCreate('wiki')}>
      <label class="label" for="nameInput">Name</label>
      <input type="text" name="name" id="nameInput" class="w3-border w3-margin-bottom input" />

      <button {disabled} type="button" on:click={toggleCreateDialog('wiki')} class="btn-secondary"
        >Cancel</button
      >
      <button {disabled} type="submit" class="btn-primary">Create</button>
    </form>
  </Modal>
{/if}

<div class="section-container my-l mx-xl">
  <h2 class="h2">Campaigns</h2>
  <div class="card-container mt-l gap-l px-s">
    <div class="cards gap-l py-m px-0">
      {#await data.campaigns}
        <p>Loading...</p>
      {:then campaigns}
        {#each campaigns as campaign}
          <Card link={'/campaigns/' + campaign.id}>
            <h3 class="p-m h3 text-center">{campaign.name}</h3>
          </Card>
        {:else}
          {#if data.auth}
            <p>No campaigns yet! Create or participate in a campaign</p>
          {:else}
            <p>Please login to view and create your campaigns</p>
          {/if}
        {/each}
      {/await}
    </div>
    {#if data.auth}
      <div class="add-button">
        <Card on:buttonClick={toggleCreateDialog('campaign')}>
          <h3 class="p-m h3"><span class="material-symbols-outlined">Add</span></h3>
        </Card>
      </div>
    {/if}
  </div>
</div>

<hr />

<div class="section-container my-l mx-xl">
  <h2 class="h2">Characters</h2>
  <div class="card-container mt-l gap-l px-s">
    <div class="cards py-m gap-l px-0">
      {#await data.characters}
        <p>Loading...</p>
      {:then characters}
        {#each characters as character}
          <Card link={'/characters/' + character.id}>
            <h3 class="p-m h3 text-center">{character.name}</h3>
          </Card>
        {:else}
          {#if data.auth}
            <p>No characters yet! Create one</p>
          {:else}
            <p>Please login to view and create your characters</p>
          {/if}
        {/each}
      {/await}
    </div>
    {#if data.auth}
      <div class="add-button">
        <Card on:buttonClick={toggleCreateDialog('character')}>
          <h3 class="p-m h3"><span class="material-symbols-outlined">Add</span></h3>
        </Card>
      </div>
    {/if}
  </div>
</div>
<hr />

<div class="section-container my-l mx-xl">
  <h2 class="h2">Wikis</h2>
  <div class="card-container mt-l gap-l px-s">
    <div class="cards py-m gap-l px-0">
      {#await data.wikis}
        <p>Loading...</p>
      {:then wikis}
        {#each wikis as wiki}
          <Card link={'/wikis/' + wiki.id + '/pages/index'}>
            <h3 class="p-m h3 text-center">{wiki.name}</h3>
          </Card>
        {:else}
          {#if data.auth}
            <p>No wikis yet! Create or participate in a wiki</p>
          {:else}
            <p>Please login to view and create your wikis</p>
          {/if}
        {/each}
      {/await}
    </div>
    {#if data.auth}
      <div class="add-button">
        <Card on:buttonClick={toggleCreateDialog('wiki')}>
          <h3 class="p-m h3"><span class="material-symbols-outlined">Add</span></h3>
        </Card>
      </div>
    {/if}
  </div>
</div>

<style>
  h3 {
    margin: 0;
  }
  p {
    line-height: 1.5em;
  }

  .card-container {
    display: flex;
    flex-direction: row;
    align-items: center;
    overflow-x: auto;
  }

  .cards {
    margin: 0;
    justify-content: start;
    flex-wrap: nowrap;
  }

  .add-button {
    padding: var(--gap-m) 0;
  }
</style>
