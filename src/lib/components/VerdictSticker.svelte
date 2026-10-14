<script lang="ts">
	import FastForwardIcon from '@lucide/svelte/icons/fast-forward';
	import PlayIcon from '@lucide/svelte/icons/play';
	import PauseIcon from '@lucide/svelte/icons/pause';
	import TvMinimalIcon from '@lucide/svelte/icons/tv-minimal';
	import { newLowCopy, verdictCopy, type Verdict } from '#lib/verdict.js';

	type Props = {
		/** A verdict tier, or the separate factual NEW LOW sticker. */
		kind: Verdict | 'new-low';
		/** Play the slap-on entrance. */
		slap?: boolean;
	};

	let { kind, slap = true }: Props = $props();

	const copy = $derived(kind === 'new-low' ? newLowCopy : verdictCopy[kind]);
	const burst = $derived(kind === 'mega' || kind === 'new-low');
	const [megaWord, dealWord] = verdictCopy.mega.stamp.split(' ');

	const tilt: Record<Verdict | 'new-low', string> = {
		mega: '-rotate-8',
		deal: '-rotate-3',
		standby: 'rotate-2',
		'no-signal': '-rotate-2',
		'new-low': 'rotate-10'
	};
</script>

<!--
	@component
	Vibe-layer verdict sticker (preview). Die-cut edge lives on the unclipped wrapper;
	the starburst clip-path sits on the inner element so it doesn't clip the edge.
-->
<span
	class={['inline-block sticker-die-cut', tilt[kind], slap && 'animate-sticker-slap']}
	role="img"
	aria-label={`${copy.stamp} · ${copy.sub}`}
>
	{#if burst}
		<span
			class={[
				'flex flex-col items-center justify-center text-center sticker-burst',
				kind === 'mega' ? 'size-36 text-price-mega-foreground fill-cel-mega' : 'size-28',
				kind === 'new-low' && 'text-price-deal-foreground fill-cel-deal'
			]}
			aria-hidden="true"
		>
			{#if kind === 'mega'}
				<FastForwardIcon class="size-5" />
				<span class="font-display text-[1.75rem] leading-[0.95] font-bold">{megaWord}</span>
				<span class="font-display text-[1.75rem] leading-[0.95] font-bold">{dealWord}</span>
				<span class="mt-1 font-sans text-caption leading-tight font-semibold">{copy.sub}</span>
			{:else}
				<span class="font-display text-lg leading-none font-bold">{copy.stamp}</span>
				<span class="mt-0.5 max-w-[4.5rem] font-sans text-[0.6875rem] leading-tight font-semibold"
					>{copy.sub}</span
				>
			{/if}
		</span>
	{:else}
		<span
			class={[
				'relative flex items-center gap-2 overflow-hidden rounded-chunky px-4 pt-2.5 pb-2',
				kind !== 'new-low' && verdictCopy[kind].className
			]}
			aria-hidden="true"
		>
			{#if kind === 'no-signal'}
				<!-- colour-bar strip, built from base tokens only -->
				<span class="absolute inset-x-0 top-0 flex h-1.5">
					<span class="flex-1 bg-surface"></span>
					<span class="flex-1 bg-price-deal"></span>
					<span class="flex-1 bg-brand"></span>
					<span class="flex-1 bg-ink-muted"></span>
					<span class="flex-1 bg-ink"></span>
				</span>
				<TvMinimalIcon class="size-5 shrink-0" />
			{:else if kind === 'deal'}
				<PlayIcon class="size-5 shrink-0" />
			{:else}
				<PauseIcon class="size-5 shrink-0" />
			{/if}
			<span class="flex flex-col">
				<span class="font-display text-xl leading-none font-bold">{copy.stamp}</span>
				<span class="font-sans text-caption leading-tight font-semibold">{copy.sub}</span>
			</span>
		</span>
	{/if}
</span>
