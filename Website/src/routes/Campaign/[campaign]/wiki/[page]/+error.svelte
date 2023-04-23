<script lang="ts">
    import type { SubmitFunction } from '@sveltejs/kit';
    import { goto, afterNavigate } from '$app/navigation';
    import { page } from '$app/stores';
    import { enhance } from '$app/forms';

    let disable: boolean = false;
    let previousUrl: string | undefined = undefined;

    afterNavigate(({ from, to }) => {
        previousUrl = from!==to ? from?.url.toString() : `/WorldWiki/${$page.params.wiki}/index`;
        console.log(from?.url.toString(), to?.url.toString());
        if(from?.url.toString().includes(`/WorldWiki/${$page.params.wiki}/index`) && to?.url.toString().includes(`/WorldWiki/${$page.params.wiki}/index`)) goto('/WorldWiki');
        if($page.status===401) goto('/login');
    })

    async function goBack() {
        await goto(previousUrl || `/WorldWiki/${$page.params.wiki}/index`)
    }

    const createPage: SubmitFunction = async function() {
        disable=true;
        return async({ update }) => {
            disable=false;
            await update();
        }
    }
</script>

<div id='content' class='w3-center w3-padding-32'>
    {#if $page.status===404}
        <h1 class='w3-section w3-padding'>Page not yet created</h1>
        <p>Do you want to create it?</p>
        <form id='btnContainer' class='w3-container' method='post' use:enhance={createPage}>
            <input type="hidden" name="text" value=''>
            <button disabled={disable} class='w3-margin w3-button w3-grey' type="button" on:click={goBack}>No</button>
            <button disabled={disable} class='w3-margin w3-button w3-teal' type="submit">Yes</button>
        </form>
    {:else if $page.status===500}
        <h1 class='w3-center'>Server Error, please try again.</h1>
    {:else if $page.status===400 && $page.error}
        <h1 class='w3-center'>{$page.error.message}</h1>
    {:else} 
        <h1>Unknown Error, please try again.</h1>
        <p>{$page.status}: {JSON.stringify($page.form)}</p>
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