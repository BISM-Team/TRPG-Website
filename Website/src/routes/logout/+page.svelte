<script lang="ts">
    import { afterNavigate, goto } from '$app/navigation';
    afterNavigate(async () => { await goto('/', { invalidateAll: true }) });
</script>