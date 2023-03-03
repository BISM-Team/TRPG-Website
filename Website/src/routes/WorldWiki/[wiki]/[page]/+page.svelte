<script lang="ts">
    import type { SubmitFunction } from '@sveltejs/kit';
    import type { PageData } from './$types';
    import { stringifyTree } from '$lib/WorldWiki/tree/tree';
    import { onMount } from 'svelte';
    import { applyAction, enhance } from '$app/forms';
    import { page } from '$app/stores';
    import { update_await_block_branch } from 'svelte/internal';

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

    const handleDelete: SubmitFunction = async function() {
        disable=true;
        return async({ result, update }) => {
            edit=false;
            show_modal=false;
            disable=false;
            if(result.type==='success' && result.data?.deleted) {
                result.status=404;
                (result.type as any)='error';
            }
            console.log(result);
            await update();
        }
    }

    const handleSubmit: SubmitFunction = async function() {
        disable=true;
        return async ({ update }) => {
            edit=false;
            disable=false;
            await update();
        }
    }
    
</script>

{#if show_modal}
    <div id='modalWrapper'>
        <div id='modalContent' class='w3-center w3-container w3-padding-16'>
            <h2 class='w3-padding'>Do you want to delete this page?</h2>
            <p><em>Note that only the content you can modify will be deleted</em></p>
            <form id='deleteConfirmationButtons' class='w3-container' method="post" use:enhance={handleDelete}>
                <input type="hidden" name="version" value={data.version}>
                <input type="hidden" name="text" value=''>
                <button disabled={disable} class='w3-button w3-margin w3-grey' type="button" on:click={() => {show_modal=false}}>Cancel</button>
                <button disabled={disable} class='w3-button w3-margin w3-teal' type="submit">Yes</button>
            </form>
        </div>
    </div>
{/if}

<div class='w3-container' id='page'>
    <div id='topRightButtonContainer'>
        <button disabled={disable} id='deleteButton' class='w3-button w3-grey' on:click={() => {show_modal=true}}>Delete</button>
        <button disabled={disable} id='editButton' class='w3-button w3-teal' on:click={() => {edit=!edit}}>{edit ? 'View' : 'Edit'}</button>
    </div>
    {#if edit}
        {#await stringifyTree(data.tree)}
            Stringifying markdown...
        {:then src} 
            {#if $page.status===409}
                <p class='w3-panel w3-red'>Oops... this page has been edited while you were working on it... Please <strong>copy the information you were editing</strong> and reload the page to get the updated version!</p>
            {/if}
            {#if $page.error}
                <p class='w3-panel w3-red'>Unspecified Error, please contact us to investigate the cause!</p>
            {/if}
            <form class='w3-container w3-padding-32' id='form' method='post' use:enhance={handleSubmit}>
                <input type="hidden" name="version" value={data.version}>
                <textarea name="text" id="textArea" value={src}/>
                <br>
                <button disabled={disable} class='w3-button w3-grey' type="button" on:click={() => {edit=false}}>Cancel</button>
                <button disabled={disable} class='w3-button w3-teal' type="submit">Done</button>
            </form>
        {/await}
    {:else}
        <div class='w3-container w3-padding-32' id='content'>{@html data.renderedTree}</div>
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