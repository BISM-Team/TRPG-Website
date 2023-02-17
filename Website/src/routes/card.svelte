<script lang="ts">
    export let data: {name: string, description: string, link: string, img: {src: string, alt: string} | null};
</script>

<a href={data.link} class='w3-container w3-card-4 w3-margin'>
    <h3 class='w3-center w3-padding-16 w3-border-bottom'>{data.name}</h3>
    <p class='w3-padding-16'>{data.description}</p>
    {#if data.img}
        <img src={data.img.src} alt={data.img.alt}>
    {/if}
</a>

<style>
    h3 {
        margin: 0;
    }
    p {
        line-height: 1.5em;
    }
    a {
        text-decoration: none;
        max-width: 20%;
        transition: ease-out 200ms;
    }
    a:hover {
        transform: scale(110%);
    }
</style>