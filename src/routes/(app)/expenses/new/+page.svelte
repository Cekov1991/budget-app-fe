<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { api, type Category, type ReceiptProcessResult } from '$lib/api.js';
	import Button from '$lib/components/Button.svelte';
	import Input from '$lib/components/Input.svelte';

	let categories = $state<Category[]>([]);
	let loadingCategories = $state(true);
	
	// Manual entry form
	let description = $state('');
	let amount = $state<number | string>('');
	let categoryId = $state<number | string>('');
	let date = $state(new Date().toISOString().split('T')[0]);
	
	// Receipt upload
	let selectedFile = $state<File | null>(null);
	let uploadedImagePath = $state('');
	let processingReceipt = $state(false);
	let processedData = $state<ReceiptProcessResult | null>(null);
	let selectedItems = $state<number[]>([]);
	let editableItems = $state<Array<{
		name: string;
		price: number;
		quantity: number;
		category_id: number;
		suggested_category: string;
	}>>([]);
	let editingIndex = $state<number | null>(null);
	let showAddItemForm = $state(false);
	let newItemName = $state('');
	let newItemPrice = $state<number | string>('');
	let newItemQuantity = $state<number | string>(1);
	let newItemCategoryId = $state<number | string>('');
	
	// UI state
	let mode = $state<'manual' | 'receipt'>('manual');
	let submitting = $state(false);
	let error = $state('');

	const loadCategories = async () => {
		try {
			const response = await api.getCategories();
			categories = response.data || [];
		} catch (err: any) {
			console.error('Failed to load categories:', err);
		} finally {
			loadingCategories = false;
		}
	};

	const handleFileSelect = (event: Event) => {
		const target = event.target as HTMLInputElement;
		if (target.files && target.files[0]) {
			selectedFile = target.files[0];
		}
	};

	const uploadAndProcessReceipt = async () => {
		if (!selectedFile) return;
		
		processingReceipt = true;
		error = '';
		
		try {
			// Upload and process the receipt (your Laravel endpoint does both)
			const uploadResponse = await api.uploadReceipt(selectedFile);
			processedData = uploadResponse.data || null;
			
			// Store the receipt path for linking to expenses
			if (processedData) {
				uploadedImagePath = processedData.receipt_image_path;
			}
			
			// Copy items to editable array and select all by default
			if (processedData?.extracted_data?.items) {
				editableItems = [...processedData.extracted_data.items];
				selectedItems = editableItems.map((_, index) => index);
			}
			
		} catch (err: any) {
			error = err.message || 'Failed to process receipt';
		} finally {
			processingReceipt = false;
		}
	};

	const toggleItemSelection = (index: number) => {
		if (selectedItems.includes(index)) {
			selectedItems = selectedItems.filter(i => i !== index);
		} else {
			selectedItems = [...selectedItems, index];
		}
	};

	const submitManualExpense = async () => {
		if (!description || !amount || !categoryId || !date) {
			error = 'Please fill in all required fields';
			return;
		}

		submitting = true;
		try {
			await api.createExpense({
				description,
				amount: Number(amount),
				category_id: Number(categoryId),
				expense_date: date
			});
			goto('/expenses');
		} catch (err: any) {
			error = err.message || 'Failed to create expense';
		} finally {
			submitting = false;
		}
	};

	const submitReceiptExpenses = async () => {
		if (!processedData || selectedItems.length === 0) {
			error = 'Please select at least one item to add';
			return;
		}

		submitting = true;
		try {
			// Create expenses for selected items using editable data
			const promises = selectedItems.map(index => {
				const item = editableItems[index];
				return api.createExpense({
					description: item.name,
					amount: item.price * item.quantity,
					category_id: item.category_id || Number(categoryId) || categories[0]?.id,
					expense_date: processedData!.expense_date || date,
					receipt_image_path: uploadedImagePath
				});
			});

			await Promise.all(promises);
			goto('/expenses');
		} catch (err: any) {
			error = err.message || 'Failed to create expenses';
		} finally {
			submitting = false;
		}
	};



	const deleteItem = (index: number) => {
		editableItems = editableItems.filter((_, i) => i !== index);
		selectedItems = selectedItems.map(i => i > index ? i - 1 : i).filter(i => i !== index);
		editingIndex = null;
	};

	const addNewItem = () => {
		if (!newItemName || !newItemPrice || !newItemQuantity || !newItemCategoryId) {
			error = 'Please fill in all fields for the new item';
			return;
		}

		const selectedCategory = categories.find(c => c.id === Number(newItemCategoryId));
		const newItem = {
			name: newItemName,
			price: Number(newItemPrice),
			quantity: Number(newItemQuantity),
			category_id: Number(newItemCategoryId),
			suggested_category: selectedCategory?.name || 'Other'
		};

		editableItems = [...editableItems, newItem];
		selectedItems = [...selectedItems, editableItems.length - 1];
		
		// Reset form
		newItemName = '';
		newItemPrice = '';
		newItemQuantity = 1;
		newItemCategoryId = '';
		showAddItemForm = false;
		error = '';
	};

	const calculateTotal = () => {
		return selectedItems.reduce((total, index) => {
			const item = editableItems[index];
			return total + (item.price * item.quantity);
		}, 0);
	};

	onMount(() => {
		loadCategories();
	});

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'MKD'
		}).format(amount);
	};
