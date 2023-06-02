<script lang="ts">
  export let source: string;
  export let active: boolean;
</script>

<div class="content w3-card-4">
  <p>Mandi</p>
  <p>Source: {source}</p>
  <p>Active: {active ? "yes" : "no"}</p>
</div>

<style>
  .content {
    padding: 2em;
    overflow: auto;
    background-color: white;
    width: 100%;
    height: 100%;
  }
</style>