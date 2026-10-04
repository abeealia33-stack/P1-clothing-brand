# Collection Names and the WhatsApp Button Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Every page names a collection the way the admin does, the green WhatsApp controls become readable, and the floating WhatsApp button stops covering Save on product pages.

**Architecture:** Sentences that mention a collection read its name through one helper over the owner's saved edits — the same resolution the product page already uses — so a rename in Admin → Collections reaches every page. Filled green controls move from light sage to the deep-sage-and-paper pairing that the product page's Add to bag already uses. Where the floating button appears becomes one tested function, and product pages (which have their own WhatsApp link under the buy row) join checkout in not getting it.

**Tech Stack:** Next.js 16.3.4 App Router (production build is `next build --webpack`), React 19, Tailwind CSS v4 (`@theme` tokens in `src/app/globals.css`), Prisma (SQLite `dev.db` locally, MySQL on Hostinger), Vitest 5 (`environment: "node"`, only `src/**/*.test.ts`).

**Spec:** The owner's report of 2026-10-04, quoted under Findings — there is no separate spec document for this fix. Collection names follow `docs/superpowers/specs/2026-09-05-bilques-website-design.md` line 10: "Rozana (daily) → Ghar (home) → Azad (oversized/expressive) → Bundles".

## Findings

The owner's report:

> The site has just one product, named "kurta" in lowercase. It's labelled "ROZE" on the product page but "Rozana" everywhere else. The light-green WhatsApp button has white text that's hard to read. It's on the button and on the Contact page card. The floating WhatsApp button also covers the "Save" link on the product page.

What is actually wrong, measured on bilques.com and on `next dev`:

1. **"ROZE" vs "Rozana".** The product page prints the collection's name as saved in Admin → Collections (`src/app/(shop)/product/[slug]/page.tsx:122`, `collection.name`). Live, it renders `<p class="field-label">Roze</p>`, and `.field-label` sets it in capitals. The code's built-in name is "Rozana" (`src/lib/types.ts:24`). Four sentences spell out the built-in names instead of reading the admin's, so no rename can reach them:
   - `src/app/(shop)/about/page.tsx:26` (photo alt text) and `:31` (caption)
   - `src/app/(shop)/cart/page.tsx:53-62` (empty-cart suggestion and its two buttons)
   - `src/app/(shop)/shipping/page.tsx:128-129` (sizing tip)
2. **"kurta" in lowercase** is the product's name as typed in Admin → Products. That is content, not code — but renaming it moves the page: the address is made from the name (`src/app/admin/products/actions.ts:96`) and nothing redirects the old one (`:211`).
3. **Unreadable green.** White on sage `#8b9e8b` is 2.85:1; WCAG AA needs 4.5:1 for text. The Contact card's number line (`text-white/85`) is 2.50:1. Affected: the floating button (`src/components/WhatsAppButton.tsx:69`), the Contact card (`src/app/(shop)/contact/page.tsx:24-38`), and everything using `.btn-sage` (`src/app/globals.css:193-199`) — Account, Shipping, the receipt upload after checkout (`src/components/PaymentTransfer.tsx:164`), and the admin's WhatsApp and payment buttons. The product page's `.btn-buy` (`globals.css:1317-1323`) already pairs sage-deep `#5c6b58` with paper `#f5f0eb` (5.01:1) and turns ink on hover (12.33:1). That pairing is the fix.
4. **The floating button covers Save.** `WhatsAppButton` hides itself on product pages only below `md` ("Desktop has the room"). On live `/product/kurta` it sits on Save at 1280×720 (while scrolling 20–110px) and at 1024×768 (from load until 90px). 1440×900, 1366×657 (13px to spare), tablets and phones are clear. The content's right edge reaches into the button's 94px corner on any window narrower than about 1340px. Every product page already has its own "Ask about this piece on WhatsApp" link under the buy row.

## Global Constraints

- Next.js 16.3.4 differs from older versions. Before writing code, read `node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md` (required by `AGENTS.md`).
- No new dependencies. Hostinger installs production dependencies only (see the `//` note in `package.json`).
- Collection slugs `rozana`, `ghar`, `azad`, `bundles` stay as they are; only display names change. Links keep `/shop?collection=rozana`.
- Colours come from the `@theme` tokens in `src/app/globals.css` (`paper`, `sage`, `sage-deep`, `ink`, …). No new hex values.
- Text on a filled control is at least 4.5:1 against its fill.
- `dev.db` is gitignored local data. Anything that edits it restores it.
- Work on `master`, one commit per task, in the repo's style: a sentence-case imperative subject, a body that says why, ending with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. If `next dev` re-adds its block to `AGENTS.md`, commit that with the task (as `AGENTS.md` asks).
- Pushing `master` deploys bilques.com within about two minutes. Push only in Task 4, with the owner's go-ahead.
- Owner preference: no placeholder or "coming soon" UI.

## Running the Checks

Three browser checks drive this plan. They use headless Chrome at `C:/Program Files/Google/Chrome/Application/chrome.exe` and Node 24's built-in `WebSocket`. They are verification tools, not app code: create them in `C:/Users/DELL/AppData/Local/Temp/bilques-checks/`, never in the repo. Each task creates the one it needs. The commands below write that folder out in full because shell variables do not persist between commands.

Start a dev server from the repo root, in the background, on port 3123 so a server the owner already has open is left alone:

```bash
npx next dev -p 3123
```

If it refuses with "Another next dev server is already running", use the address it prints (for example `http://localhost:3001`) instead of `http://localhost:3123` everywhere below.

Warm the pages once, because the first request to each route compiles it:

