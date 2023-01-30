<script lang="ts">
    import { onMount } from "svelte";

    onMount(() => {
        window.location.pathname = window.location.pathname.concat('/index');
    })
</script>