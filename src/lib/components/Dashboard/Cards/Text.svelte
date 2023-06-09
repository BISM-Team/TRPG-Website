<script lang="ts" context="module">
  export enum Type {
    Character = "Character",
    Page = "Page"
  };
</script>

<script lang="ts" >
  export let type: Type;
  export let source: string;
</script>

<div class="content w3-card-4">
  <p>Mandi</p>
  <p>Type: {type}</p>
  <p>Source: {source}</p>
</div>

<style>
  .content {
    padding: 2vh 2vw;
    overflow: auto;
    background-color: white;
    width: 100%;
    height: 100%;
  }
</style>