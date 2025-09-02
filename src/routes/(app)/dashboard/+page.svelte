<script lang="ts">
	import { onMount } from 'svelte';
	import { api, type ExpenseStats } from '$lib/api.js';
	import Button from '$lib/components/Button.svelte';

	let stats = $state<ExpenseStats | null>(null);
	let loading = $state(true);
	let error = $state('');

	const loadStats = async () => {
		loading = true;
		error = '';
		try {
			const response = await api.getExpenseStats();
			stats = response.data || null;
		} catch (err: any) {
			error = err.message || 'Failed to load statistics';
		} finally {
			loading = false;
		}
	};

	onMount(() => {
		loadStats();
	});

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'MKD'
		}).format(amount);
	};


</script>

<svelte:head>
	<title>Dashboard - Budget App</title>
</svelte:head>

<div>
	<div class="mb-6 sm:mb-8">
		<h1 class="text-xl sm:text-2xl font-bold text-gray-900">Dashboard</h1>
		<p class="mt-1 text-sm sm:text-base text-gray-600">Overview of your expenses and spending habits</p>
	</div>

	{#if loading}
		<div class="flex items-center justify-center py-12">
			<div class="text-center">
				<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
				<p class="mt-2 text-gray-600">Loading dashboard...</p>
			</div>
		</div>
	{:else if error}
		<div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
			{error}
			<Button variant="ghost" size="sm" onclick={loadStats}>
				Retry
			</Button>
		</div>
	{:else if stats}
		<!-- Summary Cards -->
		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
			<div class="bg-white rounded-lg shadow-sm p-4 sm:p-6">
				<h3 class="text-base sm:text-lg font-medium text-gray-900 mb-2">This Week</h3>
				<p class="text-2xl sm:text-3xl font-bold text-green-600">{formatCurrency(Number(stats.totals.this_week))}</p>
				<p class="text-xs sm:text-sm text-gray-500 mt-1">Total expenses this week</p>
			</div>
			
			<div class="bg-white rounded-lg shadow-sm p-4 sm:p-6">
				<h3 class="text-base sm:text-lg font-medium text-gray-900 mb-2">This Month</h3>
				<p class="text-2xl sm:text-3xl font-bold text-blue-600">{formatCurrency(Number(stats.totals.this_month))}</p>
				<p class="text-xs sm:text-sm text-gray-500 mt-1">Total expenses this month</p>
			</div>
			
			<div class="bg-white rounded-lg shadow-sm p-4 sm:p-6 sm:col-span-2 lg:col-span-1">
				<h3 class="text-base sm:text-lg font-medium text-gray-900 mb-2">All Time</h3>
				<p class="text-2xl sm:text-3xl font-bold text-purple-600">{formatCurrency(Number(stats.totals.all_time))}</p>
				<p class="text-xs sm:text-sm text-gray-500 mt-1">Total all-time expenses</p>
			</div>
		</div>

		<!-- Category Breakdown -->
		{#if stats.category_breakdown && Object.keys(stats.category_breakdown).length > 0}
			<div class="bg-white rounded-lg shadow-sm mb-6 sm:mb-8">
				<div class="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
					<h3 class="text-base sm:text-lg font-medium text-gray-900">Spending by Category</h3>
				</div>
				<div class="p-4 sm:p-6">
					<div class="space-y-3 sm:space-y-4">
						{#each Object.entries(stats.category_breakdown) as [categoryName, categoryData]}
							<div class="flex items-center justify-between">
								<div class="flex items-center min-w-0 flex-1">
									<div class="w-3 h-3 rounded-full bg-blue-500 mr-3 flex-shrink-0"></div>
									<div class="min-w-0 flex-1">
										<span class="text-sm font-medium text-gray-900 block truncate">{categoryName}</span>
										<span class="text-xs text-gray-500">({categoryData.count} expense{categoryData.count === 1 ? '' : 's'})</span>
									</div>
								</div>
								<span class="text-sm font-medium text-gray-600 ml-4">{formatCurrency(categoryData.total)}</span>
							</div>
						{/each}
					</div>
				</div>
			</div>
		{/if}

		<!-- Quick Actions -->
		<div class="bg-white rounded-lg shadow-sm p-4 sm:p-6 text-center">
			<h3 class="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Ready to track more expenses?</h3>
			<div class="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
				<Button onclick={() => window.location.href = '/expenses/new'}>
					<span class="mr-2">➕</span>
					Add Expense
				</Button>
				<Button variant="secondary" onclick={() => window.location.href = '/expenses'}>
					<span class="mr-2">💰</span>
					View All Expenses
				</Button>
			</div>
		</div>
	{/if}

	<!-- Quick Actions -->
	<div class="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4">
		<Button onclick={() => window.location.href = '/expenses/new'}>
			<span class="mr-2">➕</span>
			Add Expense
		</Button>
		<Button variant="secondary" onclick={() => window.location.href = '/categories'}>
			<span class="mr-2">🏷️</span>
			Manage Categories
		</Button>
	</div>
</div> 