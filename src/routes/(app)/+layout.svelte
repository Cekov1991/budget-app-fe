<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { authStore } from '$lib/stores/auth.svelte.js';
	import Button from '$lib/components/Button.svelte';

	let { children } = $props();

	// Redirect to login if not authenticated
	$effect(() => {
		if (authStore.isInitialized && !authStore.isAuthenticated) {
			goto('/login');
		}
	});

	const handleLogout = async () => {
		await authStore.logout();
		goto('/login');
	};

	const navigation = [
		{ name: 'Dashboard', href: '/dashboard', icon: '📊' },
		{ name: 'Expenses', href: '/expenses', icon: '💰' },
		{ name: 'Categories', href: '/categories', icon: '🏷️' },
		{ name: 'Add Expense', href: '/expenses/new', icon: '➕' }
	];
</script>

{#if authStore.isAuthenticated}
	<div class="min-h-screen bg-gray-50">
		<!-- Navigation -->
		<nav class="bg-white shadow-sm border-b">
			<div class="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
				<div class="flex justify-between items-center h-16">
					<div class="flex items-center">
						<h1 class="text-lg sm:text-xl font-bold text-gray-900">Budget App</h1>
					</div>
					<div class="flex items-center space-x-2 sm:space-x-4">
						<span class="hidden sm:inline text-sm text-gray-700">
							Welcome, {authStore.user?.name}
						</span>
						<Button variant="ghost" size="sm" onclick={handleLogout}>
							<span class="sm:hidden">👋</span>
							<span class="hidden sm:inline">Logout</span>
						</Button>
					</div>
				</div>
				
				<!-- Desktop navigation -->
				<div class="hidden sm:flex sm:space-x-8 pb-4">
					{#each navigation as item}
						<a
							href={item.href}
							class="inline-flex items-center px-1 pt-1 text-sm font-medium {$page.url.pathname === item.href ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}"
						>
							<span class="mr-2">{item.icon}</span>
							{item.name}
						</a>
					{/each}
				</div>
			</div>
		</nav>

		<!-- Mobile navigation -->
		<div class="bg-white border-b border-gray-200 sm:hidden">
			<div class="px-2 py-3 space-y-1">
				{#each navigation as item}
					<a
						href={item.href}
						class="flex items-center px-3 py-2 rounded-md text-base font-medium {$page.url.pathname === item.href ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'}"
					>
						<span class="mr-3 text-lg">{item.icon}</span>
						{item.name}
					</a>
				{/each}
			</div>
		</div>

		<!-- Main content -->
		<main class="mx-auto py-4 px-4 sm:py-6 sm:px-6 lg:px-8 max-w-7xl">
			{@render children?.()}
		</main>
	</div>
{:else}
	<div class="min-h-screen flex items-center justify-center">
		<div class="text-center">
			<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
			<p class="mt-4 text-gray-600">Loading...</p>
		</div>
	</div>
{/if} 