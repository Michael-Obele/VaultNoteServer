import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { watchAndRun } from 'vite-plugin-watch-and-run';
import path from 'path';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit(),
		watchAndRun([
			{
				name: 'route-scanner',
				watch: path.resolve('src/routes/**/*.ts'),
				run: 'node src/lib/server/utils/route-scanner.ts generate'
			}
		])
	]
});
