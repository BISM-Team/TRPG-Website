<script lang="ts">
</script>

<div id="toolbarContainer" class="bg-surface-200-700-token sticky top-0 z-20 px-4 py-4">
  <div id="left-container" class="flex gap-4">
    <slot name="left" />
  </div>

  <div id="center-container" class="flex gap-4">
    <slot name="center" />
  </div>

  <div id="right-container" class="flex gap-4">
    <slot name="right" />
  </div>
</div>

<style lang="postcss">
  #toolbarContainer {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    grid-template-rows: 1fr;
    justify-content: space-between;
  }

  #left-container {
    justify-content: left;
  }

  #center-container {
    justify-content: center;
  }

  #right-container {
    justify-content: right;
  }

  #toolbarContainer > div > :global(*) {
    @apply box-content block text-center;
    width: min-content;
  }
</style>
