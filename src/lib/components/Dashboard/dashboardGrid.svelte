<script lang="ts">
  import { scale } from 'svelte/transition';
  import { flip } from '$lib/Campaigns/better_animations';
  import Card from './card.svelte';
  import Prototype from './prototype.svelte';
  import { spring, type Spring } from 'svelte/motion';
  import { arraymove } from '$lib/utils';
  import type {
    Campaign,
    CardData,
    Character,
    Dashboard,
    NumericVariable,
    StringVariable
  } from '@prisma/client';
  import type { Jsonify } from '@sveltejs/kit';

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

  export let disabled: boolean;
  export let edited: boolean;
  export let removedCards: string[];
  export let edit: boolean;

  let scrollX: number, scrollY: number;

  const transition_delay = 0,
    transition_duration = 300;
  const animate_delay = 0,
    animate_duration = 20;
  const stiffness = 0.6,
    damping = 1.0;
  const trace_refractary_perioid = 400,
    drag_refractary_period = 700;

  let viewportHeight: number, viewportWidth: number;
  let picked:
    | {
        startingIndex: number;
        index: number;
        id: string;
        geometry: DOMRect;
        card: (typeof dashboard.cards)[number];
        refractary: boolean;
      }
    | undefined = undefined;

  let resizing:
    | {
        index: number;
        id: string;
        card: (typeof dashboard.cards)[number];
        starting_top_left: { top: number; left: number };
      }
    | undefined = undefined;

  let actionData: Spring<{ x_or_width: number; y_or_height: number }> = spring(
    { x_or_width: 0, y_or_height: 0 },
    { stiffness, damping }
  );

  function startDragElement(ev: any) {
    cancelAction();
    const index = dashboard.cards.findIndex((element) => element.id === ev.detail.id);
    if (index === -1) throw new Error('Id not found in cards');
    picked = {
      startingIndex: index,
      index: index,
      id: ev.detail.id,
      geometry: ev.detail.geometry,
      card: dashboard.cards[index],
      refractary: false
    };
    actionData = spring(
      {
        x_or_width: ev.detail.geometry.x + scrollX,
        y_or_height: ev.detail.geometry.y + scrollY
      },
      { stiffness, damping }
    );
    const mousepos = ev.detail.mousepos;
    actionData.set({
      x_or_width: mousepos.x - picked.geometry.width / 2,
      y_or_height: mousepos.y - picked.geometry.height / 2
    });
  }

  function startResizeElement(ev: any) {
    cancelAction();
    const index = dashboard.cards.findIndex((element) => element.id === ev.detail.id);
    if (index === -1) throw new Error('Id not found in cards');
    resizing = {
      index: index,
      id: ev.detail.id,
      card: dashboard.cards[index],
      starting_top_left: {
        top: ev.detail.geometry.top + scrollY,
        left: ev.detail.geometry.left + scrollX
      }
    };
    actionData = spring(
      {
        x_or_width: (100 * ev.detail.geometry.width) / viewportWidth,
        y_or_height: (100 * ev.detail.geometry.height) / viewportHeight
      },
      { stiffness, damping }
    );
  }

  function moveWhileDragging(ev: MouseEvent) {
    if (picked) {
      ev.preventDefault();
      ev.stopPropagation();
      const mousepos = { x: ev.pageX, y: ev.pageY };
      actionData.set({
        x_or_width: mousepos.x - picked.geometry.width / 2,
        y_or_height: mousepos.y - picked.geometry.height / 2
      });
      if (!picked.refractary) {
        const element = document
          .elementsFromPoint(mousepos.x - scrollX, mousepos.y - scrollY)
          .find((element) => {
            return (
              picked && element.id.startsWith('content_') && !element.id.endsWith(`${picked.id}`)
            );
          });
        if (element && element.id.startsWith('content_')) {
          picked.refractary = true;
          hoverWhileDragging(element.id.replace('content_', ''));
          setTimeout(() => {
            if (picked) picked.refractary = false;
          }, drag_refractary_period);
        } else {
          picked.refractary = true;
          setTimeout(() => {
            if (picked) picked.refractary = false;
          }, trace_refractary_perioid);
        }
      }
    } else if (resizing) {
      ev.preventDefault();
      ev.stopPropagation();
      const mousepos = { x: ev.pageX, y: ev.pageY };
      actionData.set({
        x_or_width: (100 * (mousepos.x - resizing.starting_top_left.left)) / viewportWidth,
        y_or_height: (100 * (mousepos.y - resizing.starting_top_left.top)) / viewportHeight
      });
    }
  }

  function hoverWhileDragging(id: string) {
    if (picked) {
      const index = dashboard.cards.findIndex((element) => element.id === id);
      if (index === -1) throw new Error('Id not found in cards' + id + ';\n ' + dashboard.cards);
      if (index !== picked.index) {
        arraymove(dashboard.cards, picked.index, index);
        picked.index = index;
      }
    }
  }

  function keydown(ev: KeyboardEvent) {
    if (
      (picked || resizing) &&
      (ev.key === 'Escape' || ev.key === 'Delete' || ev.key === 'Backspace')
    ) {
      ev.preventDefault();
      ev.stopPropagation();
      cancelAction();
    } else if ((picked || resizing) && ev.key === 'Enter') {
      ev.preventDefault();
      ev.stopPropagation();
      confirmAction();
    }
  }

  function cancelAction() {
    if (picked) {
      if (picked.index !== picked.startingIndex) {
        arraymove(dashboard.cards, picked.index, picked.startingIndex);
      }
      picked = undefined;
    }
    if (resizing) {
      resizing = undefined;
    }
  }

  function confirmAction(ev?: any) {
    if (picked || resizing) {
      ev.preventDefault();
      ev.stopPropagation();
      if (resizing) {
        resizing.card.width = $actionData.x_or_width;
        resizing.card.height = $actionData.y_or_height;
        resizing = undefined;
      }
      picked = undefined;
      edited = true;
    }
  }

  function removeCard(ev: any) {
    disabled = true;
    const id = ev.detail.id;
    const index = dashboard.cards.findIndex((card) => card.id === id);
    if (index !== -1) {
      removedCards.push(id);
      edited = true;
      dashboard.cards.splice(index, 1);
      dashboard.cards = dashboard.cards;
    } else {
      console.error(id, dashboard.cards);
    }
    disabled = false;
  }
