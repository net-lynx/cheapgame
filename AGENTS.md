# ถูกมั้ย? · isthisgamecheap

> **North star:** พิมพ์ชื่อเกมช่องเดียวแล้วจบ — รู้ว่าตอนนี้แต่ละร้านขายเท่าไหร่ (บาท), ถูกจริงไหม,
> เคยถูกสุดเท่าไหร่ / เมื่อไหร่, ช่วงไหนมักมีโปร และควรซื้อตอนนี้หรือรอ

เว็บเทียบราคาเกม PC สำหรับคนไทย ไฟล์นี้คือ direction ของโปรเจกต์ — อ่านก่อนเริ่มงานทุกครั้ง
`CLAUDE.md` เป็น symlink มาที่ไฟล์นี้ แก้ที่ `AGENTS.md` ที่เดียว

## 1. Product

**คำถามที่ทุกหน้าเกมต้องตอบ**

1. **ตอนนี้ราคาเท่าไหร่** — ทุกร้านที่เรามี เป็นบาท เรียงถูกไปแพง
2. **ถูกจริงไหม** — ป้ายตัดสิน (verdict) อ่านปุ๊บรู้เลย
3. **เคยราคาเท่าไหร่** — ต่ำสุดตลอดกาล + วันที่ + กราฟประวัติราคา
4. **ช่วงไหนมีโปร** — โปรที่กำลังจัดอยู่ + ช่วง sale ที่เกมนี้มักลด
5. **ควรซื้อตอนนี้หรือรอ** — สรุปจากข้อ 2–4

**หลักการ**

- **Search-first:** ช่องค้นหาคือพระเอก ไม่มีเมนูซับซ้อน ผลค้นหาต้องพาไปคำตอบใน 1 คลิก
- **Thai-first:** ราคาเป็นบาท ข้อความไทยเป็นหลัก ป้ายใช้คำอังกฤษตัวใหญ่ + ไทยตัวเล็ก
- **ข้อมูลต้องซื่อตรง:** บอกแหล่งที่มาของทุกตัวเลข ราคาที่แปลงสกุลต้องมี `≈` กำกับ
  ห้ามอ้าง "ต่ำสุดตลอดกาล" / NEW LOW ถ้าไม่มีประวัติราคาจริงรองรับ
- **ร้านที่น่าเชื่อถือเท่านั้น:** ร้านทางการ + ร้านคีย์ที่ได้รับอนุญาตจาก publisher ไม่รับตลาดคีย์เทา
  ร้านคีย์ต้องแสดง region lock ชัดเจน (คีย์ที่ใช้ในไทยไม่ได้ = ไม่ใช่ดีล)
- **ความเป็นส่วนตัว (PDPA):** สถิติเก็บแบบไม่ผูกตัวตน ไม่เก็บ IP ดิบ ไม่ใช้ cookie ติดตาม
- **ไม่แอบอ้าง:** ไม่ใช่เว็บของ Valve / ร้านใด ๆ — ระบุไว้ในหน้าเว็บ

## 2. สถานะปัจจุบัน (2026-10-15)

- SvelteKit SSR (`adapter-node`) · Svelte 5 runes · Tailwind v4 · Paraglide (th, en)
- **แหล่งราคา: Steam ไทยอย่างเดียว** ดึงสดต่อ request + in-memory cache ~10 นาที
  - ค้นหา: `src/routes/api/search/+server.ts` → Steam `storesearch`
  - หน้าเกม: `src/routes/game/[appid]/` → `checkSteam()` ใน `src/lib/server/prices/compare.ts`
- Verdict คิดจาก % ส่วนลดบน Steam ไทยเท่านั้น ยังไม่มีประวัติราคา → NEW LOW ยังไม่แสดง
- ส่วน "ดีลเด็ดคืนนี้" / ticker บนหน้าแรกยังเป็น mock (`src/lib/mock/games.ts`) ติดป้าย "ตัวอย่าง"
- ยังไม่มี DB, worker, สถิติ
- เคยมี GOG + CheapShark แล้วถอดออก (ดูข้อ 4)

## 3. สถาปัตยกรรมที่จะไป

