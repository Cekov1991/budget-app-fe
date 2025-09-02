<script lang="ts">
	import { onMount } from 'svelte';
	import { api, type Expense } from '$lib/api.js';
	import Button from '$lib/components/Button.svelte';

	let expenses = $state<Expense[]>([]);
	let loading = $state(true);
	let error = $state('');
	let currentPage = $state(1);
	let totalPages = $state(1);
	let total = $state(0);

	const loadExpenses = async (page = 1) => {
		loading = true;
		error = '';
		try {
			const response = await api.getExpenses(page, 20);
			if (response.data) {
				expenses = response.data;
				currentPage = response.meta?.current_page || 1;
				totalPages = response.meta?.last_page || 1;
				total = response.meta?.total || 0;
			}
		} catch (err: any) {
			error = err.message || 'Failed to load expenses';
		} finally {
			loading = false;
		}
	};

	const deleteExpense = async (id: number) => {
		if (!confirm('Are you sure you want to delete this expense?')) return;
		
		try {
			await api.deleteExpense(id);
			await loadExpenses(currentPage);
		} catch (err: any) {
			alert(err.message || 'Failed to delete expense');
		}
	};

	onMount(() => {
		loadExpenses();
	});

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'MKD'
		}).format(amount);
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		});
	};
</script>

<svelte:head>
	<title>Expenses - Budget App</title>
</svelte:head>

<div>
	<div class="mb-6 sm:mb-8">
		<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
			<div>
				<h1 class="text-xl sm:text-2xl font-bold text-gray-900">Expenses</h1>
				<p class="mt-1 text-sm sm:text-base text-gray-600">
					{total > 0 ? `${total} total expenses` : 'Track and manage your expenses'}
				</p>
			</div>
			<Button onclick={() => window.location.href = '/expenses/new'}>
				<span class="mr-2">➕</span>
				<span class="sm:inline">Add Expense</span>
			</Button>
		</div>
	</div>

	{#if loading}
		<div class="flex items-center justify-center py-12">
			<div class="text-center">
				<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
				<p class="mt-2 text-gray-600">Loading expenses...</p>
			</div>
		</div>
	{:else if error}
		<div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
			{error}
			<Button variant="ghost" size="sm" onclick={() => loadExpenses()}>
				Retry
			</Button>
		</div>
	{:else if expenses.length === 0}
		<div class="bg-white rounded-lg shadow-sm p-6 sm:p-8 text-center">
			<div class="text-4xl sm:text-6xl mb-4">💰</div>
			<h3 class="text-base sm:text-lg font-medium text-gray-900 mb-2">No expenses yet</h3>
			<p class="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">Start tracking your expenses to get insights into your spending habits.</p>
			<Button onclick={() => window.location.href = '/expenses/new'}>
				Add Your First Expense
			</Button>
		</div>
	{:else}
		<!-- Expenses List -->
		<div class="bg-white rounded-lg shadow-sm overflow-hidden">
			<div class="divide-y divide-gray-200">
				{#each expenses as expense (expense.id)}
					<div class="px-4 sm:px-6 py-4 hover:bg-gray-50">
						<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
							<div class="flex-1 min-w-0">
								<div class="flex items-start justify-between mb-1">
									<h3 class="text-sm sm:text-base font-medium text-gray-900 truncate pr-4">{expense.description}</h3>
									<span class="text-lg font-medium text-gray-900 flex-shrink-0">{formatCurrency(expense.amount)}</span>
								</div>
								<div class="flex flex-wrap items-center text-xs sm:text-sm text-gray-500 gap-x-3 gap-y-1">
									<span class="flex items-center">
										{#if expense.category?.color}
											<div class="w-2 h-2 rounded-full mr-1 flex-shrink-0" style="background-color: {expense.category.color}"></div>
										{:else}
											<div class="w-2 h-2 rounded-full bg-gray-400 mr-1 flex-shrink-0"></div>
										{/if}
										<span class="truncate">{expense.category?.name || 'Uncategorized'}</span>
									</span>
									<span>{formatDate(expense.expense_date)}</span>
									{#if expense.receipt_image_path}
										<span class="flex items-center">
											📄 <span class="ml-1 hidden sm:inline">Receipt</span>
										</span>
									{/if}
								</div>
							</div>
							<div class="flex items-center space-x-2 flex-shrink-0">
								<Button 
									variant="ghost" 
									size="sm"
									onclick={() => window.location.href = `/expenses/${expense.id}/edit`}
								>
									<span class="sm:hidden">✏️</span>
									<span class="hidden sm:inline">Edit</span>
								</Button>
								<Button 
									variant="danger" 
									size="sm"
									onclick={() => deleteExpense(expense.id)}
								>
									<span class="sm:hidden">🗑️</span>
									<span class="hidden sm:inline">Delete</span>
								</Button>
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>

		<!-- Pagination -->
		{#if totalPages > 1}
			<div class="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<p class="text-xs sm:text-sm text-gray-700 text-center sm:text-left">
					Page {currentPage} of {totalPages}
				</p>
				<div class="flex justify-center space-x-2">
					<Button 
						variant="ghost" 
						size="sm"
						disabled={currentPage <= 1}
						onclick={() => loadExpenses(currentPage - 1)}
					>
						<span class="sm:hidden">‹</span>
						<span class="hidden sm:inline">Previous</span>
					</Button>
					<Button 
						variant="ghost" 
						size="sm"
						disabled={currentPage >= totalPages}
						onclick={() => loadExpenses(currentPage + 1)}
					>
						<span class="sm:hidden">›</span>
						<span class="hidden sm:inline">Next</span>
					</Button>
				</div>
			</div>
		{/if}
	{/if}
</div> 