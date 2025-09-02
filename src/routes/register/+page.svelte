<script lang="ts">
	import { goto } from '$app/navigation';
	import { authStore } from '$lib/stores/auth.svelte.js';
	import Button from '$lib/components/Button.svelte';
	import Input from '$lib/components/Input.svelte';

	let name = $state('');
	let email = $state('');
	let password = $state('');
	let passwordConfirmation = $state('');
	let error = $state('');

	const handleSubmit = async (e: Event) => {
		e.preventDefault();
		e.stopPropagation();
		error = '';

		if (!name || !email || !password || !passwordConfirmation) {
			error = 'Please fill in all fields';
			return;
		}

		if (password !== passwordConfirmation) {
			error = 'Passwords do not match';
			return;
		}

		if (password.length < 8) {
			error = 'Password must be at least 8 characters long';
			return;
		}

		try {
			await authStore.register(name, email, password, passwordConfirmation);
			// Small delay for Safari to process authentication state
			await new Promise(resolve => setTimeout(resolve, 50));
			if (authStore.isAuthenticated) {
				goto('/dashboard');
			}
		} catch (err: any) {
			error = err.message || 'Registration failed. Please try again.';
		}
	};

	// Redirect if already authenticated
	$effect(() => {
		if (authStore.isAuthenticated) {
			goto('/dashboard');
		}
	});
</script>

<svelte:head>
	<title>Register - Budget App</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-gray-50 py-8 px-4 sm:py-12 sm:px-6 lg:px-8">
	<div class="w-full max-w-md space-y-6 sm:space-y-8">
		<div>
			<h2 class="mt-6 text-center text-2xl sm:text-3xl font-extrabold text-gray-900">
				Create your account
			</h2>
			<p class="mt-2 text-center text-sm text-gray-600">
				Or
				<a href="/login" class="font-medium text-blue-600 hover:text-blue-500">
					sign in to your existing account
				</a>
			</p>
		</div>

		<form class="mt-6 sm:mt-8 space-y-4 sm:space-y-6" onsubmit={handleSubmit}>
			{#if error}
				<div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
					{error}
				</div>
			{/if}

			<div class="space-y-4">
				<Input
					label="Full Name"
					type="text"
					bind:value={name}
					autocomplete="name"
					required
					placeholder="Enter your full name"
				/>

				<Input
					label="Email address"
					type="email"
					bind:value={email}
					autocomplete="email"
					required
					placeholder="Enter your email"
				/>

				<Input
					label="Password"
					type="password"
					bind:value={password}
					autocomplete="new-password"
					required
					placeholder="Enter your password (min. 8 characters)"
				/>

				<Input
					label="Confirm Password"
					type="password"
					bind:value={passwordConfirmation}
					autocomplete="new-password"
					required
					placeholder="Confirm your password"
				/>
			</div>

			<div>
				<Button
					type="submit"
					loading={authStore.isLoading}
					disabled={authStore.isLoading}
					size="lg"
				>
					{authStore.isLoading ? 'Creating account...' : 'Create account'}
				</Button>
			</div>
		</form>
	</div>
</div>

 