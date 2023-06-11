<script lang="ts" context="module">
  export enum Type {
    Character = "Character",
    Page = "Page"
  };
</script>

<script lang="ts">
  import { page } from "$app/stores";
  import { renderTree } from "$lib/WorldWiki/tree/tree";
  import { propagateErrors } from "$lib/utils";
  import type { Character, Dashboard, Heading, Page } from "@prisma/client";
  import { getContext, hasContext, onDestroy, onMount } from "svelte";
  import { context } from "../context";
  import type { Writable } from "svelte/store";
  import type { Root } from "mdast";

  export let type: Type;
  export let source: string;
  export let dashboard: Dashboard & { 
    character: Character | null 
  };
  let lowercase_source: string;
  $: lowercase_source = source.toLowerCase();

  if(!hasContext(context.pages)) throw new Error("context not found");
  const pages = getContext<Writable<Map<string, { 
    hash: string, 
    headings: (Omit<Heading, "index"> & {
      viewers: string[];
      modifiers: string[];
    })[], 
    tree: Root,
    user_id: string, 
    gm_id: string, 
    ref_count: number 
  }>>>(context.pages);

  let registered: string | undefined = undefined;
  let data: ReturnType<typeof loadData>;
  $: data = loadData(lowercase_source);

  async function loadData(source: string) {
    switch (type) {
      case Type.Character:
        let response;
        let prop;
        if(dashboard.character) {
          prop = source;
          response = await fetch(`/api/characters/${dashboard.character.id}`);
        } else {
          const index = source.indexOf(".");
          const id = source.slice(0, index);
          prop = source.slice(index+1);
          response = await fetch(`/api/characters/${id}`);
        }
        await propagateErrors(response, $page.url);
        if(!response.ok) throw new Error("unexpected error");
        const character = (await response.json()).character;
        return character.properties["character."+prop];

      case Type.Page:
        const hash_position = source.indexOf("#");
        const page_source = source.slice(0, hash_position !== -1 ? hash_position : undefined);
        if(!$pages.has(page_source)) {
          const page_response = await fetch(`/api/campaign/${dashboard.campaignId}/wiki/${page_source}`);
          await propagateErrors(page_response, $page.url);
          if (!page_response.ok) throw new Error("unexpected error");
          const fetched_page = await page_response.json();
          if(!$pages.has(page_source)) 
            $pages.set(page_source, {
              ...fetched_page,
              ref_count: 0,
            });
        }
        if(registered !== page_source) {
          pages.update((pages) => {
            const prev_page = pages.get(registered ?? "");
            prev_page && prev_page.ref_count--;
            const page = pages.get(page_source)
            page && page.ref_count++;
            registered = page_source;
            return pages;
          });
        }
        const page_data = $pages.get(page_source);
        if(!page_data) throw new Error("unexpected error");
        return {
          ...page_data,
          renderedTree: await renderTree(
            JSON.parse(JSON.stringify(page_data.tree)),
            page_data.user_id,
            page_data.gm_id
          ),
        };
      default: return undefined;
    }
  }
  
  onMount(() => {
    console.log("mount", registered);
  })

  onDestroy(() => {
    console.log("destroy", registered);
    pages.update((pages) => {
      const prev_page = pages.get(registered ?? "");
      prev_page && prev_page.ref_count--;
      registered = undefined;
      return pages;
    });
  })
</script>

<div class="content w3-card-4">
  {#await data}
    <p>loading data...</p>
  {:then data} 
    {#if type === Type.Character}
      {#if data}
        <p class="w3-center" title={source}>{data}</p>
      {:else}
        <p class="w3-center">Property not found</p>
      {/if}
    {:else if type === Type.Page}
      {@html data.renderedTree}
    {/if}
  {/await}
</div>

<style>
  .content {
    padding: 2vh 2vw;
    overflow: auto;
    background-color: white;
    width: 100%;
    height: 100%;
  }
</style>