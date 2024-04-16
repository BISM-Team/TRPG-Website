<script lang="ts">
  import { capitalizeFirstLetter } from '$lib/utils';

  export let text: string;
</script>

<p class="mt-s mb-l p-s bg-error-500 text-center">{capitalizeFirstLetter(text)}</p>
