"use client";

import { useCallback, useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Script from "next/script";
import { trackMetaPurchase, type MetaPurchase } from "@/lib/meta-purchase";

export default function MetaPixel({
  pixelId,
  purchase,
}: {
  pixelId: string;
  purchase?: MetaPurchase;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // Order lookup URLs can contain a customer's phone number.
  const privatePage =
    pathname === "/track" ||
    pathname === "/checkout/confirmed" ||
    pathname === "/customize/submitted";
  const ready = useRef(false);
  const lastUrl = useRef<string | null>(null);

  const pageView = useCallback(() => {
    if (privatePage) {
      lastUrl.current = null;
      if (ready.current && purchase && pathname === "/checkout/confirmed") {
        trackMetaPurchase(pixelId, purchase);
      }
      return;
    }
    if (!ready.current || !window.fbq) return;
    const url = window.location.href;
    if (lastUrl.current === url) return;
    window.fbq("trackSingle", pixelId, "PageView");
    lastUrl.current = url;
  }, [pixelId, privatePage, purchase, pathname]);

  // The layout persists, so the base script alone misses client-side visits.
  useEffect(pageView, [pathname, searchParams, pageView]);

  if (privatePage && !(purchase && pathname === "/checkout/confirmed")) return null;

  return (
    <Script
      id="meta-pixel"
      strategy="afterInteractive"
      onReady={() => {
        ready.current = true;
        pageView();
      }}
    >
      {`
        !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){
        n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;
        s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}
        (window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
        fbq.disablePushState = true;
        fbq('set', 'autoConfig', false, '${pixelId}');
        fbq('init', '${pixelId}');
      `}
    </Script>
  );
}
