<script lang="ts">

</script>

<div id="topRightButtonContainer" class="sticky top-0 flex justify-right py-0 px-1 gap-1 z-20 bg-surface-200-700-token">
  <slot></slot>
</div>

<style lang="postcss">

  #topRightButtonContainer > :global(*) {
    @apply text-center box-content w-4 h-24;
  }
</style>
