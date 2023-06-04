<script lang="ts">
  import type { SubmitFunction } from "@sveltejs/kit";
  import type { ActionData, PageData } from "./$types";
  import { stringifyTree } from "$lib/WorldWiki/tree/tree";
  import { enhance } from "$app/forms";
  import { addHash } from "$lib/WorldWiki/tree/heading";
  import Modal from "$lib/components/modal.svelte";
  import Toolbar from "$lib/components/toolbar.svelte";
  import WikiSearch from "$lib/components/wiki_search.svelte";
  import { page } from "$app/stores";

  export let data: PageData;
  export let form: ActionData;
  let edit = false;
  let disable = false;
  let showDeleteModal = false;
  let showSearchModal = false;

  function toggleEdit() {
    edit=!edit;
  }

  function toggleDeleteModal() {
    showDeleteModal=!showDeleteModal;
  }

  function toggleSearchModal() {
    showSearchModal=!showSearchModal;
  }

  const handleDelete: SubmitFunction = async function () {
    disable = true;
    return async ({ result, update }) => {
      await update({reset: false});
      if (result.type === "success") { 
        showDeleteModal = false;
        edit = false; 
      }
      disable = false;
    };
  };

  const handleSubmit: SubmitFunction = async function () {
    disable = true;
    return async ({ result, update }) => {
      await update({reset: false});
      if (result.type === "success") { 
        edit = false; 
      }
      disable = false;
    };
  };
</script>

<Toolbar>
  {#if edit}
    <button disabled={disable} id="deleteButton" class="w3-button" on:click={toggleDeleteModal}>
      <span class="material-symbols-outlined w3-text-white">delete</span>
    </button>
  {:else}
    <button disabled={disable} id="searchButton" class="w3-button" on:click={toggleSearchModal}>
      <span class="material-symbols-outlined w3-text-white">search</span>
    </button>
  {/if}
  <button disabled={disable} id="editButton" class="w3-button" on:click={toggleEdit}>
    <span class="material-symbols-outlined w3-text-white">{edit ? "visibility" : "edit"}</span>
  </button>
</Toolbar>

{#if showDeleteModal}
  <Modal {disable} on:close={toggleDeleteModal}>
    <h2 class="w3-padding">Do you want to delete this page?</h2>
    <p>
      <em>Note that only the content you are allowed to modify will be deleted</em>
    </p>
    <form id="deleteConfirmationButtons" class="w3-container" method="post" action="?/delete" use:enhance={handleDelete}>
      <input type="hidden" name="hash" value={data.hash} />
      <button disabled={disable} class="w3-button w3-margin w3-grey" type="button" on:click={toggleDeleteModal}>Cancel</button>
      <button disabled={disable} class="w3-button w3-margin w3-teal" type="submit">Yes</button>
    </form>
  </Modal>
{/if}

{#if showSearchModal}
  <Modal {disable} on:close={toggleSearchModal}>
    <WikiSearch campaignId={$page.params.campaign} on:close={toggleSearchModal}></WikiSearch>
  </Modal>
{/if}

<div class="w3-container" id="page">
  {#if edit}
    {#if form?.creation_conflict || form?.update_conflict} 
      <p class="w3-panel w3-red">Someone updated this page just now, please refresh the page and try again. <br /> If this happens again please contact us.</p> 
    {/if}
    {#if form?.invalid_campaign_id_or_page_name || form?.missing_text_or_tree} 
      <p class="w3-panel w3-red">Client Error, please contact us to investigate the cause!</p> 
    {/if}
    {#await stringifyTree(data.tree)}
      Stringifying markdown...
    {:then src}
      <form class="w3-container w3-padding-32" method="post" action="?/update" use:enhance={handleSubmit}>
        <input type="hidden" name="hash" value={data.hash} />
        <textarea name="text" id="textArea" value={src} />
        <br />
        <div class="buttonContainer w3-center w3-block">
          <button disabled={disable} class="w3-button w3-grey" type="button" on:click={() => {edit = false;}}>Cancel</button>
          <button disabled={disable} class="w3-button w3-teal" type="submit">Done</button>
        </div>
      </form>
    {/await}
  {:else}
    <div id="toc_container">
      <div id="toc" class="w3-card-2">
        {#each data.headings as heading}
          <a class="w3-block w3-container w3-padding" href="#{heading.id}">
            <span class="w3-text-gray">{addHash("", heading.level).trim()}</span>
            {heading.text}
          </a>
        {/each}
      </div>
    </div>
    <div class="w3-container w3-padding-32" id="content">
      {@html data.renderedTree}
    </div>
  {/if}
</div>

<style>
  #page {
    position: relative;
  }
  #textArea {
    width: 90%;
    height: 74vh;
    padding: 12px 20px;
    box-sizing: border-box;
    border: 2px solid #ccc;
    border-radius: 4px;
    background-color: #f8f8f8;
    resize: none;
  }

  #toc_container {
    position: absolute;
    top: 4em;
    right: 15%;
    height: 100%;
  }

  #toc {
    position: sticky;
    top: 10%;
    background-color: white;
    width: fit-content;
    padding: 0.5em;
  }

  #toc a {
    text-decoration: underline solid rgba(0, 0, 0, 0) 1px;
    transition: 0.2s ease-out;
  }

  #toc a:hover {
    text-decoration: underline solid rgba(0, 0, 0, 1) 1px;
  }

  .buttonContainer button {
    width: 30%;
    margin: 0 5%;
    margin-top: 1em;
  }
</style>
