<svelte:head><script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script></svelte:head>
<script lang="ts">
    import { capitalizeFirstLetter } from '$lib/utils';
     import type { PageData } from './$types';
    
    export let data: PageData;

    const h1_class = 'w3-center w3-xxlarge';
</script>

<div class='w3-container'>
{#if !data.page}
    <h1 class={h1_class}>Page Not Created Yet!</h1>
    <button on:click={() => {history.back()}}>back</button>
    <button>create</button>
{:else}
    {#if data.index}
        <h1 class={h1_class}>{data.params.wiki} {capitalizeFirstLetter(data.page.title)}</h1>
    {:else}
        <h1 class={h1_class}>{capitalizeFirstLetter(data.page.title)}</h1>
    {/if}
    <div class='w3-container w3-padding-32' id='content'>{@html data.page.content}</div>
{/if}
</div>