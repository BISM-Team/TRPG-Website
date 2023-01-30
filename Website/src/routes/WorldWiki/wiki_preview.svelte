<script lang="ts">
    import type { WikiPreview } from "$lib/data_types";
    export let wiki: WikiPreview;
</script>

<h3 class='w3-center w3-padding-16 w3-border-bottom'>{wiki.name}</h3>
<p class='w3-padding-16'>{wiki.description}</p>
{#if wiki.img}
    <img src={wiki.img.src} alt={wiki.img.alt}>
{/if}

<style>
    h3 {
        margin: 0;
    }
    p {
        line-height: 1.5em;
    }
</style>