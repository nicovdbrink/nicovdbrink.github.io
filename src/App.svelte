<script lang="ts">
	import Tailwindcss from './Tailwindcss.svelte';
	import Icon from "./components/Icon.svelte";
</script>

<Tailwindcss />
<main class="p-4 mx-auto text-center max-w-xl">
	<div class="space-y-4">
		<h1 class="uppercase text-6xl leading-normal text-svelte">Base svelte app</h1>
		<Icon name="rocket" classes="text-5xl text-svelte"/>
	</div>
</main>