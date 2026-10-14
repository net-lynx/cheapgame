/**
 * Tiny in-memory TTL cache with in-flight de-duplication.
 * Failures are never cached (the loader's rejection propagates and the key is dropped).
 */
type Entry = { expires: number; value: Promise<unknown> };

const store = new Map<string, Entry>();
const MAX_ENTRIES = 500;

export const TEN_MINUTES = 10 * 60 * 1000;
export const ONE_DAY = 24 * 60 * 60 * 1000;

export function cached<T>(key: string, ttlMs: number, loader: () => Promise<T>): Promise<T> {
	const now = Date.now();
	const hit = store.get(key);
	if (hit && hit.expires > now) return hit.value as Promise<T>;

	if (store.size >= MAX_ENTRIES) {
		for (const [k, e] of store) if (e.expires <= now) store.delete(k);
		// still full: drop the oldest insertion
		if (store.size >= MAX_ENTRIES) store.delete(store.keys().next().value as string);
	}

	const value = loader();
	const entry: Entry = { expires: now + ttlMs, value };
	store.set(key, entry);
	value.catch(() => {
		if (store.get(key) === entry) store.delete(key);
	});
	return value;
}

/** User-Agent for Steam requests. Deliberately contains no contact details. */
export const USER_AGENT = 'isthisgamecheap-demo/0.1';
export const REQUEST_TIMEOUT_MS = 6000;

export async function getJson(fetchFn: typeof fetch, url: string, init?: RequestInit) {
	const res = await fetchFn(url, {
		...init,
		headers: { 'user-agent': USER_AGENT, accept: 'application/json', ...init?.headers },
		signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
	});
	if (!res.ok) throw new Error(`${new URL(url).hostname} responded ${res.status}`);
	return (await res.json()) as unknown;
}
