<script lang="ts">
    import { goto, invalidateAll, afterNavigate } from '$app/navigation';
    import { page } from '$app/stores';

    let disable: boolean = false;
    let previousUrl: URL;

    afterNavigate(({from}) => {
        if(from) previousUrl = from.url;
        else previousUrl = new URL(`${window.location.host}/WorldWiki/${$page.params.wiki}/index`)
    })

    async function goBack() {
        await goto(previousUrl)
    }

    async function createPage() {
        disable=true;
        await fetch(window.location.href, { method: 'POST', body: '', headers: { 'content-type': 'text/plain' }});
        await goto(window.location.href);
        await invalidateAll();
        disable=false;
    }
</script>

<div id='content' class='w3-center w3-padding-32'>
    {#if $page.status===404}
        <h1 class='w3-section w3-padding'>Page not yet created</h1>
        <p>Do you want to create it?</p>
        <div id='btnContainer' class='w3-container'>
            <button disabled={disable} class='w3-margin w3-button w3-grey' on:click={goBack}>No</button>
            <button disabled={disable} class='w3-margin w3-button w3-teal' on:click={createPage}>Yes</button>
        </div>
    {:else if $page.status===500}
        <h1 class='w3-center'>Server Error, please try again.</h1>
    {:else if $page.status===400 && $page.error}
        <h1 class='w3-center'>{$page.error.message}</h1>
    {:else} 
        <h1>Unknown Error, please try again.</h1>
    {/if}
</div>

<style>
    h1 {
        font-size: xx-large;
    }

    button {
        width: 4em;
    }
</style>