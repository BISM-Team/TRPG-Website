<script lang="ts">
  import type { SubmitFunction } from "@sveltejs/kit";
  import type { ActionData, PageData } from "./$types";
  import { enhance } from "$app/forms";
  import Modal from "$lib/components/modal.svelte";
  import Toolbar from "$lib/components/toolbar.svelte";
  import WikiSearch from "$lib/components/wiki_search.svelte";
  import { page } from "$app/stores";
  import SideBarEntry from "./sideBarEntry.svelte";
  import { slide } from "svelte/transition";
  import WikiPage from "$lib/components/WikiPage.svelte";

  export let data: PageData;
  export let form: ActionData;
  let edit = false;
  let disabled = false;
  let showDeleteModal = false;
  let showSearchModal = false;
  let showSidebar = true;

  function toggleEdit() {
    edit=!edit;
  }

  function toggleDeleteModal() {
    showDeleteModal=!showDeleteModal;
  }

  function toggleSearchModal() {
    showSearchModal=!showSearchModal;
  }

  function toggleSidebar() {
    showSidebar=!showSidebar;
  }

  const handleDelete: SubmitFunction = async function () {
    disabled = true;
    return async ({ result, update }) => {
      await update({reset: false});
      if (result.type === "success") { 
        showDeleteModal = false;
        edit = false; 
      }
      disabled = false;
    };
  };

  const handleSave: SubmitFunction = async function ({ formData }) {
    disabled = true;
    formData.set("text", formData.get("pre")?.toString() + "\n" + formData.get("actual")?.toString() + "\n" + formData.get("post")?.toString());
    formData.delete("pre");
    formData.delete("actual");
    formData.delete("post");
    return async ({ result, update }) => {
      await update({reset: false});
      if (result.type === "success") { 
        edit = false; 
      }
      disabled = false;
    };
  };
</script>

<Toolbar>
  <button {disabled} id="sideBarButton" class="w3-button" style:margin-right="auto" on:click={toggleSidebar}>
    <span class="material-symbols-outlined w3-text-white">menu</span>
  </button>
  {#if edit}
    <button {disabled} id="deleteButton" class="w3-button" on:click={toggleDeleteModal}>
      <span class="material-symbols-outlined w3-text-white">delete</span>
    </button>
  {:else}
    <button {disabled} id="searchButton" class="w3-button" on:click={toggleSearchModal}>
      <span class="material-symbols-outlined w3-text-white">search</span>
    </button>
  {/if}
  <button {disabled} id="editButton" class="w3-button" on:click={toggleEdit}>
    <span class="material-symbols-outlined w3-text-white">{edit ? "visibility" : "edit"}</span>
  </button>
</Toolbar>

{#if showDeleteModal}
  <Modal {disabled} on:close={toggleDeleteModal}>
    <h2 class="w3-padding">Do you want to delete this page?</h2>
    <p>
      <em>Note that only the content you are allowed to modify will be deleted</em>
    </p>
    <form id="deleteConfirmationButtons" class="w3-container" method="post" action="?/delete" use:enhance={handleDelete}>
      <input type="hidden" name="hash" value={data.hash} />
      <button {disabled} class="w3-button w3-margin w3-grey" type="button" on:click={toggleDeleteModal}>Cancel</button>
      <button {disabled} class="w3-button w3-margin w3-teal" type="submit">Yes</button>
    </form>
  </Modal>
{/if}

{#if showSearchModal}
  <Modal {disabled} on:close={toggleSearchModal}>
    <WikiSearch campaignId={$page.params.campaign} on:close={toggleSearchModal}></WikiSearch>
  </Modal>
{/if}

<div class="layoutWithSidebar">
  {#if showSidebar}
    <div class="sidebarContainer w3-padding-32 w3-teal" transition:slide={{ axis: "x" }}>
      {#each data.campaign.wikiTree.children as child}
        <SideBarEntry node={child}/>
      {/each}
    </div>
  {/if}
  <WikiPage bind:disabled bind:edit toc={true} page={data} {handleSave}
            result={form ? { 
                          conflict: form.creation_conflict || form.update_conflict || form.delete_conflict || false, 
                          client_error: form.invalid_campaign_id_or_page_name || form.missing_hash || form.missing_page || form.missing_text_or_tree || form.no_first_heading || false 
                        } : null}/>
</div>

<style>
  .layoutWithSidebar {
    display: flex;
    flex-grow: 1;
  }

  .sidebarContainer {
    height: 100vh;
  }
</style>
