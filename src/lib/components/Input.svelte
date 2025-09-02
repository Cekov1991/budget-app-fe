<script lang="ts">
	interface Props {
		type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'date';
		placeholder?: string;
		label?: string;
		value?: string | number;
		required?: boolean;
		disabled?: boolean;
		error?: string;
		id?: string;
		name?: string;
		autocomplete?: any;
	}

	let {
		type = 'text',
		placeholder,
		label,
		value = $bindable(),
		required = false,
		disabled = false,
		error,
		id,
		name,
		autocomplete
	}: Props = $props();

	// Generate unique ID if not provided
	const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
</script>

<div class="w-full">
	{#if label}
		<label for={inputId} class="block text-sm font-medium text-gray-700 mb-1">
			{label}
			{#if required}
				<span class="text-red-500">*</span>
			{/if}
		</label>
	{/if}
	
	<input
		{type}
		{placeholder}
		{required}
		{disabled}
		{name}
		autocomplete={autocomplete}
		id={inputId}
		bind:value
		class="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed {error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}"
	/>
	
	{#if error}
		<p class="mt-1 text-sm text-red-600">{error}</p>
	{/if}
</div> 