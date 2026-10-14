<script lang="ts">
	import { Tween } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	import { MediaQuery } from 'svelte/reactivity';
	import { resolve } from '$app/paths';
	import ArrowLeftIcon from '@lucide/svelte/icons/arrow-left';
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
	import ExternalLinkIcon from '@lucide/svelte/icons/external-link';
	import SearchIcon from '@lucide/svelte/icons/search';
	import GameDiscCase from '#lib/components/GameDiscCase.svelte';
	import GameResultRow from '#lib/components/GameResultRow.svelte';
	import ThemeSwitch from '#lib/components/ThemeSwitch.svelte';
	import VerdictSticker from '#lib/components/VerdictSticker.svelte';
	import {
		formatThb,
		newLowCopy,
		verdictCopy,
		verdictFromDiscount,
		type Verdict
	} from '#lib/verdict.js';
	import type { SearchResult } from '#lib/types.js';

	const reducedMotion = new MediaQuery('(prefers-reduced-motion: reduce)');

	// ===== Navigation =====
	const sections = [
		{ id: 'brand', label: 'แบรนด์' },
		{ id: 'foundations', label: 'พื้นฐาน' },
		{ id: 'layers', label: 'ชั้นโทเคน' },
		{ id: 'components', label: 'คอมโพเนนต์' },
		{ id: 'motion', label: 'Motion' }
	] as const;

	function jump(id: string) {
		document.getElementById(id)?.scrollIntoView({
			behavior: reducedMotion.current ? 'auto' : 'smooth',
			block: 'start'
		});
	}

	// ===== Brand =====
	const personality = [
		{
			id: 'witty',
			title: 'นักล่าดีลปากไว',
			body: 'ตลกแบบคนเจอดีลแล้วอดคุยไม่ได้ พูดตรง ๆ ไม่อ้อมค้อม'
		},
		{
			id: 'poster',
			title: 'โปสเตอร์ที่คุมไว้',
			body: 'pop art แต่มีกรอบ มีระเบียบ ขอบแข็ง เงาทึบ ไม่ฟุ้ง'
		},
		{
			id: 'thai',
			title: 'ไทยก่อน',
			body: 'ข้อความหลักเป็นภาษาไทย อังกฤษใช้เป็นป้ายสั้น ๆ หรือคำกำกับ'
		}
	] as const;

	const voice = [
		{ tier: 'mega', when: 'ลด 70% ขึ้นไปเทียบราคาปกติ — ดีลที่แรงจริง' },
		{ tier: 'deal', when: 'ลด 30% ขึ้นไป — ราคาดี คุ้มแล้ว' },
		{ tier: 'standby', when: 'มีราคาแต่ลดน้อยกว่า 30% — บอกให้รอโปรก่อน' },
		{ tier: 'no-signal', when: 'ยังไม่มีข้อมูลราคา — ห้ามเดาป้ายจากราคาที่ไม่มี' }
	] as const;

	const doList = [
		'ป้ายใช้ Latin ตัวใหญ่ + คำไทยตัวเล็กเป็น sub เสมอ เช่น MEGA DEAL · ลดแรงสุดคุ้ม',
		'ใช้โทเคนจากหน้านี้เท่านั้น — สี ฟอนต์ ระยะ ขอบ เงา',
		'ใส่ vibe ได้ไม่เกิน 1–2 อย่างต่อ component และใช้ในโซนฮีโร่',
		'ใช้ text-catalog กับตัวอักษรอังกฤษ/ตัวเลขเท่านั้น'
	];

	const dontList = [
		'ห้ามใช้คำว่า “STEAL” — อ่านเป็นภาษาไทยได้ว่า “ขโมย”',
		'ห้าม letter-space ข้อความภาษาไทย (tracking-* ใช้กับ Latin ล้วนเท่านั้น)',
		'ห้ามเพิ่ม hex สีใหม่ ทุกสีต้องมาจาก token ที่มีอยู่',
		'ห้าม skew ช่องกรอก (input) หรือย่อหน้าภาษาไทยยาว ๆ',
		'ห้ามใส่ vibe ในโซนเครื่องมือ (ตารางราคา, ตัวกรอง)',
		'ห้ามใช้ text-cel กับประโยคไทย — เส้นขอบทับวรรณยุกต์'
	];

	// ===== Foundations =====
	const brandColors = [
		{
			id: 'brand',
			token: 'bg-brand / text-brand-foreground',
			role: 'โลโก้ · CTA · chrome — ไม่ใช่ป้ายราคา',
			swatch: 'bg-brand text-brand-foreground'
		}
	] as const;

	const priceColors = [
		{
			id: 'deal',
			token: 'bg-price-deal / text-price-deal-foreground',
			role: 'DEAL — ราคาดี (ลด ≥ 30%)',
			swatch: 'bg-price-deal text-price-deal-foreground'
		},
		{
			id: 'mega',
			token: 'bg-price-mega / text-price-mega-foreground',
			role: 'MEGA DEAL — ลดแรงสุดคุ้ม (ลด ≥ 70%)',
			swatch: 'bg-price-mega text-price-mega-foreground'
		},
		{
			id: 'unknown',
			token: 'bg-price-unknown / text-price-unknown-foreground',
			role: 'NO SIGNAL — สัญญาณหาย (ยังไม่มีข้อมูล)',
			swatch: 'bg-price-unknown text-price-unknown-foreground border-poster'
		}
	] as const;

	const surfaceColors = [
		{
			id: 'surface',
			token: 'bg-surface',
			role: 'พื้นกระดาษหลัก',
			swatch: 'bg-surface text-ink border-poster'
		},
		{
			id: 'surface-raised',
			token: 'bg-surface-raised',
			role: 'แผ่นยก / แผงบนพื้น',
			swatch: 'bg-surface-raised text-ink border-poster'
		},
		{
			id: 'ink',
			token: 'text-ink / bg via ink fill',
			role: 'หมึกหลัก — ข้อความและเส้น',
			swatch: 'bg-ink text-surface'
		},
		{
			id: 'ink-muted',
			token: 'text-ink-muted',
			role: 'ข้อความรอง · คำอธิบาย',
			swatch: 'bg-surface-raised text-ink-muted border-poster'
		},
		{
			id: 'border',
			token: 'border-border / border-poster',
			role: 'ขอบโปสเตอร์แข็ง',
			swatch: 'bg-surface-raised text-ink border-poster'
		},
		{
			id: 'focus',
			token: 'focus / ring-poster-focus',
			role: 'วงโฟกัสเหลือง',
			swatch: 'bg-focus text-price-deal-foreground border-poster'
		}
	] as const;

	const badges = [
		{
			id: 'deal',
			label: 'DEAL · ราคาดี',
			className:
				'rounded-poster border-poster bg-price-deal px-tool py-tool font-display text-tool text-price-deal-foreground shadow-poster uppercase tracking-wide'
		},
		{
			id: 'mega',
			label: 'MEGA DEAL · ลดแรงสุดคุ้ม',
			className:
				'rounded-poster border-poster bg-price-mega px-tool py-tool font-display text-tool text-price-mega-foreground shadow-poster'
		},
		{
			id: 'unknown',
			label: 'NO SIGNAL · สัญญาณหาย',
			className:
				'rounded-poster border-poster bg-price-unknown px-tool py-tool font-display text-tool text-price-unknown-foreground uppercase tracking-wide'
		},
		{
			id: 'standby',
			label: 'STANDBY · รอโปร',
			className: 'font-sans text-tool text-ink-muted'
		}
	] as const;

	const typeSizes = [
		{
			id: 'hero',
			token: 'text-hero',
			font: 'font-display',
			sample: 'ถูกมั้ย? Is this cheap?'
		},
		{
			id: 'price',
			token: 'text-price',
			font: 'font-display',
			sample: '฿399 · $12.99'
		},
		{
			id: 'display',
			token: 'text-display',
			font: 'font-display',
			sample: 'ดีลวันนี้ / Today’s deal'
		},
		{
			id: 'body',
			token: 'text-body',
			font: 'font-sans',
			sample: 'เปรียบเทียบราคาเกมจากหลายร้าน — compare storefronts.'
		},
		{
			id: 'tool',
			token: 'text-tool',
			font: 'font-sans',
			sample: 'ตัวกรอง · เรียงลำดับ · Filter & sort'
		},
		{
			id: 'caption',
			token: 'text-caption',
			font: 'font-sans',
			sample: 'อัปเดตล่าสุด · Last updated 2m ago'
		}
	] as const;

	const fonts = [
		{
			id: 'display',
			token: 'font-display',
			className: 'font-display',
			sample: 'โพสเตอร์หัวเรื่อง · Condensed display'
		},
		{
			id: 'sans',
			token: 'font-sans',
			className: 'font-sans',
			sample: 'เนื้อหา UI · Body & Thai UI'
		}
	] as const;

	const geometry = [
		{
			id: 'rounded-poster',
			token: 'rounded-poster',
			className: 'rounded-poster border-poster bg-surface-raised shadow-poster'
		},
		{
			id: 'rounded-poster-sharp',
			token: 'rounded-poster-sharp',
			className: 'rounded-poster-sharp border-poster bg-surface-raised'
		},
		{
			id: 'shadow-poster',
			token: 'shadow-poster + border-poster',
			className: 'rounded-poster border-poster bg-brand text-brand-foreground shadow-poster'
		}
	] as const;

	// ===== Layers =====
	const vibeRules = [
		'โทเคนหลัก (สี ฟอนต์ ระยะ ขอบ เงา) เป็นของเรา — vibe ใช้แค่ค่าที่แตกมาจากของเดิม ไม่มี hex ใหม่',
		'1 component ใส่ของ vibe ได้ไม่เกิน 1–2 อย่าง',
		'Hero zone เล่นเต็มที่ · tool zone (ตารางราคา ตัวกรอง) ใช้ชั้นฐานเป็นหลัก',
		'ตัวอักษร catalog เป็นอังกฤษ/ตัวเลขเท่านั้น — ไม่ letter-space ภาษาไทย'
	] as const;

	// ===== Components: sample data (fixed, no fetching) =====
	/**
	 * Same shape as /api/search results. appids chosen for their cover art: three have a portrait
	 * cover, "Persona 6" only has the storesearch capsule (fallback step 3), and 480 has no art at
	 * all (placeholder).
	 */
	const searchRows: SearchResult[] = [
		{
			appid: 1113000,
			name: 'Persona 4 Golden',
			image: null,
			price: { initial: 999, final: 199, discountPercent: 80 }
		},
		{
			appid: 504230,
			name: 'Celeste',
			image: null,
			price: { initial: 199, final: 99, discountPercent: 50 }
		},
		{
			appid: 632470,
			name: 'Disco Elysium - The Final Cut',
			image: null,
			price: { initial: 449, final: 359, discountPercent: 20 }
		},
		{
			appid: 2649560,
			name: 'Persona 6',
			image:
				'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2649560/5590f18b2eaff8f3cc209d873337e7427f9cbe18/capsule_231x87.jpg?t=1781799583',
			price: null
		},
		{ appid: 480, name: 'Spacewar (ไม่มีรูปปก)', image: null, price: null }
	];

	const steamPanels = [
		{ id: 'priced', price: 199, regular: 999, discount: 80, note: 'ราคาไทยจาก Steam โดยตรง (บาท)' },
		{ id: 'no-price', price: null, regular: null, discount: 0, note: 'ยังไม่มีราคาบน Steam ไทย' }
	] as const;

	const dealCards = [
		{ id: 'hk', name: 'Hollow Knight', store: 'Steam', price: 139, regular: 549, discount: 75 },
		{ id: 'celeste', name: 'Celeste', store: 'Steam', price: 99, regular: 199, discount: 50 }
	] as const;

	const tickerText = 'ถูกมั้ย? · is this cheap? · ห้ามซื้อตอนแพง · ';
	const tiers: Verdict[] = ['mega', 'deal', 'standby', 'no-signal'];

	const motionTokens = [
		{
			token: '--ease-snap',
			value: 'cubic-bezier(0.2, 1.6, 0.4, 1)',
			purpose: 'เด้งเกินนิดเดียว — ปุ่ม การ์ด และแท็กตอนเข้าและกด'
		},
		{
			token: '--ease-whip',
			value: 'cubic-bezier(0.7, 0, 0.2, 1)',
			purpose: 'เร่งแล้วหยุดนิ่ง — เส้นกวาดและการเปิดจอ'
		},
		{
			token: 'animate-tv-on',
			value: '0.6s',
			purpose: 'เปิดจอ CRT — ใช้ในโซนฮีโร่เท่านั้น'
		},
		{
			token: 'animate-cel-in',
			value: '0.55s',
			purpose: 'ชิ้นส่วนฮีโร่เลื่อนเข้าจากซ้าย ไล่ลำดับด้วย delay'
		},
		{
			token: 'animate-marquee',
			value: '32s linear',
			purpose: 'ticker tape เลื่อนวนซ้ำ'
		},
		{
			token: 'animate-stripe-scroll',
			value: '0.9s linear',
			purpose: 'ลายแถบเตือนไหล — ใช้ตอนโฟกัสช่องค้นหาและ CTA'
		},
		{
			token: 'animate-sticker-slap',
			value: '0.5s',
			purpose: 'สติกเกอร์ตบลงมา (vibe)'
		},
		{
			token: 'animate-channel-flip',
			value: '0.45s steps(6)',
			purpose: 'เปลี่ยนช่องภาพแบบ CRT (vibe)'
		},
		{
			token: 'Tween · cubicOut',
			value: '900ms (JS)',
			purpose: 'ราคาหมุนแบบมิเตอร์ — ไม่ใช่ CSS token'
		}
	] as const;

	// ===== Motion demos =====
	let slapKey = $state(0);
	let flipKey = $state(0);

	const rollTarget = 559;
	const price = new Tween(rollTarget, { easing: cubicOut });

	function rollPrice() {
		price.set(0, { duration: 0 });
		price.set(rollTarget, { duration: reducedMotion.current ? 0 : 900 });
	}
