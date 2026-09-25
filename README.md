# Bilques — shop and admin panel

Next.js 16 (App Router) + Tailwind v4 + Prisma 7, built to the spec in
[docs/superpowers/specs/2026-09-05-bilques-website-design.md](docs/superpowers/specs/2026-09-05-bilques-website-design.md).

Two halves: the shop customers see, and `/admin` where the owner manages
pieces and orders without touching code.

---

## Running it on your own computer

You need [Node.js](https://nodejs.org) 20.9 or newer. Nothing else — no
database to install.

```bash
npm install
cp .env.example .env      # then open .env and set ADMIN_PASSWORD
npm run db:push:dev       # creates the local database file
npm run db:seed           # fills it with the 13 starting pieces
npm run auth:totp-setup   # scan the QR code, save TOTP_SECRET into .env
npm run dev               # http://localhost:3000
```

The admin panel is at **http://localhost:3000/admin**. Signing in takes two
steps: your `ADMIN_PASSWORD`, then the current 6-digit code from whatever
authenticator app (Google Authenticator, Authy, etc.) you scanned the QR code
with during `auth:totp-setup`.

Useful extras:

```bash
npm run db:studio    # a spreadsheet-style view of the database
npm run db:seed      # top the catalogue back up (safe to re-run)
npm run build        # production build
npm run lint
```

---

## Using the admin panel

Go to `/admin` and sign in with your password.

**Orders** is the first thing you see, because it is the daily job.

- The four boxes at the top say what needs doing: how many are new, in
  progress and shipped, and how much money is still owed to you on orders that
  have not been delivered yet.
- Tap an order to open it. You get the customer's name, phone and address, a
  **Call** button and a **WhatsApp** button, what they bought, and what to
  collect from them.
- Every order sits at one of four stages: **New → In progress → Shipped →
  Delivered**. One button moves it to the next one — *Start preparing it*,
  then *Mark as shipped*, then *Mark as delivered*. The smaller buttons under
  it put an order back a stage if you tap the wrong thing, or cancel it.
- The boxes at the top count how many are at each stage, and the filter chips
  show just one stage at a time.
- Customers can follow the same progress on the Track Order page using their
  order number or mobile number.

**Pieces** is your catalogue, grouped by collection.

- **Add a piece** opens a form in plain language — name, collection, price,
  how many you have, description, sizes, colours, photos.
- **Photos**: drag them straight onto the page, or tap *Choose photos*. Drag
  them around to reorder; the first one is what shoppers see first, and it is
  labelled *Main*. The arrows under each photo do the same thing if dragging
  is awkward on your phone.
- **Colours** are a name plus a swatch. Tap one you have used before, or type
  a name and pick a colour.
- **Hide** takes a piece off the shop without deleting it — use this when
  something is temporarily sold out. Setting stock to 0 shows it as sold out
  but keeps it visible.
- **Delete** is permanent, and asks first. Past orders keep their own record
  of what was bought, so deleting a piece never changes your order history.

**Reels** are the short videos that scroll across the home page.

- **Add a reel** — drag a video in (MP4 or MOV, up to 40 MB; filmed upright
  works best), choose which piece it shows, add a caption if you want one.
- Tapping a reel on the shop takes the customer straight to that piece.
- Arrows reorder the strip, **Hide** takes one down without deleting it.
- Only the video in the middle of the screen plays at a time, so a phone on
  mobile data is never loading a dozen clips at once.

Everything you save shows up in the shop immediately.

---

## Putting it on Hostinger

1. **Make a MySQL database** in hPanel → Databases → MySQL Databases. Note the
   database name, user and password.
2. **Upload the project** and create a `.env` file next to `package.json`:

   ```
   DATABASE_URL="mysql://USER:PASSWORD@localhost:3306/DATABASE_NAME"
   ADMIN_PASSWORD="a password only you know"
   SESSION_SECRET="a long random string"
   TOTP_SECRET="from npm run auth:totp-setup, see below"
   ```

   Generate `SESSION_SECRET` with:
   `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

   Generate `TOTP_SECRET` by running `npm run auth:totp-setup` on your own
   computer (not on the server) — it prints a QR code to scan with Google
   Authenticator and the value to paste in here. Run it once; running it
   again makes a new secret and invalidates the old one, so you'd need to
   re-scan.

3. **Set it up and start it:**

   ```bash
   npm install
   npm run db:push      # creates the tables in MySQL
   npm run db:seed      # optional: the 13 starting pieces
   npm run build
   npm start
   ```

`DATABASE_URL` must be set before `npm run build` — the build reads the
catalogue to prepare the home page.

**Photos and videos.** Without any Cloudinary keys, uploads are saved into
`public/uploads` on the server and everything works. Adding the three
`CLOUDINARY_*` values from a free Cloudinary account sends them to Cloudinary's
CDN instead — photos resized, reel videos transcoded to a web-friendly size —
which is better on mobile data and survives redeploys. You can switch at any
time; anything already uploaded keeps working.

Reel videos are the heaviest thing on the site. Cloudinary is worth setting up
before pushing many of them, both for the transcoding and to keep them off the
Hostinger disk.

**Before going live:** change `ADMIN_PASSWORD`, set a real `SESSION_SECRET`
and `TOTP_SECRET`, and update the WhatsApp number, Instagram handle and email
in [src/lib/site.ts](src/lib/site.ts).

---

## How it is put together

**Database.** One schema, [prisma/schema.prisma](prisma/schema.prisma), set to
MySQL. On a laptop with no database installed, `npm run db:push:dev` generates a
SQLite copy of that same schema and uses a plain file instead — so the models
are written once and cannot drift apart. Which one you get is decided by
`DATABASE_URL`: a `file:` URL means the local file, anything else means MySQL.
[prisma.config.ts](prisma.config.ts) and [src/lib/prisma.ts](src/lib/prisma.ts)
pick the matching schema and driver.

**Order history is frozen.** Each order item stores its own copy of the name,
price, size, colour and photo at the moment of purchase. Editing a price or
deleting a piece can never rewrite what someone already bought.

**Prices are never trusted from the browser.** The checkout server action
re-reads every item from the database and recalculates the subtotal, shipping
and total before saving the order.

**Signing in.** Password, then a 6-digit authenticator code, then a session
cookie. The password step sets a short-lived (5 minute) cookie marking "code
still owed"; the code step checks it and, on success, sets the real session
cookie. Both cookies carry an expiry and an HMAC signature — readable by
anyone, forgeable by nobody without `SESSION_SECRET` — and the session is good
for twelve hours. Wrong guesses at either step are rate limited separately.
[src/proxy.ts](src/proxy.ts) redirects signed-out visitors away from `/admin`,
but that is only a convenience: every admin page, every server action and the
upload endpoint check the session themselves, because a server action answers
any POST that reaches it.

**Confirmation pages are private.** Order numbers are short enough to guess, so
the full confirmation — name, phone, street address — opens only in the browser
that placed the order. Everyone else gets Track Order, which shows the status,
the items and the city, and no street address.

---

## Design notes

**The fold.** The home hero is `position: sticky` behind the page body, so the
paper scrolls up over it like cloth folding over cloth. It is the only piece of
non-interactive motion on the site.

**No animation library.** Collection cards grow as they centre using CSS
scroll-driven animations, with an `IntersectionObserver` fallback. Both stand
down under `prefers-reduced-motion`.

**Product cards have no container** — no box, no shared radius, no resting
shadow. The photograph is the card; depth appears only on tap or hover.

**The admin is a different room.** Same palette, but an ink bar across the top
so there is never a doubt about which side of the counter you are on, denser
spacing, and labels in the words the owner would use out loud — "How many do
you have?" rather than "stock".

**Urdu is a flourish, not a translation**, per the spec: the tagline and
collection names only.

---

## Placeholder imagery

`public/cloth/*.svg` is generated by
[scripts/make-cloth.mjs](scripts/make-cloth.mjs) — drawn garment silhouettes
standing in for real photographs. 136 KB for the whole catalogue, no raster
images. Delete the script and the folder once real photos are uploaded through
the admin panel.

---

## Not built yet

Live payment gateways for JazzCash, EasyPaisa and card — the chosen method is
recorded on the order, and COD and bank transfer need no gateway. The owner's
new-order notification email (Resend) is also still to come; orders appear in
`/admin` immediately either way.
