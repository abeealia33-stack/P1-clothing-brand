/**
 * Generates the placeholder product imagery in /public/cloth.
 *
 * These stand in for the owner's real photographs until she uploads them
 * through the admin panel. They are drawn rather than photographed so the
 * catalogue reads as clothing at every size without shipping a single
 * kilobyte of raster image. Delete this script once real photos land.
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const out = resolve(here, "..", "public", "cloth");
mkdirSync(out, { recursive: true });

const PAPER = "#F5F0EB";
const KHADDAR = "#E8DFD4";

/** Mixes a hex colour toward black (t<0) or white (t>0). */
function shade(hex, t) {
  const n = parseInt(hex.slice(1), 16);
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) =>
    Math.round(t >= 0 ? v + (255 - v) * t : v * (1 + t))
  );
  return `#${c.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

/** Garment outlines, drawn in a 400x533 box. */
const shapes = {
  kurta: (w) => `
    <path d="M200 88 L134 108 L112 176 L146 190 L140 448 Q200 462 260 448 L254 190 L288 176 L266 108 Z" fill="${w}"/>
    <path d="M172 88 Q200 122 228 88" fill="none" stroke="${shade(w, -0.18)}" stroke-width="3"/>
    <path d="M200 122 L200 300" stroke="${shade(w, -0.1)}" stroke-width="2" opacity=".5"/>`,
  oversized: (w) => `
    <path d="M200 86 L118 110 L88 190 L130 208 L124 470 Q200 486 276 470 L270 208 L312 190 L282 110 Z" fill="${w}"/>
    <path d="M166 86 Q200 128 234 86" fill="none" stroke="${shade(w, -0.18)}" stroke-width="3"/>
    <path d="M130 208 L124 402" stroke="${shade(w, -0.1)}" stroke-width="2" opacity=".45"/>
    <path d="M270 208 L276 402" stroke="${shade(w, -0.1)}" stroke-width="2" opacity=".45"/>`,
  shirt: (w) => `
    <path d="M200 92 L124 112 L98 186 L138 202 L134 424 Q200 438 266 424 L262 202 L302 186 L276 112 Z" fill="${w}"/>
    <path d="M170 92 L200 126 L230 92" fill="none" stroke="${shade(w, -0.2)}" stroke-width="3"/>
    <path d="M200 126 L200 424" stroke="${shade(w, -0.16)}" stroke-width="2"/>
    <rect x="150" y="196" width="42" height="46" fill="none" stroke="${shade(w, -0.14)}" stroke-width="2"/>
    <circle cx="200" cy="200" r="3.5" fill="${shade(w, -0.3)}"/>
    <circle cx="200" cy="272" r="3.5" fill="${shade(w, -0.3)}"/>
    <circle cx="200" cy="344" r="3.5" fill="${shade(w, -0.3)}"/>`,
  pants: (w) => `
    <path d="M126 120 L274 120 L282 158 L266 470 L212 470 L200 250 L188 470 L134 470 L118 158 Z" fill="${w}"/>
    <rect x="126" y="120" width="148" height="30" fill="${shade(w, -0.12)}"/>
    <path d="M186 150 L200 172 L214 150" fill="none" stroke="${shade(w, -0.24)}" stroke-width="2"/>`,
  set: (w) => `
    <path d="M200 70 L142 88 L122 144 L152 156 L148 288 Q200 300 252 288 L248 156 L278 144 L258 88 Z" fill="${w}"/>
    <path d="M176 70 Q200 98 224 70" fill="none" stroke="${shade(w, -0.18)}" stroke-width="3"/>
    <path d="M144 330 L256 330 L262 356 L250 496 L208 496 L200 386 L192 496 L150 496 L138 356 Z" fill="${shade(w, -0.07)}"/>
    <rect x="144" y="330" width="112" height="22" fill="${shade(w, -0.18)}"/>`,
  stack: (w, alt = []) => {
    const tones = [alt[0] || shade(w, 0.16), alt[1] || w, alt[2] || shade(w, -0.16)];
    const boxes = [
      [88, 116, 224, 108],
      [76, 236, 248, 108],
      [96, 356, 208, 108],
    ];
    return boxes
      .map(
        ([x, y, bw, bh], i) => `
    <rect x="${x}" y="${y}" width="${bw}" height="${bh}" rx="4" fill="${tones[i]}"/>
    <rect x="${x}" y="${y}" width="${bw}" height="${bh}" rx="4" fill="none" stroke="${shade(tones[i], -0.26)}" stroke-width="2"/>
    <path d="M${x} ${y + bh / 2} H${x + bw}" stroke="${shade(tones[i], -0.2)}" stroke-width="2" opacity=".65"/>
    <path d="M${x + 14} ${y + 10} V${y + bh - 10}" stroke="${shade(tones[i], -0.14)}" stroke-width="1.5" opacity=".5"/>`
      )
      .join("");
  },
};

/**
 * View 1 is the garment on the ground, view 2 a close crop of the weave,
 * view 3 the garment folded — the three shots a small brand actually takes.
 */
function svg({ shape, cloth, view, alt = [] }) {
  const id = Math.random().toString(36).slice(2, 8);
  const ground = view === 2 ? shade(cloth, 0.5) : view === 3 ? KHADDAR : PAPER;
  const weave = `
    <filter id="w${id}" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.9 0.55" numOctaves="2" seed="${
        view * 7
      }"/>
      <feColorMatrix type="saturate" values="0"/>
    </filter>`;

  let body;
  if (view === 2) {
    // Close crop: the cloth itself, one seam running through it.
    body = `
      <rect width="400" height="533" fill="${cloth}"/>
      <rect width="400" height="533" fill="url(#drape${id})" opacity=".55"/>
      <path d="M-20 366 L420 300" stroke="${shade(cloth, -0.16)}" stroke-width="3"/>
      <path d="M-20 374 L420 308" stroke="${shade(cloth, 0.2)}" stroke-width="1.5" opacity=".7"/>`;
  } else if (view === 3) {
    body = `
      <rect width="400" height="533" fill="${ground}"/>
      <g transform="translate(0,4)">${shapes.stack(cloth, alt)}</g>`;
  } else {
    body = `
      <rect width="400" height="533" fill="${ground}"/>
      <ellipse cx="200" cy="474" rx="122" ry="22" fill="${shade(
        ground,
        -0.1
      )}" opacity=".55"/>
      <g filter="url(#soft${id})">${shapes[shape](cloth, alt)}</g>
      <g>${shapes[shape](cloth, alt)}</g>
      <rect width="400" height="533" fill="url(#drape${id})" opacity=".38" style="mix-blend-mode:multiply"/>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 533" width="400" height="533" role="img">
  <defs>
    <linearGradient id="drape${id}" x1="0" y1="0" x2="1" y2="0.3">
      <stop offset="0" stop-color="${shade(cloth, -0.3)}" stop-opacity=".5"/>
      <stop offset=".38" stop-color="${shade(cloth, 0.35)}" stop-opacity=".25"/>
      <stop offset=".62" stop-color="${shade(cloth, -0.14)}" stop-opacity=".3"/>
      <stop offset="1" stop-color="${shade(cloth, -0.34)}" stop-opacity=".55"/>
    </linearGradient>
    <filter id="soft${id}" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="9"/>
      <feColorMatrix values="0 0 0 0 0.17 0 0 0 0 0.17 0 0 0 0 0.17 0 0 0 .3 0"/>
      <feOffset dy="10"/>
    </filter>
    ${weave}
  </defs>
  ${body}
  <rect width="400" height="533" filter="url(#w${id})" opacity=".13" style="mix-blend-mode:multiply"/>
