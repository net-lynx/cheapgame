<script lang="ts">
	import type { Attachment } from 'svelte/attachments';
	import { MediaQuery } from 'svelte/reactivity';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import GameCover from '#lib/components/GameCover.svelte';
	import type { SearchResult } from '#lib/types.js';
	import { formatThb, verdictCopy, verdictFromDiscount } from '#lib/verdict.js';

	type Props = { game: SearchResult };

	let { game }: Props = $props();

	/** How long the disc "loads" (slide out + fast spin + flash) before we navigate. */
	const LOAD_MS = 450;

	const reducedMotion = new MediaQuery('(prefers-reduced-motion: reduce)');

	let phase = $state<'idle' | 'loading'>('idle');
	let timer: ReturnType<typeof setTimeout> | undefined;

	const href = $derived(resolve('/game/[appid]', { appid: String(game.appid) }));
	const discount = $derived(game.price?.discountPercent ?? 0);
	const verdict = $derived(verdictFromDiscount(game.price !== null, discount));

	/**
	 * Only a plain left click (or Enter, which the browser turns into a click) plays the
	 * animation. Cmd/Ctrl/Shift/Alt/middle-click fall through to the browser's own link behaviour.
	 * With reduced motion we don't intercept at all: the link navigates immediately.
	 */
	function onclick(event: MouseEvent) {
		if (event.defaultPrevented || event.button !== 0) return;
		if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
		if (reducedMotion.current) return;

		event.preventDefault();
		if (phase === 'loading') return;
		phase = 'loading';
		timer = setTimeout(() => {
			void goto(href).finally(() => (phase = 'idle'));
		}, LOAD_MS);
	}

	/** Cancels a pending navigation if the case unmounts mid-animation. */
	const stopTimer: Attachment = () => () => clearTimeout(timer);
</script>

<!--
	@component
	"Pull the disc out of its case" game picker (Vibe preview). Real <a href>: hover/focus tilts the
	case and slides the disc partway out (spinning); a plain click pops it out, "reads" it for
	LOAD_MS, then goto()s the compare page. Vibe elements: the disc + the NOW LOADING tag.
	All hover rules live inside (hover: hover) so touch taps go straight to click; touch devices
	get a deeper default peek instead.
-->
<a
	{href}
	{onclick}
	{@attach stopTimer}
	data-phase={phase}
	class="disc-link block focus-visible:outline-brand"
