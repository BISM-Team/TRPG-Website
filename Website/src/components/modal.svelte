<script lang='ts'>
    import { onMount } from "svelte";

    export let show_modal: boolean;

    function closeModal(event: MouseEvent) {
        let modal: HTMLElement | null;
        if (show_modal && (modal=document.getElementById("modalWrapper")) && event.target==modal) show_modal=false;
    }

    onMount(() => {
        window.addEventListener('click', closeModal);
        return () => {
            window.removeEventListener('click', closeModal);
        }
    });
</script>

<div id='modalWrapper'>
    <slot></slot>
</div>


<style>
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
</style>