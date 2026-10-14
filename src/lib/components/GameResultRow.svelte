<script lang="ts">
	import { resolve } from '$app/paths';
	import GameCover from '#lib/components/GameCover.svelte';
	import type { SearchResult } from '#lib/types.js';
	import { formatThb, verdictCopy, verdictFromDiscount } from '#lib/verdict.js';

	type Props = { game: SearchResult };

	let { game }: Props = $props();

	const discount = $derived(game.price?.discountPercent ?? 0);
	const verdict = $derived(verdictFromDiscount(game.price !== null, discount));
</script>

<!--
	@component
	Search result row (list view). Cover art | verdict stamp | name + meta | price.
	Below `sm` the stamp becomes a bar under the cover/name so the row still fits 390px.
-->
<a
	href={resolve('/game/[appid]', { appid: String(game.appid) })}
	class="result-row grid grid-cols-[4.5rem_minmax(0,1fr)] border-cel bg-surface-raised shadow-cel focus-visible:outline-brand sm:grid-cols-[5rem_7rem_minmax(0,1fr)_auto]"
>
	<GameCover
		appid={game.appid}
		fallback={game.image}
		class="row-span-2 min-h-27 w-full border-r-(length:--border-width-cel) border-border sm:row-span-1 sm:min-h-30"
	/>

	<div
		class={[
			'order-last col-span-2 flex flex-row items-center justify-center gap-2 border-t-(length:--border-width-cel) border-border px-1 py-1.5 text-center sm:order-none sm:col-span-1 sm:flex-col sm:justify-center sm:gap-0.5 sm:border-t-0 sm:border-r-(length:--border-width-cel) sm:py-2',
			verdictCopy[verdict].className
		]}
	>
		<span class="stamp inline-block font-display text-base leading-none font-bold sm:text-lg"
			>{verdictCopy[verdict].stamp}</span
		>
		<span class="font-sans text-caption leading-tight font-semibold"
			>{verdictCopy[verdict].sub}</span
		>
	</div>

	<div class="flex min-w-0 flex-col justify-center gap-1 px-tool pt-tool sm:py-tool">
		<h3 class="truncate font-display text-lg leading-snug font-bold">{game.name}</h3>
		<p class="font-sans text-caption text-ink-muted">
			Steam · {game.price ? 'ราคาไทย' : 'ยังไม่มีราคา'}<span class="hidden sm:inline">
				· กดเพื่อเช็คราคา</span
			>
		</p>
		<p class="hidden font-sans text-caption font-semibold sm:block">{verdictCopy[verdict].label}</p>
	</div>

	<div
		class="flex items-baseline gap-tool px-tool pb-tool sm:flex-col sm:items-end sm:justify-center sm:py-tool"
	>
		<p class="font-display text-display">{formatThb(game.price?.final ?? null)}</p>
		{#if game.price && discount > 0}
			<p class="flex items-center gap-2 font-sans text-caption">
				<s class="text-ink-muted">{formatThb(game.price.initial)}</s>
				<span class="bg-cel-line px-1.5 font-display font-bold text-price-deal">−{discount}%</span>
			</p>
		{/if}
	</div>
</a>

<style>
	.result-row {
		transition: translate 0.2s var(--ease-snap);
	}

	.result-row:hover {
		translate: -3px -3px;
	}

	.result-row:hover .stamp {
		animation: stamp-wiggle 0.35s var(--ease-snap);
	}

	@keyframes stamp-wiggle {
		30% {
			rotate: -10deg;
			scale: 1.15;
		}
		60% {
			rotate: 6deg;
		}
	}
</style>
