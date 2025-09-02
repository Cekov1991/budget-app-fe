import { api, type User } from '$lib/api.js';

// Auth store using Svelte 5 runes
export const authStore = (() => {
	let user = $state<User | null>(null);
	let isLoading = $state(false);
	let isInitialized = $state(false);

	// Initialize auth state on app startup
	const initialize = async () => {
		if (isInitialized) return;
		

		
		isLoading = true;
		try {
			const response = await api.getUser();
			
			// Handle the actual response structure from your Laravel API
			if (response.data) {
				user = response.data;
			} else if ((response as any).user) {
				user = (response as any).user;
			} else {
				user = response as any; // fallback if response is the user object directly
			}
		} catch (error) {
			console.log('Not authenticated or token expired');
			api.setToken(null);
			user = null;
		} finally {
			isLoading = false;
			isInitialized = true;
		}
	};

	const login = async (email: string, password: string) => {
		isLoading = true;
		try {
			const response = await api.login(email, password);
			
			// Handle multiple possible response structures
			let token: string | null = null;
			let userData: User | null = null;
			
			if (response.data) {
				// Structure: { data: { token, user } }
				token = response.data.token;
				userData = response.data.user;
			} else if ((response as any).token) {
				// Structure: { token, user }
				token = (response as any).token;
				userData = (response as any).user;
			} else if ((response as any).access_token) {
				// Structure: { access_token, user }
				token = (response as any).access_token;
				userData = (response as any).user;
			}
			
			if (token && userData) {
				api.setToken(token);
				user = userData;
			}
			return response;
		} catch (error) {
			throw error;
		} finally {
			isLoading = false;
		}
	};

	const register = async (name: string, email: string, password: string, passwordConfirmation: string) => {
		isLoading = true;
		try {
			const response = await api.register(name, email, password, passwordConfirmation);
			
			// Handle multiple possible response structures
			let token: string | null = null;
			let userData: User | null = null;
			
			if (response.data) {
				token = response.data.token;
				userData = response.data.user;
			} else if ((response as any).token) {
				token = (response as any).token;
				userData = (response as any).user;
			} else if ((response as any).access_token) {
				token = (response as any).access_token;
				userData = (response as any).user;
			}
			
			if (token && userData) {
				api.setToken(token);
				user = userData;
			}
			
			return response;
		} catch (error) {
			throw error;
		} finally {
			isLoading = false;
		}
	};

	const logout = async () => {
		isLoading = true;
		try {
			await api.logout();
		} catch (error) {
			console.error('Logout error:', error);
		} finally {
			api.setToken(null);
			user = null;
			isLoading = false;
		}
	};

	return {
		// Reactive getters
		get user() { return user; },
		get isLoading() { return isLoading; },
		get isAuthenticated() { return !!user; },
		get isInitialized() { return isInitialized; },

		// Methods
		initialize,
		login,
		register,
		logout
	};
})(); 