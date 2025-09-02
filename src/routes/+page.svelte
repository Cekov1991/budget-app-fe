<script lang="ts">
	import { goto } from '$app/navigation';
	import { authStore } from '$lib/stores/auth.svelte.js';
	import Button from '$lib/components/Button.svelte';

	// Redirect based on auth status
	$effect(() => {
		if (authStore.isInitialized) {
			if (authStore.isAuthenticated) {
				goto('/dashboard');
			} else {
				goto('/login');
			}
		}
	});
</script>

<svelte:head>
	<title>Budget App - Personal Expense Tracking</title>
</svelte:head>

{#if !authStore.isInitialized}
	<div class="min-h-screen flex items-center justify-center">
		<div class="text-center">
			<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
			<p class="mt-4 text-gray-600">Loading...</p>
		</div>
	</div>
{:else}
	<div class="min-h-screen flex items-center justify-center">
		<div class="max-w-2xl mx-auto text-center">
			<h1 class="text-4xl font-bold text-gray-900 mb-6">
				Welcome to Budget App
			</h1>
			<p class="text-xl text-gray-600 mb-8">
				Track your expenses, scan receipts with AI, and take control of your finances.
			</p>
			<div class="space-x-4">
				<Button onclick={() => goto('/login')}>
					Sign In
				</Button>
				<Button variant="secondary" onclick={() => goto('/register')}>
					Create Account
				</Button>
			</div>
		</div>
	</div>
{/if}