>
	<div class="disc-stage">
		<div class="case-stage">
			<!-- The disc: label art + clear hub (rotates), sheen (fixed), centre hole (mask) -->
			<div class="disc-slot" aria-hidden="true">
				<div class="disc-spin animate-disc-spin">
					<div class="disc-label">
						<GameCover appid={game.appid} fallback={game.image} fit="cover" class="size-full" />
					</div>
					<div class="disc-hub"></div>
				</div>
				<div class="disc-sheen bg-disc-sheen"></div>
			</div>

			<div class="case relative aspect-2/3 w-4/5 border-cel bg-ink shadow-poster">
				<div class="absolute inset-y-0 left-0 w-[7%] bg-ink" aria-hidden="true"></div>
				<div class="absolute inset-y-0 right-0 left-[7%]">
					<GameCover appid={game.appid} fallback={game.image} class="size-full" />
				</div>
				<div class="case-gloss" aria-hidden="true"></div>
				{#if game.price && discount > 0}
					<span
						class="absolute top-1.5 right-1.5 rotate-6 bg-cel-line px-1.5 font-display text-caption font-bold text-price-deal"
						aria-hidden="true">−{discount}%</span
					>
				{/if}
				<span
					class="load-tag absolute inset-x-0 bottom-0 bg-cel-line px-1 py-1 text-center text-catalog text-price-deal"
					aria-hidden="true">▶ Now loading…</span
				>
			</div>
		</div>
	</div>

	<div class="mt-tool flex flex-col items-start gap-1">
		<h3 class="line-clamp-2 font-display text-base leading-snug font-bold">{game.name}</h3>
		<p class="flex flex-wrap items-baseline gap-x-2">
			<span class="font-display text-lg leading-snug font-bold"
				>{formatThb(game.price?.final ?? null)}</span
			>
			{#if game.price && discount > 0}
				<s class="font-sans text-caption text-ink-muted">{formatThb(game.price.initial)}</s>
			{/if}
		</p>
		<p
			class={[
				'flex flex-col items-start border-poster px-2 py-0.5 leading-tight',
				verdictCopy[verdict].className
			]}
		>
			<span class="font-display text-caption font-bold">{verdictCopy[verdict].stamp}</span>
			<span class="font-sans text-caption font-semibold">{verdictCopy[verdict].sub}</span>
		</p>
	</div>

	{#if phase === 'loading'}
		<span class="sr-only" role="status">กำลังเปิด {game.name}</span>
	{/if}
</a>

<style>
	/* cqw below = % of the stage's width, so the case + disc scale with the grid cell */
	.disc-stage {
		container-type: inline-size;
	}

	.case-stage {
		position: relative;
	}

	.case {
		z-index: 1;
	}

	/* --- Disc: 74cqw wide, tucked behind the case so only a crescent shows at rest --- */
	.disc-slot {
		--disc-x: 13cqw;
		position: absolute;
		top: 50%;
		left: 0;
		z-index: 0;
		width: 74cqw;
		aspect-ratio: 1;
		border-radius: 50%;
		translate: var(--disc-x) -50%;
		/* centre hole: only the alpha channel of the mask colour matters */
		mask: radial-gradient(circle, transparent 0 7%, var(--color-ink) 7.5%);
	}

	.disc-spin {
		position: absolute;
		inset: 0;
		border-radius: 50%;
		border: var(--border-width-poster) solid var(--color-border);
		background: color-mix(in srgb, var(--color-surface) 62%, var(--color-ink-muted));
		animation-play-state: paused;
	}

	.disc-label {
		position: absolute;
		inset: 20%;
		overflow: hidden;
		border-radius: 50%;
		border: var(--border-width-poster) solid var(--color-border);
	}

	.disc-hub {
		position: absolute;
		inset: 39%;
		border-radius: 50%;
		border: var(--border-width-poster) solid var(--color-border);
		background: color-mix(in srgb, var(--color-surface-raised) 55%, transparent);
	}

	.disc-sheen {
		position: absolute;
		inset: 0;
		border-radius: 50%;
		pointer-events: none;
	}

	/* --- Case gloss: a plastic-wrap highlight from the paper token --- */
	.case-gloss {
		position: absolute;
		inset: 0;
		pointer-events: none;
		background: linear-gradient(
			105deg,
			color-mix(in srgb, var(--color-brand-foreground) 30%, transparent) 0 11%,
			transparent 11% 19%,
			color-mix(in srgb, var(--color-brand-foreground) 16%, transparent) 19% 23%,
			transparent 23%
		);
	}

	.load-tag {
		visibility: hidden;
	}

	/* Touch: no hover, so the disc peeks further by default */
	@media (hover: none) {
		.disc-slot {
			--disc-x: 17cqw;
		}
	}

	/* --- Hover / keyboard focus: tilt the case, slide the disc partway out, start spinning --- */
	@media (prefers-reduced-motion: no-preference) {
		.case-stage {
			transition: transform 0.3s var(--ease-snap);
		}

		.disc-slot {
			transition:
				translate 0.35s var(--ease-snap),
				scale 0.25s var(--ease-snap);
		}

		.disc-link:focus-visible .case-stage {
			transform: perspective(700px) rotateY(-9deg) rotateX(3deg) translateY(-3px);
		}

		.disc-link:focus-visible .disc-slot {
			--disc-x: 23cqw;
		}

		.disc-link:focus-visible .disc-spin {
			animation-play-state: running;
		}

		/* --- Select: pop in front of the case, fast spin, read flash, "Now loading" tag --- */
		.disc-link[data-phase='loading'] .case-stage {
			transform: perspective(700px) rotateY(-9deg) rotateX(3deg) translateY(-3px);
		}

		.disc-link[data-phase='loading'] .disc-slot {
			--disc-x: 26cqw;
			z-index: 2;
			scale: 1.08;
			animation: disc-read 0.45s linear;
		}

		.disc-link[data-phase='loading'] .disc-spin {
			animation-duration: 0.35s;
			animation-play-state: running;
		}

		.disc-link[data-phase='loading'] .load-tag {
			visibility: visible;
			animation: load-blink 0.15s steps(1) infinite;
		}
	}

	@media (hover: hover) and (prefers-reduced-motion: no-preference) {
		.disc-link:hover .case-stage {
			transform: perspective(700px) rotateY(-9deg) rotateX(3deg) translateY(-3px);
		}

		.disc-link:hover .disc-slot {
			--disc-x: 23cqw;
		}

		.disc-link:hover .disc-spin {
			animation-play-state: running;
		}
	}

	/* Specificity guard: hover/focus must not undo the loading pose */
	@media (prefers-reduced-motion: no-preference) {
		.disc-link[data-phase='loading'] .disc-slot {
			--disc-x: 26cqw;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.disc-spin {
			animation: none;
		}
	}

	/* Console "reads the disc": a quick brightness flash once the disc is out */
	@keyframes disc-read {
		0%,
		40% {
			filter: none;
		}
		55% {
			filter: brightness(1.8) contrast(1.3);
		}
		75% {
			filter: brightness(1.2);
		}
		100% {
			filter: none;
		}
	}

	@keyframes load-blink {
		50% {
			opacity: 0.35;
		}
	}
</style>
