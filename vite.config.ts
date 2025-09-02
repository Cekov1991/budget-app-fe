import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
	plugins: [sveltekit(), tailwindcss()],
	server: {
		allowedHosts: ['localhost', '127.0.0.1', '61129ae2fef1.ngrok-free.app']
	}
});