```
[Store adapters]  steam · gog · <authorized keyshops> …   (interface เดียวกัน)
        ↓  worker (cron ทุก 1–6 ชม. ตามร้าน)
[Postgres]        games · store_listings · price_snapshots · sale_events · stats
        ↓
[SvelteKit SSR]   อ่านจาก DB · หน้าเกม SSR + cache สั้น · ค้นหาฝั่ง client · เก็บสถิติฝั่ง server
```

- **ทำไม SSR ไม่ใช่ SPA:** browser เรียก API ร้านตรงไม่ได้ (Steam ไม่ส่ง CORS, GOG อนุญาตแค่ gog.com)
  ต้องมี server อยู่แล้ว และ SSR ให้ SEO ของหน้าเกม + OG card ตอนแชร์ลิงก์ + สถิติที่ ad-blocker บังไม่ได้
- **ทำไมต้องมี DB + worker:** การดึงสดทุก request ทำ "เคยราคาเท่าไหร่" / "ช่วงไหนมีโปร" / ดีลจริงไม่ได้
  และเสี่ยงโดน rate limit เมื่อมีหลายร้าน
- **Canonical game id = Steam appid.** ร้านอื่น map เข้ามาผ่าน `store_listings` (เก็บ mapping ที่ยืนยันแล้ว
  ไม่เดาจากชื่อทุกครั้ง; ชื่อไม่ตรงเป๊ะ = ไม่จับคู่ ดีกว่าจับคู่ผิด)
- **ภาษา:** worker เขียน TypeScript ใน repo นี้ก่อน (แชร์ type ได้) สัญญาระหว่าง worker กับเว็บคือ
  **schema ของ DB** ถ้าวันหนึ่งต้อง scrape หนัก/วิเคราะห์ข้อมูล ค่อยแยก worker เป็น Python ได้โดยไม่แตะเว็บ
- **เงิน:** เก็บเป็นจำนวนเต็มหน่วยย่อย (สตางค์ / cent) + รหัสสกุล ห้ามเก็บ float
  แปลงสกุลด้วยอัตราจริงที่อัปเดตเป็นรอบ และบันทึกอัตราที่ใช้ไว้กับ snapshot

**Store adapter (ร่าง)**

```ts
interface StoreAdapter {
	id: 'steam' | 'gog' | string;
	currency: 'THB' | 'USD' | string;
	/** ราคาปัจจุบันของหลายรายการในครั้งเดียว (ใช้ batch ถ้าร้านรองรับ) */
	fetchPrices(listingIds: string[]): Promise<PriceSnapshot[]>;
	/** หา listing ของเกมจาก Steam appid / ชื่อ — ใช้ตอนสร้าง mapping ไม่ใช่ทุก request */
	findListing(game: { appid: number; name: string }): Promise<StoreListing | null>;
	buyUrl(listingId: string): string;
}
```

## 4. ร้านค้า

| ร้าน                                                                                                        | สถานะ                 | ทาง / ข้อจำกัด                                                                                                                                                                |
| ----------------------------------------------------------------------------------------------------------- | --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Steam**                                                                                                   | ✅ ใช้อยู่            | `appdetails?cc=th&filters=price_overview` (หลาย appid ได้เฉพาะตอนมี filter นี้), ราคาเป็นสตางค์ · API ไม่มีเอกสารทางการ อาจเปลี่ยนได้                                         |
| **GOG**                                                                                                     | ⏭️ ถัดไป              | `catalog.gog.com/v1/catalog?countryCode=TH&currencyCode=THB` ทดสอบแล้วได้บาท · search เป็น fuzzy ต้องจับคู่ชื่อแบบเข้มงวด                                                     |
| **ร้านคีย์ที่ได้รับอนุญาต** (Fanatical, Humble, Green Man Gaming, GamesPlanet, WinGameStore, IndieGala ฯลฯ) | 🔍 ต้องสำรวจ          | ผ่านโปรแกรม affiliate / product feed — ยังไม่ยืนยันว่ามี feed และสกุลเงินอะไร · ต้องมี region lock                                                                            |
| **Epic Games Store**                                                                                        | ⛔ รอข้อมูลแบบมีสัญญา | GraphQL ค้นหาติด Cloudflare (403) — **ห้าม bypass** · ทางที่ถูก: API เชิงพาณิชย์ (เช่น GG.deals) หรือขออนุญาต · ระหว่างนี้ให้แค่ลิงก์ไปหน้าร้านได้                            |
| **ไม่ใช้**                                                                                                  | 🚫                    | IsThereAnyDeal API (ToS ห้ามแอปที่เป็นคู่แข่ง) · CheapShark (USD ล้วน, ต้องใช้ลิงก์ของเขา — ถอดออกแล้ว) · ตลาดคีย์เทา (G2A, Kinguin, Eneba) · การ scrape ที่ต้องหลบระบบกันบอท |

