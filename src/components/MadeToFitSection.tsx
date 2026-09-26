import Link from "next/link";

/* Three cards folded like a lookbook: a kurta with its measurements marked in
   dashes, flanked by a collar detail and a hem detail. Decorative only. */
export default function MadeToFitSection() {
  return (
    <section className="bqf">
      <div className="bqf-wrap">
        <div className="bqf-text">
          <h2>Made to fit you.</h2>
          <div className="bqf-rule" />
          <p>
            Pick any piece as your starting point and send us your measurements.
            We&rsquo;ll call to agree the price before anything is cut.
          </p>
          <Link href="/customize" className="bqf-btn">
            Start designing
          </Link>
        </div>

        <div className="bqf-fold" aria-hidden="true">
          <div className="bqf-panel l">
            <svg viewBox="0 0 120 120">
              <path className="bqf-fab" d="M10 30 Q60 50 110 30 L110 110 L10 110Z" />
              <path d="M10 30 Q35 42 44 40 L60 88 L76 40 Q85 42 110 30" />
              <path className="bqf-trim" d="M44 40 L60 88 L76 40 L70 40 L60 72 L50 40Z" />
              <path className="bqf-dash" d="M10 36 Q30 46 40 46 M80 46 Q90 46 110 36" />
              <path className="bqf-dash" d="M38 44 L60 100 L82 44" />
            </svg>
          </div>
          <div className="bqf-panel c">
            <svg viewBox="0 0 200 230">
              <path
                className="bqf-fab"
                d="M82 20 Q100 28 118 20 L150 30 L182 150 L162 154 L142 70 L142 214 L58 214 L58 70 L38 154 L18 150 L50 30Z"
              />
              <path d="M82 20 Q100 28 118 20 L150 30 L182 150 L162 154 L142 70 L142 214 L58 214 L58 70 L38 154 L18 150 L50 30Z" />
              <path className="bqf-trim" d="M88 22 L100 58 L112 22 L108 22 L100 46 L92 22Z" />
              <path
                className="bqf-trim"
                d="M22 134 L41 138 L40 142 L21 138Z M24 124 L43 128 L42 131 L23 127Z"
              />
              <path
                className="bqf-trim"
                d="M178 134 L159 138 L160 142 L179 138Z M176 124 L157 128 L158 131 L177 127Z"
              />
              <path className="bqf-trim" d="M58 198 H142 V206 H58Z" />
              <path d="M58 176 L62 214 M142 176 L138 214" />
              <path className="bqf-dash" d="M62 74 L62 172 M138 74 L138 172 M62 194 H138" />
              <path className="bqf-dash" d="M54 36 L60 70 M146 36 L140 70" />
            </svg>
          </div>
          <div className="bqf-panel r">
            <svg viewBox="0 0 120 120">
              <path className="bqf-fab" d="M30 10 L90 10 L96 104 L24 104Z" />
              <path d="M30 10 L90 10 L96 104 L24 104Z" />
              <path className="bqf-trim" d="M26 72 L94 72 L94.8 80 L25.4 80Z" />
              <path className="bqf-trim" d="M27.6 86 L92.6 86 L93.3 92 L27 92Z" />
              <path className="bqf-dash" d="M29 20 L91 20 M25 100 L95 100" />
              <path d="M24 104 Q60 114 96 104" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
