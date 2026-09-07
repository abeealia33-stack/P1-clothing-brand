# Custom design requests

Lets a customer ask for a shirt made to their own measurements, starting
from an existing piece as the base style. Quote-first: nothing is charged
at submission — the owner reviews the request and contacts the customer to
agree a price, same as any manual-transfer order today.

## Data model

New `CustomDesignRequest` model (`prisma/schema.prisma`), alongside `Order`:

```prisma
model CustomDesignRequest {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())
  /// new | contacted | closed
  status    String   @default("new")

  /// The piece picked as a starting point. Kept as a soft link, like
  /// OrderItem.productId — retiring the product must not break old requests.
  styleProductId String?
  styleProduct   Product? @relation(fields: [styleProductId], references: [id], onDelete: SetNull)
  /// Snapshot, so the request still reads sensibly if the product is edited
  /// or removed later.
  styleName      String
  stylePhoto     String   @db.Text

  heightCm   Float
  weightKg   Float
  chestIn    Float
  waistIn    Float
  shoulderIn Float
  sleeveIn   Float

  notes String? @db.Text

  name  String
  phone String
  city  String?

  @@index([status, createdAt])
}
```

Add the inverse relation `customRequests CustomDesignRequest[]` on `Product`.

## Customer flow

`src/app/(shop)/customize/page.tsx` + `actions.ts`, following the
`checkout/` pattern (client page + `"use server"` action, server re-validates
everything the client already checked).

One page, one submit:
1. **Style grid** — active products rendered as a photo grid (reusing
   `ClothImage`), radio-selected rather than added to cart.
2. **Measurements** — height (cm), weight (kg), chest/waist/shoulder/sleeve
   (inches), plain number inputs with required + positive + sane-range
   validation.
3. **Contact** — name, phone, city (same fields checkout collects, minus
   address — nothing ships yet).

Submitting calls `submitCustomRequestAction`, which re-validates, rate-limits
(`createRateLimit`, same shape as `orderLimit` in checkout's `actions.ts`),
writes the row, and redirects to `/customize/submitted` (mirrors
`checkout/confirmed`, but no order number, payment, or tracking — just a
"we'll contact you" message and a WhatsApp link).

## Admin flow

`src/app/admin/custom-requests/` — `page.tsx` (list) and `[id]/page.tsx`
(detail), mirroring `admin/orders/` exactly:

- List: status filter chips (`new` / `contacted` / `closed`, plus "All"),
  each row showing name, phone, style thumbnail + name, submitted date,
  status pill.
- Detail: full measurement table, chosen style (photo, name, link to the
  product's admin edit page), notes, contact info with `tel:` and
  `whatsappLink()` actions (same as the order detail page), status buttons
  (new → contacted → closed, plus the ability to go back, same pattern as
  `StatusButtons`).
- New admin nav entry ("Custom requests") in `src/lib/admin-nav.ts`, in the
  Overview group next to Orders.

## Homepage entry point

A new section on `src/app/(shop)/page.tsx`, added alongside the existing
hero (not replacing it) — a card/banner with "Custom design" copy and a
button to `/customize`. Placed after the hero, before "Four ways to get
dressed", so it reads as an option next to the four fixed collections
rather than competing with the main hero message.

## Error handling

Same shape as checkout: the server action returns `{ ok: false, errors }`
for validation failures (measurement out of range, missing contact fields,
unknown style product), re-rendering the form with field-level errors. No
stock or payment concerns — nothing is deducted or charged.

## Testing

`src/lib/custom-requests-db.test.ts`, following `orders-db.test.ts`'s
pattern (throwaway copy of the dev SQLite database): covers creating a
request, listing/filtering by status, and moving a request through
new → contacted → closed.
