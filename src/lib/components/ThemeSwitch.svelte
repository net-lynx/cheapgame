<script lang="ts">
	import { DropdownMenu } from 'bits-ui';
	import { MediaQuery } from 'svelte/reactivity';
	import type { TransitionConfig } from 'svelte/transition';
	import { cubicIn, cubicInOut, cubicOut } from 'svelte/easing';
	import { setMode, userPrefersMode } from 'mode-watcher';
	import SunIcon from '@lucide/svelte/icons/sun';
	import MoonIcon from '@lucide/svelte/icons/moon';
	import MonitorIcon from '@lucide/svelte/icons/monitor';
	import CheckIcon from '@lucide/svelte/icons/check';

	type ThemeChoice = 'light' | 'dark' | 'system';

	const options = [
		{ value: 'light', label: 'สว่าง', english: 'Light', icon: SunIcon },
		{ value: 'dark', label: 'มืด', english: 'Dark', icon: MoonIcon },
		{ value: 'system', label: 'ตามระบบ', english: 'System', icon: MonitorIcon }
	] as const satisfies readonly {
		value: ThemeChoice;
		label: string;
		english: string;
		icon: typeof SunIcon;
	}[];

	const reducedMotion = new MediaQuery('(prefers-reduced-motion: reduce)');
	const motion = (ms: number) => (reducedMotion.current ? 0 : ms);

	const current = $derived(options.find((o) => o.value === userPrefersMode.current) ?? options[2]);
	const CurrentIcon = $derived(current.icon);

	function choose(value: string) {
		const next = options.find((o) => o.value === value);
		if (next) setMode(next.value);
	}

	/** Panel drops in hard: whip down past the mark, hit, squash, settle. Revealed from the trigger edge. */
	function slam(_node: Element, { duration = 340 }: { duration?: number } = {}): TransitionConfig {
		const DROP = 56; // px travelled
		const OVERSHOOT = 7; // px past the resting position at impact
		const LAND = 0.62; // fraction of the timeline spent falling
		return {
			duration,
			css: (t) => {
				if (t < LAND) {
					const p = cubicInOut(t / LAND);
					const ty = -DROP + (DROP + OVERSHOOT) * p;
					const clip = `calc(${((1 - p) * 100).toFixed(2)}% - ${(p * 16).toFixed(2)}px)`;
					return `translate: 0 ${ty.toFixed(2)}px; clip-path: inset(0 -16px ${clip} -16px);`;
				}
				// impact: squash, then settle back with a quick ease-out
				const s = cubicOut((t - LAND) / (1 - LAND));
				const ty = OVERSHOOT * (1 - s);
				const squashY = 1 - 0.06 * (1 - s);
				const stretchX = 1 + 0.025 * (1 - s);
				return `translate: 0 ${ty.toFixed(2)}px; scale: ${stretchX.toFixed(4)} ${squashY.toFixed(4)}; clip-path: inset(0 -16px -16px -16px);`;
			}
		};
	}

	/** Closing snaps back up: short cubic-in, no overshoot. */
	function snapUp(
		_node: Element,
		{ duration = 150 }: { duration?: number } = {}
	): TransitionConfig {
		return {
			duration,
			css: (t, u) => {
				const e = cubicIn(u);
				return `translate: 0 ${(-48 * e).toFixed(2)}px; clip-path: inset(0 -16px calc(${(e * 100).toFixed(2)}% - ${((1 - e) * 16).toFixed(2)}px) -16px);`;
			}
		};
	}
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger
		aria-label="เปลี่ยนธีม (ตอนนี้: {current.label})"
		class={[
			'inline-flex size-10 shrink-0 cursor-pointer items-center justify-center border-poster bg-surface-raised text-ink shadow-poster',
			'transition-[translate,box-shadow] duration-100',
			'hover:text-price-deal-foreground hover:fill-cel-deal',
			'active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0_0_var(--color-ink)]',
			'data-[state=open]:bg-cel-line data-[state=open]:[background-image:none] data-[state=open]:text-brand-foreground'
		]}
	>
		<CurrentIcon class="size-5" aria-hidden="true" />
	</DropdownMenu.Trigger>

	<DropdownMenu.Portal>
		<DropdownMenu.Content
			forceMount
			align="end"
			sideOffset={10}
			collisionPadding={12}
			class="z-50 outline-none"
		>
			{#snippet child({ wrapperProps, props, open })}
				<div {...wrapperProps}>
					{#if open}
						<div
							{...props}
							in:slam={{ duration: motion(340) }}
							out:snapUp={{ duration: motion(150) }}
							class={[
								'w-56 origin-top border-cel bg-cel-line text-brand-foreground shadow-cel-brand outline-none',
								'max-w-[calc(100vw-1.5rem)]'
							]}
						>
							<div
								class="h-3 border-b-[3px] border-cel-line bg-pattern-stripe"
								aria-hidden="true"
							></div>
							<p
								class="flex items-baseline justify-between px-3 pt-2 pb-1 font-display text-caption font-bold"
								aria-hidden="true"
							>
								<span>เลือกธีม</span>
								<span class="tracking-[0.2em] text-price-deal uppercase">Theme</span>
							</p>

							<DropdownMenu.RadioGroup
								value={userPrefersMode.current}
								onValueChange={choose}
								aria-label="ธีมหน้าจอ"
								class="flex flex-col gap-1.5 p-2 pt-1"
							>
								{#each options as option (option.value)}
									<DropdownMenu.RadioItem value={option.value}>
										{#snippet child({ props, checked })}
											<div
												{...props}
												class={[
													'skew-cel cursor-pointer',
													'data-highlighted:text-price-deal-foreground data-highlighted:fill-cel-deal',
													'data-highlighted:outline-3 data-highlighted:-outline-offset-[5px] data-highlighted:outline-cel-line',
													checked ? 'text-brand-foreground fill-cel-brand' : 'text-brand-foreground'
												]}
											>
												<span
													class="flex unskew-cel items-center gap-3 px-3 py-2.5 font-display font-bold"
												>
													<option.icon class="size-5 shrink-0" aria-hidden="true" />
													<span class="flex min-w-0 flex-1 flex-col leading-tight">
														<span class="text-body">{option.label}</span>
														<span
															class="text-[0.6875rem] font-semibold tracking-[0.2em] uppercase opacity-80"
															aria-hidden="true"
														>
															{option.english}
														</span>
													</span>
													{#if checked}
														<CheckIcon
															class="size-5 shrink-0"
															stroke-width={3.5}
															aria-hidden="true"
														/>
													{/if}
												</span>
											</div>
										{/snippet}
									</DropdownMenu.RadioItem>
								{/each}
							</DropdownMenu.RadioGroup>
						</div>
					{/if}
				</div>
			{/snippet}
		</DropdownMenu.Content>
	</DropdownMenu.Portal>
</DropdownMenu.Root>