```bash
for p in / /shop /about /shipping /cart /contact /account; do curl -s -o /dev/null --max-time 180 "http://localhost:3123$p"; done
```

Stop the server afterwards. Stopping the shell leaves Next's node process listening, so kill the tree (PowerShell):

```powershell
Get-CimInstance Win32_Process -Filter "Name = 'node.exe'" | Where-Object { $_.CommandLine -match 'next.+dev -p 3123' } | ForEach-Object { taskkill /PID $_.ProcessId /T /F }
```

## Review Focus

1. The owner clears a collection's name in the admin → sentences fall back to the built-in name ("Rozana") and never read "across ,". Pinned by a unit test in Task 1.
2. A collection taken out of the menus (all four are hidden on live today) is still named in sentences. Unit test in Task 1.
3. A cart with pieces in it behaves exactly as before after the cart page is split into a server page and a client view. Seeded-cart check in Task 1.
4. `.btn-sage` on pages no check visits (the receipt upload after checkout; the admin's order, custom-request and payment buttons). Measured on the class itself in Task 2.
5. The floating button still appears on every other page at every width, and product pages still offer WhatsApp through their own link. Unit test and browser check in Task 3.

---

### Task 1: Sentences that name a collection use the admin's name

**Files:**
- Modify: `src/lib/types.ts:122-127` (add after `resolveCollection`)
- Test: `src/lib/collections.test.ts`
- Modify: `src/lib/settings.ts:7-16` (imports), `:154-156` (add after `getAllCollections`)
- Modify: `src/app/(shop)/about/page.tsx:1-4, 18-19, 26, 31`
- Modify: `src/app/(shop)/shipping/page.tsx:1-4, 19-20, 128-129`
- Move: `src/app/(shop)/cart/page.tsx` → `src/app/(shop)/cart/CartView.tsx`
- Create: `src/app/(shop)/cart/page.tsx`
- Check: `C:/Users/DELL/AppData/Local/Temp/bilques-checks/check-collection-names.mjs`

**Interfaces:**
- Consumes: `resolveCollections(edits: CollectionEdits): ResolvedCollection[]` and `type CollectionSlug` (existing, `src/lib/types.ts`); `getSettings()` (existing, `src/lib/settings.ts`).
- Produces: `type CollectionNames = Record<CollectionSlug, string>` and `collectionNames(edits: CollectionEdits): CollectionNames` from `src/lib/types.ts` (safe in client code); `getCollectionNames(): Promise<CollectionNames>` from `src/lib/settings.ts` (server only).

- [ ] **Step 1: Write the failing unit tests**

In `src/lib/collections.test.ts`, add `collectionNames` to the import from `./types`:

```ts
import {
  collectionNames,
  collections,
  navCollections,
  resolveCollection,
  resolveCollections,
} from "./types";
```

Append at the end of the file:

```ts
describe("collectionNames", () => {
  it("names each collection as the owner has", () => {
    expect(collectionNames({ rozana: { name: "Roze" } })).toEqual({
      rozana: "Roze",
      ghar: "Ghar",
      azad: "Azad",
      bundles: "Bundles",
    });
  });

  it("falls back to the built-in name when the owner's is blank", () => {
    expect(collectionNames({ rozana: { name: "   " } }).rozana).toBe("Rozana");
  });

  it("still names a collection taken out of the menus", () => {
    expect(collectionNames({ ghar: { name: "Ghar Ka", inNav: false } }).ghar).toBe("Ghar Ka");
  });
});
```

- [ ] **Step 2: Run them to make sure they fail**

Run: `npx vitest run src/lib/collections.test.ts`
Expected: the three new tests FAIL with a `TypeError` saying `collectionNames` is not a function; the existing tests pass.

- [ ] **Step 3: Add `collectionNames`**

In `src/lib/types.ts`, directly after the `resolveCollection` export (ends at line 126), add:

```ts
/** Each collection's name as the storefront shows it, keyed by slug. */
export type CollectionNames = Record<CollectionSlug, string>;

/**
 * For sentences that name a collection in passing. The owner can rename one
 * from the admin, and a sentence that spells out the old name then disagrees
 * with the product page. Hidden collections are named too: advice about
 * sizing stays true when a collection is out of the menus.
 */
export const collectionNames = (edits: CollectionEdits): CollectionNames =>
  Object.fromEntries(
    resolveCollections(edits).map((c) => [c.slug, c.name])
  ) as CollectionNames;
```

- [ ] **Step 4: Run the unit tests to make sure they pass**

Run: `npx vitest run src/lib/collections.test.ts`
Expected: all tests in the file PASS.

- [ ] **Step 5: Add `getCollectionNames` for server pages**

In `src/lib/settings.ts`, replace the import from `./types` with:

```ts
import {
  collectionNames,
  collections,
  navCollections,
  resolveCollections,
  transferMethods,
  type CollectionEdit,
  type CollectionEdits,
  type CollectionNames,
  type ResolvedCollection,
  type TransferMethod,
} from "./types";
```

Directly after `getAllCollections` (ends at line 156), add:

```ts
/** The four names as they read now, for pages that mention one in a sentence. */
export const getCollectionNames = async (): Promise<CollectionNames> =>
  collectionNames((await getSettings()).collections);
```

- [ ] **Step 6: Write the page check and watch it fail**

Create `C:/Users/DELL/AppData/Local/Temp/bilques-checks/check-collection-names.mjs`:

```js
// node check-collection-names.mjs <baseUrl> <path-to-dev.db>
// Renames the Rozana collection to "Roze" in the local database, checks that
// the About, Shipping and empty-Cart pages say "Roze", then puts the original
// value back whatever happened. Exits 1 on any failure.
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const [BASE = "http://localhost:3000", DB] = process.argv.slice(2);
const require = createRequire(join(process.cwd(), "package.json"));
const Database = require("better-sqlite3");
const db = new Database(DB);
const original = db.prepare("SELECT collections FROM Settings WHERE id = 'site'").get()?.collections;
if (original === undefined) { console.log("FAIL no Settings row in", DB); process.exit(1); }

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let failed = 0;
const check = (ok, label) => { if (!ok) failed++; console.log(`${ok ? "PASS" : "FAIL"} ${label}`); };

try {
  const edits = JSON.parse(original);
  edits.rozana = { ...(edits.rozana ?? {}), name: "Roze" };
  db.prepare("UPDATE Settings SET collections = ? WHERE id = 'site'").run(JSON.stringify(edits));

  // React marks the seams around an interpolated value with <!-- --> in the
  // HTML; strip them so "across <!-- -->Roze<!-- -->," reads as a sentence.
  const page = async (path) => (await (await fetch(`${BASE}${path}`)).text()).replaceAll("<!-- -->", "");
  const about = await page("/about");
  check(about.includes("The cotton we use across Roze,"), "About caption names the collection as the admin does");
  check(about.includes("used across the Roze collection"), "About photo alt text names it too");
  const shipping = await page("/shipping");
  check(shipping.includes("Take the smaller one in Roze and Ghar"), "Shipping sizing tip names it");

  // The cart reads the browser's basket, so its empty state only exists after
  // hydration. textContent, not innerText: the buttons are set in capitals by CSS.
  const chrome = spawn("C:/Program Files/Google/Chrome/Application/chrome.exe", [
    "--headless=new", "--remote-debugging-port=9339", `--user-data-dir=${mkdtempSync(join(tmpdir(), "names-"))}`, "--no-first-run", "about:blank",
  ], { stdio: "ignore" });
  try {
    let target;
    for (let i = 0; i < 50 && !target; i++) {
      try { target = (await (await fetch("http://127.0.0.1:9339/json/list")).json()).find((t) => t.type === "page"); } catch {}
      if (!target) await sleep(200);
    }
    const ws = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((r) => ws.addEventListener("open", r));
    let id = 0; const pending = new Map();
    ws.addEventListener("message", (e) => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } });
    const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
    await send("Page.navigate", { url: `${BASE}/cart` });
    let text = "";
    for (let i = 0; i < 40 && !text.includes("Your cart is empty"); i++) {
      await sleep(500);
      text = (await send("Runtime.evaluate", { expression: "document.body.textContent", returnByValue: true })).result.result?.value ?? "";
    }
    check(text.includes("Start with Roze if you want something for tomorrow"), "Empty cart suggestion names it");
    check(text.includes("Shop Roze"), "Empty cart button names it");

    // A cart with something in it must still list it and offer checkout.
    const line = { id: "probe-piece-M-Clay", slug: "probe-piece", name: "Probe Piece", price: 1500, size: "M", color: "Clay", photo: "/cloth/hero.svg", qty: 1 };
    await send("Runtime.evaluate", { expression: `localStorage.setItem("bilques.cart.v1", ${JSON.stringify(JSON.stringify([line]))})` });
    await send("Page.navigate", { url: `${BASE}/cart` });
    text = "";
    for (let i = 0; i < 40 && !text.includes("Checkout"); i++) {
      await sleep(500);
      text = (await send("Runtime.evaluate", { expression: "document.body.textContent", returnByValue: true })).result.result?.value ?? "";
    }
    check(text.includes("Probe Piece") && text.includes("Subtotal") && text.includes("Checkout"), "A cart with a piece in it still lists it and offers Checkout");
    ws.close();
  } finally {
    chrome.kill();
  }
} finally {
  db.prepare("UPDATE Settings SET collections = ? WHERE id = 'site'").run(original);
  console.log("restored Settings.collections to", original);
  db.close();
}
process.exit(failed ? 1 : 0);
```

Start the dev server and warm the pages (see Running the Checks). Then, from the repo root (the script loads `better-sqlite3` from the repo's `node_modules`):

Run: `node "C:/Users/DELL/AppData/Local/Temp/bilques-checks/check-collection-names.mjs" http://localhost:3123 dev.db`
Expected (exit 1; the restored value is whatever your `dev.db` held, `{}` on a fresh one):

```
FAIL About caption names the collection as the admin does
FAIL About photo alt text names it too
FAIL Shipping sizing tip names it
FAIL Empty cart suggestion names it
FAIL Empty cart button names it
PASS A cart with a piece in it still lists it and offers Checkout
restored Settings.collections to {}
```

- [ ] **Step 7: About page reads the name**

In `src/app/(shop)/about/page.tsx`, add after `import { site } from "@/lib/site";`:

```tsx
import { getCollectionNames } from "@/lib/settings";
```

Replace:

```tsx
export default function AboutPage() {
  return (
```

with:

```tsx
export default async function AboutPage() {
  const names = await getCollectionNames();

  return (
```

Replace:

```tsx
            alt="Close view of the cotton weave used across the Rozana collection"
```

with:

```tsx
            alt={`Close view of the cotton weave used across the ${names.rozana} collection`}
```

Replace:

```tsx
          The cotton we use across Rozana, photographed at the mill in Faisalabad before it was cut.
```

with:

```tsx
          The cotton we use across {names.rozana}, photographed at the mill in Faisalabad before it was cut.
```

- [ ] **Step 8: Shipping page reads the names**

In `src/app/(shop)/shipping/page.tsx`, add after `import { rupees } from "@/lib/format";`:

```tsx
import { getCollectionNames } from "@/lib/settings";
```

Replace:

```tsx
export default function ShippingPage() {
  return (
```

with:

```tsx
export default async function ShippingPage() {
  const names = await getCollectionNames();

  return (
```

Replace:

```tsx
          Between two sizes? Take the smaller one in Rozana and Ghar, the larger
          one in Azad.
```

with (the line break after the comma is JSX whitespace and renders as one space):

```tsx
          Between two sizes? Take the smaller one in {names.rozana} and {names.ghar},
          the larger one in {names.azad}.
```

- [ ] **Step 9: Split the cart into a server page and a client view**

Run: `git mv "src/app/(shop)/cart/page.tsx" "src/app/(shop)/cart/CartView.tsx"`

In `src/app/(shop)/cart/CartView.tsx` (keep `"use client";` on line 1), add after `import { shippingFor } from "@/lib/shipping";`:

```tsx
import type { CollectionNames } from "@/lib/types";
```

Replace:

```tsx
export default function CartPage() {
```

with:

```tsx
export default function CartView({ names }: { names: CollectionNames }) {
```

Replace:

```tsx
        <p className="measure mt-3" style={{ color: "var(--color-ink-soft)" }}>
          Start with Rozana if you want something for tomorrow, or Ghar if you
          want to be comfortable tonight.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link href="/shop?collection=rozana" className="btn btn-ink">
            Shop Rozana
          </Link>
          <Link href="/shop?collection=ghar" className="btn btn-quiet">
            Shop Ghar
          </Link>
```

with (the `{" "}` keeps the space that JSX would drop at a line break next to an expression):

```tsx
        <p className="measure mt-3" style={{ color: "var(--color-ink-soft)" }}>
          Start with {names.rozana} if you want something for tomorrow, or{" "}
          {names.ghar} if you want to be comfortable tonight.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link href="/shop?collection=rozana" className="btn btn-ink">
            Shop {names.rozana}
          </Link>
          <Link href="/shop?collection=ghar" className="btn btn-quiet">
            Shop {names.ghar}
          </Link>
```

Create `src/app/(shop)/cart/page.tsx` (it follows `src/app/(shop)/wishlist/page.tsx`, a server page that renders a client view beside it):

```tsx
import { getCollectionNames } from "@/lib/settings";
import CartView from "./CartView";

/**
 * The basket lives in the shopper's browser, so the cart itself is a client
 * view. This half runs on the server for one thing: what the collections are
 * called now, for the empty cart's suggestion of where to start.
 */
export default async function CartPage() {
  return <CartView names={await getCollectionNames()} />;
}
```

- [ ] **Step 10: Type-check, run every test, and run the page check**

Run: `npx tsc --noEmit`
Expected: no output, exit 0.

Run: `npx vitest run`
Expected: `Test Files  15 passed (15)` and `Tests  136 passed (136)`.

Warm `/about`, `/shipping` and `/cart` again (the dev server recompiles them after the edits), then:

Run: `node "C:/Users/DELL/AppData/Local/Temp/bilques-checks/check-collection-names.mjs" http://localhost:3123 dev.db`
Expected (exit 0):

```
PASS About caption names the collection as the admin does
PASS About photo alt text names it too
PASS Shipping sizing tip names it
PASS Empty cart suggestion names it
PASS Empty cart button names it
PASS A cart with a piece in it still lists it and offers Checkout
restored Settings.collections to {}
```

- [ ] **Step 11: Commit**

```bash
git add src/lib/types.ts src/lib/collections.test.ts src/lib/settings.ts "src/app/(shop)/about/page.tsx" "src/app/(shop)/shipping/page.tsx" "src/app/(shop)/cart/page.tsx" "src/app/(shop)/cart/CartView.tsx"
git commit -F - <<'EOF'
Name collections in sentences the way the admin does

The product page has always shown a collection under the name the owner
gives it in the admin, while the About caption, the sizing tip on
Shipping and the empty cart spelt out "Rozana" and "Ghar". Renaming a
collection left the product page saying one thing and the rest of the
site another.

Those sentences now read the names through collectionNames, over the
same saved edits. The cart is a client view, so it gains a server page
that reads the names and hands them in.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 2: Filled green controls get text that can be read

**Files:**
- Modify: `src/app/globals.css:6-9` (palette comment), `:193-199` (`.btn-sage`)
- Modify: `src/components/WhatsAppButton.tsx:69`
- Modify: `src/app/(shop)/contact/page.tsx:24-38`
- Check: `C:/Users/DELL/AppData/Local/Temp/bilques-checks/check-contrast.mjs`

**Interfaces:**
- Consumes: the `sage-deep`, `paper` and `ink` tokens (existing `@theme` in `globals.css`, which also generate the `bg-sage-deep`, `text-paper` and `bg-ink` utilities).
- Produces: the floating button's colour classes `bg-sage-deep`, `text-paper`, `hover:bg-ink`, which Task 3 keeps when it rewrites that `className`.

- [ ] **Step 1: Write the contrast check**

Create `C:/Users/DELL/AppData/Local/Temp/bilques-checks/check-contrast.mjs`:

```js
// node check-contrast.mjs <baseUrl>
// Loads each page in headless Chrome and measures the WCAG contrast ratio of
// every filled green control's text against the colour actually behind it.
// Exits 1 if any is under 4.5:1 (WCAG AA for normal-size text).
import { spawn } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const BASE = process.argv[2] ?? "http://localhost:3000";
const TARGETS = [
  ["/contact", 'a[href^="https://wa.me/"].block', "Contact card heading"],
  ["/contact", 'a[href^="https://wa.me/"].block .tnum', "Contact card number line"],
  ["/shop", 'a[aria-label="Message Bilques on WhatsApp"]', "Floating WhatsApp button"],
  ["/shipping", "a.btn-sage", "Shipping: Ask about sizing"],
  ["/account", "a.btn-sage", "Account: WhatsApp button"],
  // The class itself, for the places above that need an order or an admin
  // login to reach: the receipt upload at checkout, the admin's WhatsApp buttons.
  ["/shop", "#contrast-probe", ".btn-sage class", '<a id="contrast-probe" class="btn btn-sage">Probe</a>'],
];

const chrome = spawn("C:/Program Files/Google/Chrome/Application/chrome.exe", [
  "--headless=new", "--remote-debugging-port=9337", `--user-data-dir=${mkdtempSync(join(tmpdir(), "contrast-"))}`,
  "--no-first-run", "about:blank",
], { stdio: "ignore" });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let target;
for (let i = 0; i < 50 && !target; i++) {
  try { target = (await (await fetch("http://127.0.0.1:9337/json/list")).json()).find((t) => t.type === "page"); } catch {}
  if (!target) await sleep(200);
}
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener("open", r));
let id = 0; const pending = new Map(); const listeners = [];
ws.addEventListener("message", (e) => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } else listeners.forEach((l) => l(m)); });
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
await send("Page.enable"); await send("Runtime.enable");
await send("Network.setUserAgentOverride", { userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36" });
await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });

