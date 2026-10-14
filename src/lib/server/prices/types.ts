/** Shared types for the price modules. Server-only (lives under $lib/server). */
import type { SearchResult } from '#lib/types.js';
import type { Verdict } from '#lib/verdict.js';

export type Fetch = typeof fetch;

/** One game as returned by Steam search. Prices are THB in whole baht (not satang). */
export type SteamSearchItem = SearchResult;

export type SteamGame = {
	appid: number;
	name: string;
	image: string | null;
	isFree: boolean;
	price: SteamPrice | null;
};

/** Steam price for one app, in THB (baht, may include satang). */
export type SteamPrice = { initial: number; final: number; discountPercent: number };

/** Result of checking one Steam app. Steam is the only price source. */
export type SteamCheck =
	| {
			status: 'ok';
			game: SteamGame;
			url: string;
			verdict: {
				kind: Verdict;
				discountPercent: number;
				reason: string;
			};
			fetchedAt: number;
	  }
	| { status: 'not-found' }
	/** Steam could not be reached (as opposed to "Steam says no such app"). */
	| { status: 'error'; message: string };
