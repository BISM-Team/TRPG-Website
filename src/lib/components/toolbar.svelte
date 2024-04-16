<script lang="ts">
</script>

<div id="toolbarContainer" class="bg-surface-200-700-token shadow-sm">
  <div id="left-container" class="flex flex-row">
    <slot name="left" />
  </div>

  <div id="center-container" class="flex flex-row">
    <slot name="center" />
  </div>

  <div id="right-container" class="flex flex-row">
    <slot name="right" />
  </div>
</div>

<style lang="postcss">
  #toolbarContainer {
    display: grid;
    padding: var(--gap-m);
    grid-template-columns: 1fr 3fr 1fr;
    grid-template-rows: 1fr;
    justify-content: space-between;
  }

  #left-container {
    justify-content: left;
    align-items: center;
    gap: var(--gap-m);
  }

  #center-container {
    justify-content: center;
    align-items: center;
    gap: var(--gap-m);
  }

  #right-container {
    justify-content: right;
    align-items: center;
    gap: var(--gap-m);
  }

  #toolbarContainer > div > :global(*) {
    @apply box-content block text-center;
    width: max-content;
  }
</style>
