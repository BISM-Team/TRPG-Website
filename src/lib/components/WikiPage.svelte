<script lang="ts">
  import { enhance } from "$app/forms";
  import { addHash, getFirstHeadingIndexAfter, searchHeadingIndex } from "$lib/WorldWiki/tree/heading";
  import { renderTree, stringifyTree } from "$lib/WorldWiki/tree/tree";
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
  export let heading: string | undefined = undefined;

  let renderedTree: Promise<string>;
  let extractedTrees: {
    pre: Root;
    actual: Root;
    post: Root;
  }
  $: extractedTrees = extractTree(page.tree, heading)
  $: renderedTree = renderTree(JSON.parse(JSON.stringify(extractedTrees.actual)), page.user_id, page.gm_id)

  function extractTree(tree: Root, heading: string | undefined): typeof extractedTrees {
    if(!heading) return {
      pre: {
        type: "root",
        children: []
      },
      actual: tree,
      post: {
        type: "root",
        children: []
      }
    };
    const headingIndex = searchHeadingIndex(tree, heading);
    const nextHeadingIndex = getFirstHeadingIndexAfter(tree, headingIndex);
    if(headingIndex === -1) throw new Error("Heading not found");
    return {
      pre: {
        type: "root",
        children: tree.children.slice(0, headingIndex+1)
      },
      actual: {
        type: "root",
        children: tree.children.slice(headingIndex+1, nextHeadingIndex !== -1 ? nextHeadingIndex : undefined)
      },
      post: {
        type: "root",
        children: nextHeadingIndex !== -1 ? tree.children.slice(nextHeadingIndex) : []
      }
    }
  }

  async function stringfyTrees() {
    return { 
      pre: await stringifyTree(extractedTrees.pre), 
      actual: await stringifyTree(extractedTrees.actual), 
      post: await stringifyTree(extractedTrees.post)
    }
  }
</script>

<div class="w3-container" id="page">
  {#if edit}
    {#if result?.conflict} 
      <p class="w3-panel w3-red">Someone updated this page just now, please refresh the page and try again. <br /> If this happens again please contact us.</p> 
    {/if}
    {#if result?.client_error} 
      <p class="w3-panel w3-red">Client Error, please contact us to investigate the cause!</p> 
    {/if}
    {#await stringfyTrees()}
      <p>stringifying markdown...</p>
    {:then stringified}
      <form class="w3-container w3-padding-32" method="post" action={saveAction} use:enhance={handleSave}>
        <input type="hidden" name="hash" value={page.hash} />
        <input type="hidden" name="pre" value={stringified.pre}>
        <textarea id="textArea" name="actual" value={stringified.actual} />
        <input type="hidden" name="post" value={stringified.post}>
        <br />
        <div class="buttonContainer w3-center w3-block">
          <button {disabled} class="w3-button w3-grey" type="button" on:click={() => {edit = false;}}>Cancel</button>
          <button {disabled} class="w3-button w3-teal" type="submit">Done</button>
        </div>
      </form>
    {/await}
  {:else}
    {#if toc && !heading}
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
      {#await renderedTree}
        <p>rendering markdown...</p>
      {:then _renderedTree} 
        {@html _renderedTree}
      {/await}
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