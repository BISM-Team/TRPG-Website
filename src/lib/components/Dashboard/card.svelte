<script lang="ts">
  import type {
    Campaign,
    CardData,
    Character,
    Dashboard,
    NumericVariable,
    StringVariable
  } from '@prisma/client';
  import { createEventDispatcher } from 'svelte';
  import { map } from './Cards/cards_map';
  import CardSettings from './card_settings.svelte';
  import type { Jsonify } from '@sveltejs/kit';
  const dispatch = createEventDispatcher();

  const default_width = 'auto';
  const default_height = 'auto';

  export let dashboard: Jsonify<
    Dashboard & {
      cards: (CardData & { mod_properties: any })[];
      stringVariables: StringVariable[];
      numericVariables: NumericVariable[];
    }
  >;
  export let target:
    | { character: Jsonify<Character>; campaign: undefined }
    | { character: undefined; campaign: Jsonify<Campaign> };

  export let card: CardData & { mod_properties: any };
  export let picked: boolean;
  export let edit: boolean;
  export let edited: boolean;
  export let disabled: boolean;

  let settings: CardSettings;

  function pick(ev: MouseEvent) {
    if (edit) {
      ev.preventDefault();
      ev.stopPropagation();
      const element = document.getElementById('content_' + card.id);
      if (!element) throw new Error('Could not find root element of Card');
      let computedGeometry: DOMRect = element.getBoundingClientRect();
      dispatch('pick', {
        id: card.id,
        geometry: computedGeometry,
        mousepos: { x: ev.pageX, y: ev.pageY }
      });
    }
  }

  function resize(ev: MouseEvent) {
    if (edit) {
      ev.preventDefault();
      ev.stopPropagation();
      const element = document.getElementById('content_' + card.id);
      if (!element) throw new Error('Could not find root element of Card');
      let computedGeometry: DOMRect = element.getBoundingClientRect();
      dispatch('resize', {
        id: card.id,
        geometry: computedGeometry,
        mousepos: { x: ev.pageX, y: ev.pageY }
      });
    }
  }
</script>

<CardSettings bind:dashboard bind:card bind:disabled bind:edited bind:this={settings} />

<div
  id="content_{card.id}"
  class="card-wrapper"
  style:cursor={picked ? 'grab' : 'default'}
  style:touch-action={edit ? 'none' : 'auto'}
>
  {#if edit}
    <button
      {disabled}
      id="removeButton"
      class="btn"
      on:click={() => {
        dispatch('remove', { id: card.id });
      }}><span class="material-symbols-outlined">close</span></button
    >
    <div id="resizeArea" on:pointerdown={resize} />
    <button {disabled} id="settingsButton" class="btn" on:click={settings.toggle}>
      <span class="material-symbols-outlined">settings</span>
    </button>
  {/if}
  <div
    style:width={card.width ? Math.max(10, card.width) + 'vw' : default_width}
    style:height={card.height ? Math.max(10, card.height) + 'vh' : default_height}
    style:touch-action={edit ? 'none' : 'auto'}
    style:cursor={edit ? (picked ? 'grabbing' : 'grab') : 'default'}
    on:pointerdown={pick}
  >
    <svelte:component
      this={map[card.type].component}
      {...card.mod_properties}
      {dashboard}
      {target}
    />
  </div>
</div>

<style lang="postcss">
  .card-wrapper {
    position: relative;
    background-color: transparent;
    box-sizing: border-box;
    z-index: 0;
  }

  #pickArea:hover {
    background-color: #ccc;
  }

  #removeButton {
    position: absolute;
    top: 0em;
    right: 0em;
    transform: translateX(40%) translateY(-40%);
    padding: 0.1em;
    border-radius: 0.7em;
    background-color: transparent;
    z-index: 1;
  }

  #removeButton > span {
    display: block;
  }

  #settingsButton {
    position: absolute;
    top: 0em;
    left: 0em;
    transform: translateX(-40%) translateY(-40%);
    padding: 0.1em;
    border-radius: 0.7em;
    background-color: transparent;
    z-index: 1;
  }

  #settingsButton > span {
    display: block;
  }

  #resizeArea {
    position: absolute;
    bottom: 0;
    right: 0;
    height: 1.2em;
    width: 1.2em;
    cursor: se-resize;
    z-index: 1;
    background: linear-gradient(to top left, rgb(190, 190, 190) 0 40%, transparent 60% 100%);
  }

  ::-webkit-scrollbar {
    width: 0.75em;
    height: 0.75em;
  }

  /* Track */
  ::-webkit-scrollbar-track {
    background: #f1f1f1;
  }

  /* Handle */
  ::-webkit-scrollbar-thumb {
    background: #ccc;
  }

  /* Handle on hover */
  ::-webkit-scrollbar-thumb:hover {
    background: #9e9e9e;
  }
</style>