const measure = (selector) => `(() => {
  const el = document.querySelector(${JSON.stringify(selector)});
  if (!el) return { error: "not found" };
  // Any CSS colour (rgb, oklab, color-mix...) to sRGB 0-255 by painting one pixel.
  const ctx = Object.assign(document.createElement("canvas"), { width: 1, height: 1 }).getContext("2d", { willReadFrequently: true });
  const parse = (c) => {
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = "#000";
    ctx.fillStyle = c;
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b, al] = ctx.getImageData(0, 0, 1, 1).data;
    // getImageData returns straight (not premultiplied) alpha.
    return { r, g, b, a: al / 255 };
  };
  const over = (top, under) => ({ r: top.r * top.a + under.r * (1 - top.a), g: top.g * top.a + under.g * (1 - top.a), b: top.b * top.a + under.b * (1 - top.a), a: 1 });
  // The colour behind the element: stack translucent backgrounds up to an opaque one.
  const layers = [];
  for (let n = el; n; n = n.parentElement) {
    const bg = parse(getComputedStyle(n).backgroundColor);
    if (bg.a > 0) layers.push(bg);
    if (bg.a >= 1) break;
  }
  let bg = { r: 255, g: 255, b: 255, a: 1 };
  for (const layer of layers.reverse()) bg = over(layer, bg);
  const fg = over(parse(getComputedStyle(el).color), bg);
  const lum = ({ r, g, b }) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  const [hi, lo] = [lum(fg), lum(bg)].sort((x, y) => y - x);
  const hex = (c) => "#" + [c.r, c.g, c.b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");
  return { ratio: (hi + 0.05) / (lo + 0.05), fg: hex(fg), bg: hex(bg) };
})()`;

