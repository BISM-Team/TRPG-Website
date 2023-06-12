<script lang="ts">
  import { page } from "$app/stores";
  import { renderTree } from "$lib/WorldWiki/tree/tree";
  import { propagateErrors } from "$lib/utils";
  import type { Character, Dashboard } from "@prisma/client";
  import { getContext, hasContext, onDestroy, onMount } from "svelte";
  import { context, type ContextType } from "../context";
  import WikiPage from "$lib/components/WikiPage.svelte";
  import type { SubmitFunction } from "@sveltejs/kit";
  import type { ActionData } from "../../../../routes/campaign/[campaign]/wiki/[page]/$types";

  export let source: string;
  export let dashboard: Dashboard & { 
    character: Character | null 
  };
  let disabled = false;
  let edit = false;
  let page_source: string;
  let actionResult: ActionData | null = null;
  $: page_source = source.slice(0, source.indexOf("#") !== -1 ? source.indexOf("#") : undefined).toLowerCase();

  if(!hasContext(context.pages)) throw new Error("context not found");
  const pages = getContext<ContextType.pages>(context.pages);

  let registered: string | undefined = undefined;
  let data: ReturnType<typeof loadData>;
  $: data = loadData(page_source) || $pages;

  async function loadData(source: string) {
    if(!$pages.has(source)) {
      const page_response = await fetch(`/api/campaign/${dashboard.campaignId}/wiki/${source}`);
      await propagateErrors(page_response, $page.url);
      if (!page_response.ok) throw new Error("unexpected error");
      const fetched_page = await page_response.json();
      if(!$pages.has(source)) 
        $pages.set(source, {
          ...fetched_page,
          editing: 0,
        });
    }
    if(registered !== source) {
      registered = source;
    }
    const page_data = $pages.get(source);
    if(!page_data) throw new Error("unexpected error");
    return {
      ...page_data,
      renderedTree: await renderTree(
        JSON.parse(JSON.stringify(page_data.tree)),
        page_data.user_id,
        page_data.gm_id
      ),
    };
  }

  onDestroy(() => {
    registered = undefined;
  })

  const handleSave: SubmitFunction = function() {
    disabled = true;
    return async ({ result, update }) => {
      actionResult = (result as unknown as any).data;
      await update({reset: false});
      if (result.type === "success") { 
        pages.set(new Map());
        edit = false; 
      }
      disabled = false;
    };
  }

  function toggleEdit() {
    edit = !edit;
  }

  $: pages.update((pages) => {
      const page = pages.get(page_source);
      page && (page.editing = edit);
      return pages;
    })
</script>

<div class="content w3-card-4">
  {#await data}
    <p>loading page...</p>
  {:then _data}
    {#if !edit}
      <div class="w3-container w3-block">
        <button class="w3-button w3-right" on:click={toggleEdit} disabled={disabled || $pages.get(page_source)?.editing}><span class="material-symbols-outlined">edit</span></button>
      </div>
    {/if}
    <WikiPage page={_data} toc={false} {handleSave} saveAction="/campaign/{dashboard.campaignId}/wiki/{page_source}?/update" bind:disabled bind:edit
              result = { actionResult ? { 
                conflict: actionResult.creation_conflict || actionResult.update_conflict || actionResult.delete_conflict || false, 
                client_error: actionResult.invalid_campaign_id_or_page_name || actionResult.missing_hash || actionResult.missing_page || actionResult.missing_text_or_tree || actionResult.no_first_heading || false 
              } : null} />
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