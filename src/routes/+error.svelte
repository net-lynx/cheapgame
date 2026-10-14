<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
</script>

<svelte:head>
	<title>{page.status} · ถูกมั้ย?</title>
</svelte:head>

<main class="grid min-h-svh place-items-center overflow-x-clip bg-surface p-hero text-ink">
	<div
		class="w-full max-w-xl animate-cel-in border-cel bg-surface-raised p-hero text-center shadow-cel-brand"
		role="alert"
	>
		<p class="font-display text-[4rem] leading-none font-bold text-brand">{page.status}</p>
		<p class="mt-tool font-display text-display tracking-[0.2em] uppercase">No signal</p>
		<p class="mt-tool font-sans text-body text-ink-muted">
			{page.error?.message ?? 'มีบางอย่างผิดพลาด'}
		</p>
		<a
			href={resolve('/')}
			class="mt-hero inline-block border-cel px-hero py-tool font-display text-xl font-bold text-price-deal-foreground shadow-cel-brand fill-cel-deal"
		>
			กลับไปค้นเกม →
		</a>
	</div>
</main>
