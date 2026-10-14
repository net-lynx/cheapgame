<script lang="ts">
	import type { Attachment } from 'svelte/attachments';
	import { Tween } from 'svelte/motion';
	import { fly } from 'svelte/transition';
	import { backOut, cubicOut } from 'svelte/easing';
	import { MediaQuery } from 'svelte/reactivity';
	import { invalidateAll } from '$app/navigation';
	import { resolve } from '$app/paths';
	import ArrowLeftIcon from '@lucide/svelte/icons/arrow-left';
	import ExternalLinkIcon from '@lucide/svelte/icons/external-link';
	import ThemeSwitch from '#lib/components/ThemeSwitch.svelte';
	import { formatThb, verdictCopy } from '#lib/verdict.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const reducedMotion = new MediaQuery('(prefers-reduced-motion: reduce)');
	const motion = (ms: number) => (reducedMotion.current ? 0 : ms);

	/** Rolling price meter: counts 0 → final on load. SSR / no-JS shows the final price. */
	const ROLL_MS = 900;
	const roll = new Tween(0, { easing: cubicOut });
	/** False until the client takes over, so server-rendered HTML shows the real price. */
	let rolling = $state(false);
	const rollTo =
		(target: number): Attachment =>
		() => {
			rolling = true;
			roll.set(0, { duration: 0 });
			void roll.set(target, { duration: motion(ROLL_MS) });
		};
	/** Whole baht while rolling, the exact price (satang included) once it lands. */
	const rolled = (final: number) =>
		formatThb(!rolling || roll.current === final ? final : Math.round(roll.current));

	let retrying = $state(false);
	async function retry() {
		retrying = true;
		try {
			await invalidateAll();
		} finally {
			retrying = false;
		}
	}
</script>

