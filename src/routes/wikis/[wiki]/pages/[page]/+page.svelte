<script lang="ts">
  import type { SubmitFunction } from '@sveltejs/kit';
  import type { ActionData, PageData } from './$types';
  import { enhance } from '$app/forms';
  import Modal from '$lib/components/modal.svelte';
  import Toolbar from '$lib/components/toolbar.svelte';
  import SideBarEntry from './sideBarEntry.svelte';
  import { fade, slide } from 'svelte/transition';
  import WikiPage from '$lib/components/WikiPage.svelte';
  import { parseSource } from '$lib/WorldWiki/tree/tree';
  import { addHash } from '$lib/WorldWiki/tree/heading';
  import type { Root } from 'mdast';
  import type { fetch as kit_fetch } from '@sveltejs/kit';
  import { propagateErrors } from '$lib/utils';
  import Search from '$lib/components/search.svelte';

  export let data: PageData;
  export let form: ActionData;
  let edit = false;
  let disabled = false;
  let showDeleteModal = false;
  let showSearchModal = false;
  let showSidebar = false;
  let sidebar_wrapper: HTMLElement;

  function clickOutside(event: MouseEvent) {
    if (event.target == sidebar_wrapper) showSidebar = false;
  }

  function keyUp(ev: KeyboardEvent) {
    if (ev.key === 'Escape') showSidebar = false;
  }

  function toggleEdit() {
    edit = !edit;
  }

  function toggleDeleteModal() {
    showDeleteModal = !showDeleteModal;
  }

  function toggleSearchModal() {
    showSearchModal = !showSearchModal;
  }

  function toggleSidebar() {
    showSidebar = !showSidebar;
  }

  const handleDelete: SubmitFunction = async function () {
    disabled = true;
    return async ({ result, update }) => {
      await update({ reset: false });
      if (result.type === 'success') {
        showDeleteModal = false;
        edit = false;
      }
      disabled = false;
    };
  };

  const handleSave: SubmitFunction = async function ({ formData }) {
    disabled = true;
    formData.set(
      'text',
      formData.get('pre')?.toString() +
        '\n' +
        formData.get('actual')?.toString() +
        '\n' +
        formData.get('post')?.toString()
    );
    formData.delete('pre');
    formData.delete('actual');
    formData.delete('post');

    return async ({ result, update }) => {
      await update({ reset: false });
      if (result.type === 'success') {
        edit = false;
      }
      disabled = false;
    };
  };

  const addHeading: SubmitFunction = async function ({ formData }) {
    disabled = true;
    const pre_str = formData.get('pre')?.toString();
    const heading = formData.get('heading')?.toString();
    const level_str = formData.get('level')?.toString() ?? '2';
    formData.delete('pre');
    formData.delete('heading');
    if (!pre_str || !heading) throw new Error('unexpected error');

    const pre: Root = JSON.parse(pre_str);
    const level = parseInt(level_str);
    const actual = await parseSource(addHash(`${heading}`, level), data.user_id);
    const children = pre.children.concat(actual.children);
    formData.set(
      'tree',
      JSON.stringify({
        type: 'root',
        children
      })
    );

    return async ({ result, update }) => {
      await update({ reset: false });
      if (result.type === 'success') {
        edit = false;
      }
      disabled = false;
    };
  };

  const load_search: () => Promise<({ name: string } & Record<string, any>)[]> = async () => {
    const response = await (fetch as typeof kit_fetch)(`/api/wikis/${data.params.wiki}/search`);
    await propagateErrors(response, new URL(window.location.href));
    if (response.ok) {
      return (await response.json()).pages.map((page) => ({ name: page }));
    } else throw new Error('unexpected branch');
  };
</script>