</script>

<svelte:head>
	<title>Design tokens · isthisgamecheap</title>
</svelte:head>

{#snippet spec(where: string, layers: string, rule: string)}
	<dl class="grid grid-cols-1 gap-x-tool gap-y-1 font-sans text-tool sm:grid-cols-[7rem_1fr]">
		<dt class="font-display text-caption font-bold text-ink-muted uppercase">ใช้ที่</dt>
		<dd class="wrap-break-word"><code class="text-caption">{where}</code></dd>
		<dt class="font-display text-caption font-bold text-ink-muted uppercase">ชั้น / โทเคน</dt>
		<dd class="text-caption wrap-break-word">{layers}</dd>
		<dt class="font-display text-caption font-bold text-ink-muted uppercase">กฎการใช้</dt>
		<dd>{rule}</dd>
	</dl>
{/snippet}

<main class="min-h-svh bg-surface text-ink">
	<header class="border-poster border-x-0 border-t-0">
		<div class="mx-auto flex max-w-5xl flex-col gap-tool bg-pattern-dot p-hero">
			<p class="font-sans text-caption tracking-wide text-ink-muted uppercase">
				Design token reference
			</p>
			<h1 class="font-display text-display text-brand sm:text-hero">ถูกมั้ย? · isthisgamecheap</h1>
			<p class="max-w-prose font-sans text-body text-ink-muted">
				บอกทันทีว่าเกม PC ที่ลดราคาอยู่ตอนนี้ถูกจริงไหม — ตัดสินด้วยป้ายสั้น ๆ แบบโฆษณาทีวียุค CRT
				ชั้นโทเคนสามชั้น: ฐาน · cel · vibe.
			</p>
		</div>
	</header>

	<nav aria-label="สารบัญ" class="sticky top-0 z-20 border-poster border-x-0 border-t-0 bg-surface">
		<ul class="mx-auto flex max-w-5xl flex-wrap items-center gap-tool px-hero py-tool">
			{#each sections as section (section.id)}
				<li>
					<button
						type="button"
						class="border-poster bg-surface-raised px-tool py-1 font-display text-caption font-bold uppercase"
						onclick={() => jump(section.id)}>{section.label}</button
					>
				</li>
			{/each}
			<li class="ml-auto"><ThemeSwitch /></li>
		</ul>
	</nav>

	<div class="mx-auto flex max-w-5xl flex-col gap-hero-lg p-hero">
		<!-- ===================== BRAND ===================== -->
		<section id="brand" class="flex scroll-mt-24 flex-col gap-hero" aria-labelledby="brand-heading">
			<div class="flex flex-col gap-tool">
				<h2 id="brand-heading" class="font-display text-display">Brand</h2>
				<p class="font-sans text-tool text-ink-muted">
					เราเป็นใคร พูดยังไง — อ่านก่อนหยิบสีหรือป้ายไปใช้
				</p>
			</div>

			<!-- Name & lockup -->
			<div class="flex flex-col gap-tool-lg rounded-poster border-poster bg-surface-raised p-hero">
				<h3 class="font-display text-tool font-bold tracking-wide uppercase">ชื่อและโลโก้</h3>
				<div class="flex flex-col gap-tool sm:flex-row sm:items-end sm:gap-hero">
					<span class="inline-block skew-cel border-cel px-3 py-1 shadow-poster fill-cel-brand">
						<span
							class="inline-block unskew-cel font-display text-xl font-bold text-brand-foreground"
						>
							ถูกมั้ย?
						</span>
					</span>
					<p class="font-display text-display">isthisgamecheap</p>
				</div>
				<dl class="grid grid-cols-1 gap-tool font-sans text-tool sm:grid-cols-2">
					<div class="flex flex-col gap-1">
						<dt class="font-display text-caption font-bold text-ink-muted uppercase">ชื่อไทย</dt>
						<dd>ถูกมั้ย? — ป้ายแท็กสีแดงมุมซ้ายบน (logo tag)</dd>
					</div>
					<div class="flex flex-col gap-1">
						<dt class="font-display text-caption font-bold text-ink-muted uppercase">ชื่อ Latin</dt>
						<dd>isthisgamecheap — ใช้ในชื่อโดเมน, title, และเมตาข้อมูล</dd>
					</div>
				</dl>
			</div>

			<!-- Purpose -->
			<div class="flex flex-col gap-tool rounded-poster border-poster bg-surface-raised p-hero">
				<h3 class="font-display text-tool font-bold tracking-wide uppercase">วัตถุประสงค์</h3>
				<p class="font-sans text-body">
					ช่วยคนเล่น PC ไทยตอบคำถามเดียว: <strong>เกมนี้ถูกจริงตอนนี้ไหม</strong> — ดึงราคาปัจจุบันจาก
					Steam ไทยเป็นบาท แล้วสรุปด้วยป้ายตัดสินจาก % ส่วนลด (ตอนนี้ยังไม่เทียบร้านอื่น และยังไม่มีประวัติราคา)
				</p>
			</div>

			<!-- Personality -->
			<div class="flex flex-col gap-tool-lg">
				<h3 class="font-display text-tool font-bold tracking-wide uppercase">บุคลิก</h3>
				<ul class="grid grid-cols-1 gap-tool-lg sm:grid-cols-3">
					{#each personality as trait (trait.id)}
						<li
							class="flex flex-col gap-tool rounded-poster border-poster bg-surface-raised p-tool"
						>
							<p class="font-display text-display">{trait.title}</p>
							<p class="font-sans text-tool text-ink-muted">{trait.body}</p>
						</li>
					{/each}
				</ul>
			</div>

			<!-- Voice -->
			<div class="flex flex-col gap-tool-lg">
				<h3 class="font-display text-tool font-bold tracking-wide uppercase">
					เสียงของป้าย — ศัพท์โฆษณาทีวี
				</h3>
				<p class="font-sans text-tool text-ink-muted">
					ป้าย Latin ตัวใหญ่ + คำไทยตัวเล็ก · ใช้ค่าจาก <code class="text-caption">verdictCopy</code
					>
					โดยตรง ไม่พิมพ์ซ้ำ
				</p>
				<ul class="flex flex-col gap-tool-lg">
					{#each voice as row (row.tier)}
						<li
							class="grid grid-cols-[7rem_1fr] items-center gap-x-hero gap-y-tool rounded-poster border-poster bg-surface-raised p-tool sm:grid-cols-[8rem_1fr]"
						>
							<span
								class={[
									'flex h-20 w-28 flex-col items-center justify-center gap-0.5 border-cel px-1 text-center',
									verdictCopy[row.tier].className
								]}
							>
								<span class="font-display text-base leading-none font-bold"
									>{verdictCopy[row.tier].stamp}</span
								>
								<span class="font-sans text-caption leading-tight font-semibold"
									>{verdictCopy[row.tier].sub}</span
								>
							</span>
							<div class="flex flex-col gap-1">
								<p class="font-sans text-tool font-semibold">{verdictCopy[row.tier].label}</p>
								<p class="font-sans text-caption text-ink-muted">{row.when}</p>
							</div>
						</li>
					{/each}
					<li
						class="grid grid-cols-[7rem_1fr] items-center gap-x-hero gap-y-tool rounded-poster border-poster bg-surface-raised p-tool sm:grid-cols-[8rem_1fr]"
					>
						<span
							class="flex h-20 w-28 flex-col items-center justify-center gap-0.5 border-cel bg-cel-line px-1 text-center text-price-deal"
						>
							<span class="font-display text-base leading-none font-bold">NEW LOW!</span>
							<span class="font-sans text-caption leading-tight font-semibold"
								>{newLowCopy.sub}</span
							>
						</span>
						<div class="flex flex-col gap-1">
							<p class="font-sans text-tool font-semibold">ป้ายข้อเท็จจริง แปะซ้อนบนป้ายตัดสิน</p>
							<p class="font-sans text-caption text-ink-muted">
								ยังไม่ใช้บนหน้าเว็บ — รอจนเราเก็บประวัติราคา Steam เอง
								แล้วแปะเฉพาะตอนราคาแตะต่ำสุดเท่าที่เคยมี ไม่ใช่ป้ายตัดสินเอง
							</p>
						</div>
					</li>
				</ul>
			</div>

			<!-- Do / don't -->
			<div class="grid grid-cols-1 gap-hero md:grid-cols-2">
				<div class="flex flex-col gap-tool rounded-poster border-poster bg-surface-raised p-tool">
					<h3 class="font-display text-tool font-bold tracking-wide uppercase">ควรทำ</h3>
					<ul class="flex flex-col gap-tool font-sans text-tool">
						{#each doList as item (item)}
							<li class="flex gap-tool">
								<span class="shrink-0 font-display font-bold">✓</span><span>{item}</span>
							</li>
						{/each}
					</ul>
				</div>
				<div class="flex flex-col gap-tool rounded-poster border-poster bg-surface-raised p-tool">
					<h3 class="font-display text-tool font-bold tracking-wide uppercase">ห้ามทำ</h3>
					<ul class="flex flex-col gap-tool font-sans text-tool">
						{#each dontList as item (item)}
							<li class="flex gap-tool">
								<span class="shrink-0 font-display font-bold text-brand">✕</span><span>{item}</span>
							</li>
						{/each}
					</ul>
				</div>
			</div>
		</section>

		<!-- ===================== FOUNDATIONS ===================== -->
		<section
			id="foundations"
			class="flex scroll-mt-24 flex-col gap-hero-lg"
			aria-labelledby="foundations-heading"
		>
			<div class="flex flex-col gap-tool">
				<h2 id="foundations-heading" class="font-display text-display">Foundations</h2>
				<p class="font-sans text-tool text-ink-muted">
					ชั้นฐาน (Base) — สี ฟอนต์ ระยะ ขอบ เงา ที่ไม่เปลี่ยนตามอารมณ์ของหน้า
				</p>
			</div>

			<!-- Colors -->
			<section class="flex flex-col gap-hero" aria-labelledby="colors-heading">
				<div class="flex flex-col gap-tool">
					<h3 id="colors-heading" class="font-display text-display">Colors</h3>
					<p class="font-sans text-tool text-ink-muted">
						สีตามบทบาท — brand / price / surface. ใช้คลาสโทเคนเท่านั้น
					</p>
				</div>

				<div class="flex flex-col gap-tool-lg">
					<h4 class="font-display text-tool tracking-wide uppercase">Brand</h4>
					<ul class="grid grid-cols-1 gap-tool sm:grid-cols-2">
						{#each brandColors as color (color.id)}
							<li
								class={[
									color.swatch,
									'flex min-h-24 flex-col justify-end gap-tool rounded-poster border-poster p-tool shadow-poster'
								]}
							>
								<span class="font-sans text-caption font-medium">{color.token}</span>
								<span class="font-sans text-tool">{color.role}</span>
							</li>
						{/each}
					</ul>
				</div>

				<div class="flex flex-col gap-tool-lg">
					<h4 class="font-display text-tool tracking-wide uppercase">Price</h4>
					<ul class="grid grid-cols-1 gap-tool sm:grid-cols-3">
						{#each priceColors as color (color.id)}
							<li
								class={[
									color.swatch,
									'flex min-h-24 flex-col justify-end gap-tool rounded-poster p-tool shadow-poster'
								]}
							>
								<span class="font-sans text-caption font-medium">{color.token}</span>
								<span class="font-sans text-tool">{color.role}</span>
							</li>
						{/each}
					</ul>
				</div>

				<div class="flex flex-col gap-tool-lg">
					<h4 class="font-display text-tool tracking-wide uppercase">Surfaces</h4>
					<ul class="grid grid-cols-1 gap-tool sm:grid-cols-2 lg:grid-cols-3">
						{#each surfaceColors as color (color.id)}
							<li
								class={[
									color.swatch,
									'flex min-h-24 flex-col justify-end gap-tool rounded-poster p-tool'
								]}
							>
								<span class="font-sans text-caption font-medium">{color.token}</span>
								<span class="font-sans text-tool">{color.role}</span>
							</li>
						{/each}
					</ul>
				</div>

				<div class="flex flex-col gap-tool-lg">
					<h4 class="font-display text-tool tracking-wide uppercase">Price badges</h4>
					<ul class="flex flex-wrap items-center gap-tool-lg">
						{#each badges as item (item.id)}
							<li>
								<span class={item.className}>{item.label}</span>
							</li>
						{/each}
					</ul>
				</div>
			</section>

			<!-- Typography -->
			<section class="flex flex-col gap-hero" aria-labelledby="typography-heading">
				<div class="flex flex-col gap-tool">
					<h3 id="typography-heading" class="font-display text-display">Typography</h3>
					<p class="font-sans text-tool text-ink-muted">
						font-display / font-sans + สเกล text-* (hero → caption)
					</p>
				</div>

				<ul class="flex flex-col gap-tool-lg">
					{#each fonts as font (font.id)}
						<li
							class="flex flex-col gap-tool rounded-poster border-poster bg-surface-raised p-tool"
						>
							<span class="font-sans text-caption text-ink-muted">{font.token}</span>
							<p class={[font.className, 'text-display']}>{font.sample}</p>
						</li>
					{/each}
				</ul>

				<ul class="flex flex-col gap-tool-lg">
					{#each typeSizes as size (size.id)}
						<li
							class="flex flex-col gap-tool rounded-poster border-poster bg-surface-raised p-tool"
						>
							<span class="font-sans text-caption text-ink-muted">{size.token}</span>
							<p class={[size.font, size.token]}>{size.sample}</p>
						</li>
					{/each}
				</ul>
			</section>

			<!-- Geometry -->
			<section class="flex flex-col gap-hero" aria-labelledby="geometry-heading">
				<div class="flex flex-col gap-tool">
					<h3 id="geometry-heading" class="font-display text-display">Geometry</h3>
					<p class="font-sans text-tool text-ink-muted">ขอบแข็ง · มุมโปสเตอร์ · เงา offset</p>
				</div>

				<ul class="grid grid-cols-1 gap-hero sm:grid-cols-3">
					{#each geometry as item (item.id)}
						<li class="flex flex-col gap-tool">
							<span class="font-sans text-caption text-ink-muted">{item.token}</span>
							<div class={[item.className, 'flex h-28 items-center justify-center p-tool']}>
								<span class="font-sans text-tool">poster panel</span>
							</div>
						</li>
					{/each}
				</ul>
			</section>

			<!-- Density -->
			<section class="flex flex-col gap-hero" aria-labelledby="density-heading">
				<div class="flex flex-col gap-tool">
					<h3 id="density-heading" class="font-display text-display">Density</h3>
					<p class="font-sans text-tool text-ink-muted">
						Hero zone vs tool zone — เปรียบเทียบ spacing
					</p>
				</div>

				<div class="grid grid-cols-1 gap-hero lg:grid-cols-2">
					<div class="flex flex-col gap-hero rounded-poster border-poster bg-surface-raised p-hero">
						<span class="font-sans text-caption text-ink-muted"
							>gap-hero · gap-hero-lg · p-hero</span
						>
						<p class="font-display text-display">Hero density</p>
						<p class="font-sans text-body text-ink-muted">โซนโปสเตอร์ — หายใจกว้าง หัวเรื่องใหญ่</p>
						<div class="flex flex-col gap-hero-lg">
							<span
								class="rounded-poster border-poster bg-brand p-hero font-sans text-tool text-brand-foreground"
								>p-hero padded block</span
							>
							<span
								class="rounded-poster border-poster bg-price-deal p-hero font-sans text-tool text-price-deal-foreground"
								>gap-hero-lg between</span
							>
						</div>
					</div>

					<div class="flex flex-col gap-tool rounded-poster border-poster bg-surface-raised p-tool">
						<span class="font-sans text-caption text-ink-muted"
							>gap-tool · gap-tool-lg · p-tool</span
						>
						<p class="font-display text-tool tracking-wide uppercase">Tool density</p>
						<p class="font-sans text-caption text-ink-muted">โซนเครื่องมือ — แน่น อ่านเร็ว</p>
						<div class="flex flex-col gap-tool-lg">
							<span
								class="rounded-poster-sharp border-poster bg-ink p-tool font-sans text-caption text-surface"
								>p-tool padded block</span
							>
							<span
								class="rounded-poster-sharp border-poster bg-ink-muted p-tool font-sans text-caption text-surface"
								>gap-tool-lg between</span
							>
						</div>
					</div>
				</div>
			</section>

			<!-- Pattern + focus -->
			<section class="flex flex-col gap-hero" aria-labelledby="pattern-heading">
				<div class="flex flex-col gap-tool">
					<h3 id="pattern-heading" class="font-display text-display">Pattern + focus</h3>
					<p class="font-sans text-tool text-ink-muted">
						bg-pattern-dot ใช้น้อย · ring-poster-focus เมื่อโฟกัส
					</p>
				</div>

				<div class="grid grid-cols-1 gap-hero sm:grid-cols-2">
					<div
						class="flex min-h-36 items-end rounded-poster border-poster bg-pattern-dot p-tool shadow-poster"
					>
						<span class="font-sans text-caption text-ink-muted">bg-pattern-dot</span>
					</div>

					<div
						class="flex min-h-36 flex-col items-start justify-end gap-tool rounded-poster border-poster bg-surface-raised p-tool"
					>
						<span class="font-sans text-caption text-ink-muted"
							>ring-poster-focus sample · Tab the button</span
						>
						<span
							class="rounded-poster border-poster bg-surface px-tool py-tool font-sans text-caption text-ink ring-poster-focus"
						>
							ring-poster-focus
						</span>
						<button
							type="button"
							class="rounded-poster border-poster bg-brand px-tool py-tool font-display text-tool text-brand-foreground shadow-poster"
						>
							โฟกัสฉัน · Focus me
						</button>
					</div>
				</div>
			</section>
		</section>

		<!-- ===================== LAYERS ===================== -->
		<section
			id="layers"
			class="flex scroll-mt-24 flex-col gap-hero"
			aria-labelledby="layers-heading"
		>
			<div class="flex flex-col gap-tool">
				<h2 id="layers-heading" class="font-display text-display">Layers</h2>
				<p class="max-w-prose font-sans text-tool text-ink-muted">
					สามชั้นซ้อนกัน: ชั้นบนใช้ค่าของชั้นล่างเท่านั้น ไม่มี hex ใหม่ ถ้าอยากได้ของใหม่
					ให้ลดลงมาที่ชั้นฐานก่อน
				</p>
			</div>

			<ol class="flex flex-col gap-hero-lg">
				<!-- Base -->
				<li class="flex flex-col gap-tool-lg rounded-poster border-poster bg-surface-raised p-hero">
					<div class="flex flex-col gap-tool">
						<p class="text-catalog text-ink-muted">Layer 01 · Base</p>
						<h3 class="font-display text-display">ชั้นฐาน — ของเรา ไม่เปลี่ยน</h3>
						<p class="font-sans text-tool text-ink-muted">
							สีแบรนด์ สีราคา ink/surface ฟอนต์ IBM Plex ระยะ ขอบแข็ง เงา offset และ halftone ทุก
							component ต้องผ่านชั้นนี้ก่อน และโซนเครื่องมือใช้ชั้นนี้เป็นหลัก
						</p>
					</div>
					<ul class="flex flex-wrap gap-2 font-sans text-caption">
						{#each ['bg-brand', 'bg-price-deal', 'bg-price-mega', 'text-ink', 'font-display', 'border-poster', 'shadow-poster', 'bg-pattern-dot', 'ring-poster-focus'] as token (token)}
							<li><code class="border-poster bg-surface px-1.5 py-0.5">{token}</code></li>
						{/each}
					</ul>
					<div class="rounded-poster border-poster bg-pattern-dot p-hero shadow-poster">
						<p class="font-display text-display">Hard poster panel</p>
						<p class="font-sans text-tool text-ink-muted">ขอบ 2px · เงา 4px ทึบ · halftone</p>
					</div>
				</li>

				<!-- Cel -->
				<li class="flex flex-col gap-tool-lg rounded-poster border-poster bg-surface-raised p-hero">
					<div class="flex flex-col gap-tool">
						<p class="text-catalog text-ink-muted">Layer 02 · Cel</p>
						<h3 class="font-display text-display">ชั้น Cel — สไตล์ Persona ลดทอน</h3>
						<p class="font-sans text-tool text-ink-muted">
							เติมด้วยสองโทนและขอบเส้นหนา (hard stop) เอียงเฉพาะแท็ก หัวเรื่อง และปุ่ม ไม่เอียง
							input หรือเนื้อหาไทย
						</p>
					</div>
					<ul class="flex flex-wrap gap-2 font-sans text-caption">
						{#each ['fill-cel-brand', 'fill-cel-deal', 'fill-cel-mega', 'border-cel', 'shadow-cel', 'shadow-cel-brand', 'skew-cel / unskew-cel', 'text-cel', 'bg-pattern-stripe', 'bg-pattern-scan', 'animate-tv-on', 'animate-cel-in', '--ease-snap'] as token (token)}
							<li><code class="border-poster bg-surface px-1.5 py-0.5">{token}</code></li>
						{/each}
					</ul>
					<div class="flex flex-wrap items-center gap-hero">
						<span class="inline-block skew-cel border-cel px-3 py-1 shadow-cel fill-cel-deal">
							<span class="inline-block unskew-cel font-display text-display">ราคาดี</span>
						</span>
						<span class="font-display text-price text-price-deal text-cel">CEL</span>
						<span class="h-8 w-28 border-cel bg-pattern-stripe" aria-hidden="true"></span>
					</div>
				</li>

				<!-- Vibe -->
				<li class="flex flex-col gap-tool-lg rounded-poster border-poster bg-surface-raised p-hero">
					<div class="flex flex-col gap-tool">
						<p class="text-catalog text-ink-muted">Layer 03 · Vibe · Live in parts · CH-07</p>
						<h3 class="font-display text-display">ชั้น Vibe — บรรยากาศ TV shopping</h3>
						<p class="max-w-prose font-sans text-tool text-ink-muted">
							บรรยากาศ retro-modern แบบช่อง TV shopping ในร้านเช่าวิดีโอ — ยืมแค่ vibe
							ส่วนโทเคนหลักยังเป็นของเรา ใช้จริงแล้ว: กรอบ CRT + channel-flip + ราคาหมุน (หน้าเกม),
							ป้ายเทป (ดีลหน้าแรก), ตลับแผ่นเกม (ชั้นวางผลค้นหา) · สติกเกอร์ยังเป็นพรีวิว — NEW LOW!
							รอประวัติราคา (P0)
						</p>
					</div>
					<ul class="flex flex-wrap gap-2 font-sans text-caption">
						{#each ['sticker-burst', 'sticker-die-cut', 'text-catalog', 'bg-pattern-barcode', 'rounded-chunky', 'animate-sticker-slap', 'animate-channel-flip', '--color-sticker-edge'] as token (token)}
							<li><code class="border-poster bg-surface px-1.5 py-0.5">{token}</code></li>
						{/each}
					</ul>
					<div class="flex flex-wrap items-center gap-hero">
						<div class="rounded-chunky border-cel bg-surface p-tool">
							<p class="text-catalog text-ink-muted">Tape No.1113000 · SP · 120 min</p>
							<span class="mt-tool block h-7 w-40 bg-pattern-barcode" aria-hidden="true"></span>
						</div>
						<span class="text-catalog text-ink-muted">Rec · CH-07</span>
					</div>
					<ul class="flex flex-col gap-tool rounded-poster border-poster bg-surface p-tool">
						{#each vibeRules as rule, i (rule)}
							<li class="flex items-baseline gap-tool font-sans text-tool">
								<span class="shrink-0 text-catalog text-ink-muted">R-0{i + 1}</span>
								<span>{rule}</span>
							</li>
						{/each}
					</ul>
				</li>
			</ol>
		</section>

		<!-- ===================== COMPONENTS ===================== -->
		<section
			id="components"
			class="flex scroll-mt-24 flex-col gap-hero"
			aria-labelledby="components-heading"
		>
			<div class="flex flex-col gap-tool">
				<h2 id="components-heading" class="font-display text-display">Components</h2>
				<p class="max-w-prose font-sans text-tool text-ink-muted">
					ตัวอย่างจริงจากหน้าเว็บ (คัดลอกคลาสจากซอร์สแล้ว) ข้อมูลเป็นค่าคงที่ ไม่ดึงจากที่ไหน
					ใต้แต่ละชิ้นมีว่าใช้ที่ไหน ใช้ชั้นไหน และกฎการใช้
				</p>
			</div>

			<!-- Logo tag -->
			<article
				class="flex flex-col gap-tool-lg rounded-poster border-poster bg-surface-raised p-hero"
			>
				<h3 class="font-display text-display">Logo tag</h3>
				<div class="flex flex-wrap items-center gap-tool p-tool">
					<span class="inline-block skew-cel border-cel px-3 py-1 shadow-poster fill-cel-brand">
						<span
							class="inline-block unskew-cel font-display text-xl font-bold text-brand-foreground"
						>
							ถูกมั้ย?
						</span>
					</span>
				</div>
				{@render spec(
					'src/routes/+page.svelte · src/routes/game/[appid]/+page.svelte',
					'Cel (skew, fill-cel-brand, border-cel) บนชั้นฐาน (shadow-poster)',
					'มีแค่หนึ่งชิ้นต่อหน้า มุมซ้ายบน และไม่ใช้เป็นปุ่ม'
				)}
			</article>

			<!-- Kicker tag -->
			<article
				class="flex flex-col gap-tool-lg rounded-poster border-poster bg-surface-raised p-hero"
			>
				<h3 class="font-display text-display">Kicker tag</h3>
				<div class="p-tool">
					<p class="inline-block skew-cel bg-cel-line px-3 py-1">
						<span
							class="inline-block unskew-cel font-display text-caption font-bold tracking-[0.25em] text-price-deal uppercase"
						>
							▶ Midnight Deal Channel
						</span>
					</p>
				</div>
				{@render spec(
					'src/routes/+page.svelte (ฮีโร่) · src/routes/game/[appid]/+page.svelte (หัวหน้าเกม)',
					'Cel (skew, bg-cel-line) + ชั้นฐาน (text-caption)',
					'ตัวอักษรเป็น Latin ล้วนเท่านั้น — tracking ได้ เพราะไม่มีภาษาไทย'
				)}
			</article>

			<!-- Section heading -->
			<article
				class="flex flex-col gap-tool-lg rounded-poster border-poster bg-surface-raised p-hero"
			>
				<h3 class="font-display text-display">Section heading (แถบหมึกเอียง)</h3>
				<div class="flex flex-col gap-tool p-tool">
					<h4 class="inline-block skew-cel bg-ink px-4 py-1">
						<span class="inline-block unskew-cel font-display text-display text-surface"
							>ดีลเด็ดคืนนี้</span
						>
					</h4>
					<h4 class="inline-block skew-cel bg-ink px-4 py-1">
						<span class="inline-block unskew-cel font-display text-display text-surface"
							>ราคาบน Steam</span
						>
					</h4>
				</div>
				{@render spec(
					'src/routes/+page.svelte (ดีลเด็ดคืนนี้, 3 สเต็ป จบ) · src/routes/game/[appid]/+page.svelte (ราคาบน Steam)',
					'Cel (skew) + ชั้นฐาน (bg-ink, text-surface, text-display)',
					'หนึ่งแถบต่อหนึ่งส่วน — ข้อความไทยอยู่ใน span ที่ unskew แล้วเท่านั้น'
				)}
			</article>

			<!-- Search bar -->
			<article
				class="flex flex-col gap-tool-lg rounded-poster border-poster bg-surface-raised p-hero"
			>
				<h3 class="font-display text-display">Search bar</h3>
				<div class="p-tool">
					<div role="search" class="search-frame relative">
						<div
							class="search-tape absolute inset-0 skew-cel bg-pattern-stripe opacity-0"
							aria-hidden="true"
						></div>
						<div
							class="search-skin relative skew-cel border-cel p-2 shadow-cel-brand fill-cel-deal sm:p-3"
						>
							<div class="flex unskew-cel items-stretch gap-2 sm:gap-3">
								<label for="demo-search" class="sr-only">ค้นหาเกมที่อยากเช็คราคา</label>
								<div
									class="search-field flex min-w-0 flex-1 items-center gap-3 border-cel bg-surface-raised px-3 sm:px-5"
								>
									<SearchIcon class="size-6 shrink-0 sm:size-8" aria-hidden="true" />
									<input
										id="demo-search"
										type="search"
										placeholder="ลองพิมพ์ Persona 4 Golden"
										autocomplete="off"
										spellcheck="false"
										class="h-14 w-full min-w-0 border-0 bg-transparent p-0 font-sans text-lg font-semibold text-ink placeholder:text-ink-muted/70 focus:ring-0 focus:outline-none sm:h-20 sm:text-2xl"
									/>
									<kbd
										class="hidden border-poster px-2 font-display text-caption text-ink-muted sm:inline-block"
										aria-hidden="true">/</kbd
									>
								</div>
								<button
									type="button"
									class="search-go flex items-center gap-2 border-cel px-4 font-display text-xl font-bold text-brand-foreground uppercase fill-cel-brand focus-visible:outline-cel-line sm:px-7 sm:text-2xl"
								>
									<span class="hidden sm:inline">ค้นเลย!</span>
									<ArrowRightIcon class="size-6 sm:size-7" aria-hidden="true" />
									<span class="sr-only sm:hidden">ค้นหา</span>
								</button>
							</div>
						</div>
					</div>
				</div>
				{@render spec(
					'src/routes/+page.svelte (ฮีโร่, #game-search)',
					'Cel (skew wrapper, fill-cel-deal, shadow-cel-brand, ลายแถบตอนโฟกัส) + ชั้นฐาน (ช่องกรอก border-cel)',
					'เอียงเฉพาะกรอบด้านนอก — ช่องกรอกต้องไม่เอียง และโฟกัสต้องยกกรอบขึ้น (ดูตัวอย่าง: คลิกช่องค้นหา)'
				)}
			</article>

			<!-- Trending chip -->
			<article
				class="flex flex-col gap-tool-lg rounded-poster border-poster bg-surface-raised p-hero"
			>
				<h3 class="font-display text-display">Trending chip</h3>
				<ul class="flex flex-wrap gap-2 p-tool">
					{#each ['Persona 4 Golden', 'Elden Ring', 'Celeste'] as name (name)}
						<li>
							<button
								type="button"
								class="border-poster bg-surface-raised px-3 py-1 font-sans text-caption font-semibold"
							>
								{name}
							</button>
						</li>
					{/each}
				</ul>
				{@render spec(
					'src/routes/+page.svelte (ยอดฮิตคืนนี้ใต้ช่องค้นหา)',
					'ชั้นฐาน (border-poster, bg-surface-raised, text-caption)',
					'ไม่เกิน 4 ชิ้น กดแล้วใส่ชื่อลงช่องค้นหาและค้นทันที'
				)}
			</article>

			<!-- Search result row -->
			<article
				class="flex flex-col gap-tool-lg rounded-poster border-poster bg-surface-raised p-hero"
			>
				<h3 class="font-display text-display">Search result row</h3>
				<p class="font-sans text-tool text-ink-muted">
					ปกแนวตั้งจาก Steam (library 600×900) → ถ้าไม่มีใช้ header → ภาพ capsule จากผลค้นหา →
					ช่องสี token ปกติ ลองย่อหน้าต่างให้เหลือ 390px เพื่อดูแถวแบบมือถือ
				</p>
				<ul class="flex flex-col gap-tool-lg p-tool">
					{#each searchRows as game (game.appid)}
						<li>
							<GameResultRow {game} />
						</li>
					{/each}
				</ul>
				{@render spec(
					'src/lib/components/GameResultRow.svelte + GameCover.svelte (ผลค้นหา มุมมอง “รายการ”)',
					'Cel (border-cel, shadow-cel) + ชั้นฐาน (บล็อกป้ายจาก verdictCopy, ช่องปกสี token) · ลำดับปก: src/lib/cover.ts',
					'หนึ่งแถวต่อหนึ่งเกม ปกอยู่ซ้ายสุดเสมอและกรอบมีขนาดตายตัว (2:3) — ภาพไม่มา/ไม่มีก็ห้ามขยับเลย์เอาต์ · คำตัดสินเป็นบล็อกคงที่ (แถบใต้ปกบนมือถือ) — ไม่มีราคาก็ใช้ NO SIGNAL'
				)}
			</article>

			<!-- Game disc case (vibe) -->
			<article
				class="flex flex-col gap-tool-lg rounded-poster border-poster bg-surface-raised p-hero"
			>
				<h3 class="font-display text-display">
					Game disc case <span class="text-catalog text-ink-muted">· Vibe</span>
				</h3>
				<p class="font-sans text-tool text-ink-muted">
					ผลค้นหามุมมอง “ชั้นวางแผ่น” — วางเมาส์หรือกด Tab เพื่อให้แผ่นเลื่อนออกมาหมุน กดเพื่อ
					“โหลดแผ่น” แล้วไปหน้าเปรียบเทียบ (ในตัวอย่างนี้จะพาไปหน้าเกมจริง) ·
					บนจอสัมผัสแผ่นโผล่ให้เห็นอยู่แล้ว แตะครั้งเดียวเข้าเลย
				</p>
				<ul class="grid grid-cols-2 gap-x-tool-lg gap-y-hero p-tool sm:grid-cols-3 lg:grid-cols-4">
					{#each searchRows as game (game.appid)}
						<li class="min-w-0">
							<GameDiscCase {game} />
						</li>
					{/each}
				</ul>
				{@render spec(
					'src/lib/components/GameDiscCase.svelte (ผลค้นหา มุมมอง “ชั้นวางแผ่น”, สลับด้วยปุ่มเหนือผลค้นหา)',
					'Vibe (แผ่น: animate-disc-spin + bg-disc-sheen จาก color-mix ของ token, ป้าย text-catalog “Now loading”) + Cel (border-cel) + ชั้นฐาน (ป้ายตัดสิน)',
					'ลิงก์จริงเสมอ (<a href>) — ดักเฉพาะคลิกซ้ายธรรมดา/Enter, Cmd/Ctrl/Shift/คลิกกลางเปิดตามปกติ · เลือก = แผ่นเด้งออก ~450ms แล้ว goto · reduced motion = ไม่หมุน/ไม่เลื่อน และไปทันที · ใช้เป็นมุมมองทางเลือก ไม่ใช่ค่าเริ่มต้น และไม่ใช้ในโซนเครื่องมือ'
				)}
			</article>

			<!-- Steam price panel -->
			<article
				class="flex flex-col gap-tool-lg rounded-poster border-poster bg-surface-raised p-hero"
			>
				<h3 class="font-display text-display">Steam price panel</h3>
				<ul class="flex flex-col gap-tool-lg p-tool">
					{#each steamPanels as panel (panel.id)}
						<li>
							<article
								class="flex flex-col border-cel bg-surface-raised shadow-cel-brand sm:grid sm:grid-cols-[7rem_1fr_auto_auto]"
							>
								<div
									class={[
										'flex items-center justify-center border-b-(length:--border-width-cel) border-border px-tool py-2 font-display text-lg font-bold sm:border-r-(length:--border-width-cel) sm:border-b-0',
										panel.price
											? 'text-price-deal-foreground fill-cel-deal'
											: 'bg-muted text-ink-muted'
									]}
								>
									Steam
								</div>

								<div class="flex min-w-0 flex-col justify-center gap-1 p-tool">
									<h4 class="font-display text-xl leading-tight font-bold">ราคาปัจจุบัน</h4>
									<p class="font-sans text-caption text-ink-muted">{panel.note}</p>
								</div>

								<div
									class="flex items-baseline gap-tool px-tool pb-tool sm:flex-col sm:items-end sm:justify-center sm:py-tool"
								>
									{#if panel.price}
										<p class="font-display text-display">{formatThb(panel.price)}</p>
										<p class="flex flex-wrap items-center gap-2 font-sans text-caption">
											<s class="text-ink-muted">{formatThb(panel.regular)}</s>
											<span class="bg-cel-line px-1.5 font-display font-bold text-price-deal"
												>−{panel.discount}%</span
											>
										</p>
									{:else}
										<p class="font-display text-display">???</p>
									{/if}
								</div>

								<div class="flex items-center p-tool pt-0 sm:pt-tool">
									<button
										type="button"
										class="go flex w-full items-center justify-center gap-2 border-cel px-4 py-2 font-display text-lg font-bold text-brand-foreground fill-cel-brand focus-visible:outline-cel-line sm:w-auto"
									>
										ไปที่ Steam <ExternalLinkIcon class="size-4" aria-hidden="true" />
									</button>
								</div>
							</article>
						</li>
					{/each}
				</ul>
				{@render spec(
					'src/routes/game/[appid]/+page.svelte (ราคาบน Steam)',
					'Cel (border-cel, shadow-cel-brand, fill-cel-deal เมื่อมีราคา, fill-cel-brand ปุ่ม) + ชั้นฐาน (ตัวเลขราคา text-display) · ราคาหมุน (Tween + cubicOut 900ms) ใช้จริงแล้ว — ปุ่ม “▶ หมุนราคา” ในส่วน Motion เล่นซ้ำได้',
					'หนึ่งแผงต่อเกม ราคาเป็นบาทจาก Steam ไทยเท่านั้น — ไม่มีราคาก็แสดง ??? และยังมีปุ่มไปที่ Steam · ตัวเลขที่หมุนเป็น aria-hidden เสมอ และมีราคาจริงใน sr-only · reduced motion = แสดงราคาจริงทันที · tabular-nums กันความกว้างสั่น'
				)}
			</article>

			<!-- CRT frame -->
			<article
				class="flex flex-col gap-tool-lg rounded-poster border-poster bg-surface-raised p-hero"
			>
				<h3 class="font-display text-display">
					CRT frame <span class="text-catalog text-ink-muted">· Vibe</span>
				</h3>
				<div class="flex flex-col items-start gap-tool p-tool">
					<div class="w-full max-w-sm rounded-[18px] border-cel bg-cel-line p-3 shadow-poster">
						<div class="relative overflow-hidden rounded-chunky">
							{#key flipKey}
								<img
									src="https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/504230/header.jpg"
									alt=""
									width="460"
									height="215"
									class="aspect-460/215 w-full animate-channel-flip bg-muted object-cover"
								/>
							{/key}
							<span class="absolute inset-0 bg-pattern-scan" aria-hidden="true"></span>
							<span
								class="absolute top-2 left-2 bg-cel-line px-1.5 py-0.5 text-catalog text-price-deal"
								aria-hidden="true">● Rec · CH-30</span
							>
						</div>
					</div>
					<button
						type="button"
						class="rounded-poster border-poster bg-surface-raised px-tool py-1.5 font-display text-tool font-bold"
						onclick={() => flipKey++}>▶ เปลี่ยนช่อง</button
					>
				</div>
				{@render spec(
					'src/routes/game/[appid]/+page.svelte (รูปหัวหน้าเกม) — ใช้จริงแล้ว',
					'Vibe 2 อย่าง (animate-channel-flip เล่นครั้งเดียวตอนโหลด, text-catalog ป้าย REC · CH-xx = 2 หลักท้ายของ appid) + Cel (border-cel, shadow-poster) + rounded-chunky + bg-pattern-scan',
					'ใช้กับรูปหัวหน้าเกมในโซนฮีโร่เท่านั้น · มีรูปไม่ได้ให้แสดงกรอบ NO IMAGE ในกรอบเดิม · reduced motion = ไม่เล่น flip (กฎ global)'
				)}
			</article>

			<!-- Deal card -->
			<article
				class="flex flex-col gap-tool-lg rounded-poster border-poster bg-surface-raised p-hero"
			>
				<h3 class="font-display text-display">
					Deal card · ป้ายเทป <span class="text-catalog text-ink-muted">· Vibe</span>
				</h3>
				<ul class="grid grid-cols-1 gap-hero p-tool sm:grid-cols-2">
					{#each dealCards as game, i (game.id)}
						{@const verdict = verdictFromDiscount(true, game.discount)}
						<li>
							<button
								type="button"
								class="flex h-full w-full overflow-hidden rounded-chunky border-cel bg-surface-raised text-left shadow-cel focus-visible:outline-brand"
							>
								<span class="w-3 shrink-0 fill-cel-brand" aria-hidden="true"></span>
								<span class="flex min-w-0 flex-1 flex-col gap-2 p-tool">
									<span class="text-catalog text-ink-muted" aria-hidden="true"
										>Tape No.{String(i + 1).padStart(2, '0')} · {game.store} · ▶ Play</span
									>
									<span class="line-clamp-2 font-display text-xl leading-snug font-bold"
										>{game.name}</span
									>
									<span class="font-sans text-caption text-ink-muted">{game.store} · ตัวอย่าง</span>
									<span class="flex flex-wrap items-baseline gap-x-2">
										<span class="font-display text-price tabular-nums">{formatThb(game.price)}</span
										>
										<s class="font-sans text-caption text-ink-muted">{formatThb(game.regular)}</s>
										<span
											class={[
												'rotate-6 border-cel px-2 font-display text-lg font-bold',
												verdictCopy[verdict].className
											]}
										>
											−{game.discount}%
										</span>
									</span>
									<span class="mt-auto flex items-end justify-between gap-tool pt-tool">
										<span class="h-7 w-24 bg-pattern-barcode" aria-hidden="true"></span>
										<span
											class="flex items-center gap-1 font-display text-tool font-bold whitespace-nowrap"
										>
											เช็คเกมนี้ <ArrowRightIcon class="size-4" aria-hidden="true" />
										</span>
									</span>
								</span>
							</button>
						</li>
					{/each}
				</ul>
				{@render spec(
					'src/routes/+page.svelte (ดีลเด็ดคืนนี้ — ข้อมูลตัวอย่าง)',
					'Cel (border-cel, shadow-cel, fill-cel-brand สันเทป, ป้ายลดเอียง) + Vibe 2 อย่าง (text-catalog บรรทัด TAPE No., bg-pattern-barcode) + rounded-chunky — ใช้จริงแล้วบนหน้าแรก',
					'ต้องมีป้าย “ตัวอย่าง” กำกับทุกครั้งจนกว่าจะเป็นข้อมูลจริง · กดแล้วเติมชื่อเกมในช่องค้นหา · ห้ามติดสติกเกอร์ NEW LOW!'
				)}
			</article>

			<!-- Verdict block -->
			<article
				class="flex flex-col gap-tool-lg rounded-poster border-poster bg-surface-raised p-hero"
			>
				<h3 class="font-display text-display">Verdict block</h3>
				<div class="p-tool">
					<div
						class="grid grid-cols-1 border-cel bg-surface-raised shadow-cel sm:grid-cols-[minmax(0,13rem)_1fr]"
					>
						<div
							class={[
								'flex items-center justify-center border-b-(length:--border-width-cel) border-border px-hero py-hero sm:border-r-(length:--border-width-cel) sm:border-b-0',
								verdictCopy.mega.className
							]}
						>
							<span class="flex -rotate-6 flex-col items-center gap-1 text-center">
								<span class="font-display text-[2rem] leading-none font-bold"
									>{verdictCopy.mega.stamp}</span
								>
								<span class="font-sans text-tool leading-tight font-semibold"
									>{verdictCopy.mega.sub}</span
								>
							</span>
						</div>
						<div class="flex flex-col justify-center gap-2 p-hero">
							<p class="font-display text-display">{verdictCopy.mega.label}</p>
							<p class="font-sans text-tool">Steam ไทยลด 80% จากราคาเต็ม</p>
							<p class="font-sans text-caption text-ink-muted">
								ตัดสินจากส่วนลดบน Steam ไทยอย่างเดียว — เรายังไม่ได้เก็บประวัติราคา
							</p>
						</div>
					</div>
				</div>
				{@render spec(
					'src/routes/game/[appid]/+page.svelte (บล็อกคำตัดสินบนสุด)',
					'Cel (fill-cel-* จาก verdictCopy, border-cel, shadow-cel, ป้ายเอียง) + ชั้นฐาน (ข้อความ)',
					'หนึ่งบล็อกต่อหน้า บอกเหตุผล (ส่วนลดบน Steam ไทย) ใต้คำตัดสินเสมอ'
				)}
			</article>

			<!-- NO SIGNAL panel -->
			<article
				class="flex flex-col gap-tool-lg rounded-poster border-poster bg-surface-raised p-hero"
			>
				<h3 class="font-display text-display">NO SIGNAL panel</h3>
				<div class="grid grid-cols-1 gap-tool-lg p-tool sm:grid-cols-3">
					<div
						class="no-signal relative flex min-h-32 flex-col items-center justify-center gap-1 border-cel bg-surface-raised p-hero text-center"
					>
						<p class="relative font-display text-display tracking-[0.2em] uppercase">Scanning…</p>
						<p class="relative font-sans text-caption text-ink-muted">กำลังหาในร้านค้า</p>
					</div>
					<div
						class="no-signal relative flex min-h-32 flex-col items-center justify-center gap-1 border-cel bg-surface-raised p-hero text-center"
					>
						<p class="relative font-display text-display tracking-[0.2em] uppercase">Signal lost</p>
						<p class="relative font-sans text-caption text-ink-muted">ดึงข้อมูลไม่สำเร็จ ลองใหม่</p>
					</div>
					<div
						class="no-signal relative flex min-h-32 flex-col items-center justify-center gap-1 border-cel bg-surface-raised p-hero text-center"
					>
						<p class="relative font-display text-display tracking-[0.2em] uppercase">No signal</p>
						<p class="relative font-sans text-caption text-ink-muted">ไม่เจอผลลัพธ์ ลองสะกดใหม่</p>
					</div>
				</div>
				{@render spec(
					'src/routes/+page.svelte (ผลค้นหา) · src/routes/game/[appid]/+page.svelte (โหลด / ผิดพลาด / ไม่มีร้าน)',
					'ชั้นฐาน (bg-surface-raised, border-cel) + สัญญาณรบกวนคงที่ (.no-signal::before)',
					'ใช้กับสถานะของระบบเท่านั้น — ห้ามใช้แทนป้ายราคา'
				)}
			</article>

			<!-- Buttons -->
			<article
				class="flex flex-col gap-tool-lg rounded-poster border-poster bg-surface-raised p-hero"
			>
				<h3 class="font-display text-display">Buttons</h3>
				<div class="flex flex-col gap-hero-lg p-tool">
					<div class="flex flex-wrap items-center gap-tool-lg">
						<button
							type="button"
							class="flex items-center gap-2 border-cel px-4 py-2 font-display text-xl font-bold text-brand-foreground uppercase fill-cel-brand focus-visible:outline-cel-line"
						>
							ค้นเลย! <ArrowRightIcon class="size-6" aria-hidden="true" />
						</button>
						<button
							type="button"
							class="flex items-center gap-2 border-cel px-4 py-2 font-display text-lg font-bold text-brand-foreground fill-cel-brand focus-visible:outline-cel-line"
						>
							ไปที่ Steam <ExternalLinkIcon class="size-4" aria-hidden="true" />
						</button>
						<button
							type="button"
							class="flex items-center gap-2 border-poster bg-surface-raised px-3 py-1 font-display text-tool font-bold"
						>
							<ArrowLeftIcon class="size-4" aria-hidden="true" /> ค้นเกมอื่น
						</button>
					</div>
					<div class="bg-pattern-stripe p-tool">
						<button
							type="button"
							class="border-cel bg-ink px-hero py-tool font-display text-xl font-bold text-price-deal-foreground uppercase shadow-cel-brand fill-cel-deal focus-visible:outline-brand"
						>
							ค้นเกมถูกเลย →
						</button>
					</div>
				</div>
				{@render spec(
					'src/routes/+page.svelte (ค้นเลย!, CTA ท้ายหน้า) · src/routes/game/[appid]/+page.svelte (ไปที่ Steam, ค้นเกมอื่น)',
					'Cel (fill-cel-brand / fill-cel-deal, border-cel, shadow-cel-brand) + ชั้นฐาน (border-poster สำหรับปุ่มรอง)',
					'ปุ่มหลักมีได้หนึ่งปุ่มต่อหนึ่งมุมมอง · ปุ่มรองใช้กรอบขอบแข็งบนพื้นกระดาษ · “ไปที่ Steam” คือลิงก์ออกไปหน้าร้าน Steam'
				)}
			</article>

			<!-- Theme switch -->
			<article
				class="flex flex-col gap-tool-lg rounded-poster border-poster bg-surface-raised p-hero"
			>
				<h3 class="font-display text-display">Theme switch</h3>
				<div class="flex items-center gap-tool p-tool">
					<ThemeSwitch />
					<p class="font-sans text-tool text-ink-muted">
						กดเพื่อสลับ สว่าง / มืด / ตามระบบ — ทั้งหน้านี้เปลี่ยนตามทันที
					</p>
				</div>
				{@render spec(
					'src/lib/components/ThemeSwitch.svelte · header ของหน้า landing, หน้าเกม และแถบสารบัญหน้านี้',
					'Cel (bg-cel-line, border-cel, shadow-cel-brand, bg-pattern-stripe, fill-cel-deal ตอนโฟกัส, fill-cel-brand ตัวที่เลือก) + mode-watcher (.dark บน <html>)',
					'หนึ่งปุ่มต่อหน้า อยู่มุมขวาของ header · เมนูตกลงมาแรงแล้วดีดกลับ ปิด motion เมื่อ reduced motion'
				)}
			</article>

			<!-- Ticker tape -->
			<article
				class="flex flex-col gap-tool-lg rounded-poster border-poster bg-surface-raised p-hero"
			>
				<h3 class="font-display text-display">Ticker tape</h3>
				<div class="flex flex-col gap-hero overflow-hidden py-tool">
					<div
						class="tape -rotate-2 border-y-(length:--border-width-cel) border-border bg-cel-line"
					>
						<div class="flex w-max animate-marquee">
							{#each [0, 1] as copy (copy)}
								<ul class="flex shrink-0" aria-hidden={copy === 1}>
									<li
										class="px-hero py-2 font-display text-lg font-bold tracking-wide whitespace-nowrap text-price-deal uppercase"
									>
										★ ตัวอย่าง · Hollow Knight {formatThb(139)}
										<span class="text-brand">−75%</span>
									</li>
								</ul>
							{/each}
						</div>
					</div>
					<div
						class="tape relative -rotate-[0.5deg] border-y-(length:--border-width-cel) border-border fill-cel-deal"
						aria-hidden="true"
					>
						<div class="flex w-max animate-marquee [animation-direction:reverse]">
							{#each [0, 1] as copy (copy)}
								<p
									class="shrink-0 px-hero py-1.5 font-display text-caption font-bold tracking-wide whitespace-nowrap text-price-deal-foreground uppercase"
								>
									{tickerText.repeat(6)}
								</p>
							{/each}
						</div>
					</div>
				</div>
				{@render spec(
					'src/routes/+page.svelte (แถบเทประหว่างฮีโร่กับดีลเด็ด)',
					'Cel (bg-cel-line, fill-cel-deal ลายแถบ) + Base (border-border) + animate-marquee',
					'ตกแต่งเท่านั้น (aria-hidden) — ห้ามมีข้อมูลเดียวที่ผู้ใช้ต้องรู้ไว้ในแถบนี้'
				)}
			</article>

			<!-- Verdict sticker (vibe) -->
			<article
				class="flex flex-col gap-tool-lg rounded-poster border-poster bg-surface-raised p-hero"
			>
				<h3 class="font-display text-display">
					Verdict sticker <span class="text-catalog text-ink-muted">· Vibe</span>
				</h3>
				<p class="font-sans text-tool text-ink-muted">
					ป้ายแปะแบบ die-cut ส่วน “Now” คือบล็อกที่หน้าเว็บใช้จริง ส่วน “Vibe”
					คือสติกเกอร์ที่ใช้ดูบรรยากาศ
				</p>
				<ul class="flex flex-col gap-tool-lg p-tool">
					{#each tiers as tier (tier)}
						<li
							class="grid grid-cols-[7rem_1fr] items-center gap-x-hero gap-y-tool rounded-poster border-poster bg-surface p-tool sm:grid-cols-[minmax(0,1fr)_7rem_12rem]"
						>
							<div class="col-span-2 flex flex-col gap-1 sm:col-span-1">
								<span class="text-catalog text-ink-muted">verdict: {tier}</span>
								<span class="font-sans text-tool">{verdictCopy[tier].label}</span>
							</div>
							<div class="flex flex-col items-center gap-1">
								<span
									class={[
										'flex h-20 w-28 flex-col items-center justify-center gap-0.5 border-cel px-1 text-center',
										verdictCopy[tier].className
									]}
								>
									<span class="font-display text-base leading-none font-bold"
										>{verdictCopy[tier].stamp}</span
									>
									<span class="font-sans text-caption leading-tight font-semibold"
										>{verdictCopy[tier].sub}</span
									>
								</span>
								<span class="text-catalog text-ink-muted">Now</span>
							</div>
							<div
								class="col-span-2 flex min-h-36 flex-col items-center justify-center gap-tool sm:col-span-1"
							>
								{#key slapKey}
									<VerdictSticker kind={tier} />
								{/key}
								<span class="text-catalog text-ink-muted">Vibe</span>
							</div>
						</li>
					{/each}
					<li
						class="grid grid-cols-[7rem_1fr] items-center gap-x-hero gap-y-tool rounded-poster border-poster bg-surface p-tool sm:grid-cols-[minmax(0,1fr)_7rem_12rem]"
					>
						<div class="col-span-2 flex flex-col gap-1 sm:col-span-1">
							<span class="text-catalog text-ink-muted">factual overlay: new-low</span>
							<span class="font-sans text-tool">{newLowCopy.stamp} · {newLowCopy.sub}</span>
						</div>
						<div class="flex flex-col items-center gap-1">
							<span
								class="flex h-20 w-28 flex-col items-center justify-center gap-0.5 border-cel bg-cel-line px-1 text-center text-price-deal"
							>
								<span class="font-display text-base leading-none font-bold">NEW LOW!</span>
								<span class="font-sans text-caption leading-tight font-semibold"
									>{newLowCopy.sub}</span
								>
							</span>
							<span class="text-catalog text-ink-muted">Overlay</span>
						</div>
						<div
							class="col-span-2 flex min-h-36 flex-col items-center justify-center gap-tool sm:col-span-1"
						>
							{#key slapKey}
								<VerdictSticker kind="new-low" />
							{/key}
							<span class="text-catalog text-ink-muted">Vibe</span>
						</div>
					</li>
				</ul>
				{@render spec(
					'src/lib/components/VerdictSticker.svelte (พรีวิว — ใช้ในหน้านี้เท่านั้น ยังไม่ขึ้นหน้าจริง)',
					'Vibe (sticker-die-cut, sticker-burst, animate-sticker-slap, rounded-chunky) + Cel (fill-cel-*)',
					'สูงสุด 1–2 อย่างของ vibe ต่อชิ้น ห้ามวางบนช่องราคาหรือโซนเครื่องมือ · NEW LOW! ห้ามขึ้นหน้าจริงจนกว่าจะมีประวัติราคาจริง (P0)'
				)}
			</article>
		</section>

		<!-- ===================== MOTION ===================== -->
		<section
			id="motion"
			class="flex scroll-mt-24 flex-col gap-hero"
			aria-labelledby="motion-heading"
		>
			<div class="flex flex-col gap-tool">
				<h2 id="motion-heading" class="font-display text-display">Motion</h2>
				<p class="font-sans text-tool text-ink-muted">
					โทเคนการเคลื่อนไหว และตัวอย่างเล่นซ้ำ · หากผู้ใช้ตั้งค่า reduced motion ไว้ CSS
					จะย่อให้เหลือเกือบศูนย์ และราคาหมุนจะเปลี่ยนทันที
				</p>
			</div>

			<ul class="flex flex-col gap-tool rounded-poster border-poster bg-surface-raised p-tool">
				{#each motionTokens as m (m.token)}
					<li
						class="grid grid-cols-1 gap-x-tool gap-y-1 font-sans text-tool sm:grid-cols-[13rem_9rem_1fr]"
					>
						<code class="text-caption font-semibold break-all">{m.token}</code>
						<span class="text-caption text-ink-muted">{m.value}</span>
						<span>{m.purpose}</span>
					</li>
				{/each}
			</ul>

			<div class="flex flex-wrap items-center gap-tool">
				<span class="font-sans text-caption text-ink-muted">เล่น motion ซ้ำ:</span>
				<button
					type="button"
					class="rounded-poster border-poster bg-surface-raised px-tool py-1.5 font-display text-tool font-bold"
					onclick={() => slapKey++}>▶ สติกเกอร์ตบ</button
				>
				<button
					type="button"
					class="rounded-poster border-poster bg-surface-raised px-tool py-1.5 font-display text-tool font-bold"
					onclick={() => flipKey++}>▶ เปลี่ยนช่อง</button
				>
				<button
					type="button"
					class="rounded-poster border-poster bg-surface-raised px-tool py-1.5 font-display text-tool font-bold"
					onclick={rollPrice}>▶ หมุนราคา</button
				>
			</div>

			<div class="grid grid-cols-1 gap-hero-lg md:grid-cols-2">
				<figure class="flex flex-col gap-tool">
					<div class="rounded-[18px] border-cel bg-cel-line p-3 shadow-poster">
						<div class="relative overflow-hidden rounded-chunky">
							{#key flipKey}
								<img
									src="https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1113000/header.jpg"
									alt=""
									width="460"
									height="215"
									class="aspect-460/215 w-full animate-channel-flip bg-muted object-cover"
								/>
							{/key}
							<span class="absolute inset-0 bg-pattern-scan" aria-hidden="true"></span>
							<span
								class="absolute top-2 left-2 bg-cel-line px-1.5 py-0.5 text-catalog text-price-deal"
								aria-hidden="true">● Rec · CH-07</span
							>
						</div>
					</div>
					<figcaption class="font-sans text-caption text-ink-muted">
						กรอบจอ CRT สำหรับรูปเกม · <span class="text-catalog">animate-channel-flip</span>
					</figcaption>
				</figure>

				<figure class="flex flex-col gap-tool">
					<div class="relative pt-6 pr-4">
						<article
							class="flex overflow-hidden rounded-chunky border-cel bg-surface-raised shadow-cel"
						>
							<span class="w-3 shrink-0 fill-cel-brand" aria-hidden="true"></span>
							<div class="flex min-w-0 flex-1 flex-col gap-2 p-tool">
								<p class="text-catalog text-ink-muted">Tape No.1113000 · Steam · ▶ Play</p>
								<h4 class="font-display text-display leading-tight">Persona 4 Golden</h4>
								<p class="font-display text-price tabular-nums">
									{formatThb(Math.round(price.current))}
								</p>
								<div class="flex items-end justify-between gap-tool">
									<span class="h-7 w-32 bg-pattern-barcode" aria-hidden="true"></span>
									<span class="text-catalog text-ink-muted">SP · 120 min</span>
								</div>
							</div>
						</article>
						<span class="absolute top-0 right-0">
							{#key slapKey}
								<VerdictSticker kind="new-low" />
							{/key}
						</span>
					</div>
					<figcaption class="font-sans text-caption text-ink-muted">
						ฉลากเทป + สติกเกอร์ NEW LOW! (แปะเฉพาะตอนแตะราคาต่ำสุด) · ราคาหมุนแบบมิเตอร์
					</figcaption>
				</figure>
			</div>

			<p class="font-sans text-caption text-ink-muted">
				<a href={resolve('/')} class="underline">กลับหน้าแรก</a>
			</p>
		</section>
	</div>
</main>

<style>
	/* --- Static noise behind NO SIGNAL panels (copied from the landing page) --- */
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

	/* --- Search bar focus: lift the frame, show the caution tape (copied from the landing page) --- */
	.search-skin {
		transition:
			translate 0.25s var(--ease-snap),
			box-shadow 0.25s var(--ease-snap);
	}

	.search-tape {
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
</style>