let failed = 0;
for (const [path, selector, label, inject] of TARGETS) {
  const loaded = new Promise((r) => { const l = (m) => { if (m.method === "Page.loadEventFired") { listeners.splice(listeners.indexOf(l), 1); r(); } }; listeners.push(l); });
  await send("Page.navigate", { url: BASE + path });
  await Promise.race([loaded, sleep(20000)]);
  await sleep(800);
  if (inject) await send("Runtime.evaluate", { expression: `document.querySelector("main").insertAdjacentHTML("beforeend", ${JSON.stringify(inject)})` });
  const res = (await send("Runtime.evaluate", { expression: measure(selector), returnByValue: true })).result.result.value;
  if (res.error) { failed++; console.log(`MISSING ${label} (${path} ${selector})`); continue; }
  const ok = res.ratio >= 4.5;
  if (!ok) failed++;
  console.log(`${ok ? "PASS" : "FAIL"} ${res.ratio.toFixed(2)}:1  ${res.fg} on ${res.bg}  ${label}`);
}
ws.close(); chrome.kill();
process.exit(failed ? 1 : 0);
```

- [ ] **Step 2: Run it to make sure it fails**

With the dev server running and warm:

Run: `node "C:/Users/DELL/AppData/Local/Temp/bilques-checks/check-contrast.mjs" http://localhost:3123`
Expected (exit 1):

