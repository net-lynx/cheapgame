<script lang="ts">
	import GamepadIcon from '@lucide/svelte/icons/gamepad-2';
	import { coverSources } from '#lib/cover.js';

	type Props = {
		appid: number;
		/** Landscape capsule from Steam search — the last image tried before the placeholder. */
		fallback?: string | null;
		/**
		 * `auto`: portrait art fills the frame, landscape fallbacks are letterboxed so they aren't
		 * cropped to a sliver. `cover`: always fill (for the round disc label).
		 */
		fit?: 'auto' | 'cover';
		/** Size/shape of the frame. Defaults to a full-width 2:3 box. */
		class?: string;
	};

	let {
		appid,
		fallback = null,
		fit = 'auto',
		class: className = 'aspect-2/3 w-full'
	}: Props = $props();

	const sources = $derived(coverSources(appid, fallback));
	/** Sources whose request failed. Derived lookups reset themselves when `appid` changes. */
	let failed = $state<string[]>([]);
	const current = $derived(sources.find((source) => !failed.includes(source.src)));
	const letterbox = $derived(fit === 'auto' && current?.kind === 'landscape');
</script>

<!--
	@component
	Game cover with an onerror fallback chain (no $effect). The frame has a fixed size, so swapping
	sources never shifts layout. The placeholder is painted behind the <img>.
-->
<span
	class={[
		'relative block shrink-0 overflow-hidden',
		current ? 'bg-muted bg-pattern-scan' : 'fill-cel-deal',
		className
	]}
>
	{#if current}
		<img
			src={current.src}
			width={current.width}
			height={current.height}
			alt=""
			loading="lazy"
			decoding="async"
			onerror={() => (failed = [...failed, current.src])}
			class={['absolute inset-0 size-full', letterbox ? 'object-contain' : 'object-cover']}
		/>
	{:else}
		<span class="absolute inset-0 flex items-center justify-center text-price-deal-foreground">
			<GamepadIcon class="size-1/3 min-h-5 min-w-5" aria-hidden="true" />
		</span>
	{/if}
</span>