</script>

<svelte:window
  bind:scrollX
  bind:scrollY
  bind:innerHeight={viewportHeight}
  bind:innerWidth={viewportWidth}
/>
<svelte:document
  on:pointermove={moveWhileDragging}
  on:pointerup={confirmAction}
  on:keydown={keydown}
/>

<div id="grid" style="touch-action: none">
  {#each dashboard.cards as card (card.id)}
    <div
      class="card"
      in:scale={{ delay: transition_delay, duration: transition_duration }}
      out:scale={{ delay: transition_delay, duration: transition_duration }}
      animate:flip={{ delay: animate_delay, duration: (d) => Math.sqrt(d) * animate_duration }}
    >
      {#if picked && card.id === picked.id}
        <Prototype data={{ id: card.id, width: card.width, height: card.height }} />
      {:else if resizing && card.id === resizing.id}
        <Prototype
          data={{ id: card.id, width: $actionData.x_or_width, height: $actionData.y_or_height }}
        />
      {:else}
        <Card
          bind:disabled
          bind:edited
          bind:dashboard
          {target}
          {card}
          picked={false}
          {edit}
          on:pick={startDragElement}
          on:resize={startResizeElement}
          on:remove={removeCard}
        />
      {/if}
    </div>
  {/each}
</div>

{#if picked}
  <div class="pickedCard" style="top:{$actionData.y_or_height}px; left:{$actionData.x_or_width}px;">
    <Card
      bind:disabled
      bind:edited
      bind:dashboard
      {target}
      card={picked.card}
      picked={true}
      {edit}
    />
  </div>
{/if}

<style lang="postcss">
  #grid {
    display: flex;
    flex-flow: row wrap;
    align-items: flex-start;
    gap: 4vh 4vw;
    margin: 5vh 5vw;
  }

  .pickedCard {
    position: absolute;
    z-index: 100;
  }
</style>
