<script lang="ts">
    const default_width = "auto";
    const default_height = "auto";

    export let data: { id: string; width: number; height: number };
</script>

<div
    id="prototype-content{data.id}"
    class="prototype-content w3-card-4"
    style="width:{data.width
        ? Math.max(10, data.width) + 'vw'
        : default_width}; height:{data.height
        ? Math.max(10, data.height) + 'vh'
        : default_height}"
/>

<style>
    .prototype-content {
        background-color: white;
        border: 0.5em solid #f1f1f1;
        border-radius: 1.5em;
        box-sizing: border-box;
    }
</style>
