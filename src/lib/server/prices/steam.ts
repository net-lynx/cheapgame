/**
 * Steam storefront (UNOFFICIAL, undocumented endpoints — be gentle, cache everything).
 *  - storesearch: name search + price (THB, satang)
 *  - appdetails:  single-app name/image/price
 */
import { cached, getJson, TEN_MINUTES } from './cache.js';
import type { Fetch, SteamGame, SteamSearchItem } from './types.js';

type Rec = Record<string, unknown>;
const isRec = (v: unknown): v is Rec => typeof v === 'object' && v !== null && !Array.isArray(v);

/** Steam prices are integers in the smallest unit (satang). */
function parsePrice(raw: unknown): SteamSearchItem['price'] {
	if (!isRec(raw)) return null;
	const initial = Number(raw.initial);
	const final = Number(raw.final);
	if (!Number.isFinite(initial) || !Number.isFinite(final) || initial <= 0) return null;
	const discountPercent =
		isRec(raw) && Number.isFinite(Number(raw.discount_percent))
			? Number(raw.discount_percent)
			: Math.max(0, Math.round((1 - final / initial) * 100));
	return { initial: initial / 100, final: final / 100, discountPercent };
}

const httpsOnly = (v: unknown) => (typeof v === 'string' && v.startsWith('https://') ? v : null);

export function steamStoreUrl(appid: number) {
	return `https://store.steampowered.com/app/${appid}/`;
}

export function searchSteam(fetchFn: Fetch, term: string, limit = 6): Promise<SteamSearchItem[]> {
	const key = `steam:search:${term.toLowerCase()}:${limit}`;
	return cached(key, TEN_MINUTES, async () => {
		const url = new URL('https://store.steampowered.com/api/storesearch/');
		url.search = new URLSearchParams({ term, cc: 'th', l: 'english' }).toString();
		const body = await getJson(fetchFn, url.toString());
		const items = isRec(body) && Array.isArray(body.items) ? body.items : [];
		const out: SteamSearchItem[] = [];
		for (const item of items) {
			if (!isRec(item) || item.type !== 'app') continue;
			const appid = Number(item.id);
			if (!Number.isInteger(appid) || typeof item.name !== 'string') continue;
			out.push({
				appid,
				name: item.name.trim(),
				image: httpsOnly(item.tiny_image),
				price: parsePrice(item.price)
			});
			if (out.length >= limit) break;
		}
		return out;
	});
}

/** Returns null when Steam says the app does not exist / is not available in the TH store. */
export function getSteamGame(fetchFn: Fetch, appid: number): Promise<SteamGame | null> {
	return cached(`steam:app:${appid}`, TEN_MINUTES, async () => {
		const url = new URL('https://store.steampowered.com/api/appdetails');
		url.search = new URLSearchParams({
			appids: String(appid),
			cc: 'th',
			l: 'english',
			filters: 'basic,price_overview'
		}).toString();
		const body = await getJson(fetchFn, url.toString());
		const entry = isRec(body) ? body[String(appid)] : null;
		if (!isRec(entry) || entry.success !== true) return null;
		// Apps with no price (unreleased, some free) come back with `data: []` rather than an object.
		const data = entry.data;
		if (!isRec(data) || typeof data.name !== 'string') return null;
		return {
			appid,
			name: data.name.trim(),
			image: httpsOnly(data.header_image),
			isFree: data.is_free === true,
			price: parsePrice(data.price_overview)
		};
	});
}