```
FAIL 2.85:1  #ffffff on #8b9e8b  Contact card heading
FAIL 2.50:1  #eef1ee on #8b9e8b  Contact card number line
FAIL 2.85:1  #ffffff on #8b9e8b  Floating WhatsApp button
FAIL 2.85:1  #ffffff on #8b9e8b  Shipping: Ask about sizing
FAIL 2.85:1  #ffffff on #8b9e8b  Account: WhatsApp button
FAIL 2.85:1  #ffffff on #8b9e8b  .btn-sage class
```

- [ ] **Step 3: Put `.btn-sage` on the deep sage**

In `src/app/globals.css`, replace the palette note at the top:

```css
   Three colours come from the brand: paper, ink, sage. The other three exist
   so the palette is a system rather than three flat swatches — khaddar for
   ground alternation, sage-deep for pressed states, ink-soft for secondary
   text (a warm brown rather than a grey, so it belongs to the cloth).
```

with:

```css
   Three colours come from the brand: paper, ink, sage. The other three exist
   so the palette is a system rather than three flat swatches — khaddar for
   ground alternation, sage-deep for pressed states and for any fill with
   words on it (white on sage is 2.85:1, too faint to read), ink-soft for
   secondary text (a warm brown rather than a grey, so it belongs to the cloth).
```

