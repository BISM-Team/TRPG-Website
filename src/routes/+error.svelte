<script lang="ts">
    import { page } from '$app/stores';
</script>

<div class="text-center p-8">
  {#if 200 <= $page.status && $page.status <= 299}
    <h1 class="h1">Page state mismatch</h1>
    <p>{$page.status}: {$page.error?.message}</p>
  {:else if 400 <= $page.status && $page.status <= 499}
    {#if $page.status===404}
      <h1 class="h1">Page not found</h1>
      <p>Hold up, something ain't right</p>
    {/if}
  {:else if 500 <= $page.status && $page.status <= 599}
    <h1 class="h1">Server Error</h1>
    <p>We're very sorry, please contact us about this.</p>
  {:else}
    <h1 class="h1">Unknown Error</h1>
    <p>{$page.status}: {$page.error?.message}</p>
  {/if}
</div>
