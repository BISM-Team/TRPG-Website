<script lang="ts">
  import type { PageData } from "./$types";

  export let data: PageData
</script>

<h1 class="w3-center w3-padding-48">{data.character.name}</h1>
<p class="w3-center w3-padding-16">{JSON.stringify(data.character.properties)}</p>