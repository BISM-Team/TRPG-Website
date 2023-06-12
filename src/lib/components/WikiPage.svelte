<script lang="ts">
  import { enhance } from "$app/forms";
  import { addHash } from "$lib/WorldWiki/tree/heading";
  import { stringifyTree } from "$lib/WorldWiki/tree/tree";
  import type { Heading } from "@prisma/client";
  import type { SubmitFunction } from "@sveltejs/kit";
  import type { Root } from "mdast";

  export let page: {
    hash: string, 
    headings: (Omit<Heading, "index"> & {
      viewers: string[];
      modifiers: string[];
    })[], 
    tree: Root,
    user_id: string, 
    gm_id: string, 
    renderedTree: string
  }

  export let disabled: boolean;
  export let edit: boolean;
  export let result: {
    conflict: boolean;
    client_error: boolean;
  } | null;
  export let toc: boolean;
  export let handleSave: SubmitFunction;
  export let saveAction: string = "?/update";
</script>

<div class="w3-container" id="page">
  {#if edit}
    {#if result?.conflict} 
      <p class="w3-panel w3-red">Someone updated this page just now, please refresh the page and try again. <br /> If this happens again please contact us.</p> 
    {/if}
    {#if result?.client_error} 
      <p class="w3-panel w3-red">Client Error, please contact us to investigate the cause!</p> 
    {/if}
    {#await stringifyTree(page.tree)}
      <p>stringifying markdown...</p>
    {:then src}
      <form class="w3-container w3-padding-32" method="post" action={saveAction} use:enhance={handleSave}>
        <input type="hidden" name="hash" value={page.hash} />
        <textarea name="text" id="textArea" value={src} />
        <br />
        <div class="buttonContainer w3-center w3-block">
          <button {disabled} class="w3-button w3-grey" type="button" on:click={() => {edit = false;}}>Cancel</button>
          <button {disabled} class="w3-button w3-teal" type="submit">Done</button>
        </div>
      </form>
    {/await}
  {:else}
    {#if toc}
      <div id="toc_container">
        <div id="toc" class="w3-card-2">
          {#each page.headings as heading}
            <a class="w3-block w3-container w3-padding" href="#{heading.id}">
              <span class="w3-text-gray">{addHash("", heading.level).trim()}</span>
              {heading.text}
            </a>
          {/each}
        </div>
      </div>
    {/if}
    <div class="w3-container w3-padding-32" id="content">
      {@html page.renderedTree}
    </div>
  {/if}
</div>

<style>
  #page {
    position: relative;
    width: 100%;
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