</script>

<svelte:head>
	<title>Add Expense - Budget App</title>
</svelte:head>

<div>
	<div class="mb-6 sm:mb-8">
		<h1 class="text-xl sm:text-2xl font-bold text-gray-900">Add Expense</h1>
		<p class="mt-1 text-sm sm:text-base text-gray-600">Add a new expense manually or upload a receipt for AI processing</p>
	</div>

	{#if error}
		<div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 sm:mb-6 text-sm">
			{error}
		</div>
	{/if}

	<!-- Mode Toggle -->
	<div class="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
		<div class="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:space-x-0">
			<Button 
				variant={mode === 'manual' ? 'primary' : 'ghost'}
				onclick={() => mode = 'manual'}
			>
				<span class="mr-2">✏️</span>Manual Entry
			</Button>
			<Button 
				variant={mode === 'receipt' ? 'primary' : 'ghost'}
				onclick={() => mode = 'receipt'}
			>
				<span class="mr-2">📷</span>Upload Receipt
			</Button>
		</div>
	</div>

	{#if mode === 'manual'}
		<!-- Manual Entry Form -->
		<div class="bg-white rounded-lg shadow-sm p-4 sm:p-6">
			<h2 class="text-base sm:text-lg font-medium text-gray-900 mb-4">Enter Expense Details</h2>
			
			<div class="space-y-4">
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
					{#if loadingCategories}
						<div class="text-sm text-gray-500">Loading categories...</div>
					{:else}
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
					{/if}
				</div>

				<div class="flex flex-col sm:flex-row gap-3 sm:gap-4">
					<Button 
						type="submit"
						loading={submitting}
						disabled={submitting}
						onclick={submitManualExpense}
					>
						{submitting ? 'Creating...' : 'Create Expense'}
					</Button>
					<Button 
						variant="ghost"
						onclick={() => goto('/expenses')}
					>
						Cancel
					</Button>
				</div>
			</div>
		</div>

	{:else}
		<!-- Receipt Upload -->
		<div class="bg-white rounded-lg shadow p-6">
			<h2 class="text-lg font-medium text-gray-900 mb-4">Upload Receipt</h2>
			
			{#if !processedData}
				<div class="space-y-4">
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-2">
							Select Receipt Image
						</label>
						<input
							type="file"
							accept="image/*"
							onchange={handleFileSelect}
							class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
						/>
						{#if selectedFile}
							<p class="mt-2 text-sm text-gray-600">Selected: {selectedFile.name}</p>
						{/if}
					</div>

					<Button 
						disabled={!selectedFile || processingReceipt}
						loading={processingReceipt}
						onclick={uploadAndProcessReceipt}
					>
						{processingReceipt ? 'Processing Receipt...' : 'Upload & Process'}
					</Button>
				</div>

			{:else}
				<!-- Processed Receipt Results -->
				<div class="space-y-6">
					<div>
						<h3 class="text-md font-medium text-gray-900 mb-4">Detected Items</h3>
						<p class="text-sm text-gray-600 mb-4">
							Select the items you want to add as expenses:
						</p>
						
						<div class="space-y-3">
							{#each editableItems as item, index}
								<div class="border rounded-lg p-3 {selectedItems.includes(index) ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}">
									<div class="flex items-center justify-between mb-2">
										<div class="flex items-center">
											<input
												type="checkbox"
												checked={selectedItems.includes(index)}
												onchange={() => toggleItemSelection(index)}
												class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
											/>
											<span class="ml-2 text-sm font-medium text-gray-900">
												{editingIndex === index ? 'Editing Item' : `${item.name} (x${item.quantity})`}
											</span>
										</div>
										<div class="flex items-center space-x-2">
											<span class="text-sm font-medium text-gray-900">{formatCurrency(item.price * item.quantity)}</span>
											{#if editingIndex === index}
												<Button size="sm" onclick={() => editingIndex = null}>Save</Button>
												<Button size="sm" variant="ghost" onclick={() => editingIndex = null}>Cancel</Button>
											{:else}
												<Button size="sm" variant="ghost" onclick={() => editingIndex = index}>Edit</Button>
												<Button size="sm" variant="danger" onclick={() => deleteItem(index)}>Delete</Button>
											{/if}
										</div>
									</div>
									
									{#if editingIndex === index}
										<!-- Edit form -->
										<div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
											<Input
												label="Item Name"
												bind:value={item.name}
											/>
											<Input
												label="Price"
												type="number"
												bind:value={item.price}
												placeholder="0.00"
											/>
											<Input
												label="Quantity"
												type="number"
												bind:value={item.quantity}
												placeholder="1"
											/>
											<div>
												<label class="block text-sm font-medium text-gray-700 mb-1">Category</label>
												<select 
													bind:value={item.category_id}
													onchange={() => {
														const selectedCategory = categories.find(c => c.id === item.category_id);
														item.suggested_category = selectedCategory?.name || 'Other';
													}}
													class="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
												>
													{#each categories as category}
														<option value={category.id}>{category.name}</option>
													{/each}
												</select>
											</div>
										</div>
									{:else}
										<!-- Display mode -->
										<p class="text-xs text-gray-500 ml-6">
											Category: {item.suggested_category} • Price: {formatCurrency(item.price)} each
										</p>
									{/if}
								</div>
							{/each}
						</div>
						
						<!-- Add Item Button -->
						<div class="mt-4">
							{#if !showAddItemForm}
								<Button variant="ghost" size="sm" onclick={() => showAddItemForm = true}>
									<span class="mr-2">➕</span>
									Add Missing Item
								</Button>
							{:else}
								<!-- Add Item Form -->
								<div class="border border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
									<h4 class="text-sm font-medium text-gray-900 mb-3">Add New Item</h4>
									<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
										<Input
											label="Item Name"
											bind:value={newItemName}
											placeholder="e.g., Coffee"
										/>
										<Input
											label="Price"
											type="number"
											bind:value={newItemPrice}
											placeholder="0.00"
										/>
										<Input
											label="Quantity"
											type="number"
											bind:value={newItemQuantity}
											placeholder="1"
										/>
										<div>
											<label class="block text-sm font-medium text-gray-700 mb-1">Category</label>
											<select 
												bind:value={newItemCategoryId}
												class="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
											>
												<option value="">Select a category</option>
												{#each categories as category}
													<option value={category.id}>{category.name}</option>
												{/each}
											</select>
										</div>
									</div>
									<div class="flex space-x-2 mt-3">
										<Button size="sm" onclick={addNewItem}>Add Item</Button>
										<Button size="sm" variant="ghost" onclick={() => { showAddItemForm = false; error = ''; }}>Cancel</Button>
									</div>
								</div>
							{/if}
						</div>
					</div>

					{#if processedData.extracted_data.merchant_name}
						<div>
							<span class="text-sm text-gray-600">Merchant: </span>
							<span class="text-sm font-medium">{processedData.extracted_data.merchant_name}</span>
						</div>
					{/if}

					<div class="flex items-center justify-between">
						<div>
							<span class="text-sm text-gray-600">Original Total: </span>
							<span class="text-sm text-gray-500">{formatCurrency(processedData.extracted_data.total_amount)}</span>
						</div>
						<div>
							<span class="text-sm text-gray-600">Selected Total: </span>
							<span class="text-lg font-bold text-green-600">{formatCurrency(calculateTotal())}</span>
						</div>
					</div>

					<!-- Default category for items without suggestions -->
					{#if selectedItems.some(index => !editableItems[index]?.category_id)}
						<div>
							<label class="block text-sm font-medium text-gray-700 mb-1">
								Default Category (for items without suggestions)
							</label>
							<select 
								bind:value={categoryId}
								class="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							>
								<option value="">Select a category</option>
								{#each categories as category}
									<option value={category.id}>{category.name}</option>
								{/each}
							</select>
						</div>
					{/if}

					<div class="flex space-x-4">
						<Button 
							disabled={selectedItems.length === 0 || submitting}
							loading={submitting}
							onclick={submitReceiptExpenses}
						>
							{submitting ? 'Creating Expenses...' : `Create ${selectedItems.length} Expense${selectedItems.length === 1 ? '' : 's'}`}
						</Button>
						<Button 
							variant="ghost"
							onclick={() => {
								processedData = null;
								selectedFile = null;
								uploadedImagePath = '';
								selectedItems = [];
								editableItems = [];
								editingIndex = null;
								showAddItemForm = false;
								newItemName = '';
								newItemPrice = '';
								newItemQuantity = 1;
								newItemCategoryId = '';
							}}
						>
							Start Over
						</Button>
					</div>
				</div>
			{/if}
		</div>
	{/if}
</div> 