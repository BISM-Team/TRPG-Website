<script lang="ts">

</script>

<div id="topRightButtonContainer" class="w3-block">
  <slot></slot>
</div>

<style>
  #topRightButtonContainer {
    position: sticky;
    top: 0;
    background-color: teal;
    display: flex;
    justify-content: right;
    padding: 0em 1em;
    gap: 1em;
    z-index: 50;
  }
  #topRightButtonContainer > :global(*) {
    text-align: center;
    box-sizing: content-box;
    width: 4em;
    height: 24px;
    transition: 0.1s ease-out;
  }
</style>
