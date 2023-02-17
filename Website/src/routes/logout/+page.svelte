<script lang="ts">
    import { afterNavigate, goto } from '$app/navigation';
    import type { PageData } from './$types';  

    export let data: PageData;
    afterNavigate(async () => { if(data.logged_out) await goto('/', { invalidateAll: true }) });
</script>