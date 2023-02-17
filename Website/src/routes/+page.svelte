<script lang="ts">
    import Card from "./card.svelte";

    const cards = [
        {
            name: 'Game Wiki',
            description: 'A place to find all the informations for a specific Game System, such as DnD or others',
            link: '/GameWiki',
            img: null
        },
        {
            name: 'Campaign',
            description: 'Explore and enter all the campaigns you have been invited to or created',
            link: '/Campaign',
            img: null
        },
        {
            name: 'World Wiki',
            description: 'Explore all the information about the Worlds you have seen in your campaigns, create and look at Lore, Characters, Cities and private or shared notes',
            link: '/WorldWiki',
            img: null
        },
    ]
</script>

<div id='cards' class='w3-container w3-padding-48'>
    {#each cards as data}
        <Card {data}/>
    {/each}
</div>

<style>
    #cards {
        width: 100%;
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        justify-content: space-evenly;
    }
</style>