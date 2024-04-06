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
    function toggleCreateDialog() {
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

<div class="card-container">
  <h2>Campaigns</h2>
  <div class="cards">
    {#await data.campaigns}
      <p>Loading...</p>
    {:then campaigns}
      {#each campaigns as campaign}
        <Card link={'/campaigns/' + campaign.id}>
          <svelte:fragment slot="card-header">
            <h3 class="h3 p-2 text-center">{campaign.name}</h3>
          </svelte:fragment>
        </Card>
      {:else}
        {#if data.auth}
          <p>No campaigns yet! Create or participate in a campaign</p>
        {:else}
          <p>Please login to view and create your campaigns</p>
        {/if}
      {/each}
      {#if data.auth}
        <Card on:buttonClick={toggleCreateDialog('campaign')}>
          <h3 class="h3 p-2">+</h3>
        </Card>
      {/if}
    {/await}
  </div>
</div>

<div class="card-container">
  <h2>Characters</h2>
  <div class="cards">
    {#await data.characters}
      <p>Loading...</p>
    {:then characters}
      {#each characters as character}
        <Card link={'/characters/' + character.id}>
          <svelte:fragment slot="card-header">
            <h3 class="h3 p-2 text-center">{character.name}</h3>
          </svelte:fragment>
        </Card>
      {:else}
        {#if data.auth}
          <p>No characters yet! Create one</p>
        {:else}
          <p>Please login to view and create your characters</p>
        {/if}
      {/each}
      {#if data.auth}
        <Card on:buttonClick={toggleCreateDialog('character')}>
          <h3 class="h3 p-2">+</h3>
        </Card>
      {/if}
    {/await}
  </div>
</div>

<div class="card-container">
  <h2>Wikis</h2>
  <div class="cards">
    {#await data.wikis}
      <p>Loading...</p>
    {:then wikis}
      {#each wikis as wiki}
        <Card link={'/wikis/' + wiki.id + '/pages/index'}>
          <svelte:fragment slot="card-header">
            <h3 class="h3 p-2 text-center">{wiki.name}</h3>
          </svelte:fragment>
        </Card>
      {:else}
        {#if data.auth}
          <p>No wikis yet! Create or participate in a wiki</p>
        {:else}
          <p>Please login to view and create your wikis</p>
        {/if}
      {/each}
      {#if data.auth}
        <Card on:buttonClick={toggleCreateDialog('wiki')}>
          <h3 class="h3 p-2">+</h3>
        </Card>
      {/if}
    {/await}
  </div>
</div>

<p>Auth: {data.auth}</p>

<style lang="postcss">
  h3 {
    margin: 0;
  }
  p {
    line-height: 1.5em;
  }
  .card-container {
    margin: 3em;
  }
</style>
