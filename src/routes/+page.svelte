<script lang="ts">
	import type { Attachment } from 'svelte/attachments';
	import { fly } from 'svelte/transition';
	import { backOut } from 'svelte/easing';
	import { MediaQuery } from 'svelte/reactivity';
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';
	import SearchIcon from '@lucide/svelte/icons/search';
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
	import DiscIcon from '@lucide/svelte/icons/disc-3';
	import ListIcon from '@lucide/svelte/icons/list';
	import TvIcon from '@lucide/svelte/icons/tv';
	import GameDiscCase from '#lib/components/GameDiscCase.svelte';
	import GameResultRow from '#lib/components/GameResultRow.svelte';
	import ThemeSwitch from '#lib/components/ThemeSwitch.svelte';
	import { games, verdictOf, discountOf } from '#lib/mock/games.js';
	import type { SearchResponse, SearchResult } from '#lib/types.js';
	import { formatThb, verdictCopy } from '#lib/verdict.js';

	const reducedMotion = new MediaQuery('(prefers-reduced-motion: reduce)');
	const motion = (ms: number) => (reducedMotion.current ? 0 : ms);

	const SEARCH_DEBOUNCE_MS = 250;
	const MIN_QUERY_LENGTH = 2;

	type SearchState = 'idle' | 'loading' | 'done' | 'error';

	let query = $state('');
	let results = $state<SearchResult[]>([]);
	/** The trimmed query that `results` / `searchState` belong to. */
	let searchedFor = $state('');
	let searchState = $state<SearchState>('idle');
	/** Result layout: rows (default) or a shelf of disc cases. */
	let view = $state<'list' | 'shelf'>('list');
	const views = [
		{ id: 'list', label: 'รายการ', icon: ListIcon },
		{ id: 'shelf', label: 'ชั้นวางแผ่น', icon: DiscIcon }
	] as const;
	let searchInput: HTMLInputElement | undefined;
	let resultsPanel: HTMLElement | undefined;

	let debounceTimer: ReturnType<typeof setTimeout> | undefined;
	let inflight: AbortController | undefined;

	const status = $derived(
		searchState === 'loading'
			? `กำลังค้นหา ${searchedFor}`
			: searchState === 'done'
				? results.length > 0
					? `เจอ ${results.length} เกม`
					: `ไม่เจอเกมที่ชื่อ ${searchedFor}`
				: searchState === 'error'
					? 'ค้นหาไม่สำเร็จ'
					: ''
	);

	function cancelSearch() {
		clearTimeout(debounceTimer);
		inflight?.abort();
		inflight = undefined;
	}

	/** Debounced live search. Every path that changes `query` funnels through here. */
	function scheduleSearch(immediate = false) {
		cancelSearch();
		const q = query.trim();
		if (q.length < MIN_QUERY_LENGTH) {
			searchState = 'idle';
			results = [];
			searchedFor = '';
			return;
		}
		searchedFor = q;
		searchState = 'loading';
		debounceTimer = setTimeout(() => void runSearch(q), immediate ? 0 : SEARCH_DEBOUNCE_MS);
	}

	async function runSearch(q: string) {
		const controller = new AbortController();
		inflight = controller;
		try {
			const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, {
				signal: controller.signal
			});
			if (!res.ok) throw new Error(`search ${res.status}`);
			const body: SearchResponse = await res.json();
			if (controller.signal.aborted) return;
			results = body.results;
			searchState = 'done';
		} catch {
			// A newer query aborted us: it owns the state now.
			if (controller.signal.aborted) return;
			results = [];
			searchState = 'error';
		}
	}

	onMount(() => cancelSearch);

	const trending = ['Persona 4 Golden', 'Elden Ring', 'Celeste', 'Hollow Knight'];
	const placeholderNames = [
		'Persona 4 Golden',
		'Metaphor: ReFantazio',
		'Disco Elysium',
		'Stardew Valley',
		'Elden Ring'
	];

	const cheapGames = games
		.filter((game) => ['mega', 'deal'].includes(verdictOf(game)))
		.sort((a, b) => discountOf(b) - discountOf(a));
	const tonightDeals = cheapGames.slice(0, 4);

	const steps = [
		{ n: '01', title: 'ค้น', body: 'พิมพ์ชื่อเกม ชื่อย่อ หรือชื่อไทยก็ได้ — p4g, เอลเดนริง' },
		{ n: '02', title: 'เช็ค', body: 'ดูราคาปัจจุบันบน Steam ไทย (บาท) พร้อมส่วนลดจากราคาเต็ม' },
		{
			n: '03',
			title: 'ตัดสิน',
			body: 'ป้าย MEGA DEAL / DEAL บอกเลยว่าควรซื้อตอนนี้ หรือ STANDBY รอโปร'
		}
	] as const;

	/** Persona-style typewriter placeholder. Cleans its timer up on unmount. */
	const typewriter: Attachment<HTMLInputElement> = (input) => {
		const prefix = 'ลองพิมพ์ ';
		let index = 0;
		let length = 0;
		let deleting = false;
		let timer: ReturnType<typeof setTimeout>;

		const tick = () => {
			const name = placeholderNames[index];

			if (reducedMotion.current) {
				input.placeholder = prefix + name;
				index = (index + 1) % placeholderNames.length;
				timer = setTimeout(tick, 2500);
				return;
			}

			length += deleting ? -1 : 1;
			input.placeholder = prefix + name.slice(0, length) + '▌';

			let delay = deleting ? 28 : 65;
			if (!deleting && length === name.length) {
				deleting = true;
				delay = 1500;
			} else if (deleting && length === 0) {
				deleting = false;
				index = (index + 1) % placeholderNames.length;
				delay = 350;
			}
			timer = setTimeout(tick, delay);
		};

		timer = setTimeout(tick, 1400);
		return () => clearTimeout(timer);
	};

	function focusSearch(value?: string) {
		if (value !== undefined) {
			query = value;
			scheduleSearch();
		}
		searchInput?.focus({ preventScroll: true });
		searchInput?.scrollIntoView({
			behavior: reducedMotion.current ? 'auto' : 'smooth',
			block: 'center'
		});
	}

	function onWindowKeydown(event: KeyboardEvent) {
		if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey) return;
		const target = event.target as HTMLElement | null;
		if (target?.closest('input, textarea, select, [contenteditable="true"]')) return;
		event.preventDefault();
		focusSearch();
	}

	/** Submit skips the debounce and plays a "channel switch" glitch. */
	function onSubmit(event: SubmitEvent) {
		event.preventDefault();
		scheduleSearch(true);
		if (reducedMotion.current) return;
		resultsPanel?.animate(
			[
				{ translate: '0 0', filter: 'none' },
				{ translate: '-8px 0', filter: 'contrast(1.8) brightness(1.4)' },
				{ translate: '6px 0', filter: 'contrast(1.4)' },
				{ translate: '0 0', filter: 'none' }
			],
			{ duration: 300, easing: 'steps(4, end)' }
		);
	}
