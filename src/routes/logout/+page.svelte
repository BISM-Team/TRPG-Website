<script lang="ts">
  import { afterNavigate, goto } from '$app/navigation';
  afterNavigate(async ({ from }) => { await goto(from?.url || '/', { invalidateAll: true }) });
</script>