## 5. Roadmap

**P0 — ฐานข้อมูล**

- Postgres + migrations, worker เก็บ snapshot ราคา Steam ไทยทุกวัน (เริ่มจากเกมที่มีคนค้น + top sellers)
- ต่ำสุดตลอดกาลของเราเอง → เปิดใช้ NEW LOW! (ป้ายข้อเท็จจริง แยกจาก tier)
- "ดีลเด็ดคืนนี้" + ticker ใช้ข้อมูลจริง เลิกใช้ mock
- สถิติฝั่ง server แบบไม่ผูกตัวตน: คำค้นที่ไม่เจอ, เกมที่ถูกเช็คบ่อย, คลิกออกไปร้าน

**P1 — "เคยราคาเท่าไหร่ / ช่วงไหนมีโปร"**

- กราฟประวัติราคาในหน้าเกม (step line, ราคาไทย)
- ปฏิทิน sale (`sale_events`): Steam Spring / Summer / Autumn / Winter Sale และเทศกาลอื่น ๆ —
  ใส่วันที่จริงจากประกาศของร้าน ไม่เดา
- "เกมนี้มักลดช่วงไหน / ลดลึกสุดกี่ %" จากประวัติจริง
- GOG กลับมาผ่าน adapter + หน้าเกมเทียบหลายร้านอีกครั้ง
- SEO: OG image/card ต่อเกม, sitemap ของหน้าเกม

**P2 — ร้านคีย์ + การแจ้งเตือน**

- adapter ร้านคีย์ที่ได้รับอนุญาตทีละร้าน + region lock + ≈THB จากอัตราจริง
- wishlist / แจ้งเตือนเมื่อถึงราคาที่ตั้ง (ต้องออกแบบเรื่องบัญชีผู้ใช้ + PDPA ก่อน)

**P3 — Epic** เมื่อได้แหล่งข้อมูลที่ถูกต้องตามสัญญา

**Verdict (ทิศทาง):** ตอนนี้ MEGA DEAL ≥ 70% · DEAL ≥ 30% · STANDBY · NO SIGNAL
เมื่อมีประวัติราคา ให้คิดจาก "ห่างจากต่ำสุดตลอดกาลแค่ไหน" ร่วมกับ % ส่วนลด และเตือน STANDBY
ถ้า sale ใหญ่ใกล้จะมา — ตัดสินจาก **ราคาไทย** เป็นหลักเสมอ ร้าน USD เป็นข้อมูลเสริม

## 6. Design system

- Token ทั้งหมดอยู่ใน `src/routes/layout.css` · คู่มือมีชีวิตที่ `/design-tokens` (อัปเดตทุกครั้งที่เพิ่ม/แก้ component)
- **3 ชั้น:** Base (ของเรา: สี brand/deal/mega/ink/paper, IBM Plex, ความหนาแน่น hero/tool, ขอบ+เงาแข็ง) →
  Cel (Persona-inspired, ใช้แบบพอดี) → Vibe (retro-modern TV-shopping / ร้านเช่าวิดีโอ, ยังเป็น preview)
- **ห้าม:** เพิ่ม hex ใหม่ (vibe ต้องแตกจากสีเดิม) · letter-spacing ภาษาไทย · skew input หรือเนื้อความไทย
  (skew wrapper แล้ว unskew ข้างใน) · ใช้คำว่า "STEAL"
