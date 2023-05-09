<script lang="ts">
    import { page } from '$app/stores';
</script>

<div class="w3-center w3-padding-32">
  {#if 200 <= $page.status && $page.status <= 299}
    <h1>Page state mismatch</h1>
    <p>{$page.status}: {$page.error?.message}</p>
  {:else if 400 <= $page.status && $page.status <= 499}
    {#if $page.status===404}
      <h1>Page not found</h1>
      <p>Hold up, something ain't right</p>
    {/if}
  {:else if 500 <= $page.status && $page.status <= 599}
    <h1>Server Error</h1>
    <p>We're very sorry, please contact us about this.</p>
  {:else}
    <h1>Unknown Error</h1>
    <p>{$page.status}: {$page.error?.message}</p>
  {/if}
</div>
