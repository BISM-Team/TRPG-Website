<script lang="ts">
    import { onMount } from 'svelte';
    import type { PageData } from './$types';
    import WikiPreview from './wiki_preview.svelte';
    
    export let data: PageData;
</script>

<div id='grid' class='w3-container w3-padding-48'>
    {#each data.world_wikis as wiki}
        <a href={'./WorldWiki/'+wiki.name+'/index'} class='w3-container w3-card-4 w3-margin wiki'><WikiPreview {wiki}/></a>
    {/each}
</div>

<style>
    #grid {
        width: 100%;
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        justify-content: space-evenly;
    }
    .wiki {
        text-decoration: none;
        max-width: 20%;
        transition: ease-out 200ms;
    }
    .wiki:hover {
        transform: scale(110%);
    }
    
</style>