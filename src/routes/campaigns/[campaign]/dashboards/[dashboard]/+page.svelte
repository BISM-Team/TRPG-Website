<script lang="ts">
  import type { ActionData, PageData, SubmitFunction } from './$types';
  import Toolbar from '$lib/components/toolbar.svelte';
  import { enhance } from '$app/forms';
  import DashboardGrid from '$lib/components/Dashboard/dashboardGrid.svelte';
  import Menu from '$lib/components/Dashboard/menu.svelte';
  import Create from '$lib/components/Dashboard/create.svelte';
  import Save from '$lib/components/Dashboard/save.svelte';
  import Modal from '$lib/components/modal.svelte';
  import ErrorBar from '$lib/components/error_bar.svelte';
  import { goto } from '$app/navigation';
  import { propagateErrors } from '$lib/utils';
  import type { fetch as kit_fetch } from '@sveltejs/kit';

  export let data: PageData;
  export let form: ActionData;
  let dashboard: Awaited<PageData['dashboard']> | undefined;

  $: {
    if (data.dashboard)
      data.dashboard.then((_dashboard) => {
        dashboard = _dashboard;
      });
    else dashboard = undefined;
  }

  let menu: Menu;
  let create: Create;
  let save: Save;

  let show_modal = false;
  let edit = false;
  let edited = false;
  let disabled = false;
  let removedCards: string[] = [];
  let removedNumVar: string[] = [];
  let removedStrVar: string[] = [];

  function closeError() {
    if (form?.client_error) form.client_error = false;
    if (form?.server_error) form.server_error = false;
  }

  let select: HTMLSelectElement;

  async function onChange() {
    await goto(`/campaigns/${data.params.campaign}/dashboards/${select.value}`);
  }

  let templates: ReturnType<typeof loadTemplates>;

  async function loadTemplates() {
    const response = await (fetch as typeof kit_fetch)('/api/dashboardTemplates?type=dashboard');
    await propagateErrors(response, new URL(window.location.href));
    if (!response.ok) throw new Error('unexpected error');
    const templates = (await response.json()).templates.map((template) => {
      const { createdAt, ...rest } = template;
      return {
        ...rest,
        createdAt: new Date(createdAt)
      };
    });
    return templates;
  }

  function toggleModal() {
    if (!show_modal) templates = loadTemplates();
    show_modal = !show_modal;
  }

  const submit: SubmitFunction = async function () {
    disabled = true;
    return async ({ result, update }) => {
      if (result.type === 'success') {
        toggleModal();
        await update({ reset: false, invalidateAll: false });
        if (result.data?.createdId)
          await goto(`/campaigns/${data.params.campaign}/dashboards/${result.data?.createdId}`);
      } else {
        await update({ reset: false });
      }
      disabled = false;
    };
  };
</script>

{#if show_modal}
  <Modal bind:disabled on:close={toggleModal}>
    <form action="?/create" method="post" use:enhance={submit}>
      <label class="label" for="templateSelect">Initialize from template</label>
      <select class="select" name="templateId" id="templateSelect">
        <option value="" selected>empty</option>
        {#await templates then templates}
          {#each templates as template}
            <option value={template.id}>{template.name}</option>
          {/each}
        {/await}
      </select>
      <label class="label" for="nameInput">Name</label>
      <input type="text" name="name" id="nameInput" /><br />
      <input
        type="hidden"
        name="isDefault"
        value={data.campaign.Dashboard_Campaign.length > 0 ? 'false' : 'true'}
      />
      <button {disabled} type="button" on:click={toggleModal} class="btn-secondary btn"
        >Cancel</button
      >
      <button {disabled} type="submit" class="btn-primary btn">Create</button>
    </form>
  </Modal>
{/if}

<Toolbar>
  <svelte:fragment slot="center">
    <label for="idSelect" class="label">Layout</label>
    <select class="select" name="id" id="idSelect" bind:this={select} on:change={onChange}>
      {#if data.params.dashboard === 'empty'}
        <option value="" selected>-</option>
      {/if}
      {#each data.campaign.Dashboard_Campaign as dashboard_campaign}
        <option
          value={dashboard_campaign.dashboardId}
          selected={dashboard_campaign.dashboardId === data.params.dashboard}
        >
          {dashboard_campaign.dashboard.name}</option
        >
      {/each}
    </select>
    <button class="btn-primary btn" on:click={toggleModal}>+</button>
  </svelte:fragment>
  <svelte:fragment slot="right">
    {#await data.dashboard then}
      {#if dashboard}
        {#if edit}
          <form
            action="?/save"
            style="display: none"
            id="hiddenSaveForm"
            method="post"
            use:enhance={save.submitSave}
          >
            <input type="hidden" name="dashboardId" value={dashboard.id} />
            <input type="hidden" name="switch" value="false" />
          </form>
          <button
            disabled={disabled || !edited}
            id="saveButton"
            type="submit"
            form="hiddenSaveForm"
          >
            <span class="material-symbols-outlined text-primary-200">save</span>
          </button>
          <button {disabled} id="newButton" on:click={create.toggle}>
            <span class="material-symbols-outlined text-primary-200">add</span>
          </button>
        {/if}
        <button {disabled} id="editButton" on:click={save.toggleEdit}>
          <span class="material-symbols-outlined text-primary-200"
            >{edit ? 'visibility' : 'edit'}</span
          >
        </button>
        <button {disabled} id="menuButton" on:click={menu.toggle}>
          <span class="material-symbols-outlined text-primary-200">more_horiz</span>
        </button>
      {/if}
    {/await}
  </svelte:fragment>
</Toolbar>

{#if data.dashboard}
  {#await data.dashboard}
    <p style:margin="3em">Loading...</p>
  {:then}
    {#if dashboard}
      <Save
        {dashboard}
        bind:edit
        bind:edited
        bind:disabled
        bind:removedCards
        bind:removedNumVar
        bind:removedStrVar
        bind:this={save}
      />

      <Create
        bind:dashboard
        dashboardId={dashboard.id}
        bind:edited
        bind:disabled
        bind:this={create}
      />

      <Menu
        {dashboard}
        bind:disabled
        bind:this={menu}
        bind:edited
        bind:edit
        deleteRedirectUrl={'/campaigns/' + data.params.campaign + '/dashboards/empty'}
        bind:removedCards
        bind:removedNumVar
        bind:removedStrVar
      />

      <DashboardGrid
        bind:dashboard
        target={{ character: undefined, campaign: data.campaign }}
        bind:edited
        bind:disabled
        bind:removedCards
        {edit}
      />
    {/if}
  {/await}
{/if}

{#if form?.client_error || form?.server_error}
  <Modal {disabled} on:close={closeError}>
    {#if form?.client_error}
      <ErrorBar text={'Client Error, please try again or contact us!'} />
    {:else if form?.server_error}
      <ErrorBar text={'Server Error, please contact us!'} />
    {/if}
  </Modal>
{/if}
