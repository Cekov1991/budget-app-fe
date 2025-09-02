// API base configuration and utilities
const API_BASE = 'http://localhost:8000/api'; // Adjust this to your Laravel backend URL

export interface ApiResponse<T = any> {
	data?: T;
	message?: string;
	errors?: Record<string, string[]>;
	meta?: {
		current_page: number;
		last_page: number;
		per_page: number;
		total: number;
	};
}

export interface User {
	id: number;
	name: string;
	email: string;
	email_verified_at?: string;
	created_at: string;
	updated_at: string;
}

export interface Category {
	id: number;
	name: string;
	color?: string;
	user_id: number;
	created_at: string;
	updated_at: string;
}

export interface Expense {
	id: number;
	amount: number;
	description: string;
	category_id: number;
	category?: Category;
	receipt_image_path?: string;
	expense_date: string;
	user_id: number;
	created_at: string;
	updated_at: string;
}

export interface ExpenseStats {
	totals: {
		this_week: string;
		this_month: string;
		all_time: string;
	};
	category_breakdown: Record<string, {
		total: number;
		count: number;
	}>;
}

export interface ReceiptProcessResult {
	receipt_image_path: string;
	receipt_image_url: string;
	extracted_data: {
		total_amount: number;
		merchant_name: string;
		date: string;
		items: Array<{
			name: string;
			price: number;
			quantity: number;
			category_id: number;
			suggested_category: string;
		}>;
	};
	expense_date: string;
}

class ApiClient {
	private token: string | null = null;

	constructor() {
		// Try to get token from localStorage on client side (Safari compatibility)
		if (typeof window !== 'undefined') {
			try {
				this.token = localStorage.getItem('auth_token');
			} catch (error) {
				console.log('LocalStorage access error in constructor:', error);
				this.token = null;
			}
		}
	}

	setToken(token: string | null) {
		this.token = token;
		if (typeof window !== 'undefined') {
			try {
				if (token) {
					localStorage.setItem('auth_token', token);
				} else {
					localStorage.removeItem('auth_token');
				}
			} catch (error) {
				console.log('LocalStorage write error:', error);
				// Continue anyway - token is still set in memory
			}
		}
	}

	private async request<T>(
		endpoint: string,
		options: RequestInit = {}
	): Promise<ApiResponse<T>> {
		const url = `${API_BASE}${endpoint}`;
		const headers: Record<string, string> = {
			'Content-Type': 'application/json',
			Accept: 'application/json',
			...(options.headers as Record<string, string>)
		};

		if (this.token) {
			headers.Authorization = `Bearer ${this.token}`;
		}

		try {
			const response = await fetch(url, {
				...options,
				headers
			});

			// Better error handling for Safari
			if (!response.ok) {
				console.log(`API Error: ${response.status} ${response.statusText} for ${url}`);
			}

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || 'API request failed');
			}

			return data;
		} catch (error) {
			console.error('API Error:', error);
			throw error;
		}
	}

	// Auth methods
	async register(name: string, email: string, password: string, password_confirmation: string) {
		return this.request<{ user: User; token: string }>('/register', {
			method: 'POST',
			body: JSON.stringify({ name, email, password, password_confirmation })
		});
	}

	async login(email: string, password: string) {
		return this.request<{ user: User; token: string }>('/login', {
			method: 'POST',
			body: JSON.stringify({ email, password })
		});
	}

	async logout() {
		return this.request('/logout', { method: 'POST' });
	}

	async getUser() {
		return this.request<User>('/user');
	}

	// Categories
	async getCategories() {
		return this.request<Category[]>('/categories');
	}

	async createCategory(name: string, color?: string) {
		return this.request<Category>('/categories', {
			method: 'POST',
			body: JSON.stringify({ name, color })
		});
	}

	async updateCategory(id: number, name: string, color?: string) {
		return this.request<Category>(`/categories/${id}`, {
			method: 'PUT',
			body: JSON.stringify({ name, color })
		});
	}

	async deleteCategory(id: number) {
		return this.request(`/categories/${id}`, { method: 'DELETE' });
	}

	// Expenses
	async getExpenses(page = 1, per_page = 20) {
		return this.request<Expense[]>(`/expenses?page=${page}&per_page=${per_page}`);
	}

	async getExpense(id: number) {
		return this.request<Expense>(`/expenses/${id}`);
	}

	async createExpense(expense: {
		amount: number;
		description: string;
		category_id: number;
		expense_date: string;
		receipt_image_path?: string;
	}) {
		return this.request<Expense>('/expenses', {
			method: 'POST',
			body: JSON.stringify(expense)
		});
	}

	async updateExpense(id: number, expense: Partial<Expense>) {
		return this.request<Expense>(`/expenses/${id}`, {
			method: 'PUT',
			body: JSON.stringify(expense)
		});
	}

	async deleteExpense(id: number) {
		return this.request(`/expenses/${id}`, { method: 'DELETE' });
	}

	async getExpenseStats() {
		return this.request<ExpenseStats>('/expenses/stats');
	}

	// Receipt processing
	async uploadReceipt(file: File) {
		const formData = new FormData();
		formData.append('receipt_image', file);

		const headers: Record<string, string> = {
			Accept: 'application/json'
		};

		if (this.token) {
			headers.Authorization = `Bearer ${this.token}`;
		}

		const response = await fetch(`${API_BASE}/receipts/upload`, {
			method: 'POST',
			headers,
			body: formData
		});

		const data = await response.json();
		if (!response.ok) {
			throw new Error(data.message || 'Upload failed');
		}

		return data;
	}



	async getReceiptImageUrl(path: string) {
		return this.request<{ url: string }>(`/receipts/${encodeURIComponent(path)}/url`);
	}
}

export const api = new ApiClient(); 