<svelte:head>
	{#if data.check.status === 'ok'}
		<title>{data.check.game.name} ถูกมั้ย? · isthisgamecheap</title>
		<meta
			name="description"
			content="เช็คราคา {data.check.game.name} บน Steam ไทย (บาท) พร้อมป้ายตัดสินว่าถูกจริงไหม"
		/>
	{:else}
		<title>เช็คราคาไม่สำเร็จ · isthisgamecheap</title>
	{/if}
</svelte:head>

<main class="min-h-svh overflow-x-clip bg-surface text-ink">
	<header class="mx-auto flex max-w-5xl items-center justify-between gap-tool p-hero">
		<a
			href={resolve('/')}
			class="inline-block skew-cel border-cel px-3 py-1 shadow-poster fill-cel-brand"
		>
			<span class="inline-block unskew-cel font-display text-xl font-bold text-brand-foreground">
				ถูกมั้ย?
			</span>
			<span class="sr-only">isthisgamecheap — หน้าแรก</span>
		</a>
		<div class="flex items-center gap-tool">
			<a
				href={resolve('/')}
				class="back flex items-center gap-2 border-poster bg-surface-raised px-3 py-1 font-display text-tool font-bold"
			>
				<ArrowLeftIcon class="size-4" aria-hidden="true" /> ค้นเกมอื่น
			</a>
			<ThemeSwitch />
		</div>
	</header>

	{#if data.check.status === 'ok'}
		{@const game = data.check.game}
		{@const verdict = verdictCopy[data.check.verdict.kind]}
		{@const price = game.price}

		<!-- ===== Game header ===== -->
		<section class="mx-auto max-w-5xl px-hero pb-hero" aria-labelledby="game-heading">
			<div class="grid grid-cols-1 items-end gap-hero md:grid-cols-[minmax(0,22rem)_1fr]">
				<!-- CRT bezel. The channel-flip plays once when the page loads, like switching channel. -->
				<div class="animate-cel-in rounded-[18px] border-cel bg-cel-line p-3 shadow-poster">
					<div class="relative overflow-hidden rounded-chunky">
						{#if game.image}
							<img
								src={game.image}
								alt=""
								width="460"
								height="215"
								class="aspect-460/215 w-full animate-channel-flip bg-muted object-cover"
							/>
						{:else}
							<div
								class="flex aspect-460/215 w-full items-center justify-center fill-cel-brand"
								aria-hidden="true"
							>
								<span class="font-display text-display text-brand-foreground">NO IMAGE</span>
							</div>
						{/if}
						<span class="absolute inset-0 bg-pattern-scan" aria-hidden="true"></span>
						<span
							class="absolute top-2 left-2 bg-cel-line px-1.5 py-0.5 text-catalog text-price-deal"
							aria-hidden="true">● Rec · CH-{String(game.appid % 100).padStart(2, '0')}</span
						>
					</div>
				</div>

				<div class="min-w-0">
					<p class="inline-block skew-cel bg-cel-line px-3 py-1">
						<span
							class="inline-block unskew-cel font-display text-caption font-bold tracking-[0.25em] text-price-deal uppercase"
						>
							▶ Price check · Steam #{game.appid}
						</span>
					</p>
					<h1
						id="game-heading"
						class="mt-tool font-display text-[clamp(2rem,7vw,3.5rem)] leading-[1.2] font-bold wrap-break-word"
					>
						{game.name}
					</h1>
					{#if game.isFree}
						<p class="mt-tool font-sans text-tool font-semibold">เกมนี้เล่นฟรีบน Steam</p>
					{/if}
				</div>
			</div>
		</section>

		<!-- ===== Verdict ===== -->
		<section class="mx-auto max-w-5xl px-hero pb-hero" aria-labelledby="verdict-heading">
			<h2 id="verdict-heading" class="sr-only">คำตัดสิน</h2>
			<div
				class="grid grid-cols-1 border-cel bg-surface-raised shadow-cel sm:grid-cols-[minmax(0,13rem)_1fr]"
				in:fly|global={{ x: -56, duration: motion(380), easing: backOut }}
			>
				<div
					class={[
						'flex items-center justify-center border-b-(length:--border-width-cel) border-border px-hero py-hero sm:border-r-(length:--border-width-cel) sm:border-b-0',
						verdict.className
					]}
				>
					<span class="stamp-big flex flex-col items-center gap-1 text-center">
						<span class="font-display text-[2rem] leading-none font-bold">{verdict.stamp}</span>
						<span class="font-sans text-tool leading-tight font-semibold">{verdict.sub}</span>
					</span>
				</div>
				<div class="flex flex-col justify-center gap-2 p-hero">
					<p class="font-display text-display">{verdict.label}</p>
					<p class="font-sans text-tool">{data.check.verdict.reason}</p>
					<p class="font-sans text-caption text-ink-muted">
						ตัดสินจากส่วนลดบน Steam ไทยอย่างเดียว — เรายังไม่ได้เก็บประวัติราคา
						เลยยังบอกไม่ได้ว่านี่คือราคาต่ำสุดหรือเปล่า
					</p>
				</div>
			</div>
		</section>

		<!-- ===== Steam price ===== -->
		<section class="mx-auto max-w-5xl px-hero pb-hero-lg" aria-labelledby="price-heading">
			<div class="mb-hero flex flex-wrap items-end justify-between gap-tool">
				<h2 id="price-heading" class="inline-block skew-cel bg-ink px-4 py-1">
					<span class="inline-block unskew-cel font-display text-display text-surface"
						>ราคาบน Steam</span
					>
				</h2>
				<p class="font-sans text-caption text-ink-muted">ราคาไทยเป็นบาท (THB) · แคช ~10 นาที</p>
			</div>

			<article
				class="panel flex flex-col border-cel bg-surface-raised shadow-cel-brand sm:grid sm:grid-cols-[7rem_1fr_auto_auto]"
				in:fly|global={{ x: -56, duration: motion(380), delay: motion(120), easing: backOut }}
			>
				<div
					class={[
						'flex items-center justify-center border-b-(length:--border-width-cel) border-border px-tool py-2 font-display text-lg font-bold sm:border-r-(length:--border-width-cel) sm:border-b-0',
						price ? 'text-price-deal-foreground fill-cel-deal' : 'bg-muted text-ink-muted'
					]}
				>
					Steam
				</div>

				<div class="flex min-w-0 flex-col justify-center gap-1 p-tool">
					<h3 class="font-display text-xl leading-tight font-bold">ราคาปัจจุบัน</h3>
					<p class="font-sans text-caption text-ink-muted">
						{#if price}
							ราคาไทยจาก Steam โดยตรง (บาท)
						{:else if game.isFree}
							เล่นฟรีบน Steam — ไม่มีค่าเกมให้เทียบ
						{:else}
							ยังไม่มีราคาบน Steam ไทย
						{/if}
					</p>
				</div>

				<div
					class="flex items-baseline gap-tool px-tool pb-tool sm:flex-col sm:items-end sm:justify-center sm:py-tool"
				>
					{#if price}
						<p
							class="relative font-display text-display tabular-nums"
							{@attach rollTo(price.final)}
						>
							<span class="sr-only">{formatThb(price.final)}</span>
							<!-- invisible copy reserves the final width so the meter never jitters the layout -->
							<span class="invisible" aria-hidden="true">{formatThb(price.final)}</span>
							<span class="absolute top-0 right-0" aria-hidden="true">{rolled(price.final)}</span>
						</p>
						{#if price.discountPercent > 0}
							<p class="flex flex-wrap items-center gap-2 font-sans text-caption">
								<s class="text-ink-muted">{formatThb(price.initial)}</s>
								<span class="bg-cel-line px-1.5 font-display font-bold text-price-deal"
									>−{price.discountPercent}%</span
								>
							</p>
						{/if}
					{:else}
						<p class="font-display text-display">{game.isFree ? 'ฟรี' : '???'}</p>
					{/if}
				</div>

				<div class="flex items-center p-tool pt-0 sm:pt-tool">
					<!-- eslint-disable svelte/no-navigation-without-resolve -- absolute external store URL built on the server -->
					<a
						href={data.check.url}
						target="_blank"
						rel="noopener noreferrer"
						class="go flex w-full items-center justify-center gap-2 border-cel px-4 py-2 font-display text-lg font-bold text-brand-foreground fill-cel-brand focus-visible:outline-cel-line sm:w-auto"
					>
						ไปที่ Steam <ExternalLinkIcon class="size-4" aria-hidden="true" />
					</a>
					<!-- eslint-enable svelte/no-navigation-without-resolve -->
				</div>
			</article>

			<p class="mt-hero font-sans text-caption text-ink-muted">
				ราคามาจาก Steam ร้านไทย (บาท) เท่านั้น · ยังไม่ได้เทียบกับร้านอื่น และยังไม่มีประวัติราคา ·
				เว็บนี้ไม่ได้เกี่ยวข้องกับ Valve
			</p>
		</section>
	{:else}
		<!-- ===== Steam unreachable ===== -->
		<section class="mx-auto max-w-5xl px-hero pb-hero-lg" role="alert">
			<div
				class="no-signal relative flex min-h-48 flex-col items-center justify-center gap-tool border-cel bg-surface-raised p-hero text-center"
			>
				<p class="relative font-display text-display tracking-[0.2em] uppercase">Signal lost</p>
				<p class="relative font-sans text-tool text-ink-muted">
					ติดต่อ Steam ไม่ได้ตอนนี้ เลยเช็คราคาเกม #{data.appid} ไม่สำเร็จ — ลองใหม่อีกครั้งนะ
				</p>
				<button
					type="button"
					class="go relative border-cel px-4 py-2 font-display text-lg font-bold text-brand-foreground fill-cel-brand focus-visible:outline-cel-line disabled:opacity-60"
					disabled={retrying}
					onclick={retry}
				>
					{retrying ? 'กำลังลองใหม่…' : 'ลองใหม่'}
				</button>
			</div>
		</section>
	{/if}
</main>

<style>
	.back {
		transition: translate 0.2s var(--ease-snap);
	}

	.back:hover {
		translate: -2px -2px;
	}

	.panel {
		transition: translate 0.2s var(--ease-snap);
	}

	.panel:hover {
		translate: -3px -3px;
	}

	.go {
		transition: translate 0.2s var(--ease-snap);
	}

	.go:hover {
		translate: -2px -2px;
	}

	.go:active {
		translate: 2px 2px;
	}

	.stamp-big {
		rotate: -6deg;
		animation: stamp-slam 0.45s var(--ease-snap) 0.25s backwards;
	}

	@keyframes stamp-slam {
		from {
			opacity: 0;
			scale: 2.2;
			rotate: -20deg;
		}
	}

	/* --- No-signal static (same as the landing page) --- */
	.no-signal::before {
		content: '';
		position: absolute;
		inset: 0;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='1' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
		opacity: 0.18;
		animation: static-jitter 0.3s steps(3) infinite;
	}

	@keyframes static-jitter {
		33% {
			background-position: 37px -61px;
		}
		66% {
			background-position: -83px 29px;
		}
	}
</style>
