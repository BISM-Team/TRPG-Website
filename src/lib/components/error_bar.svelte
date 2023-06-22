<script lang="ts">
  import { capitalizeFirstLetter } from "$lib/utils";

  export let text: string;
</script>

<p class="text-center w3-panel bg-error-500 w3-margin">{capitalizeFirstLetter(text)}</p>