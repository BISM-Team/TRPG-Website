<script lang="ts">
    import type { PageData } from './$types';
    import ListItem from './list_item.svelte';
    import Modal from '../modal.svelte';
    import { enhance } from '$app/forms';
    
    export let data: PageData;

    let show_modal=false;
</script>

{#if show_modal}
    <Modal bind:show_modal>
        <div id='modalContent'>
            <form method='post' action='?/create' use:enhance>
                <input type="text" name="name"/>
                <button type="button" on:click={() => {show_modal=false}}>Cancel</button>
                <button type="submit">Create</button>
            </form>
        </div>
    </Modal>
{/if}

<div id="content">
    {#each data.dashboards as dashboard}
        <div class='list-item'><ListItem {dashboard}/></div>
    {/each}
    <button class='w3-button w3-white' on:click={() => {show_modal=true}}>New</button>
</div>

<style>
    #content {
        padding: 2em;
        display: flex;
        flex-flow: row wrap;
        gap: 2em;
    }

    #content > * {
        min-width: 20vw;
        min-height: 20vh;
        transition: ease-out 200ms;
    }
    #content > *:hover {
        transform: scale(110%);
    }

    #modalContent {
        background-color: #fefefe;
        border: 1px solid #888;
        padding: 2em;
        margin: 15% auto;
        min-height: 20vh;
        width: 40vw;
    }

    #modalContent form input {
        
    }
</style>