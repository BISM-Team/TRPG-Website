<script lang="ts">
    import type { PageData } from './$types';
    import { afterNavigate } from '$app/navigation';
    import { page } from '$app/stores';

    export let data: PageData;
    let previousUrl: URL = new URL(`${window.location.host}`);

    afterNavigate(({from}) => {
        if(from) previousUrl = from.url;
    })

</script>

