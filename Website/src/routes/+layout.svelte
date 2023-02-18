<script lang='ts'>
    import type { LayoutData } from "./$types";
    export let data: LayoutData;
</script>

<header class='w3-container w3-center w3-teal w3-padding-16'>
    <h1>BISM Website</h1>
    <nav>
        <a href="/" class='w3-block'>Home</a>
        <a href="/GameWiki" class='w3-block'>Game Wiki</a>
        <a href="/WorldWiki" class='w3-block'>World Wiki</a>
        {#if data.auth} <a href="/logout" data-sveltekit-preload-data="tap" class='w3-block'>Logout</a>
        {:else} <a href="/login" class='w3-block'>Login/Signup</a> {/if}
    </nav>
</header>

<slot></slot>

<style>
    h1 {
        margin-top: 0;
    }

    a {
        text-decoration: none;
    }

    nav {
        display: flex;
        flex-direction: row;
        height: 20%;
        width: 100%;
        justify-content: space-evenly;
    }
</style>