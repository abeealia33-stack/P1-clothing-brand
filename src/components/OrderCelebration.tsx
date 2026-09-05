"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

/**
 * The one moment on the site that celebrates: a scatter of cloth-coloured
 * sprinkles and a soft chime when an order lands.
 *
 * Three things keep it from wearing out its welcome. It fires once per order
 * number, so a refresh or a tap of Back does not set it off again. It is
 * silent for anyone who has muted it, and the choice is remembered. And it
 * does not run at all for a device that has asked for reduced motion — no
 * canvas, no sound.
 */

const PARTICLE_COUNT = 70;
const DURATION_MS = 2600;

/* Cloth colours, not party colours: the sage and clay of the palette, plus
   two neutrals so the scatter reads as thread rather than plastic. */
const COLORS = ["#8b9e8b", "#5c6b58", "#c07b52", "#e8dfd4", "#2c2c2c"];

const MUTE_KEY = "bilques_chime_muted";

/* Read straight from storage rather than from React state: the celebration
   fires on the first commit, before a state-setting effect could have told it
   the customer had muted the chime last time. The subscription below exists
   only so the label on the toggle keeps up — same shape as the cart store. */
function readMuted(): boolean {
  try {
    return window.localStorage.getItem(MUTE_KEY) === "1";
  } catch {
    return false;
  }
}

const muteListeners = new Set<() => void>();

function subscribeMute(listener: () => void) {
  muteListeners.add(listener);
  return () => muteListeners.delete(listener);
}

function writeMuted(next: boolean) {
  try {
    window.localStorage.setItem(MUTE_KEY, next ? "1" : "0");
  } catch {
    /* Blocked storage: the toggle still holds for this page view. */
  }
  for (const listener of muteListeners) listener();
}

/** The server has no storage to read, so it always renders "chime on". */
const mutedOnServer = () => false;

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  spin: number;
  angle: number;
  length: number;
  width: number;
  color: string;
};

/** A short two-note bell, built rather than shipped as an audio file. */
function playChime() {
  const Ctor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!Ctor) return;

  const ctx = new Ctor();
  const now = ctx.currentTime;

  /* A fifth apart and struck a beat late, which is what makes it read as a
     bell rather than a beep. */
  for (const [frequency, delay, gain] of [
    [880, 0, 0.16],
    [1320, 0.06, 0.1],
  ]) {
    const osc = ctx.createOscillator();
    const amp = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = frequency;
    amp.gain.setValueAtTime(0.0001, now + delay);
    amp.gain.exponentialRampToValueAtTime(gain, now + delay + 0.012);
    amp.gain.exponentialRampToValueAtTime(0.0001, now + delay + 0.9);
    osc.connect(amp).connect(ctx.destination);
    osc.start(now + delay);
    osc.stop(now + delay + 1);
  }

  // Let the tail finish, then hand the hardware back.
  setTimeout(() => void ctx.close(), 1400);
}

export default function OrderCelebration({ orderId }: { orderId: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [running, setRunning] = useState(false);
  const muted = useSyncExternalStore(subscribeMute, readMuted, mutedOnServer);

  const toggleMute = useCallback(() => writeMuted(!readMuted()), []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    /* Once per order. sessionStorage rather than local, so a customer who
       orders again next week gets the moment again. */
    const seenKey = `bilques_celebrated_${orderId}`;
    try {
      if (window.sessionStorage.getItem(seenKey)) return;
      window.sessionStorage.setItem(seenKey, "1");
    } catch {
      /* Without storage it may fire twice on a refresh. Not worth blocking. */
    }

    const el = canvas.current;
    const ctx = el?.getContext("2d");
    if (!el || !ctx) return;

    setRunning(true);

    if (!readMuted()) {
      try {
        playChime();
      } catch {
        /* Autoplay policy, no audio device, an old browser — all silent. */
      }
    }

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = el.clientWidth;
    const height = el.clientHeight;
    el.width = width * dpr;
    el.height = height * dpr;
    ctx.scale(dpr, dpr);

    const particles: Particle[] = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: width * (0.5 + (Math.random() - 0.5) * 0.55),
      y: height * 0.28 + Math.random() * 40,
      vx: (Math.random() - 0.5) * 3.4,
      vy: -2 - Math.random() * 4.5,
      spin: (Math.random() - 0.5) * 0.22,
      angle: Math.random() * Math.PI,
      length: 7 + Math.random() * 9,
      width: 1.4 + Math.random() * 1.6,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    }));

    const started = performance.now();
    let frame = 0;

    const draw = (now: number) => {
      const elapsed = now - started;
      if (elapsed > DURATION_MS) {
        ctx.clearRect(0, 0, width, height);
        setRunning(false);
        return;
      }

      // Fade the whole scatter out over the last third rather than letting
      // it pop off the screen.
      const fade = Math.max(0, Math.min(1, (DURATION_MS - elapsed) / (DURATION_MS * 0.4)));
      ctx.clearRect(0, 0, width, height);

      for (const p of particles) {
        p.vy += 0.075; // gravity
        p.vx *= 0.995; // air
        p.x += p.vx;
        p.y += p.vy;
        p.angle += p.spin;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.globalAlpha = fade;
        ctx.strokeStyle = p.color;
        ctx.lineWidth = p.width;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(-p.length / 2, 0);
        ctx.lineTo(p.length / 2, 0);
        ctx.stroke();
        ctx.restore();
      }

      frame = requestAnimationFrame(draw);
    };

    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [orderId]);

  return (
    <>
      <canvas
        ref={canvas}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-50 h-full w-full"
        style={{ display: running ? "block" : "none" }}
      />
      <button
        type="button"
        onClick={toggleMute}
        aria-pressed={muted}
        className="inline-flex items-center gap-1.5 text-sm underline underline-offset-4"
        style={{ color: "var(--color-ink-soft)" }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.3}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M4 7.5v5h2.6L10.5 16V4L6.6 7.5H4Z" />
          {muted ? (
            <path d="m13.5 8 3 4m0-4-3 4" />
          ) : (
            <path d="M13.2 7.6a3.4 3.4 0 0 1 0 4.8" />
          )}
        </svg>
        {muted ? "Chime off" : "Chime on"}
      </button>
    </>
  );
}
