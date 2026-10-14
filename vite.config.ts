import { paraglideVitePlugin } from '@inlang/paraglide-js';
import tailwindcss from '@tailwindcss/vite';
import adapter from '@sveltejs/adapter-node';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			adapter: adapter()
		}),

		paraglideVitePlugin({
			project: './project.inlang',
			outdir: './src/lib/paraglide',
			emitTsDeclarations: true
		})
	],
	// @lucide/svelte (and similar) ship .js that re-export .svelte; Node can't load those
	// when Vite SSR-externalizes the package. Bundle them through the Svelte plugin instead.
	ssr: {
		noExternal: ['@lucide/svelte', 'bits-ui', 'mode-watcher']
	},
	optimizeDeps: {
		exclude: ['@lucide/svelte']
	}
});
