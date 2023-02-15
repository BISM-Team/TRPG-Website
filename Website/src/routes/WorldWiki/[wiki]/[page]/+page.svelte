<script lang="ts">
    import { stringifyTree } from '$lib/WorldWiki/tree/tree';
    import type { PageData } from './$types';
    import { goto, invalidateAll } from '$app/navigation';
    import { onMount } from 'svelte';

    export let data: PageData;
    let edit: boolean = false
    let disable: boolean = false;
    let show_modal: boolean = false;

    onMount(() => {
        window.onclick = function(event) {
            let modal: HTMLElement | null;
            if (show_modal && (modal=document.getElementById("modalWrapper")) && event.target==modal) show_modal=false;
        }
    });

    async function deletePage() {
        await fetch(window.location.href, { method: 'POST', body: '', headers: { 'content-type': 'text/plain' }});
        await invalidateAll();
        goto(window.location.href);
    }

    async function handleSubmit(event: any) {
        disable=true;
        const response = await fetch(event.target.action, { method: 'POST', body: new FormData(event.target).get('text')});
        if (response.ok) {
            await invalidateAll();
            edit=false;
        }
        disable=false;
    }
</script>

{#if show_modal}
    <div id='modalWrapper'>
        <div id='modalContent' class='w3-center w3-container w3-padding-16'>
            <h2 class='w3-padding'>Do you want to delete this page?</h2>
            <p><em>Note that only the content you can modify will be deleted</em></p>
            <div id='deleteConfirmationButtons' class='w3-container'>
                <button disabled={disable} class='w3-button w3-margin w3-grey' on:click={() => {show_modal=false}}>Cancel</button>
                <button disabled={disable} type="submit" class='w3-button w3-margin w3-teal' on:click={deletePage}>Yes</button>
            </div>
        </div>
    </div>
{/if}

<div class='w3-container' id='page'>
    {#if !data.loaded}
        <div>Loading data...</div>
    {:else} 
        <div id='topRightButtonContainer'>
            <button disabled={disable} id='deleteButton' class='w3-button w3-grey' on:click={() => {show_modal=true}}>Delete</button>
            <button disabled={disable} id='editButton' class='w3-button w3-teal' on:click={() => {edit=!edit}}>{edit ? 'View' : 'Edit'}</button>
        </div>
        {#if edit}
            {#await stringifyTree(data.tree)}
                Stringifying markdown...
            {:then src} 
                <form method='post' on:submit|preventDefault={handleSubmit} class='w3-container w3-padding-32' id='form'>
                    <textarea name="text" id="textArea" value={src}/>
                    <br>
                    <button disabled={disable} class='w3-button w3-grey' on:click={() => {edit=false}}>Cancel</button>
                    <button disabled={disable} type="submit" class='w3-button w3-teal'>Done</button>
                </form>
            {/await}
        {:else}
            <div class='w3-container w3-padding-32' id='content'>{@html data.html}</div>
        {/if}
    {/if}
</div>

<style>
    #page {
        position: relative;
    }
    #topRightButtonContainer {
        position: absolute;
        right: 4em;
        top: 2em;
    }
    #topRightButtonContainer button {
        text-align: center;
        width: 6em;
        transition: 0.1s ease-out;
    }
    #form {
        margin-top: 1.5em;
    }
    #textArea {
        width: calc(100% - 10em);
        height: 74vh;
        padding: 12px 20px;
        box-sizing: border-box;
        border: 2px solid #ccc;
        border-radius: 4px;
        background-color: #f8f8f8;
        resize: vertical;
    }
    #modalWrapper {
        position: fixed; /* Stay in place */
        z-index: 1; /* Sit on top */
        left: 0;
        top: 0;
        width: 100%; /* Full width */
        height: 100%; /* Full height */
        overflow: auto; /* Enable scroll if needed */
        background-color: rgb(0,0,0); /* Fallback color */
        background-color: rgba(0,0,0,0.4); /* Black w/ opacity */
    }

    #modalContent {
        background-color: #fefefe;
        margin: 15% auto; /* 15% from the top and centered */
        border: 1px solid #888;
        max-width: 40em;
    }
    #modalContent button {
        width: 6em;
    }
</style>