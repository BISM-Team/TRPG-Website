<script lang="ts">
    import type { PageData } from './$types';
    import { enhance } from '$app/forms';
    import Card from '$lib/components/card.svelte';
    import Modal from '$lib/components/modal.svelte';
    import type { SubmitFunction } from '@sveltejs/kit';
  import { propagateErrors } from '$lib/utils';
  import { page } from '$app/stores';
  import type { Character } from '@prisma/client';
    
    export let data: PageData;
    let show_modal = false;
    let disabled = false;

    let textSearch: string = "";
    let characters: Character[] = [];

    async function toggleAddDialog() {
      show_modal = !show_modal;
      if(show_modal) await loadCharacters();
      else characters = [];
    }

    const handleSubmit: SubmitFunction = function () {
      disabled = true;
      return async ({ result, update }) => {
        await update({reset: false});
        if (result.type === "success") show_modal = false;
        disabled = false;
      };
    };

    async function loadCharacters() {
      const response = await fetch(`/api/campaign/${data.params.campaign}/characters?not_in=true`);
      await propagateErrors(response, $page.url);
      if(!response.ok) throw new Error("unexpected error");
      characters = (await response.json()).characters as Character[];
    }
</script>

{#if show_modal}
  <Modal {disabled} on:close={toggleAddDialog}>
    <div id="modalContent">
      <form method="post" action="?/add" use:enhance={handleSubmit}>
        <input type="text" id="searchInput" class="input" bind:value={textSearch}>
        <div class="cards">
          {#each characters.filter(character => !textSearch || character.name.toLowerCase().trim().includes(textSearch.toLowerCase().trim())) as character}
            <Card button={{role: "submit", name: "characterId", value: character.id}}>
              <h5 class="p-1">{character.name}</h5>
            </Card>
          {/each}
        </div>
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

    <Card on:buttonClick={toggleAddDialog}>
      <h3 class="h3 p-2">Add character</h3>
    </Card>
</div>