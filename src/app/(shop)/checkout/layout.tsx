import { noIndex } from "@/lib/seo";

export const metadata = { title: "Checkout", robots: noIndex };

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
