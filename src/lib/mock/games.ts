// Mock data for the landing page's "tonight's deals" section only (search is live now).

import type { Verdict } from '#lib/verdict.js';

export type { Verdict };

export type Game = {
	id: string;
	name: string;
	aliases: string[];
	/** THB, null = no price data yet */
	price: number | null;
	regular: number | null;
};

export const games: Game[] = [
	{
		id: 'p4g',
		name: 'Persona 4 Golden',
		aliases: ['p4g', 'persona 4', 'เพอร์โซน่า 4'],
		price: 289,
		regular: 719
	},
	{
		id: 'p5r',
		name: 'Persona 5 Royal',
		aliases: ['p5r', 'persona 5', 'เพอร์โซน่า 5'],
		price: 899,
		regular: 1799
	},
	{
		id: 'metaphor',
		name: 'Metaphor: ReFantazio',
		aliases: ['metaphor', 'เมตาฟอร์'],
		price: 1439,
		regular: 2399
	},
	{
		id: 'elden-ring',
		name: 'Elden Ring',
		aliases: ['elden', 'เอลเดนริง'],
		price: 1190,
		regular: 1790
	},
	{
		id: 'celeste',
		name: 'Celeste',
		aliases: ['เซเลสต์'],
		price: 63,
		regular: 315
	},
	{
		id: 'disco-elysium',
		name: 'Disco Elysium',
		aliases: ['disco'],
		price: 125,
		regular: 829
	},
	{
		id: 'stardew',
		name: 'Stardew Valley',
		aliases: ['stardew', 'สตาร์ดิว'],
		price: 157,
		regular: 315
	},
	{
		id: 'bg3',
		name: "Baldur's Gate 3",
		aliases: ['bg3', 'baldur'],
		price: 1399,
		regular: 1999
	},
	{
		id: 'cyberpunk',
		name: 'Cyberpunk 2077',
		aliases: ['cyberpunk', 'ไซเบอร์พังก์'],
		price: 699,
		regular: 1399
	},
	{
		id: 'hades-2',
		name: 'Hades II',
		aliases: ['hades', 'เฮดีส'],
		price: 455,
		regular: 455
	},
	{
		id: 'silksong',
		name: 'Hollow Knight: Silksong',
		aliases: ['silksong', 'hollow knight'],
		price: 499,
		regular: 499
	},
	{
		id: 'smt5v',
		name: 'Shin Megami Tensei V: Vengeance',
		aliases: ['smt', 'smt5', 'shin megami'],
		price: null,
		regular: null
	}
];

export function discountOf(game: Game): number {
	if (game.price === null || !game.regular) return 0;
	return Math.round((1 - game.price / game.regular) * 100);
}

export function verdictOf(game: Game): Verdict {
	if (game.price === null) return 'no-signal';
	const discount = discountOf(game);
	if (discount >= 70) return 'mega';
	if (discount >= 30) return 'deal';
	return 'standby';
}
