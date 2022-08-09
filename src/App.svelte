<script lang="ts">
	import ModeSwitcher from './ModeSwitcher.svelte';
	import Tailwindcss from './Tailwindcss.svelte';

	import { ApolloClient, InMemoryCache } from '@apollo/client';
	import {query, setClient} from "svelte-apollo";
	import Icon from "./components/Icon.svelte";
	import {queryCategories, queryExample} from "./queries";
	import {displayResponse} from "./displayResponse";
	import {onMount} from "svelte";

	const client = new ApolloClient({
		uri: 'http://localhost:1337/graphql',
		cache: new InMemoryCache()
	});

	setClient(client);

	let loading = false

	onMount(() => {
		displayResponse({ok: false})
	})

	async function getExample() {
		const reply = await query(queryExample);
		reply.subscribe(data => {
			loading = data.loading
			console.log(data.data)
		})
	}

	getExample()
</script>

<Tailwindcss />
<ModeSwitcher />
<main class="p-4 mx-auto text-center max-w-xl">
	<div class="space-y-4">
		<h1 class="uppercase text-6xl leading-normal text-svelte">Base svelte app</h1>
		<Icon name="rocket" classes="text-5xl text-svelte"/>
	</div>

	<div class="absolute bottom-4 right-4 z-50 w-max max-w-lg">
		<div class="flex justify-end w-full" id="display-response"></div>
	</div>
</main>