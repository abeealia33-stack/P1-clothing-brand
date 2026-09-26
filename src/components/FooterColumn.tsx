"use client";

import { useId, useState } from "react";

/**
 * One column of footer links: a heading and a list.
 *
 * On a phone it folds, because three columns stacked open push the legal
 * line most of a screen away. From md up it cannot fold, so the heading is
 * plain text rather than a button that does nothing — each is hidden from
 * the accessibility tree at the width where it does not apply.
 */
export default function FooterColumn({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();

  return (
    <div className="footer-col">
      <h2 className="footer-heading">
        <button
          type="button"
          className="footer-toggle md:hidden"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen((o) => !o)}
        >
          {title}
          <svg
            className="footer-chevron"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
        <span className="hidden md:block">{title}</span>
      </h2>

      <nav id={id} aria-label={title} className={`footer-links ${open ? "is-open" : ""}`}>
        <ul>{children}</ul>
      </nav>
    </div>
  );
}