</svg>`;
}

/** slug -> [silhouette, cloth colour, number of views] */
const plan = {
  "suti-kurta": ["kurta", "#E4DCCF", 3],
  "sada-lawn-kurta": ["kurta", "#EDE7DD", 2],
  "dhoop-kurta": ["kurta", "#D8C7A6", 3],
  "chai-kurta": ["kurta", "#9C7F63", 2],
  "neend-lounge-set": ["set", "#CFCCC4", 3],
  "subah-home-set": ["set", "#EDE7DD", 2],
  "aaram-pajama-set": ["set", "#A98D77", 2],
  "azad-oversized-kurta": ["oversized", "#3A3A3A", 3],
  "hawa-wide-pants": ["pants", "#3A3A3A", 2],
  "baadal-oversized-shirt": ["shirt", "#EDE7DD", 2],
  "rozana-week-bundle": ["stack", "#D8C7A6", 2, ["#E4DCCF", "#8B9E8B", "#A98D77"]],
  "ghar-rest-bundle": ["stack", "#B9C0B4", 2, ["#CFCCC4", "#8B9E8B", "#EDE7DD"]],
  "azad-statement-bundle": ["stack", "#8C8478", 2, ["#3A3A3A", "#EDE7DD", "#3A3A3A"]],
};

let n = 0;
for (const [slug, [shape, cloth, views, alt]] of Object.entries(plan)) {
  for (let v = 1; v <= views; v++) {
    writeFileSync(
      resolve(out, `${slug}-${v}.svg`),
      svg({ shape, cloth, view: v, alt })
    );
    n++;
  }
}

/**
 * Collection covers.
 *
 * The product shots are pale garments on a pale ground, which is right for a
 * catalogue and wrong for a card carrying a name across it. These are their own
 * thing: a mid-tone cloth field with real drape, dark enough at the foot that
 * the collection name reads in white without burying the image under a scrim.
 */
const covers = {
  rozana: { cloth: "#C9C2B6", shape: "kurta" },
  ghar: { cloth: "#B9C0B4", shape: "set" },
  azad: { cloth: "#A9A296", shape: "oversized" },
  bundles: { cloth: "#C4B8A8", shape: "stack" },
};

for (const [slug, { cloth, shape }] of Object.entries(covers)) {
  const g = `${slug}g`;
  writeFileSync(
    resolve(out, `collection-${slug}.svg`),
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" width="400" height="500" role="img">
  <defs>
    <linearGradient id="${g}f" x1="0" y1="0" x2=".85" y2="1">
      <stop offset="0" stop-color="${shade(cloth, 0.3)}"/>
      <stop offset=".45" stop-color="${cloth}"/>
      <stop offset="1" stop-color="${shade(cloth, -0.3)}"/>
    </linearGradient>
    <linearGradient id="${g}s" x1="0" y1="0" x2="0" y2="1">
      <stop offset=".45" stop-color="#1E1C19" stop-opacity="0"/>
      <stop offset="1" stop-color="#1E1C19" stop-opacity=".62"/>
    </linearGradient>
    <filter id="${g}w"><feTurbulence type="fractalNoise" baseFrequency="0.8 0.5" numOctaves="3" seed="9"/><feColorMatrix type="saturate" values="0"/></filter>
  </defs>
  <rect width="400" height="500" fill="url(#${g}f)"/>
  <g opacity=".38" fill="none" stroke="${shade(cloth, -0.4)}" stroke-width="1.5">
    <path d="M-10 150 Q100 116 200 158 T410 140"/>
    <path d="M-10 232 Q110 196 210 240 T410 220"/>
    <path d="M-10 316 Q100 280 200 322 T410 302"/>
  </g>
  <g opacity=".2" transform="translate(0,-30) scale(1,0.94)">${shapes[shape](
    shade(cloth, -0.3)
  )}</g>
  <rect width="400" height="500" fill="url(#${g}s)"/>
  <rect width="400" height="500" filter="url(#${g}w)" opacity=".12" style="mix-blend-mode:multiply"/>
</svg>`
  );
  n++;
}

