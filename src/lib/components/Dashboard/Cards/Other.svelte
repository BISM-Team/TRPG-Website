<script lang="ts">
  export let url: string;
  export let zoom: number;
</script>

<div class="content w3-card-4">
  <img src={url} alt="">
  <p>Zoom: {zoom}</p>
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