Replace:

```css
  .btn-sage {
    background: var(--color-sage);
    color: #fff;
  }
  .btn-sage:hover:not(:disabled) {
    background: var(--color-sage-deep);
  }
```

with:

```css
  /* Paper on the deep sage, as on Add to bag; the light sage is too pale to
     carry words. */
  .btn-sage {
    background: var(--color-sage-deep);
    color: var(--color-paper);
  }
  .btn-sage:hover:not(:disabled) {
    background: var(--color-ink);
  }
```

- [ ] **Step 4: Same pairing on the floating button**

In `src/components/WhatsAppButton.tsx` (line 69), inside the `className`, replace:

```
rounded-full bg-sage px-4 text-white shadow-lg transition-colors hover:bg-sage-deep
```

with:

```
rounded-full bg-sage-deep px-4 text-paper shadow-lg transition-colors hover:bg-ink
```

- [ ] **Step 5: Same pairing on the Contact card**

In `src/app/(shop)/contact/page.tsx`, replace:

```tsx
        <a
          href={whatsappLink("Salam! I have a question about Bilques.")}
          className="block p-6 transition-colors"
          style={{ background: "var(--color-sage)", color: "#fff" }}
        >
```

with:

```tsx
        <a
          href={whatsappLink("Salam! I have a question about Bilques.")}
          className="block bg-sage-deep p-6 text-paper transition-colors hover:bg-ink"
        >
```

Replace:

```tsx
          <span className="tnum mt-1 block text-sm text-white/85">
```

with (the dimmed line fell to 2.50:1; size alone now sets it apart from the heading):

```tsx
          <span className="tnum mt-1 block text-sm">
```

- [ ] **Step 6: Run the check to make sure it passes**

Run: `node "C:/Users/DELL/AppData/Local/Temp/bilques-checks/check-contrast.mjs" http://localhost:3123`
Expected (exit 0):

```
PASS 5.01:1  #f5f0eb on #5c6b58  Contact card heading
PASS 5.01:1  #f5f0eb on #5c6b58  Contact card number line
PASS 5.01:1  #f5f0eb on #5c6b58  Floating WhatsApp button
PASS 5.01:1  #f5f0eb on #5c6b58  Shipping: Ask about sizing
PASS 5.01:1  #f5f0eb on #5c6b58  Account: WhatsApp button
PASS 5.01:1  #f5f0eb on #5c6b58  .btn-sage class
```

Then open `http://localhost:3123/contact` and `/shipping` in a browser and hover the green controls: each turns ink (`#2c2c2c`) with the text still clear (12.33:1).

- [ ] **Step 7: Type-check and run every test**

Run: `npx tsc --noEmit` — expected: no output, exit 0.
Run: `npx vitest run` — expected: `Tests  136 passed (136)` (no test changes in this task).

- [ ] **Step 8: Commit**

```bash
git add src/app/globals.css src/components/WhatsAppButton.tsx "src/app/(shop)/contact/page.tsx"
git commit -F - <<'EOF'
Give the green buttons type that can be read

White on the light sage measured 2.85:1, and the Contact card's number
line 2.50:1, against the 4.5:1 text needs. The floating WhatsApp
button, the Contact card and every .btn-sage (Account, Shipping, the
receipt upload after checkout, the admin's WhatsApp and payment
buttons) now use the pairing Add to bag already had: paper on the deep
sage, 5.01:1, turning ink on hover.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 3: Keep the floating WhatsApp button off product pages

**Files:**
- Modify: `src/lib/site.ts:27-28` (add after `whatsappLink`)
- Create: `src/lib/site.test.ts`
- Modify: `src/components/WhatsAppButton.tsx:4, 58-72`
- Check: `C:/Users/DELL/AppData/Local/Temp/bilques-checks/check-whatsapp-float.mjs`

**Interfaces:**
- Consumes: the colour classes Task 2 put in the floating button's `className` (`bg-sage-deep`, `text-paper`, `hover:bg-ink`).
- Produces: `showsFloatingWhatsApp(pathname: string): boolean` from `src/lib/site.ts`.

- [ ] **Step 1: Write the failing unit tests**

Create `src/lib/site.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { showsFloatingWhatsApp } from "./site";

describe("showsFloatingWhatsApp", () => {
  it("floats over the pages people browse", () => {
    for (const path of ["/", "/shop", "/about", "/contact", "/cart", "/track", "/shipping", "/wishlist"]) {
      expect(showsFloatingWhatsApp(path)).toBe(true);
    }
  });

  it("stays off checkout, where a second way to buy only distracts", () => {
    expect(showsFloatingWhatsApp("/checkout")).toBe(false);
    expect(showsFloatingWhatsApp("/checkout/confirmed")).toBe(false);
  });

  it("stays off product pages at every width, where it lands on Save", () => {
    expect(showsFloatingWhatsApp("/product/kurta")).toBe(false);
  });
});
```

- [ ] **Step 2: Run them to make sure they fail**

Run: `npx vitest run src/lib/site.test.ts`
Expected: all three FAIL with a `TypeError` saying `showsFloatingWhatsApp` is not a function.

- [ ] **Step 3: Write the rule**

In `src/lib/site.ts`, directly after `whatsappLink`, add:

```ts
/**
 * Whether the floating WhatsApp button belongs on a page.
 *
 * Not over checkout: someone mid-payment does not need a second way to buy.
 * Not over a product page, at any width: it carries its own WhatsApp line
 * under the buy row, and on windows narrower than about 1340px the floating
 * button sits on Save as the buy row scrolls past the corner.
 */
