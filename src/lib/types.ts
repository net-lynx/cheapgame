/** One Steam search hit as returned by GET /api/search. Prices are THB in whole baht. */
export type SearchResult = {
	appid: number;
	name: string;
	image: string | null;
	price: { initial: number; final: number; discountPercent: number } | null;
};

export type SearchResponse = {
	q: string;
	results: SearchResult[];
	error?: string;
};
