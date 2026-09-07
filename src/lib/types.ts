/**
 * Shapes and fixed lists shared by the storefront, the admin and the database
 * layer. Deliberately free of server imports so client components can use it.
 */

export type CollectionSlug = "rozana" | "ghar" | "azad" | "bundles";

export type Collection = {
  slug: CollectionSlug;
  name: string;
  urdu: string;
  /** Shown under the collection name on the home rail. */
  line: string;
  /** Longer intro at the top of the collection's shop view. */
  intro: string;
};

/** Fixed by the brand, not owner-editable — four collections, always. */
export const collections: Collection[] = [
  {
    slug: "rozana",
    name: "Rozana",
    urdu: "روزانہ",
    line: "For the days that just need getting on with.",
    intro:
      "Kurtas you can pull on at 8am and still feel like yourself in at 6pm. Cotton and lawn, cut straight, nothing that needs ironing twice.",
  },
  {
    slug: "ghar",
    name: "Ghar",
    urdu: "گھر",
    line: "Soft enough to sleep in, decent enough to open the door.",
    intro:
      "Home sets in khaddar and washed cotton. Loose waistbands, deep pockets, and colours that survive a hundred washes.",
  },
  {
    slug: "azad",
    name: "Azad",
    urdu: "آزاد",
    line: "Cut wide. Takes up room on purpose.",
    intro:
      "Oversized shapes for when you want the clothes to say something. Dropped shoulders, long lines, wide legs.",
  },
  {
    slug: "bundles",
    name: "Bundles",
    urdu: "بنڈل",
    line: "Three pieces, one price, a week sorted.",
    intro:
      "Put together so you stop thinking about it. Every bundle ships free and works as a full week of wearing.",
  },
];

export const getCollection = (slug: string): Collection | undefined =>
  collections.find((c) => c.slug === slug);

export const isCollectionSlug = (value: string): value is CollectionSlug =>
  collections.some((c) => c.slug === value);

export type PriceTier = "under-2500" | "2500-5000" | "over-5000";

export const priceTiers: { value: PriceTier; label: string }[] = [
  { value: "under-2500", label: "Under Rs. 2,500" },
  { value: "2500-5000", label: "Rs. 2,500 – 5,000" },
  { value: "over-5000", label: "Over Rs. 5,000" },
];

export const isPriceTier = (value: string): value is PriceTier =>
  priceTiers.some((t) => t.value === value);

export type SortOption = "newest" | "price-asc" | "price-desc";

export const sortOptions: { value: SortOption; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
];

export const isSortOption = (value: string): value is SortOption =>
  sortOptions.some((s) => s.value === value);

/** An owner-created grouping — separate from the fixed Collections above. */
export type Category = {
  id: string;
  name: string;
  slug: string;
  position: number;
};

export type ProductColor = {
  name: string;
  /** Approximate cloth colour, used for the selector swatch. */
  hex: string;
};

/** The only sizes a piece can be marked available in, in display order. */
export const standardSizes = ["XS", "S", "M", "L", "XL", "XXL"] as const;

export type StandardSize = (typeof standardSizes)[number];

export const isStandardSize = (value: string): value is StandardSize =>
  (standardSizes as readonly string[]).includes(value);

export type Product = {
  id: string;
  slug: string;
  name: string;
  urdu: string | null;
  collection: CollectionSlug;
  /** Whole rupees. */
  price: number;
  sizes: string[];
  colors: ProductColor[];
  stock: number;
  photos: string[];
  description: string;
  /** Plain facts a COD shopper asks before buying. */
  details: string[];
  active: boolean;
  position: number;
  /** Owner-created categories this piece is tagged with. */
  categoryIds: string[];
};

export type PaymentMethod = "cod" | "bank" | "jazzcash" | "easypaisa" | "card";

export const paymentMethods: {
  value: PaymentMethod;
  label: string;
  note: string;
  available: boolean;
}[] = [
  {
    value: "cod",
    label: "Cash on delivery",
    note: "Pay the courier when your order reaches you.",
    available: true,
  },
  {
    value: "bank",
    label: "Bank transfer",
    note: "Account details show on the next page. Send us the receipt.",
    available: true,
  },
  {
    value: "jazzcash",
    label: "JazzCash",
    note: "Wallet number shows on the next page. Send us the receipt.",
    available: true,
  },
  {
    value: "easypaisa",
    label: "EasyPaisa",
    note: "Wallet number shows on the next page. Send us the receipt.",
    available: true,
  },
  {
    value: "card",
    label: "Card",
    note: "Not available yet — pick another method for now.",
    available: false,
  },
];

export const paymentLabel = (value: string) =>
  paymentMethods.find((m) => m.value === value)?.label ?? value;

/**
 * The methods where the customer moves the money themselves and we have to
 * recognise it afterwards. Cards will not belong here — a gateway confirms
 * those without anyone looking at a screenshot.
 */
export const transferMethods = ["bank", "jazzcash", "easypaisa"] as const;