export const showsFloatingWhatsApp = (pathname: string): boolean =>
  !pathname.startsWith("/checkout") && !pathname.startsWith("/product/");
```

- [ ] **Step 4: Run the unit tests to make sure they pass**

Run: `npx vitest run src/lib/site.test.ts`
Expected: 3 PASS.

- [ ] **Step 5: Write the browser check and watch it fail**

Create `C:/Users/DELL/AppData/Local/Temp/bilques-checks/check-whatsapp-float.mjs`:

```js
// node check-whatsapp-float.mjs <baseUrl>
// The floating WhatsApp button must be absent on product pages at every width
// (so it can never sit on the Save button) and present everywhere else, and a
// product page must still offer WhatsApp through its own inline link.
// Exits 1 on any failure.
import { spawn } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const BASE = process.argv[2] ?? "http://localhost:3000";
const VIEWPORTS = [[1440, 900], [1280, 720], [1024, 768], [768, 1024], [390, 844]];

const chrome = spawn("C:/Program Files/Google/Chrome/Application/chrome.exe", [
  "--headless=new", "--remote-debugging-port=9338", `--user-data-dir=${mkdtempSync(join(tmpdir(), "float-"))}`,
  "--no-first-run", "--hide-scrollbars", "about:blank",
], { stdio: "ignore" });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let target;
for (let i = 0; i < 50 && !target; i++) {
  try { target = (await (await fetch("http://127.0.0.1:9338/json/list")).json()).find((t) => t.type === "page"); } catch {}
  if (!target) await sleep(200);
}
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener("open", r));
let id = 0; const pending = new Map(); const listeners = [];
ws.addEventListener("message", (e) => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } else listeners.forEach((l) => l(m)); });
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
await send("Page.enable"); await send("Runtime.enable");
await send("Network.setUserAgentOverride", { userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36" });

async function open(path) {
  const loaded = new Promise((r) => { const l = (m) => { if (m.method === "Page.loadEventFired") { listeners.splice(listeners.indexOf(l), 1); r(); } }; listeners.push(l); });
  await send("Page.navigate", { url: BASE + path });
  await Promise.race([loaded, sleep(20000)]);
  await sleep(1000);
}
const evaluate = async (expression) => (await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true })).result.result.value;
const INLINE_WHATSAPP = `!!document.querySelector('main a[href^="https://wa.me/"]')`;
const FLOAT_SHOWN = `(() => { const a = document.querySelector('a[aria-label="Message Bilques on WhatsApp"]'); return !!a && getComputedStyle(a).display !== "none"; })()`;

// Any product will do: take the first one the shop lists.
await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 720, deviceScaleFactor: 1, mobile: false });
await open("/shop");
const product = await evaluate(`document.querySelector('a[href^="/product/"]')?.getAttribute("href")`);
if (!product) { console.log("FAIL no product link on /shop"); process.exit(1); }

