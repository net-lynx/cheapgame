/**
 * Steam cover art with a fallback chain. Shared by the result row, the disc case and the design guide.
 *
 * Order (best first): portrait library cover → plain landscape header → the capsule URL Steam's
 * storesearch already returned for this app → token-styled placeholder (the caller's job).
 * Newer apps keep their art under a hashed folder, so `library_600x900` / `header` 404 for them;
 * the storesearch capsule is the only file whose URL we can know for those.
 */

export type CoverSource = {
	src: string;
	kind: 'portrait' | 'landscape';
	/** Intrinsic size, so the <img> can reserve space before it loads. */
	width: number;
	height: number;
};

const STEAM_ASSETS = 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps';

export const coverUrl = (appid: number) => `${STEAM_ASSETS}/${appid}/library_600x900.jpg`;
export const headerUrl = (appid: number) => `${STEAM_ASSETS}/${appid}/header.jpg`;

/** Candidates for one game, best first. `capsule` is `SearchResult.image` (storesearch `tiny_image`). */
export function coverSources(appid: number, capsule?: string | null): CoverSource[] {
	const out: CoverSource[] = [];
	if (Number.isInteger(appid) && appid > 0) {
		out.push(
			{ src: coverUrl(appid), kind: 'portrait', width: 600, height: 900 },
			{ src: headerUrl(appid), kind: 'landscape', width: 460, height: 215 }
		);
	}
	if (capsule?.startsWith('https://')) {
		out.push({ src: capsule, kind: 'landscape', width: 231, height: 87 });
	}
	return out;
}
