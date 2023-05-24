<script lang="ts">
  import { capitalizeFirstLetter } from "$lib/utils";

  export let text: string;
</script>

<p class="w3-center w3-panel w3-red w3-margin">{capitalizeFirstLetter(text)}</p>