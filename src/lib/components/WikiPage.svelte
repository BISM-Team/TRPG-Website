<script lang="ts">
  import { enhance } from '$app/forms';
  import {
    addHash,
    getFirstHeadingIndexAfter,
    searchHeadingIndex
  } from '$lib/WorldWiki/tree/heading';
  import { renderTree, stringifyTree } from '$lib/WorldWiki/tree/tree';
  import { capitalizeFirstLetter } from '$lib/utils';
  import type { Heading } from '@prisma/client';
  import type { SubmitFunction } from '@sveltejs/kit';
  import type { Root } from 'mdast';
  import ErrorBar from './error_bar.svelte';

  export let page: {
    hash: string;
    headings: (Omit<Heading, 'index'> & {
      viewers: string[];
      modifiers: string[];
    })[];
    tree: Root;
    user_id: string;
    gm_id: string;
  };
  export let disabled: boolean;
  export let edit: boolean;
  export let result: {
    conflict: boolean;
    client_error: boolean;
  } | null;
  export let toc: boolean;
  export let handleSave: SubmitFunction;
  export let addHeading: SubmitFunction;
  export let saveAction: string = '?/update';
  export let heading: string | undefined = undefined;

  let renderedTree: Promise<string>;
  let extractedTrees: {
    pre: Root;
    actual: Root;
    post: Root;
  };
  let missing_heading: boolean = false;
  $: extractedTrees = extractTree(page.tree, heading);
  $: renderedTree = renderTree(
    JSON.parse(JSON.stringify(extractedTrees.actual)),
    page.user_id,
    page.gm_id
  );

  function extractTree(tree: Root, heading: string | undefined): typeof extractedTrees {
    if (!heading) {
      missing_heading = false;
      return {
        pre: {
          type: 'root',
          children: []
        },
        actual: tree,
        post: {
          type: 'root',
          children: []
        }
      };
    }
    const headingIndex = searchHeadingIndex(tree, heading);
    const nextHeadingIndex = getFirstHeadingIndexAfter(tree, headingIndex);
    if (headingIndex === -1) {
      console.log(tree, heading, headingIndex);
      missing_heading = true;
      return {
        pre: tree,
        actual: {
          type: 'root',
          children: []
        },
        post: {
          type: 'root',
          children: []
        }
      };
    } else missing_heading = false;
    return {
      pre: {
        type: 'root',
        children: tree.children.slice(0, headingIndex + 1)
      },
      actual: {
        type: 'root',
        children: tree.children.slice(
          headingIndex + 1,
          nextHeadingIndex !== -1 ? nextHeadingIndex : undefined
        )
      },
      post: {
        type: 'root',
        children: nextHeadingIndex !== -1 ? tree.children.slice(nextHeadingIndex) : []
      }
    };
  }

  async function stringfyTrees() {
    const obj = JSON.parse(JSON.stringify(extractedTrees));
    return {
      pre: await stringifyTree(obj.pre),
      actual: await stringifyTree(obj.actual),
      post: await stringifyTree(obj.post)
    };
  }
</script>

<div class="p-xl" id="page">
  {#if edit}
    {#if result?.conflict}
      <ErrorBar
        text="Someone updated this page just now, please refresh the page and try again. <br /> If this happens again please contact us."
      />
    {/if}
    {#if result?.client_error}
      <ErrorBar text="Client Error, please contact us to investigate the cause!" />
    {/if}
    {#await stringfyTrees()}
      <p>stringifying markdown...</p>
    {:then stringified}
      <form class="my-m p-m" method="post" action={saveAction} use:enhance={handleSave}>
        <input type="hidden" name="hash" value={page.hash} class="input" />
        <input type="hidden" name="pre" value={stringified.pre} class="input" />
        <textarea
          id="textArea"
          name="actual"
          value={stringified.actual}
          class="textarea bg-surface-200-700-token border-surface-400-500-token"
        />
        <input type="hidden" name="post" value={stringified.post} class="input" />
        <br />
        <div class="buttonContainer block text-center">
          <button
            {disabled}
            class="btn-secondary btn"
            type="button"
            on:click={() => {
              edit = false;
            }}>Cancel</button
          >
          <button {disabled} class="btn-primary btn" type="submit">Done</button>
        </div>
      </form>
    {/await}
  {:else}
    {#if toc && !heading}
      <div id="toc_container">
        <div id="toc" class="p-l card bg-surface-200-700-token">
          {#each page.headings as heading}
            <a class="m-s p-m block transition-[text-decoration]" href="#{heading.id}">
              <span class="text-gray">{addHash('', heading.level).trim()}</span>
              {heading.text}
            </a>
          {/each}
        </div>
      </div>
    {/if}
    <div class="my-m p-m" id="content">
      {#await renderedTree}
        <p>rendering markdown...</p>
      {:then _renderedTree}
        {#if heading && missing_heading}
          <div class="text-center">
            <h3 class="my-m p-m h3">
              Heading '{capitalizeFirstLetter(heading)}' does not exist yet
            </h3>
            <p>Do you want to create it?</p>
            <form
              id="btnContainer"
              class="my-m"
              method="post"
              action={saveAction}
              use:enhance={addHeading}
            >
              <input type="hidden" name="hash" value={page.hash} class="input" />
              <input
                type="hidden"
                name="pre"
                value={JSON.stringify(extractedTrees.pre)}
                class="input"
              />
              <input
                type="hidden"
                name="heading"
                value={capitalizeFirstLetter(heading)}
                class="input"
              />
              <button {disabled} class="btn-primary btn" type="submit">Yes</button>
            </form>
          </div>
        {:else}
          <div class="rendered-content">
            {@html _renderedTree}
          </div>
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
    border-width: 2px;
    border-radius: 4px;
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
    width: fit-content;
    opacity: 0;
    @apply transition-[opacity];
  }

  #toc:hover {
    opacity: 0.98;
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

  .rendered-content {
    padding-left: 6vw;
    padding-right: 6vw;
  }

  .rendered-content :global(wiki-heading[tag='h1']) {
    display: block;
    margin-top: var(--gap-xxl);
    margin-bottom: var(--gap-xl);
  }

  .rendered-content :global(wiki-heading[tag='h2']) {
    display: block;
    margin-top: var(--gap-xxl);
    margin-bottom: var(--gap-l);
  }

  .rendered-content :global(wiki-heading[tag='h3']) {
    display: block;
    margin-top: var(--gap-xl);
    margin-bottom: var(--gap-m);
  }

  .rendered-content :global(wiki-heading[tag='h4']) {
    display: block;
    margin-top: var(--gap-l);
    margin-bottom: var(--gap-s);
  }

  .rendered-content :global(wiki-heading[tag='h5']) {
    display: block;
    margin-top: var(--gap-m);
    margin-bottom: var(--gap-xs);
  }

  .rendered-content :global(p) {
    display: block;
    margin-top: var(--gap-xs);
    margin-bottom: var(--gap-m);
  }

  .rendered-content :global(a) {
    text-decoration: underline;
  }
</style>
