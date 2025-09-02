<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { api, type Category, type Expense } from '$lib/api.js';
	import Button from '$lib/components/Button.svelte';
	import Input from '$lib/components/Input.svelte';

	let categories = $state<Category[]>([]);
	let expense = $state<Expense | null>(null);
	let loading = $state(true);
	let submitting = $state(false);
	let error = $state('');
	
	// Form fields
	let description = $state('');
	let amount = $state<number | string>('');
	let categoryId = $state<number | string>('');
	let date = $state('');

	const expenseId = Number($page.params.id);

	const loadData = async () => {
		loading = true;
		error = '';
		
		try {
			// Load categories and expense data in parallel
			const [categoriesResponse, expenseResponse] = await Promise.all([
				api.getCategories(),
				api.getExpense(expenseId)
			]);
			
			categories = categoriesResponse.data || [];
			expense = expenseResponse.data || null;
			
			if (!expense) {
				error = 'Expense not found';
				return;
			}
			
			// Pre-populate form fields
			description = expense.description;
			amount = expense.amount;
			categoryId = expense.category_id;
			date = expense.expense_date;
			
		} catch (err: any) {
			error = err.message || 'Failed to load expense data';
		} finally {
			loading = false;
		}
	};

	const handleSubmit = async (e: Event) => {
		e.preventDefault();
		error = '';

		if (!description || !amount || !categoryId || !date) {
			error = 'Please fill in all required fields';
			return;
		}

		submitting = true;
		try {
			await api.updateExpense(expenseId, {
				description,
				amount: Number(amount),
				category_id: Number(categoryId),
				expense_date: date
			});
			goto('/expenses');
		} catch (err: any) {
			error = err.message || 'Failed to update expense';
		} finally {
			submitting = false;
		}
	};

	const handleDelete = async () => {
		if (!confirm('Are you sure you want to delete this expense? This action cannot be undone.')) {
			return;
		}

		try {
			await api.deleteExpense(expenseId);
			goto('/expenses');
		} catch (err: any) {
			alert(err.message || 'Failed to delete expense');
		}
	};

	onMount(() => {
		loadData();
	});
</script>

<svelte:head>
	<title>Edit Expense - Budget App</title>
</svelte:head>

<div>
	<div class="mb-6 sm:mb-8">
		<h1 class="text-xl sm:text-2xl font-bold text-gray-900">Edit Expense</h1>
		<p class="mt-1 text-sm sm:text-base text-gray-600">Update the details of your expense</p>
	</div>

	{#if loading}
		<div class="flex items-center justify-center py-12">
			<div class="text-center">
				<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
				<p class="mt-2 text-gray-600">Loading expense...</p>
			</div>
		</div>
	{:else if error && !expense}
		<div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
			{error}
			<div class="mt-3">
				<Button variant="ghost" onclick={() => goto('/expenses')}>
					← Back to Expenses
				</Button>
			</div>
		</div>
	{:else if expense}
		{#if error}
			<div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
				{error}
			</div>
		{/if}

		<div class="bg-white rounded-lg shadow-sm p-4 sm:p-6">
			<form class="space-y-4" on:submit={handleSubmit}>
				<Input
					label="Description"
					bind:value={description}
					placeholder="What did you spend money on?"
					required
				/>

				<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<Input
						label="Amount"
						type="number"
						bind:value={amount}
						placeholder="0.00"
						required
					/>

					<Input
						label="Date"
						type="date"
						bind:value={date}
						required
					/>
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1">
						Category <span class="text-red-500">*</span>
					</label>
					<select 
						bind:value={categoryId}
						class="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						required
					>
						<option value="">Select a category</option>
						{#each categories as category}
							<option value={category.id}>{category.name}</option>
						{/each}
					</select>
				</div>

				{#if expense.receipt_image_path}
					<div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
						<div class="flex items-center">
							<span class="text-blue-600 mr-2">📄</span>
							<span class="text-sm text-blue-800">This expense has an attached receipt</span>
						</div>
					</div>
				{/if}

				<div class="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
					<Button 
						type="submit"
						loading={submitting}
						disabled={submitting}
					>
						{submitting ? 'Updating...' : 'Update Expense'}
					</Button>
					<Button 
						variant="ghost"
						onclick={() => goto('/expenses')}
					>
						Cancel
					</Button>
					<div class="sm:ml-auto">
						<Button 
							variant="danger"
							onclick={handleDelete}
						>
							<span class="sm:hidden">🗑️</span>
							<span class="hidden sm:inline">Delete Expense</span>
						</Button>
					</div>
				</div>
			</form>
		</div>

		<!-- Expense History -->
		<div class="mt-6 sm:mt-8 bg-white rounded-lg shadow-sm p-4 sm:p-6">
			<h3 class="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Expense Details</h3>
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
				<div>
					<span class="text-gray-600">Created:</span>
					<span class="ml-2 text-gray-900 block sm:inline">{new Date(expense.created_at).toLocaleDateString()}</span>
				</div>
				<div>
					<span class="text-gray-600">Last Updated:</span>
					<span class="ml-2 text-gray-900 block sm:inline">{new Date(expense.updated_at).toLocaleDateString()}</span>
				</div>
			</div>
		</div>
	{/if}
</div> 