let failed = 0;
for (const [w, h] of VIEWPORTS) {
  await send("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: 1, mobile: w < 768 });
  await open(product);
  const onProduct = await evaluate(FLOAT_SHOWN);
  const inline = await evaluate(INLINE_WHATSAPP);
  await open("/shop");
  const onShop = await evaluate(FLOAT_SHOWN);
  const ok = !onProduct && inline && onShop;
  if (!ok) failed++;
  console.log(`${ok ? "PASS" : "FAIL"} ${w}x${h}  float on ${product}: ${onProduct ? "shown" : "hidden"}, inline link: ${inline ? "yes" : "NO"}  |  float on /shop: ${onShop ? "shown" : "hidden"}`);
}
ws.close(); chrome.kill();
process.exit(failed ? 1 : 0);
```

Run: `node "C:/Users/DELL/AppData/Local/Temp/bilques-checks/check-whatsapp-float.mjs" http://localhost:3123`
Expected (exit 1; the product is the first one your local shop lists, for example `/product/suti-kurta`):

```
FAIL 1440x900  float on /product/suti-kurta: shown, inline link: yes  |  float on /shop: shown
FAIL 1280x720  float on /product/suti-kurta: shown, inline link: yes  |  float on /shop: shown
FAIL 1024x768  float on /product/suti-kurta: shown, inline link: yes  |  float on /shop: shown
FAIL 768x1024  float on /product/suti-kurta: shown, inline link: yes  |  float on /shop: shown
PASS 390x844  float on /product/suti-kurta: hidden, inline link: yes  |  float on /shop: shown
```

- [ ] **Step 6: Use the rule in `WhatsAppButton`**

In `src/components/WhatsAppButton.tsx`, replace:

```tsx
import { whatsappLink } from "@/lib/site";
```

with:

```tsx
import { showsFloatingWhatsApp, whatsappLink } from "@/lib/site";
```

Replace:

```tsx
  /* Nothing floats over checkout. A shopper mid-payment does not need a second
     way to buy, and the confirmation page has its own celebration. */
  if (pathname.startsWith("/checkout")) return null;

  /* On phones the product page already parks a buy bar above the tab bar, and
     two fixed elements in the same corner is one too many. Desktop has the
     room, and the product page carries its own inline WhatsApp line either
     way. */
  const crowdedOnPhones = pathname.startsWith("/product/");
```

with:

```tsx
  // Not over checkout or a product page; the reasons are kept with the rule.
  if (!showsFloatingWhatsApp(pathname)) return null;
```

Replace:

```tsx
      className={`group fixed right-4 bottom-tabbar z-50 mb-4 h-14 items-center gap-3 rounded-full bg-sage-deep px-4 text-paper shadow-lg transition-colors hover:bg-ink md:right-6 md:bottom-6 md:mb-0 ${
        crowdedOnPhones ? "hidden md:flex" : "flex"
      }`}
```

with:

```tsx
      className="group fixed right-4 bottom-tabbar z-50 mb-4 flex h-14 items-center gap-3 rounded-full bg-sage-deep px-4 text-paper shadow-lg transition-colors hover:bg-ink md:right-6 md:bottom-6 md:mb-0"
```

- [ ] **Step 7: Run the browser check to make sure it passes**

Run: `node "C:/Users/DELL/AppData/Local/Temp/bilques-checks/check-whatsapp-float.mjs" http://localhost:3123`
Expected (exit 0):

```
PASS 1440x900  float on /product/suti-kurta: hidden, inline link: yes  |  float on /shop: shown
PASS 1280x720  float on /product/suti-kurta: hidden, inline link: yes  |  float on /shop: shown
PASS 1024x768  float on /product/suti-kurta: hidden, inline link: yes  |  float on /shop: shown
PASS 768x1024  float on /product/suti-kurta: hidden, inline link: yes  |  float on /shop: shown
PASS 390x844  float on /product/suti-kurta: hidden, inline link: yes  |  float on /shop: shown
```

- [ ] **Step 8: Type-check, run every test, re-run the contrast check**

Run: `npx tsc --noEmit` — expected: no output, exit 0.
Run: `npx vitest run` — expected: `Test Files  16 passed (16)` and `Tests  139 passed (139)`.
Run: `node "C:/Users/DELL/AppData/Local/Temp/bilques-checks/check-contrast.mjs" http://localhost:3123` — expected: still 6 PASS (the float measured on `/shop`).

Stop the dev server (see Running the Checks).

- [ ] **Step 9: Commit**

```bash
git add src/lib/site.ts src/lib/site.test.ts src/components/WhatsAppButton.tsx
git commit -F - <<'EOF'
Keep the floating WhatsApp button off product pages

It already stood aside there on phones, where the buy bar takes the
corner, on the grounds that a desktop has room. Between about 768 and
1340px wide it does not: the button sat on Save as the buy row scrolled
past, measured at 1280x720 and 1024x768 on the live shop. A product
page has its own WhatsApp line under the buy row, so the floating one
now stays off product pages at every width. Where it appears is one
tested rule in site.ts.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 4: Ship and check the live site

**Files:** none changed.

**Interfaces:**
- Consumes: the commits from Tasks 1–3 and the three check scripts.

- [ ] **Step 1: Get the owner's go-ahead to deploy**

Pushing `master` publishes bilques.com. Ask the owner and wait for a yes.

- [ ] **Step 2: Push**

Run: `git push origin master`
Expected: `master -> master` with the three new commits.

- [ ] **Step 3: Wait for Hostinger to deploy**

Run in the background (each pass takes about half a minute; the deploy usually lands within two minutes):

```bash
for i in $(seq 1 40); do node "C:/Users/DELL/AppData/Local/Temp/bilques-checks/check-whatsapp-float.mjs" https://bilques.com > /dev/null && { echo "live"; break; }; sleep 30; done
```

Expected: `live`.

- [ ] **Step 4: Run the browser checks against the live site**

Run: `node "C:/Users/DELL/AppData/Local/Temp/bilques-checks/check-whatsapp-float.mjs" https://bilques.com`
Expected: 5 PASS lines, with the live product (for example `/product/kurta`).

Run: `node "C:/Users/DELL/AppData/Local/Temp/bilques-checks/check-contrast.mjs" https://bilques.com`
Expected: 6 PASS lines at 5.01:1.

- [ ] **Step 5: Check the live collection name agrees across pages**

The live database cannot be edited from here, so compare what the product page and the About page say:

```bash
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36"
curl -s -A "$UA" https://bilques.com/product/kurta | grep -o 'class="field-label"[^>]*>[^<]*' | head -1
curl -s -A "$UA" https://bilques.com/about | sed 's/<!-- -->//g' | grep -o 'The cotton we use across [^,]*,'
```

Expected: the same collection name in both — `Roze` until the owner changes it in Task 5.

---

### Task 5: Owner — name the collection and the piece (in the admin, no code)

These need the owner's admin login. Tasks 1–4 do not depend on them, and they can be done at any time. After Task 4 the collection's name reaches every page.

- [ ] **Step 1: Choose the collection's name**

Admin → Collections → the Rozana card → **Name**. Enter the name the shop goes by and save. Recommended: **Rozana**. It is the name in the design spec, it matches the Urdu name روزانہ, and it matches the address `/shop?collection=rozana`; "Roze" reads as a shortened slip.

- [ ] **Step 2: Give the piece a proper name**

Admin → Products → kurta → **Name**, for example **Clay Kurta**, then save. The address changes with the name: `/product/kurta` becomes `/product/clay-kurta`, and the old address stops working. Replace any link to it already posted on Instagram or WhatsApp.

- [ ] **Step 3: Check it**

Open the piece's new address on bilques.com. Above the title: the name from Step 1, in capitals. The title: the new name. The About page caption ("The cotton we use across …") shows the same collection name.
