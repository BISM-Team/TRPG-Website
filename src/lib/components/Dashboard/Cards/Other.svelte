<script lang="ts">
  export let url: string;
  export let zoom: number;
  export let obj: {
    first: string,
    second: boolean
  }
  export let arr: string[];
  export let char_arr: {
    name: string,
    property: string
  }[];
</script>

<div class="content w3-card-4">
  <img src={url} alt="">
  <p>Zoom: {zoom}</p>

  <p>Object: {obj.first}; {obj.second}</p>

  <p>
    {#each arr as item}
      <p>{item}</p>
    {/each}
  </p>

  <p>
    {#each char_arr as item}
      <p>{item.name}: {item.property}</p>
    {/each}
  </p>
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