<script lang="ts">
    import type { Dashboard } from '@prisma/client'
    export let dashboard: Dashboard;
</script>

<a href={'./'+dashboard.id} class='w3-container w3-card-4 w3-margin'>
    <h3 class='w3-center w3-padding-16 w3-border-bottom'>{dashboard.name}</h3>
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
    }
</style>