// The home hero: a wide, quiet frame of cloth with light falling across it.
writeFileSync(
  resolve(out, "hero.svg"),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1600" width="1200" height="1600" role="img">
  <defs>
    <linearGradient id="h" x1="0" y1="0" x2=".7" y2="1">
      <stop offset="0" stop-color="#EFE7DC"/>
      <stop offset=".42" stop-color="#DCD2C4"/>
      <stop offset=".72" stop-color="#C3BAAC"/>
      <stop offset="1" stop-color="#9E968A"/>
    </linearGradient>
    <linearGradient id="light" x1=".2" y1="0" x2=".8" y2="1">
      <stop offset="0" stop-color="#FFFFFF" stop-opacity=".5"/>
      <stop offset=".5" stop-color="#FFFFFF" stop-opacity="0"/>
      <stop offset="1" stop-color="#2C2C2C" stop-opacity=".22"/>
    </linearGradient>
    <filter id="hw"><feTurbulence type="fractalNoise" baseFrequency="0.7 0.45" numOctaves="3" seed="4"/><feColorMatrix type="saturate" values="0"/></filter>
  </defs>
  <rect width="1200" height="1600" fill="url(#h)"/>
  <g opacity=".5" fill="none" stroke="#8A8175" stroke-width="2">
    <path d="M-40 560 Q300 470 620 596 T1240 540"/>
    <path d="M-40 700 Q320 604 640 742 T1240 686"/>
    <path d="M-40 980 Q280 900 600 1030 T1240 972"/>
    <path d="M-40 1160 Q300 1074 620 1206 T1240 1150"/>
  </g>
  <rect width="1200" height="1600" fill="url(#light)"/>
  <rect width="1200" height="1600" filter="url(#hw)" opacity=".11" style="mix-blend-mode:multiply"/>
</svg>`
);
n++;

console.log(`wrote ${n} files to public/cloth`);
