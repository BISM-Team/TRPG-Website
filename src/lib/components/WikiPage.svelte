<script lang="ts">
  import { enhance } from "$app/forms";
  import { addHash, getFirstHeadingIndexAfter, searchHeadingIndex } from "$lib/WorldWiki/tree/heading";
  import { renderTree, stringifyTree } from "$lib/WorldWiki/tree/tree";
  import { capitalizeFirstLetter } from "$lib/utils";
  import type { Heading } from "@prisma/client";
  import type { SubmitFunction } from "@sveltejs/kit";
  import type { Root } from "mdast";
  import ErrorBar from "./error_bar.svelte";

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
  export let addHeading: SubmitFunction;
  export let saveAction: string = "?/update";
  export let heading: string | undefined = undefined;

  let renderedTree: Promise<string>;
  let extractedTrees: {
    pre: Root;
    actual: Root;
    post: Root;
  }
  let missing_heading: boolean = false;
  $: extractedTrees = extractTree(page.tree, heading)
  $: renderedTree = renderTree(JSON.parse(JSON.stringify(extractedTrees.actual)), page.user_id, page.gm_id)

  function extractTree(tree: Root, heading: string | undefined): typeof extractedTrees {
    if(!heading) {
      missing_heading = false;
      return {
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
    }
    const headingIndex = searchHeadingIndex(tree, heading);
    const nextHeadingIndex = getFirstHeadingIndexAfter(tree, headingIndex);
    if(headingIndex === -1) {
      console.log(tree, heading, headingIndex);
      missing_heading = true;
      return {
        pre: tree,
        actual: {
          type: "root",
          children: []
        },
        post: {
          type: "root",
          children: []
        }
      };
    } else missing_heading = false;
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
    const obj = JSON.parse(JSON.stringify(extractedTrees));
    return { 
      pre: await stringifyTree(obj.pre), 
      actual: await stringifyTree(obj.actual), 
      post: await stringifyTree(obj.post)
    }
  }
</script>

<div class="w3-container" id="page">
  {#if edit}
    {#if result?.conflict} 
      <ErrorBar text="Someone updated this page just now, please refresh the page and try again. <br /> If this happens again please contact us."/>
    {/if}
    {#if result?.client_error} 
      <ErrorBar text="Client Error, please contact us to investigate the cause!"/>
    {/if}
    {#await stringfyTrees()}
      <p>stringifying markdown...</p>
    {:then stringified}
      <form class="w3-container p-2" method="post" action={saveAction} use:enhance={handleSave}>
        <input type="hidden" name="hash" value={page.hash} class="input"/>
        <input type="hidden" name="pre" value={stringified.pre} class="input">
        <textarea id="textArea" name="actual" value={stringified.actual} class="textarea"/>
        <input type="hidden" name="post" value={stringified.post} class="input">
        <br />
        <div class="buttonContainer text-center block">
          <button {disabled} class="btn-secondary" type="button" on:click={() => {edit = false;}}>Cancel</button>
          <button {disabled} class="btn-primary" type="submit">Done</button>
        </div>
      </form>
    {/await}
  {:else}
    {#if toc && !heading}
      <div id="toc_container">
        <div id="toc" class="w3-card-2">
          {#each page.headings as heading}
            <a class="block transition-[text-decoration] w3-container w3-padding" href="#{heading.id}">
              <span class="text-gray">{addHash("", heading.level).trim()}</span>
              {heading.text}
            </a>
          {/each}
        </div>
      </div>
    {/if}
    <div class="w3-container p-2" id="content">
      {#await renderedTree}
        <p>rendering markdown...</p>
      {:then _renderedTree} 
        {#if heading && missing_heading}
          <div class="text-center">
            <h3 class="h3 w3-section w3-padding">Heading '{capitalizeFirstLetter(heading)}' does not exist yet</h3>
            <p>Do you want to create it?</p>
            <form id="btnContainer" class="w3-container" method="post" action={saveAction} use:enhance={addHeading}>
              <input type="hidden" name="hash" value={page.hash} class="input"/>
              <input type="hidden" name="pre" value={JSON.stringify(extractedTrees.pre)} class="input"/>
              <input type="hidden" name="heading" value={capitalizeFirstLetter(heading)} class="input"/>
              <button {disabled} class="w3-margin btn btn-primary" type="submit">Yes</button>
            </form>
          </div>
        {:else}
          {@html _renderedTree}
        {/if}
      {/await}
    </div>
  {/if}
</div>

<style lang="postcss">
  
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