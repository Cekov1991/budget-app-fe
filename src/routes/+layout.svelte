<script lang="ts">
	import { onMount } from 'svelte';
	import favicon from '$lib/assets/favicon.svg';
	import { authStore } from '$lib/stores/auth.svelte.js';
	import '../app.css';

	let { children } = $props();

	// Initialize auth on app startup
	onMount(() => {
		authStore.initialize();
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
</svelte:head>

<div class="min-h-screen bg-gray-50">
	{@render children?.()}
</div>
