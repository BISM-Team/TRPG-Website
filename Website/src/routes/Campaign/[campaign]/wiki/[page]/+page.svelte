<script lang="ts">
  import type { SubmitFunction } from "@sveltejs/kit";
  import type { PageData } from "./$types";
  import { stringifyTree } from "$lib/WorldWiki/tree/tree";
  import { onMount } from "svelte";
  import { enhance } from "$app/forms";
  import { page } from "$app/stores";
  import { addHash } from "$lib/WorldWiki/tree/heading";

  export let data: PageData;
  let edit = false;
  let disable = false;
  let show_modal = false;

  onMount(() => {
    window.onclick = function (event) {
      let modal: HTMLElement | null;
      if (
        show_modal &&
        (modal = document.getElementById("modalWrapper")) &&
        event.target == modal
      )
        show_modal = false;
    };
  });

  const handleDelete: SubmitFunction = async function () {
    disable = true;
    return async ({ result, update }) => {
      edit = false;
      show_modal = false;
      disable = false;
      if (result.type === "success" && result.data?.deleted) {
        result.status = 404;
        (result.type as any) = "error";
      }
      await update();
    };
  };

  const handleSubmit: SubmitFunction = async function () {
    disable = true;
    return async ({ result, update }) => {
      if (result.type === "success") edit = false;
      disable = false;
      await update();
    };
  };
</script>

{#if show_modal}
  <div id="modalWrapper">
    <div id="modalContent" class="w3-center w3-container w3-padding-16">
      <h2 class="w3-padding">Do you want to delete this page?</h2>
      <p>
        <em
          >Note that only the content you are allowed to modify will be deleted</em
        >
      </p>
      <form
        id="deleteConfirmationButtons"
        class="w3-container"
        method="post"
        use:enhance={handleDelete}
      >
        <input type="hidden" name="version" value={data.version} />
        <input type="hidden" name="text" value="" />
        <button
          disabled={disable}
          class="w3-button w3-margin w3-grey"
          type="button"
          on:click={() => {
            show_modal = false;
          }}>Cancel</button
        >
        <button
          disabled={disable}
          class="w3-button w3-margin w3-teal"
          type="submit">Yes</button
        >
      </form>
    </div>
  </div>
{/if}

<div id="topRightButtonContainer" class="w3-block">
  <button
    disabled={disable}
    id="editButton"
    class="w3-button"
    on:click={() => {
      edit = !edit;
    }}
    ><span class="material-symbols-outlined"
      >{edit ? "visibility" : "edit"}</span
    ></button
  >
  <button
    disabled={disable}
    id="deleteButton"
    class="w3-button"
    on:click={() => {
      show_modal = true;
    }}><span class="material-symbols-outlined">delete</span></button
  >
</div>

<div class="w3-container" id="page">
  {#if edit}
    {#if $page.status === 409}
      <p class="w3-panel w3-red">
        Oops... this page has been edited while you were working on it... Please <strong
          >copy the information you were editing</strong
        > and reload the page to get the updated version!
      </p>
    {/if}
    {#if $page.error}
      <p class="w3-panel w3-red">
        Unspecified Error, please contact us to investigate the cause!
      </p>
    {/if}
    {#await stringifyTree(data.tree)}
      Stringifying markdown...
    {:then src}
      <form
        class="w3-container w3-padding-32"
        id="form"
        method="post"
        use:enhance={handleSubmit}
      >
        <input type="hidden" name="version" value={data.version} />
        <textarea name="text" id="textArea" value={src} />
        <br />
        <button
          disabled={disable}
          class="w3-button w3-grey"
          type="button"
          on:click={() => {
            edit = false;
          }}>Cancel</button
        >
        <button disabled={disable} class="w3-button w3-teal" type="submit"
          >Done</button
        >
      </form>
    {/await}
  {:else}
    <div id="toc_container">
      <div id="toc" class="w3-card-2">
        {#each data.headings as heading}
          <a class="w3-block w3-container w3-padding" href="#{heading.id}"
            ><span class="w3-text-gray"
              >{addHash("", heading.level).trim()}</span
            >
            {heading.text}</a
          >
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
  #topRightButtonContainer {
    background-color: teal;
    display: flex;
    justify-content: right;
    padding: 0em 1em;
    gap: 1em;
  }
  #topRightButtonContainer button {
    text-align: center;
    box-sizing: content-box;
    width: 4em;
    height: 24px;
    transition: 0.1s ease-out;
  }
  #form {
    margin-top: 1.5em;
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
  #modalWrapper {
    position: fixed; /* Stay in place */
    z-index: 1; /* Sit on top */
    left: 0;
    top: 0;
    width: 100%; /* Full width */
    height: 100%; /* Full height */
    overflow: auto; /* Enable scroll if needed */
    background-color: rgb(0, 0, 0); /* Fallback color */
    background-color: rgba(0, 0, 0, 0.4); /* Black w/ opacity */
  }

  #modalContent {
    background-color: #fefefe;
    margin: 15% auto; /* 15% from the top and centered */
    border: 1px solid #888;
    max-width: 40em;
  }
  #modalContent button {
    width: 6em;
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
</style>
