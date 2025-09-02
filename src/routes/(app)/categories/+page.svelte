<script lang="ts">
	import { onMount } from 'svelte';
	import { api, type Category } from '$lib/api.js';
	import Button from '$lib/components/Button.svelte';
	import Input from '$lib/components/Input.svelte';

	let categories = $state<Category[]>([]);
	let loading = $state(true);
	let error = $state('');
	
	// Form state
	let showAddForm = $state(false);
	let editingCategory = $state<Category | null>(null);
	let newCategoryName = $state('');
	let newCategoryColor = $state('#3B82F6');
	let submitting = $state(false);

	const loadCategories = async () => {
		loading = true;
		error = '';
		try {
			const response = await api.getCategories();
			categories = response.data || [];
		} catch (err: any) {
			error = err.message || 'Failed to load categories';
		} finally {
			loading = false;
		}
	};

	const createCategory = async () => {
		if (!newCategoryName.trim()) {
			error = 'Category name is required';
			return;
		}

		submitting = true;
		try {
			await api.createCategory(newCategoryName.trim(), newCategoryColor);
			newCategoryName = '';
			newCategoryColor = '#3B82F6';
			showAddForm = false;
			await loadCategories();
		} catch (err: any) {
			error = err.message || 'Failed to create category';
		} finally {
			submitting = false;
		}
	};

	const updateCategory = async () => {
		if (!editingCategory || !newCategoryName.trim()) {
			error = 'Category name is required';
			return;
		}

		submitting = true;
		try {
			await api.updateCategory(editingCategory.id, newCategoryName.trim(), newCategoryColor);
			editingCategory = null;
			newCategoryName = '';
			newCategoryColor = '#3B82F6';
			await loadCategories();
		} catch (err: any) {
			error = err.message || 'Failed to update category';
		} finally {
			submitting = false;
		}
	};

	const deleteCategory = async (id: number) => {
		if (!confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
			return;
		}

		try {
			await api.deleteCategory(id);
			await loadCategories();
		} catch (err: any) {
			alert(err.message || 'Failed to delete category');
		}
	};

	const startEdit = (category: Category) => {
		editingCategory = category;
		newCategoryName = category.name;
		newCategoryColor = category.color || '#3B82F6';
		showAddForm = false;
	};

	const cancelEdit = () => {
		editingCategory = null;
		newCategoryName = '';
		newCategoryColor = '#3B82F6';
		showAddForm = false;
		error = '';
	};

	onMount(() => {
		loadCategories();
	});

	const defaultColors = [
		'#3B82F6', '#EF4444', '#10B981', '#F59E0B', 
		'#8B5CF6', '#EC4899', '#06B6D4', '#84CC16',
		'#F97316', '#6366F1', '#14B8A6', '#EAB308'
	];
</script>

<svelte:head>
	<title>Categories - Budget App</title>
</svelte:head>

<div>
	<div class="mb-6 sm:mb-8">
		<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
			<div>
				<h1 class="text-xl sm:text-2xl font-bold text-gray-900">Categories</h1>
				<p class="mt-1 text-sm sm:text-base text-gray-600">Organize your expenses with custom categories</p>
			</div>
			<Button onclick={() => { showAddForm = true; editingCategory = null; }}>
				<span class="mr-2">➕</span>
				<span class="sm:inline">Add Category</span>
			</Button>
		</div>
	</div>

	{#if error}
		<div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
			{error}
		</div>
	{/if}

	<!-- Add/Edit Form -->
	{#if showAddForm || editingCategory}
		<div class="bg-white rounded-lg shadow p-6 mb-6">
			<h2 class="text-lg font-medium text-gray-900 mb-4">
				{editingCategory ? 'Edit Category' : 'Add New Category'}
			</h2>
			
			<div class="space-y-4">
				<Input
					label="Category Name"
					bind:value={newCategoryName}
					placeholder="Enter category name"
					required
				/>

				<div>
					<label class="block text-sm font-medium text-gray-700 mb-2">
						Color
					</label>
					<div class="flex items-center space-x-2 mb-3">
						<input
							type="color"
							bind:value={newCategoryColor}
							class="h-10 w-16 rounded border border-gray-300 cursor-pointer"
						/>
						<span class="text-sm text-gray-600">{newCategoryColor}</span>
					</div>
					
					<!-- Preset colors -->
					<div class="grid grid-cols-6 gap-2">
						{#each defaultColors as color}
							<button
								type="button"
								onclick={() => newCategoryColor = color}
								class="h-8 w-8 rounded-full border-2 {newCategoryColor === color ? 'border-gray-800' : 'border-gray-300'} hover:border-gray-600"
								style="background-color: {color}"
								title={color}
							></button>
						{/each}
					</div>
				</div>

				<div class="flex space-x-4">
					<Button 
						loading={submitting}
						disabled={submitting}
						onclick={editingCategory ? updateCategory : createCategory}
					>
						{submitting ? 'Saving...' : editingCategory ? 'Update Category' : 'Create Category'}
					</Button>
					<Button 
						variant="ghost"
						onclick={cancelEdit}
					>
						Cancel
					</Button>
				</div>
			</div>
		</div>
	{/if}

	<!-- Categories List -->
	{#if loading}
		<div class="flex items-center justify-center py-12">
			<div class="text-center">
				<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
				<p class="mt-2 text-gray-600">Loading categories...</p>
			</div>
		</div>
	{:else if categories.length === 0}
		<div class="bg-white rounded-lg shadow p-8 text-center">
			<div class="text-6xl mb-4">🏷️</div>
			<h3 class="text-lg font-medium text-gray-900 mb-2">No categories yet</h3>
			<p class="text-gray-600 mb-6">Create your first category to start organizing your expenses.</p>
			<Button onclick={() => showAddForm = true}>
				Create Your First Category
			</Button>
		</div>
	{:else}
		<div class="bg-white rounded-lg shadow overflow-hidden">
			<div class="divide-y divide-gray-200">
				{#each categories as category (category.id)}
					<div class="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
						<div class="flex items-center">
							<div 
								class="w-4 h-4 rounded-full mr-3"
								style="background-color: {category.color || '#6B7280'}"
							></div>
							<div>
								<h3 class="text-sm font-medium text-gray-900">{category.name}</h3>
								<p class="text-xs text-gray-500">
									Created {new Date(category.created_at).toLocaleDateString()}
								</p>
							</div>
						</div>
						<div class="flex items-center space-x-2">
							<Button 
								variant="ghost" 
								size="sm"
								onclick={() => startEdit(category)}
							>
								Edit
							</Button>
							<Button 
								variant="danger" 
								size="sm"
								onclick={() => deleteCategory(category.id)}
							>
								Delete
							</Button>
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Quick tip -->
	<div class="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
		<div class="flex">
			<div class="flex-shrink-0">
				<span class="text-blue-600">💡</span>
			</div>
			<div class="ml-3">
				<h3 class="text-sm font-medium text-blue-800">
					Tip: Organize your spending
				</h3>
				<p class="mt-1 text-sm text-blue-700">
					Create categories that match your spending habits like "Food", "Transportation", "Entertainment", etc. 
					The AI receipt processing will automatically suggest appropriate categories.
				</p>
			</div>
		</div>
	</div>
</div> 