</script>

<svelte:head>
	<title>ถูกมั้ย? · isthisgamecheap</title>
	<meta
		name="description"
		content="พิมพ์ชื่อเกม แล้วรู้ทันทีว่าราคาตอนนี้บน Steam ไทยถูกจริงไหม — ราคาเป็นบาท ดูส่วนลดชัด ๆ"
	/>
</svelte:head>

<svelte:window onkeydown={onWindowKeydown} />

<main class="min-h-svh overflow-x-clip bg-surface text-ink">
	<!-- ===== HERO: search is the star ===== -->
	<section class="hero relative isolate" aria-labelledby="hero-heading">
		<div class="hero-static bg-pattern-scan" aria-hidden="true"></div>

		<header
			class="relative z-10 mx-auto flex max-w-5xl items-center justify-between gap-tool p-hero"
		>
			<a
				href={resolve('/')}
				class="inline-block skew-cel border-cel px-3 py-1 shadow-poster fill-cel-brand"
			>
				<span class="inline-block unskew-cel font-display text-xl font-bold text-brand-foreground">
					ถูกมั้ย?
				</span>
				<span class="sr-only">isthisgamecheap — หน้าแรก</span>
			</a>

			<div class="flex min-w-0 items-center gap-tool">
				<p
					class="flex items-center gap-2 font-display text-caption font-bold tracking-[0.2em] uppercase"
				>
					<span class="rec-dot size-2.5 rounded-full bg-brand" aria-hidden="true"></span>
					<TvIcon class="size-4" aria-hidden="true" />
					On air <span class="tracking-normal max-sm:hidden">· ช่องดีลเที่ยงคืน</span>
				</p>
				<ThemeSwitch />
			</div>
		</header>

		<div class="relative z-10 mx-auto max-w-5xl animate-tv-on px-hero pt-tool pb-hero-lg">
			<p
				class="inline-block skew-cel animate-cel-in bg-cel-line px-3 py-1"
				style:animation-delay="0.3s"
			>
				<span
					class="inline-block unskew-cel font-display text-caption font-bold tracking-[0.25em] text-price-deal uppercase"
				>
					▶ Midnight Deal Channel
				</span>
			</p>

			<h1
				id="hero-heading"
				class="mt-tool-lg font-display text-[clamp(3.25rem,13vw,8rem)] leading-[1.22] font-bold"
			>
				<span class="block animate-cel-in" style:animation-delay="0.36s">
					<span class="inline-block skew-cel">เกมนี้</span>
				</span>
				<span class="relative block animate-cel-in" style:animation-delay="0.44s">
					<span class="line-band fill-cel-brand" aria-hidden="true"></span>
					<span class="relative inline-block skew-cel text-price-deal text-cel">ถูกมั้ย?</span>
				</span>
			</h1>

			<p
				class="mt-hero-lg max-w-xl animate-cel-in font-sans text-body text-ink-muted"
				style:animation-delay="0.6s"
			>
				พิมพ์ชื่อเกม แล้วรู้ทันทีว่าราคาตอนนี้ <strong class="text-ink">ถูกจริง</strong> หรือแค่ลดหลอก
				— เช็คราคาจาก Steam ไทย เป็นบาทชัด ๆ
			</p>

			<!-- The hero: search bar -->
			<form
				role="search"
				class="search-frame relative mt-hero-lg animate-cel-in"
				style:animation-delay="0.5s"
				onsubmit={onSubmit}
			>
				<div class="search-tape skew-cel" aria-hidden="true"></div>
				<div class="search-skin skew-cel border-cel p-2 fill-cel-deal sm:p-3">
					<div class="flex unskew-cel items-stretch gap-2 sm:gap-3">
						<label for="game-search" class="sr-only">ค้นหาเกมที่อยากเช็คราคา</label>
						<div
							class="search-field flex min-w-0 flex-1 items-center gap-3 border-cel bg-surface-raised px-3 sm:px-5"
						>
							<SearchIcon class="size-6 shrink-0 sm:size-8" aria-hidden="true" />
							<input
								id="game-search"
								type="search"
								bind:value={query}
								oninput={() => scheduleSearch()}
								bind:this={searchInput}
								{@attach typewriter}
								placeholder="ลองพิมพ์ Persona 4 Golden"
								autocomplete="off"
								spellcheck="false"
								aria-describedby="search-hint"
								aria-controls="search-results"
								class="h-14 w-full min-w-0 border-0 bg-transparent p-0 font-sans text-lg font-semibold text-ink placeholder:text-ink-muted/70 focus:ring-0 focus:outline-none sm:h-20 sm:text-2xl"
							/>
							<kbd
								class="hidden border-poster px-2 font-display text-caption text-ink-muted sm:inline-block"
								aria-hidden="true">/</kbd
							>
						</div>
						<button
							type="submit"
							class="search-go flex items-center gap-2 border-cel px-4 font-display text-xl font-bold text-brand-foreground uppercase fill-cel-brand focus-visible:outline-cel-line sm:px-7 sm:text-2xl"
						>
							<span class="hidden sm:inline">ค้นเลย!</span>
							<ArrowRightIcon class="size-6 sm:size-7" aria-hidden="true" />
							<span class="sr-only sm:hidden">ค้นหา</span>
						</button>
					</div>
				</div>
			</form>

			<div
				class="mt-hero flex animate-cel-in flex-wrap items-center gap-tool"
				style:animation-delay="0.66s"
			>
				<p id="search-hint" class="font-sans text-caption text-ink-muted">
					ยอดฮิตคืนนี้ <span class="hidden sm:inline"
						>· กด <kbd class="border-poster px-1 font-display">/</kbd> เพื่อค้นจากที่ไหนก็ได้</span
					>
				</p>
				<ul class="flex flex-wrap gap-2">
					{#each trending as name (name)}
						<li>
							<button
								type="button"
								class="chip border-poster bg-surface-raised px-3 py-1 font-sans text-caption font-semibold"
								onclick={() => focusSearch(name)}
							>
								{name}
							</button>
						</li>
					{/each}
				</ul>
			</div>

			<p class="sr-only" aria-live="polite">{status}</p>

			<div id="search-results" bind:this={resultsPanel} class="mt-hero">
				{#if searchState === 'loading' && results.length === 0}
					<div
						class="no-signal relative flex min-h-32 flex-col items-center justify-center gap-1 border-cel bg-surface-raised p-hero text-center"
					>
						<p class="relative font-display text-display tracking-[0.2em] uppercase">Scanning…</p>
						<p class="relative font-sans text-tool text-ink-muted">
							กำลังหา “{searchedFor}” ใน Steam
						</p>
					</div>
				{:else if searchState === 'error'}
					<div
						class="no-signal relative flex min-h-32 flex-col items-center justify-center gap-1 border-cel bg-surface-raised p-hero text-center"
						in:fly|global={{ y: 16, duration: motion(260), easing: backOut }}
					>
						<p class="relative font-display text-display tracking-[0.2em] uppercase">Signal lost</p>
						<p class="relative font-sans text-tool text-ink-muted">
							ค้นหาไม่สำเร็จ — Steam อาจช้าหรือล่ม ลองใหม่อีกครั้งนะ
						</p>
					</div>
				{:else if searchState !== 'idle'}
					{#if results.length > 0}
						<div class="mb-tool flex flex-wrap items-center justify-between gap-tool">
							<p class="font-display text-caption font-semibold text-ink-muted">
								{searchState === 'loading'
									? 'กำลังค้นหา…'
									: `เจอ ${results.length} เกม · ช่อง “${searchedFor}”`}
							</p>
							<div role="group" aria-label="มุมมองผลค้นหา" class="flex">
								{#each views as v, i (v.id)}
									<button
										type="button"
										aria-pressed={view === v.id}
										onclick={() => (view = v.id)}
										class={[
											'view-toggle flex items-center gap-1.5 border-poster px-3 py-1 font-display text-caption font-bold',
											i > 0 && '-ml-0.5',
											view === v.id ? 'bg-ink text-surface' : 'bg-surface-raised text-ink'
										]}
									>
										<v.icon class="size-4" aria-hidden="true" />
										{v.label}
									</button>
								{/each}
							</div>
						</div>

						{#if view === 'list'}
							<ul
								class={[
									'flex flex-col gap-tool-lg transition-opacity',
									searchState === 'loading' && 'opacity-60'
								]}
							>
								{#each results as game, i (game.appid)}
									<li
										in:fly|global={{
											x: -56,
											duration: motion(380),
											delay: motion(i * 55),
											easing: backOut
										}}
									>
										<GameResultRow {game} />
									</li>
								{/each}
							</ul>
						{:else}
							<ul
								class={[
									'grid grid-cols-2 gap-x-tool-lg gap-y-hero sm:grid-cols-3 lg:grid-cols-4',
									'transition-opacity',
									searchState === 'loading' && 'opacity-60'
								]}
							>
								{#each results as game, i (game.appid)}
									<li
										class="min-w-0"
										in:fly|global={{
											y: 24,
											duration: motion(380),
											delay: motion(i * 55),
											easing: backOut
										}}
									>
										<GameDiscCase {game} />
									</li>
								{/each}
							</ul>
						{/if}
					{:else}
						<div
							class="no-signal relative flex min-h-32 flex-col items-center justify-center gap-1 border-cel bg-surface-raised p-hero text-center"
							in:fly|global={{ y: 16, duration: motion(260), easing: backOut }}
						>
							<p class="relative font-display text-display tracking-[0.2em] uppercase">No signal</p>
							<p class="relative font-sans text-tool text-ink-muted">
								ไม่เจอ “{searchedFor}” ใน Steam — ลองสะกดเป็นชื่อเกมภาษาอังกฤษเต็ม ๆ
							</p>
						</div>
					{/if}
				{/if}
			</div>
		</div>
	</section>

	<!-- ===== Caution-tape tickers ===== -->
	<section class="relative py-hero-lg" aria-label="ดีลตัวอย่าง">
		<div class="tape -rotate-2 border-y-(length:--border-width-cel) border-border bg-cel-line">
			<div class="flex w-max animate-marquee">
				{#each [0, 1] as copy (copy)}
					<ul class="flex shrink-0" aria-hidden={copy === 1}>
						{#each cheapGames as game (game.id)}
							<li
								class="px-hero py-2 font-display text-lg font-bold tracking-wide whitespace-nowrap text-price-deal uppercase"
							>
								★ ตัวอย่าง · {game.name}
								{formatThb(game.price)}
								<span class="text-brand">−{discountOf(game)}%</span>
							</li>
						{/each}
					</ul>
				{/each}
			</div>
		</div>
		<div
			class="tape relative mt-5 -rotate-[0.5deg] border-y-(length:--border-width-cel) border-border fill-cel-deal"
			aria-hidden="true"
		>
			<div class="flex w-max animate-marquee [animation-direction:reverse]">
				{#each [0, 1] as copy (copy)}
					<p
						class="shrink-0 px-hero py-1.5 font-display text-caption font-bold tracking-wide whitespace-nowrap text-price-deal-foreground uppercase"
					>
						{'ถูกมั้ย? · is this cheap? · ห้ามซื้อตอนแพง · '.repeat(6)}
					</p>
				{/each}
			</div>
		</div>
	</section>

	<!-- ===== Tonight's deals ===== -->
	<section class="mx-auto max-w-5xl px-hero py-hero-lg" aria-labelledby="deals-heading">
		<div class="mb-hero flex flex-wrap items-end justify-between gap-tool">
			<div class="flex flex-wrap items-center gap-tool">
				<h2 id="deals-heading" class="inline-block skew-cel bg-ink px-4 py-1">
					<span class="inline-block unskew-cel font-display text-display text-surface"
						>ดีลเด็ดคืนนี้</span
					>
				</h2>
				<span
					class="border-poster bg-surface-raised px-2 font-display text-caption font-bold text-ink-muted"
					>ตัวอย่าง</span
				>
			</div>
			<p class="font-sans text-tool text-ink-muted">
				ข้อมูลตัวอย่าง (ยังไม่ใช่ราคาจริง) · กดการ์ดเพื่อลองค้นเกมนี้
			</p>
		</div>

		<ul class="grid grid-cols-1 gap-hero sm:grid-cols-2">
			{#each tonightDeals as game, i (game.id)}
				{@const verdict = verdictOf(game)}
				<li class="reveal">
					<button
						type="button"
						class="deal-card flex h-full w-full overflow-hidden rounded-chunky border-cel bg-surface-raised text-left shadow-cel focus-visible:outline-brand"
						onclick={() => focusSearch(game.name)}
					>
						<!-- tape-label spine -->
						<span class="w-3 shrink-0 fill-cel-brand" aria-hidden="true"></span>
						<span class="flex min-w-0 flex-1 flex-col gap-2 p-tool">
							<span class="text-catalog text-ink-muted" aria-hidden="true"
								>Tape No.{String(i + 1).padStart(2, '0')} · Steam · ▶ Play</span
							>
							<span class="line-clamp-2 font-display text-xl leading-snug font-bold"
								>{game.name}</span
							>
							<span class="font-sans text-caption text-ink-muted">Steam · ตัวอย่าง</span>
							<span class="flex flex-wrap items-baseline gap-x-2">
								<span class="font-display text-price tabular-nums">{formatThb(game.price)}</span>
								<s class="font-sans text-caption text-ink-muted">{formatThb(game.regular)}</s>
								<span
									class={[
										'stamp-badge border-cel px-2 font-display text-lg font-bold',
										verdictCopy[verdict].className
									]}
								>
									−{discountOf(game)}%
								</span>
							</span>
							<span class="mt-auto flex items-end justify-between gap-tool pt-tool">
								<span class="h-7 w-24 bg-pattern-barcode" aria-hidden="true"></span>
								<span
									class="flex items-center gap-1 font-display text-tool font-bold whitespace-nowrap"
								>
									เช็คเกมนี้ <ArrowRightIcon class="arrow size-4" aria-hidden="true" />
								</span>
							</span>
						</span>
					</button>
				</li>
			{/each}
		</ul>
	</section>

	<!-- ===== How it works ===== -->
	<section class="mx-auto max-w-5xl px-hero py-hero-lg" aria-labelledby="how-heading">
		<h2 id="how-heading" class="mb-hero inline-block skew-cel bg-ink px-4 py-1">
			<span class="inline-block unskew-cel font-display text-display text-surface">3 สเต็ป จบ</span>
		</h2>
		<ol class="grid grid-cols-1 gap-hero md:grid-cols-3">
			{#each steps as step (step.n)}
				<li class="reveal skew-cel border-cel bg-surface-raised p-hero shadow-cel">
					<div class="flex unskew-cel flex-col gap-tool">
						<span class="step-number font-display text-[5rem] leading-none font-bold">{step.n}</span
						>
						<h3 class="font-display text-display">{step.title}</h3>
						<p class="font-sans text-tool text-ink-muted">{step.body}</p>
					</div>
				</li>
			{/each}
		</ol>
	</section>

	<!-- ===== Final CTA ===== -->
	<section class="animate-stripe-scroll bg-pattern-stripe px-hero py-hero-lg">
		<div class="mx-auto max-w-3xl skew-cel border-cel bg-ink p-hero shadow-cel-brand">
			<div
				class="flex unskew-cel flex-col items-start gap-tool-lg sm:flex-row sm:items-center sm:justify-between"
			>
				<p class="font-display text-display text-surface">ยังไม่ได้ค้นเลยนะ?</p>
				<button
					type="button"
					class="cta-button border-cel px-hero py-tool font-display text-xl font-bold text-price-deal-foreground uppercase shadow-cel-brand fill-cel-deal focus-visible:outline-brand"
					onclick={() => focusSearch()}
				>
					ค้นเกมถูกเลย →
				</button>
			</div>
		</div>
	</section>

	<footer class="mx-auto max-w-5xl p-hero font-sans text-caption text-ink-muted">
		Draft · ผลค้นหาดึงราคาจริงจาก Steam (ไทย) · ส่วน “ดีลเด็ดคืนนี้” เป็นข้อมูลตัวอย่าง (mock) · <a
			href={resolve('/design-tokens')}
			class="underline">design tokens</a
		>
	</footer>
</main>

<style>
	/* --- TV static + scanlines behind the hero --- */
	.hero-static {
		position: absolute;
		inset: 0;
		z-index: -1;
	}

	.hero-static::after {
		content: '';
		position: absolute;
		inset: 0;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
		opacity: 0.07;
		animation: static-jitter 0.45s steps(3) infinite;
	}

	:global(.dark) .hero-static::after {
		opacity: 0.12;
	}

	@keyframes static-jitter {
		33% {
			background-position: 37px -61px;
		}
		66% {
			background-position: -83px 29px;
		}
	}

	/* --- Red band that sweeps in behind "ถูกมั้ย?" --- */
	.line-band {
		position: absolute;
		top: 34%;
		bottom: 4%;
		left: -100vw;
		width: calc(100vw + min(30rem, 80%));
		border-block: var(--border-width-cel) solid var(--color-cel-line);
		/* pivot where the text starts, so the slant doesn't climb into the line above */
		rotate: -2deg;
		transform-origin: 100vw center;
		animation: band-sweep 0.55s var(--ease-whip) 0.5s backwards;
	}

	@keyframes band-sweep {
		from {
			clip-path: inset(0 100% 0 0);
		}
		to {
			clip-path: inset(0 0 0 0);
		}
	}

	/* --- On-air dot --- */
	.rec-dot {
		animation: blink 1.2s steps(1) infinite;
	}

	@keyframes blink {
		50% {
			opacity: 0;
		}
	}

	/* --- Search frame: lift + caution tape on focus --- */
	.search-skin {
		position: relative;
		box-shadow: var(--shadow-cel-brand);
		transition:
			translate 0.25s var(--ease-snap),
			box-shadow 0.25s var(--ease-snap);
	}

	/* Sibling behind the skin (DOM order), so the stripes never paint over the fill */
	.search-tape {
		position: absolute;
		inset: 0;
		background-image: var(--background-image-pattern-stripe);
		opacity: 0;
		transition:
			opacity 0.15s,
			translate 0.3s var(--ease-snap);
	}

	.search-frame:focus-within .search-skin {
		translate: -4px -4px;
		box-shadow: 3px 3px 0 0 var(--color-ink);
	}

	.search-frame:focus-within .search-tape {
		opacity: 1;
		translate: 10px 10px;
		animation: stripe-scroll 0.9s linear infinite;
	}

	.search-field:focus-within {
		outline: 3px solid var(--color-brand);
		outline-offset: 2px;
	}

	.search-go {
		transition: translate 0.2s var(--ease-snap);
	}

	.search-go:hover {
		translate: -2px -2px;
	}

	.search-go:active {
		translate: 2px 2px;
	}

	/* --- Chips --- */
	.chip {
		transition:
			translate 0.2s var(--ease-snap),
			background-color 0.15s;
	}

	.chip:hover {
		translate: 0 -3px;
		background-color: var(--color-price-deal);
		color: var(--color-price-deal-foreground);
	}

	/* --- View toggle --- */
	.view-toggle {
		transition: translate 0.2s var(--ease-snap);
	}

	.view-toggle:hover {
		translate: 0 -2px;
	}

	/* --- No-signal static --- */
	.no-signal::before {
		content: '';
		position: absolute;
		inset: 0;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='1' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
		opacity: 0.18;
		animation: static-jitter 0.3s steps(3) infinite;
	}

	/* --- Deal cards --- */
	.deal-card {
		transition:
			translate 0.22s var(--ease-snap),
			box-shadow 0.22s var(--ease-snap);
	}

	.deal-card:hover,
	.deal-card:focus-visible {
		translate: -4px -4px;
		box-shadow: var(--shadow-cel-lift);
	}

	.stamp-badge {
		rotate: 6deg;
		transition: rotate 0.25s var(--ease-snap);
	}

	.deal-card:hover .stamp-badge {
		rotate: -8deg;
		scale: 1.12;
	}

	.deal-card :global(.arrow) {
		transition: translate 0.2s var(--ease-snap);
	}

	.deal-card:hover :global(.arrow) {
		translate: 6px 0;
	}

	/* --- Outlined step numbers --- */
	.step-number {
		color: transparent;
		-webkit-text-stroke: 2px var(--color-ink);
		text-shadow: 4px 4px 0 var(--color-price-deal);
	}

	/* --- CTA --- */
	.cta-button {
		transition: translate 0.2s var(--ease-snap);
	}

	.cta-button:hover {
		translate: -3px -3px;
	}

	/* --- Scroll-driven slide-in (progressive enhancement) --- */
	@media (prefers-reduced-motion: no-preference) {
		@supports (animation-timeline: view()) {
			.reveal {
				animation: cel-in linear both;
				animation-timeline: view();
				animation-range: entry 0% entry 70%;
			}
		}
	}
</style>
