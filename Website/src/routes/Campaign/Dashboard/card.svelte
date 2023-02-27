<script lang='ts'>
    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();

    const default_width = 'auto';
    const default_height = 'auto';

    export let data: {picked: boolean, index?: number, id: number, content: string, width?: number, height?: number}

    function pick(ev: MouseEvent) {
        ev.preventDefault();
        ev.stopPropagation();
        let computedGeometry: DOMRect | undefined = document.getElementById('content'+data.id)?.getBoundingClientRect();
        dispatch('pick', {id: data.id, geometry: computedGeometry, mousepos: {x: ev.pageX, y: ev.pageY}})
    }
</script>

<div id='content{data.id}' class='card-content w3-card-4' style='width:{data.width ? Math.max(6, data.width)+'px' : default_width}; height:{data.height ? Math.max(6, data.height)+'px' : default_height}'>
    <p>Id: {data.id}</p>
    <p>{data.content}</p>
    <button on:click={() => {dispatch('remove', {id: data.id})}} class='w3-button w3-teal w3-margin'>Remove</button>
    <button on:mousedown={pick} class='w3-button w3-teal w3-margin'>Pick</button>
</div>

<style>
    .card-content {
        padding: 2em;
        overflow: auto;
        box-sizing: border-box;
        background-color: white;
        box-sizing: border-box;
    }

    button {
        width: 7em;
        margin-bottom: 0 !important;
    }

    ::-webkit-scrollbar {
        width: 0.75em;
        height: 0.75em;
    }

    /* Track */
    ::-webkit-scrollbar-track {
        background: #f1f1f1; 
    }
    
    /* Handle */
    ::-webkit-scrollbar-thumb {
        background: #9e9e9e; 
    }

    /* Handle on hover */
    ::-webkit-scrollbar-thumb:hover {
        background: #616161;
    }
</style>