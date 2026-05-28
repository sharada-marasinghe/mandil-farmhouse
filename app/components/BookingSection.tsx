// Pure Server Component — no "use client" directive.
// Owns the static <section> shell and header markup (SEO-renderable).
// Delegates the interactive form to BookingDynamicLoader (Client Component),
// which in turn uses next/dynamic { ssr: false } — the only legal location
// for that API in Next.js 16.

import { HiSparkles } from "react-icons/hi";
import BookingDynamicLoader from "./BookingDynamicLoader";

export default function BookingSection() {
  return (
    <section
      id="booking"
      className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 w-full flex flex-col items-center bg-gradient-to-b from-[#0a1628] to-[#0d2137] relative overflow-hidden"
    >
      {/* Top rule */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-teal-500/40 to-transparent" />

      {/* Ambient glow — decorative */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-emerald-900/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full bg-teal-900/10 blur-3xl" />
      </div>

      {/* ── Content boundary — Standardized max-w-6xl container ─────────── */}
      <div className="relative w-full max-w-6xl mx-auto flex flex-col items-center">
        
        {/* ── Section header — Standardized ───────────────────────────────── */}
        <div className="w-full max-w-3xl mx-auto flex flex-col items-center text-center justify-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold tracking-widest uppercase mb-4">
            <HiSparkles aria-hidden="true" />
            Book Your Experience
          </div>

          <h2 className="font-display text-4xl sm:text-5xl font-bold text-white mb-4">
            Reserve Your <span className="text-gradient">Getaway</span>
          </h2>

          <p className="text-slate-400 text-lg max-w-xl">
            Secure your spot in minutes. We&apos;ll confirm within 2 hours with a
            personal call.
          </p>
        </div>

        {/* ── Client boundary: dynamic form with ssr:false ────────────────── */}
        <div className="w-full">
          <BookingDynamicLoader />
        </div>
      </div>
    </section>
  );
}
