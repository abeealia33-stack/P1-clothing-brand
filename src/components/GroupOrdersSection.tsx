import { whatsappLink } from "@/lib/site";

const occasions = ["Mehndi", "Eid", "Dholki", "Bridesmaids", "Mother & daughter"];

/* Hum rang — matching outfits for a group. There is no group-order page yet,
   so the button opens WhatsApp with the request already written, which is
   how these orders would be agreed anyway. */
export default function GroupOrdersSection() {
  return (
    <section className="bqf flip">
      <div className="bqf-wrap">
        <div className="bqf-text">
          <div className="bqf-eyebrow">
            Group orders <span className="urdu">ہم رنگ</span>
          </div>
          <h2>Made to match.</h2>
          <div className="bqf-rule" />
          <p>
            Mehndi, Eid or a family day. Choose one design and we&rsquo;ll stitch it for
            everyone, each to their own measurements, delivered together.
          </p>
          <ul className="bqf-chips">
            {occasions.map((occasion) => (
              <li key={occasion} className="bqf-chip">
                {occasion}
              </li>
            ))}
          </ul>
          <ul className="bqf-facts">
            <li>From 4 people</li>
            <li>Group discount on 6+</li>
            <li>Book 3 weeks ahead</li>
          </ul>
          <a
            className="bqf-btn"
            href={whatsappLink(
              "Hi Bilques, I'd like to plan a group order. How many people, and for which occasion? "
            )}
            target="_blank"
            rel="noopener noreferrer"
          >
            Plan a group order
          </a>
        </div>

        <div className="bqf-group" aria-hidden="true">
          <svg viewBox="0 0 400 300">
            <defs>
              {/* Colours are set on the shapes themselves so they survive
                  being drawn through <use> in every browser. */}
              <g id="bq-kurta">
                <path
                  fill="#C9D3C4"
                  stroke="none"
                  d="M82 20 Q100 28 118 20 L150 30 L182 150 L162 154 L142 70 L142 214 L58 214 L58 70 L38 154 L18 150 L50 30Z"
                />
                <path
                  fill="none"
                  stroke="#2C2C2C"
                  strokeWidth="1.3"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  d="M82 20 Q100 28 118 20 L150 30 L182 150 L162 154 L142 70 L142 214 L58 214 L58 70 L38 154 L18 150 L50 30Z"
                />
                <path fill="#2C2C2C" stroke="none" d="M88 22 L100 58 L112 22 L108 22 L100 46 L92 22Z" />
                <path
                  fill="#2C2C2C"
                  stroke="none"
                  d="M22 134 L41 138 L40 142 L21 138Z M24 124 L43 128 L42 131 L23 127Z"
                />
                <path
                  fill="#2C2C2C"
                  stroke="none"
                  d="M178 134 L159 138 L160 142 L179 138Z M176 124 L157 128 L158 131 L177 127Z"
                />
                <path fill="#2C2C2C" stroke="none" d="M58 198 H142 V206 H58Z" />
                <path
                  fill="none"
                  stroke="#2C2C2C"
                  strokeWidth="1.3"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  d="M58 176 L62 214 M142 176 L138 214"
                />
                <path
                  fill="none"
                  stroke="#6B6055"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                  d="M62 74 L62 172 M138 74 L138 172"
                />
              </g>
            </defs>
            {/* Two adults at the sides, the child in front of them. */}
            <g className="bqf-k bqf-k1">
              <use href="#bq-kurta" transform="translate(2 40) scale(.95)" />
            </g>
            <g className="bqf-k bqf-k3">
              <use href="#bq-kurta" transform="translate(208 40) scale(.95)" />
            </g>
            <g className="bqf-k bqf-k2">
              <use href="#bq-kurta" transform="translate(134 112) scale(.66)" />
            </g>
          </svg>
        </div>
      </div>
    </section>
  );
}
