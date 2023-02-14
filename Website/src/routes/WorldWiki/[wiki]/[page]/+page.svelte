<script lang="ts">
    import { stringifyTree } from '$lib/tree/tree';
    import type { PageData } from './$types';
    import { invalidateAll } from '$app/navigation';

    export let data: PageData;
    let edit: boolean = false
    let disable: boolean = false;

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

<div class='w3-container' id='page'>
    {#if !data.html}
        <div>Loading data...</div>
    {:else} 
        <button disabled={disable} id='edit' class='w3-button w3-teal' on:click={() => {edit=!edit}}>{edit ? 'View' : 'Edit'}</button>
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
    #edit {
        position: absolute;
        right: 4em;
        top: 2em;
        transition: 0.1s ease-out;
    }
    #form {
        margin-top: 1.5em;
    }
    #textArea {
        width: calc(100% - 10em);
        height: 70vh;
        padding: 12px 20px;
        box-sizing: border-box;
        border: 2px solid #ccc;
        border-radius: 4px;
        background-color: #f8f8f8;
        resize: vertical;
    }
</style>