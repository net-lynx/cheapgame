import { json } from '@sveltejs/kit';
import { searchSteam } from '#lib/server/prices/steam.js';
import type { RequestHandler } from './$types';

const MAX_QUERY_LENGTH = 80;
const MAX_RESULTS = 6;

export const GET: RequestHandler = async ({ url, fetch, setHeaders }) => {
	// Collapse whitespace / strip control chars, cap length.
	const q = (url.searchParams.get('q') ?? '')
		// eslint-disable-next-line no-control-regex
		.replace(/[\u0000-\u001f\u007f]/g, ' ')
		.replace(/\s+/g, ' ')
		.trim()
		.slice(0, MAX_QUERY_LENGTH);

	if (q.length < 2) return json({ q, results: [] });

	try {
		const items = await searchSteam(fetch, q, MAX_RESULTS);
		setHeaders({ 'cache-control': 'public, max-age=60' });
		return json({ q, results: items });
	} catch (e) {
		console.error('[api/search] steam search failed:', e instanceof Error ? e.message : e);
		return json({ q, results: [], error: 'search_unavailable' }, { status: 502 });
	}
};
