<script lang="ts">
  import { enhance } from '$app/forms';
  import Card from '$lib/components/card.svelte';
  import Modal from '$lib/components/modal.svelte';
  import Search from '$lib/components/search.svelte';
  import { propagateErrors } from '$lib/utils';
  import type { PageData, SubmitFunction } from './$types';
  import type { fetch as kit_fetch } from '@sveltejs/kit';

  export let data: PageData;

  let show_modal: {
    player: boolean;
    wiki: boolean;
  } = { player: false, wiki: false };
  let disabled = false;

  $: defaultDashboardId =
    data.campaign.Dashboard_Campaign.find((dashboard_campaign) => dashboard_campaign.default)
      ?.dashboardId ?? 'empty';

  const toggleAddDialog = (field: keyof typeof show_modal) =>
    function () {
      const tmp = show_modal[field];
      show_modal = {
        player: false,
        wiki: false
      };
      show_modal[field] = !tmp;
    };

  const submitAdd: (field: keyof typeof show_modal) => SubmitFunction = (field) =>
    async function () {
      disabled = true;
      return async ({ result, update }) => {
        await update({ reset: false });
        if (result.type === 'success') toggleAddDialog(field)();
        disabled = false;
      };
    };

  const load_players: () => Promise<({ name: string } & Record<string, any>)[]> = async () => {
    return [];
  };

  const load_wikis: () => Promise<({ name: string } & Record<string, any>)[]> = async () => {
    const response = await (fetch as typeof kit_fetch)(
      `/api/wikis/search?campaignId=${data.params.campaign}`
    );
    await propagateErrors(response, new URL(window.location.href));
    if (response.ok) {
      const data = await response.json();
      if ('wikis' in data) {
        return data.wikis.map((wiki) => ({ name: wiki.name, id: wiki.id }));
      } else throw new Error('unexpected fetch behaviour');
    } else throw new Error('unexpected branch');
  };
</script>

{#if show_modal.player}
  <Modal {disabled} on:close={toggleAddDialog('player')}>
    <Search fetch_function={load_players}>
      <svelte:fragment slot="results" let:results>
        <form action="?/addPlayer" method="post" use:enhance={submitAdd('player')}>
          <div class="cards">
            {#each results as player}
              <Card button={{ type: 'submit', name: 'playerId', value: player.id }}>
                {player.name}
              </Card>
            {/each}
          </div>
        </form>
      </svelte:fragment>
    </Search>
  </Modal>
{/if}

{#if show_modal.wiki}
  <Modal {disabled} on:close={toggleAddDialog('wiki')}>
    <Search fetch_function={load_wikis}>
      <svelte:fragment slot="results" let:results>
        <form action="?/addWiki" method="post" use:enhance={submitAdd('wiki')}>
          <div class="search-cards">
            {#each results as wiki}
              <Card>
                <button type="submit" name="wikiId" value={wiki.id}>{wiki.name}</button>
              </Card>
            {/each}
          </div>
        </form>
      </svelte:fragment>
    </Search>
  </Modal>
{/if}

<h1 class="my-xxl h1 mx-auto w-fit">{data.campaign.name}</h1>

<div class="my-xxl mx-auto w-fit">
  <Card link="/campaigns/{data.params.campaign}/dashboards/{defaultDashboardId}">Dashboard</Card>
</div>

<hr />

<div class="section-container my-l mx-xl">
  <h2 class="h2">Wikis</h2>
  <div class="card-container mt-l gap-l px-s">
    <div class="cards gap-l py-m px-0">
      {#each data.campaign.wikis as wiki}
        <Card link={'/wikis/' + wiki.id + '/pages/index'}>
          <h3 class="h3 p-2 text-center">{wiki.name}</h3>
        </Card>
      {:else}
        <p>No wikis yet! Add one!</p>
      {/each}
      {#if data.auth}
        <div class="add-button">
          <Card on:buttonClick={toggleAddDialog('wiki')}>
            <h3 class="h3 p-2"><span class="material-symbols-outlined">Add</span></h3>
          </Card>
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .card-container {
    display: flex;
    flex-direction: row;
    align-items: center;
    overflow-x: auto;
  }

  .cards {
    justify-content: start;
    flex-wrap: nowrap;
  }

  .add-button {
    margin-left: auto;
  }

  form button {
    width: initial;
  }
</style>