- **คำ verdict (ชุด A)** อยู่ใน `src/lib/verdict.ts` เท่านั้น: MEGA DEAL · ลดแรงสุดคุ้ม / DEAL · ราคาดี /
  STANDBY · รอโปร / NO SIGNAL · สัญญาณหาย / NEW LOW! · ต่ำสุดเท่าที่เคยมี
- Hero zone เล่นได้เต็มที่ · tool zone (ตารางราคา ตัวกรอง) ใช้ชั้น Base เป็นหลัก · ของ vibe ไม่เกิน 1–2 อย่างต่อ component
- Dark mode = class `.dark` จาก `mode-watcher` (`ThemeSwitch.svelte`) ไม่ใช่ media query
- Vibe ที่ใช้จริงแล้ว: กรอบ CRT + `animate-channel-flip` + ราคาหมุน (หน้าเกม), ป้ายเทป (ดีลหน้าแรก), `GameDiscCase` (มุมมอง “ชั้นวางแผ่น” ของผลค้นหา) · สติกเกอร์ NEW LOW! ยังห้ามขึ้นหน้าจริงจนกว่า P0 จะมีประวัติราคา
- ปกเกมใช้ `GameCover.svelte` + ลำดับ fallback ใน `src/lib/cover.ts` (library 600×900 → header → capsule จากผลค้นหา → ช่องสี token) — ห้ามใช้ `<img>` ปกตรง ๆ
- Motion ทุกตัวต้องเคารพ `prefers-reduced-motion` (CSS ถูกปิดโดยกฎ global; Svelte transition / Tween ต้อง gate เองด้วย `MediaQuery`)

## 7. Engineering conventions

- โค้ดที่เรียก API ภายนอกอยู่ใต้ `src/lib/server/` เท่านั้น · ทุก fetch มี timeout · ร้านหนึ่งล่มต้องไม่ทำทั้งหน้าพัง
- import ภายในใช้ `#lib/...` (มี `.js` ต่อท้ายสำหรับไฟล์ `.ts`) · ลิงก์ภายในผ่าน `resolve()` จาก `$app/paths`
  ลิงก์ออกไปร้านใช้ `<!-- eslint-disable svelte/no-navigation-without-resolve -->` เฉพาะจุด
- Svelte 5 runes เท่านั้น, `onclick=`, `{#each}` แบบมี key ที่ไม่ใช่ index, `class={[...]}` แทน `class:`
- ก่อนส่งงาน: `pnpm check` · `npx eslint <ไฟล์ที่แก้>` · `npx prettier --write <ไฟล์ที่แก้>` (ห้ามรันทั้งโฟลเดอร์) · `pnpm build`
- ตรวจหน้าตาด้วย dev server พอร์ตของตัวเอง (ไม่แตะ 5173 ที่ผู้ใช้รันอยู่) ที่ 1280 / 390 px, light + dark — ไม่มี scroll แนวนอน
- โปรเจกต์ยังไม่อยู่ใน git — ระวังการลบ/เขียนทับไฟล์

---

## Project Configuration

- **Language**: TypeScript
- **Package Manager**: pnpm
- **Add-ons**: prettier, tailwindcss, sveltekit-adapter, ai-tools, eslint, paraglide

---

You are able to use the Svelte MCP server, where you have access to comprehensive Svelte 5 and SvelteKit documentation. Here's how to use the available tools effectively:

## Available Svelte MCP Tools:

### 1. list-sections

Use this FIRST to discover all available documentation sections. Returns a structured list with titles, use_cases, and paths.
When asked about Svelte or SvelteKit topics, ALWAYS use this tool at the start of the chat to find relevant sections.

### 2. get-documentation

Retrieves full documentation content for specific sections. Accepts single or multiple sections.
After calling the list-sections tool, you MUST analyze the returned documentation sections (especially the use_cases field) and then use the get-documentation tool to fetch ALL documentation sections that are relevant for the user's task.

### 3. svelte-autofixer

Analyzes Svelte code and returns issues and suggestions.
You MUST use this tool whenever writing Svelte code before sending it to the user. Keep calling it until no issues or suggestions are returned.

### 4. playground-link

Generates a Svelte Playground link with the provided code.
After completing the code, ask the user if they want a playground link. Only call this tool after user confirmation and NEVER if code was written to files in their project.
