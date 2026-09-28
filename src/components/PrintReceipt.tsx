"use client";

/**
 * Prints the page. Every browser worth naming offers "save as PDF" from its
 * own print dialogue, so this needs no library and still hands the customer a
 * file to keep — the print rules in globals.css strip the page to the receipt.
 */
export default function PrintReceipt() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="btn btn-quiet mt-5 w-full"
    >
      Print or save receipt
    </button>
  );
}
