<script lang="ts">
    export let link: string;
</script>

<a href={link} class='card-container w3-container w3-card-4 w3-margin'>
    <slot></slot>
</a>

<style>
    a {
        text-decoration: none;
        max-width: 20%;
        transition: ease-out 200ms;
    }
    a:hover {
        transform: scale(110%);
    }
</style>