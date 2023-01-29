<script lang="ts">
    //import type { LayoutData } from './$types';
    
    //export let data: LayoutData;
</script>

<header>
    <h1>BISM Website</h1>
</header>

<slot></slot>

<style>
    header {
        width: 100%;
        padding: 2em;
        background-color: teal;
    }
    header h1 {
        margin:auto;
        text-align: center;
        text-shadow: 3px 2px rgba(10, 10, 10, 0.1);
    }
</style>