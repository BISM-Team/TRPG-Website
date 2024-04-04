<script lang="ts">
  import { page } from "$app/stores";
  import { parseSource } from "$lib/WorldWiki/tree/tree";
  import { propagateErrors } from "$lib/utils";
  import type { Character, Dashboard } from "@prisma/client";
  import { getContext, hasContext, onDestroy, onMount } from "svelte";
  import { context, type ContextType } from "../context";
  import WikiPage from "$lib/components/WikiPage.svelte";
  import type { SubmitFunction } from "@sveltejs/kit";
  import type { ActionData } from "../../../../routes/campaign/[campaign]/wiki/[page]/$types";
  import type { Root } from "mdast";
  import { addHash } from "$lib/WorldWiki/tree/heading";
  import type { fetch as kit_fetch } from "@sveltejs/kit";


  export let source: string;
  export let dashboard: Dashboard & { 
    character: Character | null 
  };

  if(!hasContext(context.pages)) throw new Error("context not found");
  const pages = getContext<ContextType.pages>(context.pages);

  let disabled = false;
  let edit = false;
  let actionResult: ActionData | null = null;
  let mounted: boolean = false;

  function updateEditState(edit: boolean, source: string = page_source) {
    pages.update((pages) => {
      if(edit && registered && registered !== source) {
        const old_page = pages.get(registered);
        if(old_page) old_page.editing = false;
      }
      const page_store = pages.get(source);
      if(page_store) page_store.editing = edit;
      return pages;
    })
  }

  $: page_store = loadData(page_source);
  $: page_source = source.slice(0, source.indexOf("#") !== -1 ? source.indexOf("#") : undefined).toLowerCase();
  $: heading = source.indexOf("#") !== -1 ? source.slice(source.indexOf("#")+1) : undefined;
  $: updateEditState(edit);

  let registered: string | undefined = undefined;

  async function fetchPage() {
    const page_response = await (fetch as typeof kit_fetch)(`/api/campaign/${dashboard.campaignId}/wiki/${source}`);
      await propagateErrors(page_response, $page.url);
      if (!page_response.ok) throw new Error("unexpected error");
      return await page_response.json();
  }

  function loadData(source: string) {
    if(!mounted) return;
    console.log("loadData " + source);
    if(!$pages.has(source)) {
      console.log("loadData " + source, $pages);
      $pages.set(source, {
        page: fetchPage(),
        editing: false,
      });
    }
    if(registered !== source) updateEditState(edit)
    registered = source;
    return $pages.get(source);
  }

  onMount(() => {
    mounted = true;
    pages.subscribe(() => {
      page_store = loadData(page_source);
    })
  });

  function toggleEdit() {
    edit = !edit;
  }

  onDestroy(() => {
    updateEditState(edit, "");
    registered = undefined;
    mounted = false;
  })

  const handleSave: SubmitFunction = function({ formData }) {
    disabled = true;
    formData.set("text", formData.get("pre")?.toString() + "\n" + formData.get("actual")?.toString() + "\n" + formData.get("post")?.toString());
    formData.delete("pre");
    formData.delete("actual");
    formData.delete("post");
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

  const addHeading: SubmitFunction = async function({ formData }) {
    if(!page_store) throw new Error("page not loaded correctly");
    disabled = true;
    const pre_str = formData.get("pre")?.toString();
    const heading = formData.get("heading")?.toString();
    const level_str = formData.get("level")?.toString() ?? "2";
    formData.delete("pre");
    formData.delete("heading");
    if(!pre_str || !heading) throw new Error("unexpected error");

    const pre: Root = JSON.parse(pre_str);
    const level = parseInt(level_str);
    const actual: Root = await parseSource(addHash(`${heading}`, level), (await page_store?.page).user_id)
    const children = pre.children.concat(actual.children);
    formData.set("tree", JSON.stringify({
      type: "root",
      children,
    }));

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
</script>

<div class="content card">
  {#if page_store}
    {#await page_store.page}
      <p>loading page...</p>
    {:then data}
      {#if !edit}
        <div class="block absolute top-0 w-full shadow-sm text-right">
          <button class="btn" on:click={toggleEdit} disabled={disabled || (page_store.editing && !edit)}><span class="material-symbols-outlined">edit</span></button>
        </div>
      {/if}
      <WikiPage page={data} toc={false} {handleSave} {addHeading} saveAction="/campaign/{dashboard.campaignId}/wiki/{page_source}?/update" {heading} disabled={disabled || (page_store.editing && !edit)} bind:edit
                result = { actionResult ? { 
                  conflict: actionResult.creation_conflict || actionResult.update_conflict || actionResult.delete_conflict || false, 
                  client_error: actionResult.invalid_campaign_id_or_page_name || actionResult.missing_hash || actionResult.missing_page || actionResult.missing_text_or_tree || actionResult.no_first_heading || false 
                } : null} />
    {/await}
  {/if}
</div>

<style lang="postcss">
  .content {
    padding: 2vh 2vw;
    overflow: auto;
    background-color: white;
    width: 100%;
    height: 100%;
  }
</style>