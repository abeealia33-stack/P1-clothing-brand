# Bilques Website — Design Spec

Date: 2026-09-05

## Brand Context

- **Brand**: Bilques — "Aaram se tayaar" (Ready with comfort)
- **Colors**: Off-white `#F5F0EB` / Charcoal `#2C2C2C` / Sage `#8B9E8B`
- **Fonts**: Cormorant Garamond (headings), Inter (body), Noto Nastaliq Urdu (tagline/brand accents only)
- **Collections**: Rozana (daily) → Ghar (home) → Azad (oversized/expressive) → Bundles
- **Price range**: PKR 1,800–3,500 per piece / PKR 5,500–7,500 bundles
- **Payments**: COD first, then bank transfer, JazzCash/EasyPaisa, card last
- **Shipping**: Free over PKR 3,000 / Major cities 2–4 days / Rest 4–7 days
- **Sales channels**: Instagram + WhatsApp + Website
- **Target audience**: Working women & university girls 18–32, at-home women 25–45
- **Traffic profile**: ~80% mobile — every design and performance decision is mobile-first

## Goals & Constraints

1. Feel premium and "3D interactive" through **motion and depth**, not literal 3D/WebGL — must stay light on Hostinger hosting and fast on mobile data.
2. Fully custom-built (not WordPress/WooCommerce) — built in VS Code with Claude's help.
3. Owner (no coding skills) must be able to manage products/orders herself day-to-day via a simple admin panel — no code edits needed for routine updates.
4. Mobile-first UX: thumb-reachable navigation, fast page loads, minimal JS weight.

## Tech Stack & Hosting

- **Framework**: Next.js (App Router) + React — built and deployed from VS Code
- **Styling**: Tailwind CSS
- **Motion/depth effects**: CSS scroll-driven animations + lightweight `IntersectionObserver` (no heavy animation library, no WebGL/3D models)
- **Hosting**: Hostinger Node.js/Cloud hosting plan, running the Next.js server directly
- **Database**: MySQL (included with Hostinger), accessed via Prisma (server-side only — does not add browser weight)
- **Images**: Cloudinary free tier — uploaded via the admin panel, auto-optimized (resized, WebP) and served from Cloudinary's CDN
- **Admin auth**: single password-protected `/admin` route with a cookie session (no multi-user auth needed)
- **Order email notification**: Resend free tier sends the owner an email on each new order

## Data Model (high level)

- **Product**: name, collection (Rozana/Ghar/Azad/Bundles), price, sizes, colors, stock, photos (Cloudinary URLs), description
- **Order**: customer name/phone/address, items (product + size/color/qty), payment method (COD default; bank transfer/JazzCash/EasyPaisa/card as alternate options), status (new/fulfilled), timestamps

## Admin Panel (`/admin`)

- Password-protected, single owner login
- Add/edit/delete products, upload photos (goes to Cloudinary automatically)
- View orders list, mark orders fulfilled
- No multi-user roles, no analytics dashboard beyond order list (out of scope for v1)

## Site Structure & Pages

- **Home** — full-bleed hero (image + "Aaram se tayaar" tagline, gentle parallax scroll) → short brand story line → scaling mood/collection cards (Rozana / Ghar / Azad / Bundles) that grow as they center on scroll
- **Shop / Collection pages** — grid of product cards, filterable by collection; cards get a soft lift + shadow on tap/hover
- **Product page (PDP)** — image gallery (swipeable), color/size selectors, description, **sticky bottom Add-to-Cart bar** (price + button always visible)
- **Cart** — line items, quantity edit, subtotal, free-shipping threshold indicator (PKR 3,000)
- **Checkout** — single form (name, phone, address, payment method — COD default), creates an Order record, sends owner notification email, shows confirmation page
- **About** — brand story
- **Shipping & Returns / COD policy**
- **Contact** — WhatsApp and Instagram links prominent
- **Track Order** — simple lookup by phone number or order ID, shows status

## Mobile UX

- **Bottom tab bar** navigation: Home / Shop / Search / Cart / Account — always within thumb reach
- All layouts built mobile-first in Tailwind; desktop is a progressive enhancement, not the primary design target
- Per-component spacing/typography tuned for small screens first

## Performance Guardrails

- No animation/3D libraries beyond CSS + `IntersectionObserver` — keeps JS bundle minimal
- All product images served through Cloudinary at device-appropriate sizes (no full-resolution images shipped to phones)
- Next.js automatic code-splitting — each page loads only what it needs
- Below-the-fold sections and images lazy-loaded

## Explicitly Out of Scope (v1)

- Full bilingual (English/Urdu) site — Urdu is used only for brand accents (tagline, collection flourishes), not full translation
- Real 3D models / WebGL product viewers — motion/depth effects only
- Payment gateway integration for JazzCash/EasyPaisa/card — v1 ships with COD + bank transfer captured as selected method on the order; live gateway integration is a later phase
- Multi-user admin accounts or role permissions
- Analytics/reporting dashboard beyond a basic order list

## Open Items for Later Phases

- Which specific JazzCash/EasyPaisa/card gateway to integrate once payment volume justifies it
- Whether to add customer accounts/order history (v1 uses phone/order-ID lookup instead of login)
My logo ![alt text](image.png) 