<div class="sticky top-0 z-20">
  <Toolbar>
    <svelte:fragment slot="left">
      <button {disabled} id="sideBarButton" class="btn" on:click={toggleSidebar}>
        <span class="material-symbols-outlined text-primary-200">menu</span>
      </button>
    </svelte:fragment>
    <svelte:fragment slot="right">
      {#if edit}
        <button {disabled} id="deleteButton" class="mx-m px-s" on:click={toggleDeleteModal}>
          <span class="material-symbols-outlined text-primary-200">delete</span>
        </button>
      {:else}
        <button {disabled} id="searchButton" class="mx-m px-s" on:click={toggleSearchModal}>
          <span class="material-symbols-outlined text-primary-200">search</span>
        </button>
      {/if}
      <button {disabled} id="editButton" class="mx-m px-s" on:click={toggleEdit}>
        <span class="material-symbols-outlined text-primary-200"
          >{edit ? 'visibility' : 'edit'}</span
        >
      </button>
    </svelte:fragment>
  </Toolbar>

  {#if showDeleteModal}
    <Modal {disabled} on:close={toggleDeleteModal}>
      <h2 class="w3-padding h2">Do you want to delete this page?</h2>
      <p>
        <em>Note that only the content you are allowed to modify will be deleted</em>
      </p>
      <form
        id="deleteConfirmationButtons"
        class="w3-container"
        method="post"
        action="?/delete"
        use:enhance={handleDelete}
      >
        <input type="hidden" name="hash" value={data.hash} />
        <button {disabled} class="btn-secondary" type="button" on:click={toggleDeleteModal}
          >Cancel</button
        >
        <button {disabled} class="btn-primary" type="submit">Yes</button>
      </form>
    </Modal>
  {/if}

  {#if showSearchModal}
    <Modal {disabled} on:close={toggleSearchModal}>
      <Search fetch_function={load_search}>
        <svelte:fragment slot="results" let:results>
          {#each results as page}
            <a
              href={'/wikis/' + data.params.wiki + '/pages/' + page.name}
              on:click={toggleSearchModal}
              class="search-link p-m block"
            >
              <li>{page.name}</li>
            </a>
          {/each}
        </svelte:fragment>
        <svelte:fragment slot="not_found" let:searchText>
          <a
            data-sveltekit-preload-data="off"
            data-sveltekit-preload-code="hover"
            href={'./' + searchText.trim()}
            on:click={toggleSearchModal}
            class="search-link p-m block opacity-50"
          >
            <li>
              + {searchText.trim()}
            </li>
          </a>
        </svelte:fragment>
      </Search>
    </Modal>
  {/if}
</div>

<svelte:document on:click={clickOutside} on:keyup={keyUp} />

<div class="flex h-full flex-row">
  {#if showSidebar}
    <div id="sidebarWrapper" transition:fade bind:this={sidebar_wrapper}>
      <div
        id="sidebarContainer"
        class="p-m bg-surface-300-600-token"
        transition:slide={{ axis: 'x' }}
      >
        {#each data.wiki.wikiTree.children as child}
          <SideBarEntry node={child} />
        {/each}
      </div>
    </div>
  {/if}
  <WikiPage
    bind:disabled
    bind:edit
    toc={false}
    page={data}
    {handleSave}
    {addHeading}
    result={form
      ? {
          conflict: form.creation_conflict || form.update_conflict || form.delete_conflict || false,
          client_error:
            form.invalid_campaign_id_or_page_name ||
            form.missing_hash ||
            form.missing_page ||
            form.missing_text_or_tree ||
            form.no_first_heading ||
            false
        }
      : null}
  />
</div>

<style lang="postcss">
  #sidebarWrapper {
    position: fixed; /* Stay in place */
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: flex-start;
    z-index: 50; /* Sit on top */
    width: 100%; /* Full width */
    height: 100%; /* Full height */
    overflow: auto; /* Enable scroll if needed */
    background-color: rgb(0, 0, 0); /* Fallback color */
    background-color: rgba(0, 0, 0, 0.4); /* Black w/ opacity */
  }

  #sidebarContainer {
    position: relative;
    height: 100vh;
    overflow-y: auto;
    opacity: 1 !important;
  }

  .search-link {
    @apply transition;
  }

  .search-link:hover {
    @apply bg-surface-300-600-token;
  }
</style>
