import { error } from '@sveltejs/kit';
import { checkSteam } from '#lib/server/prices/compare.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, fetch, setHeaders }) => {
	if (!/^\d{1,9}$/.test(params.appid)) error(404, 'ไม่พบเกมนี้');
	const appid = Number(params.appid);

	// Steam is the only price source. checkSteam never rejects: a Steam outage comes back as
	// `status: 'error'` and the page renders a friendly state instead of crashing.
	const check = await checkSteam(fetch, appid);
	if (check.status === 'not-found') error(404, 'ไม่พบเกมนี้ใน Steam');
	if (check.status === 'error') {
		console.error('[game] steam lookup failed:', check.message);
		setHeaders({ 'cache-control': 'no-store' });
		return { appid, check: { status: 'error' as const } };
	}

	setHeaders({ 'cache-control': 'private, max-age=60' });
	return { appid, check };
};