export type TransferMethod = (typeof transferMethods)[number];

export const isTransferMethod = (value: string): value is TransferMethod =>
  (transferMethods as readonly string[]).includes(value);

/** Has the money arrived — a different question from where the parcel is. */
export type PaymentStatus = "unpaid" | "review" | "paid";

export const isPaymentStatus = (value: string): value is PaymentStatus =>
  value === "unpaid" || value === "review" || value === "paid";

/* Worded from the owner's side, since that is who reads it in the admin. The
   customer-facing wording lives on the pages themselves. */
export const paymentStatusLabel: Record<PaymentStatus, string> = {
  unpaid: "Awaiting payment",
  review: "Receipt to check",
  paid: "Payment received",
};

export type OrderStatus =
  | "new"
  | "in_progress"
  | "shipped"
  | "delivered"
  | "cancelled";

export type OrderLine = {
  id: string;
  slug: string;
  name: string;
  price: number;
  size: string;
  color: string;
  photo: string;
  qty: number;
};

export type Order = {
  id: string;
  createdAt: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  notes: string | null;
  payment: PaymentMethod;
  paymentStatus: PaymentStatus;
  /** URL of the transfer receipt the customer uploaded, if any. */
  paymentProof: string | null;
  paidAt: string | null;
  lines: OrderLine[];
  subtotal: number;
  shipping: number;
  total: number;
  status: OrderStatus;
};

/** What the customer is told. */
export const statusLabel: Record<OrderStatus, string> = {
  new: "Received — we are getting to it",
  in_progress: "Being prepared",
  shipped: "On its way to you",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

/** What the owner sees and picks from, in the order the work happens. */
export const statusFlow: { value: OrderStatus; label: string }[] = [
  { value: "new", label: "New" },
  { value: "in_progress", label: "In progress" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

/** The stages an order moves through, in order. Cancelled sits outside it. */
export const statusOrder: OrderStatus[] = [
  "new",
  "in_progress",
  "shipped",
  "delivered",
];

/** What the button says when moving an order forward to that stage. */
export const advanceLabel: Partial<Record<OrderStatus, string>> = {
  in_progress: "Start preparing it",
  shipped: "Mark as shipped",
  delivered: "Mark as delivered",
};

/**
 * The wording depends on which way the order is going. Sending it forward is
 * doing the work; sending it back is fixing a mistake; cancelling is neither.
 */
export function statusButtonLabel(from: OrderStatus, to: OrderStatus): string {
  if (to === "cancelled") return "Cancel order";

  const here = statusOrder.indexOf(from);
  const there = statusOrder.indexOf(to);
  const label = statusFlow.find((s) => s.value === to)?.label ?? to;

  if (here === -1 || there > here) return advanceLabel[to] ?? `Mark as ${label}`;
  return `Put back to ${label.toLowerCase()}`;
}

/**
 * Orders saved before the stages were renamed still carry the old words.
 * Reading them through this keeps old orders displaying correctly.
 */
export function normaliseStatus(value: string): OrderStatus {
  const legacy: Record<string, OrderStatus> = {
    packed: "in_progress",
    fulfilled: "delivered",
  };
  const mapped = legacy[value] ?? value;
  return isOrderStatus(mapped) ? mapped : "new";
}

export const isOrderStatus = (value: string): value is OrderStatus =>
  statusFlow.some((s) => s.value === value);

/* -------------------------------------------------- custom design requests -- */

export type CustomRequestStatus = "new" | "contacted" | "closed";

export const customRequestStatusFlow: {
  value: CustomRequestStatus;
  label: string;
}[] = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "closed", label: "Closed" },
];

export const isCustomRequestStatus = (value: string): value is CustomRequestStatus =>
  customRequestStatusFlow.some((s) => s.value === value);

export type CustomMeasurements = {
  heightCm: number;
  weightKg: number;
  chestIn: number;
  waistIn: number;
  shoulderIn: number;
  sleeveIn: number;
};

/** Field-by-field bounds a real body could plausibly have. */
export const measurementRanges: Record<
  keyof CustomMeasurements,
  { label: string; unit: string; min: number; max: number }
> = {
  heightCm: { label: "Height", unit: "cm", min: 100, max: 220 },
  weightKg: { label: "Weight", unit: "kg", min: 25, max: 200 },
  chestIn: { label: "Chest", unit: "in", min: 24, max: 70 },
  waistIn: { label: "Waist", unit: "in", min: 20, max: 70 },
  shoulderIn: { label: "Shoulder", unit: "in", min: 10, max: 30 },
  sleeveIn: { label: "Sleeve length", unit: "in", min: 15, max: 40 },
};

export type CustomDesignRequest = {
  id: string;
  createdAt: string;
  status: CustomRequestStatus;
  styleProductId: string | null;
  styleSlug: string | null;
  styleName: string;
  stylePhoto: string;
  measurements: CustomMeasurements;
  notes: string | null;
  name: string;
  phone: string;
  city: string | null;
};
