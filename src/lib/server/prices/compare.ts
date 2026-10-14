import { verdictFromDiscount } from '#lib/verdict.js';
import { getSteamGame, steamStoreUrl } from './steam.js';
import type { Fetch, SteamCheck, SteamGame } from './types.js';

const messageOf = (e: unknown) => (e instanceof Error ? e.message : 'unknown error');

/**
 * Tier comes from the Steam (THB) discount only: we keep no price history, so there is no
 * "all-time low" signal. Free games and games without a Thai price get NO SIGNAL.
 */
function judge(game: SteamGame): Extract<SteamCheck, { status: 'ok' }>['verdict'] {
	if (game.isFree) {
		return {
			kind: 'no-signal',
			discountPercent: 0,
			reason: 'เกมนี้เล่นฟรีบน Steam ไม่มีราคาให้ตัดสิน'
		};
	}
	if (!game.price) {
		return {
			kind: 'no-signal',
			discountPercent: 0,
			reason: 'ยังไม่มีราคาบน Steam ไทย (อาจยังไม่วางขาย หรือไม่ได้ขายในไทย)'
		};
	}
	const d = game.price.discountPercent;
	return {
		kind: verdictFromDiscount(true, d),
		discountPercent: d,
		reason: d > 0 ? `Steam ไทยลด ${d}% จากราคาเต็ม` : 'ตอนนี้ Steam ไทยขายราคาเต็ม ไม่มีส่วนลด'
	};
}

/** Never rejects: a Steam failure becomes `{ status: 'error' }` so the page can render it. */
export async function checkSteam(fetchFn: Fetch, appid: number): Promise<SteamCheck> {
	try {
		const game = await getSteamGame(fetchFn, appid);
		if (!game) return { status: 'not-found' };
		return {
			status: 'ok',
			game,
			url: steamStoreUrl(appid),
			verdict: judge(game),
			fetchedAt: Date.now()
		};
	} catch (e) {
		return { status: 'error', message: messageOf(e) };
	}
}
