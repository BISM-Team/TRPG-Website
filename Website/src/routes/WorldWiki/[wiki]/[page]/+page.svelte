<script lang="ts">
    import type { PageData } from './$types';
    import { renderTree } from '$lib/tree/tree';
    
    export let data: PageData;
    let content = renderTree(data.tree, 'gm');

    const h1_class = 'w3-center w3-xxlarge';
</script>

<div class='w3-container'>
    {#await content}
        <div>Loading data...</div>
    {:then content} 
        <div class='w3-container w3-padding-32' id='content'>{@html content}</div>
    {/await}
</div>