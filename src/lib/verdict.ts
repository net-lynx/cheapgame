/** Verdict vocabulary shared by the landing page, search results and compare page. */

export type Verdict = 'mega' | 'deal' | 'standby' | 'no-signal';

export const MEGA_DISCOUNT = 70;
export const DEAL_DISCOUNT = 30;

/**
 * TV-ad vocabulary (set A). `stamp` is the big Latin label, `sub` the short Thai tagline
 * (never letter-spaced), `label` the longer sentence used next to the stamp.
 */
export const verdictCopy: Record<
	Verdict,
	{ stamp: string; sub: string; label: string; className: string }
> = {
	mega: {
		stamp: 'MEGA DEAL',
		sub: 'ลดแรงสุดคุ้ม',
		label: 'ลดแรงสุดคุ้ม — ซื้อเลย',
		className: 'fill-cel-mega text-price-mega-foreground'
	},
	deal: {
		stamp: 'DEAL',
		sub: 'ราคาดี',
		label: 'ราคาดี — คุ้มแล้ว',
		className: 'fill-cel-deal text-price-deal-foreground'
	},
	standby: {
		stamp: 'STANDBY',
		sub: 'รอโปร',
		label: 'ยังไม่ถูก — รอโปรก่อน',
		className: 'bg-muted text-ink-muted'
	},
	'no-signal': {
		stamp: 'NO SIGNAL',
		sub: 'สัญญาณหาย',
		label: 'ยังไม่มีข้อมูลราคา',
		className: 'bg-price-unknown text-price-unknown-foreground'
	}
};

/** Separate factual sticker, shown on top of the tier when the price is at its all-time low. */
export const newLowCopy = { stamp: 'NEW LOW!', sub: 'ต่ำสุดเท่าที่เคยมี' } as const;

/** Discount-only verdict (no price history). */
export function verdictFromDiscount(hasPrice: boolean, discountPercent: number): Verdict {
	if (!hasPrice) return 'no-signal';
	if (discountPercent >= MEGA_DISCOUNT) return 'mega';
	if (discountPercent >= DEAL_DISCOUNT) return 'deal';
	return 'standby';
}

const thb = new Intl.NumberFormat('th-TH', {
	style: 'currency',
	currency: 'THB',
	maximumFractionDigits: 0
});
const thbCents = new Intl.NumberFormat('th-TH', {
	style: 'currency',
	currency: 'THB',
	minimumFractionDigits: 2,
	maximumFractionDigits: 2
});
const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

/** Whole baht when the amount is whole, otherwise satang (Steam sells at e.g. ฿99.75). */
export const formatThb = (value: number | null) =>
	value === null ? '—' : Number.isInteger(value) ? thb.format(value) : thbCents.format(value);
export const formatUsd = (value: number | null) => (value === null ? '—' : usd.format(value));
