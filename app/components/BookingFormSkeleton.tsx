// Pure Server Component — no "use client" directive.
// Renders a pixel-accurate skeleton that matches the real BookingForm layout
// so the Cumulative Layout Shift (CLS) score stays at zero during client mount.

export default function BookingFormSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch w-full max-w-6xl mx-auto animate-pulse">
      {/* ── Left column: form card ─────────────────────────────────────── */}
      <div className="w-full">
        <div className="glass-card rounded-3xl border border-white/10 p-6 sm:p-8">
          {/* Card title */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-5 h-5 rounded bg-emerald-500/20" />
            <div className="h-5 w-44 rounded-lg bg-white/10" />
          </div>

          <div className="space-y-6">
            {/* Date field */}
            <div className="space-y-2">
              <div className="h-3 w-24 rounded bg-white/10" />
              <div className="h-12 w-full rounded-xl bg-white/5 border border-white/10" />
            </div>

            {/* Package selector */}
            <div className="space-y-2">
              <div className="h-3 w-28 rounded bg-white/10" />
              <div className="h-12 w-full rounded-xl bg-white/5 border border-white/10" />
            </div>

            {/* Guest counter */}
            <div className="space-y-2">
              <div className="h-3 w-36 rounded bg-white/10" />
              <div className="flex items-center gap-4">
                <div className="h-12 w-36 rounded-xl bg-white/5 border border-white/10" />
                <div className="h-4 w-20 rounded bg-white/10" />
              </div>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <div className="h-3 w-20 rounded bg-white/10" />
              <div className="h-12 w-full rounded-xl bg-white/5 border border-white/10" />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <div className="h-3 w-28 rounded bg-white/10" />
              <div className="h-12 w-full rounded-xl bg-white/5 border border-white/10" />
            </div>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <div className="flex-1 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/10" />
              <div className="flex-1 h-14 rounded-2xl bg-green-500/10 border border-green-500/10" />
            </div>
          </div>
        </div>
      </div>

      {/* ── Right column: info panels ──────────────────────────────────── */}
      <div className="w-full space-y-4 flex flex-col justify-between">
        {/* Booking summary card */}
        <div className="glass-card rounded-3xl border border-emerald-500/20 p-6 space-y-4 flex-1">
          <div className="h-3 w-32 rounded bg-white/10" />
          {[100, 80, 60, 60].map((w, i) => (
            <div key={i} className="flex justify-between">
              <div className={`h-3 w-20 rounded bg-white/10`} />
              <div className="h-3 w-24 rounded bg-white/10" />
            </div>
          ))}
        </div>

        {/* Contact card */}
        <div className="glass-card rounded-3xl border border-white/10 p-6 space-y-4">
          <div className="h-3 w-28 rounded bg-white/10" />
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10" />
            <div className="h-3 w-32 rounded bg-white/10" />
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-green-500/10" />
            <div className="h-3 w-28 rounded bg-white/10" />
          </div>
        </div>

        {/* Policy card */}
        <div className="glass-card rounded-3xl border border-white/10 p-5 space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-emerald-500/20 flex-shrink-0" />
              <div className="h-3 rounded bg-white/10" style={{ width: `${60 + i * 8}%` }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
