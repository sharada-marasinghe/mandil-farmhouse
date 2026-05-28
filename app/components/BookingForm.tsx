"use client";

// ─── Why "use client" + ssr:false (set in BookingSection.tsx) ────────────────
// react-datepicker computes calendar grids using Date.now() and the browser's
// locale, which always produces a different result on the server vs. the client.
// Marking this file "use client" alone is NOT enough — Next.js still attempts a
// server pre-render that diverges. The parent dynamic() call with { ssr: false }
// prevents any server execution of this module entirely, making hydration
// mismatches structurally impossible.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  FaCalendarAlt,
  FaUsers,
  FaAnchor,
  FaCheckCircle,
  FaPhone,
  FaWhatsapp,
  FaChevronDown,
} from "react-icons/fa";
import { HiSparkles } from "react-icons/hi";

// ─── Types ────────────────────────────────────────────────────────────────────

type PackageId =
  | "boat-safari-1h"
  | "boat-safari-2h"
  | "boat-safari-sunset"
  | "family-adult"
  | "family-mixed";

interface PackageOption {
  value: PackageId;
  label: string;
  price: string;
  category: "safari" | "family";
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const PACKAGES: PackageOption[] = [
  {
    value: "boat-safari-1h",
    label: "Boat Safari — 1 Hour",
    price: "LKR 8,500 / boat",
    category: "safari",
  },
  {
    value: "boat-safari-2h",
    label: "Boat Safari — 2 Hours",
    price: "LKR 15,000 / boat",
    category: "safari",
  },
  {
    value: "boat-safari-sunset",
    label: "Sunset Safari Charter (3h)",
    price: "LKR 22,000 / boat",
    category: "safari",
  },
  {
    value: "family-adult",
    label: "Family Day-Out (Adults only)",
    price: "LKR 3,500 / person",
    category: "family",
  },
  {
    value: "family-mixed",
    label: "Family Day-Out (Mixed ages)",
    price: "Custom quote",
    category: "family",
  },
];

const POLICY_ITEMS = [
  "Instant booking confirmation",
  "Free cancellation 24 hours before",
  "No hidden charges",
  "Group discounts for 15+ guests",
];

// ─── Shared style tokens ──────────────────────────────────────────────────────

const inputCls =
  "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white " +
  "placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500/60 " +
  "focus:bg-emerald-500/5 focus:ring-2 focus:ring-emerald-500/50 transition-all duration-200";

const labelCls =
  "block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2";

// ─── Framer Motion variants ───────────────────────────────────────────────────

const sectionVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.05 },
  },
};

const colVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

const successVariants: Variants = {
  hidden: { opacity: 0, scale: 0.88 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: "easeOut" } },
  exit: { opacity: 0, scale: 0.92, transition: { duration: 0.25 } },
};

const formVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function BookingForm() {
  // Guard: delay rendering until client mount to avoid any residual SSR diff
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [guests, setGuests] = useState<number>(2);
  const [packageId, setPackageId] = useState<PackageId>("boat-safari-2h");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const selectedPkg = PACKAGES.find((p) => p.value === packageId)!;

  // minDate is computed client-side only — no SSR clock divergence possible
  const minDate = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d;
  })();

  const formattedDate = selectedDate
    ? selectedDate.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Not selected";

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedDate || !name.trim() || !phone.trim()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1800);
  };

  const handleReset = () => {
    setSubmitted(false);
    setName("");
    setPhone("");
    setSelectedDate(null);
    setGuests(2);
    setPackageId("boat-safari-2h");
  };

  const handleWhatsApp = () => {
    const dateStr = selectedDate
      ? selectedDate.toLocaleDateString("en-GB")
      : "TBD";
    const msg = encodeURIComponent(
      `Hi Mandil Farmhouse! I'd like to book:\n\n` +
        `Package: ${selectedPkg.label}\n` +
        `Date: ${dateStr}\n` +
        `Guests: ${guests}\n` +
        `Name: ${name || "—"}\n` +
        `Phone: ${phone || "—"}`
    );
    window.open(`https://wa.me/94712345678?text=${msg}`, "_blank");
  };

  // Render a transparent placeholder until the client is ready — this prevents
  // a flash of un-animated content before Framer Motion takes over.
  if (!mounted) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch w-full max-w-6xl mx-auto opacity-0" />
    );
  }

  return (
    <motion.div
      variants={sectionVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch w-full max-w-6xl mx-auto"
    >
      {/* ── Left column: main form card ──────────────────────────────────── */}
      <motion.div variants={colVariants} className="w-full">
        <div className="glass-card rounded-3xl border border-white/10 p-6 sm:p-8 h-full flex flex-col justify-between">
          <div>
            <h3 className="font-display text-xl font-bold text-white mb-6 flex items-center gap-2">
              <FaCalendarAlt className="text-emerald-500" />
              Availability Check
            </h3>

            <AnimatePresence mode="wait">
              {/* ── Success state ─────────────────────────────────────────── */}
              {submitted ? (
                <motion.div
                  key="success"
                  variants={successVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="flex flex-col items-center justify-center py-12 text-center gap-5"
                >
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                    <FaCheckCircle className="text-emerald-400 text-3xl" />
                  </div>
                  <div>
                    <h4 className="font-display text-2xl font-bold text-white mb-2">
                      Booking Request Sent!
                    </h4>
                    <p className="text-slate-400 text-sm max-w-xs mx-auto leading-relaxed">
                      Thank you,{" "}
                      <span className="text-emerald-400 font-semibold">{name}</span>!
                      Our team will call you at{" "}
                      <span className="text-emerald-400 font-semibold">{phone}</span>{" "}
                      within 2 hours to confirm your{" "}
                      <span className="text-white font-medium">{selectedPkg.label}</span>.
                    </p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={handleReset}
                    className="mt-1 px-6 py-2.5 rounded-xl border border-emerald-500/30 text-emerald-400 text-sm font-medium hover:bg-emerald-500/10 transition-colors"
                  >
                    Make another booking
                  </motion.button>
                </motion.div>
              ) : (
                /* ── Booking form ─────────────────────────────────────────── */
                <motion.form
                  key="form"
                  variants={formVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  onSubmit={handleSubmit}
                  className="space-y-5"
                  noValidate
                >
                  {/* Date picker ------------------------------------------- */}
                  <div>
                    <label className={labelCls} htmlFor="booking-date">
                      Select Date
                    </label>
                    <div className="relative">
                      <DatePicker
                        id="booking-date"
                        selected={selectedDate}
                        onChange={(date: Date | null) => setSelectedDate(date)}
                        minDate={minDate}
                        placeholderText="Choose your visit date"
                        className={inputCls}
                        dateFormat="EEEE, MMMM d, yyyy"
                        autoComplete="off"
                        required
                      />
                      <FaCalendarAlt className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500 text-sm pointer-events-none" />
                    </div>
                  </div>

                  {/* Package dropdown -------------------------------------- */}
                  <div>
                    <label className={labelCls} id="package-label">
                      Package Type
                    </label>
                    <div className="relative" role="combobox" aria-expanded={dropdownOpen}>
                      <button
                        type="button"
                        id="package-trigger"
                        aria-haspopup="listbox"
                        aria-labelledby="package-label package-trigger"
                        onClick={() => setDropdownOpen((o) => !o)}
                        className={`${inputCls} flex items-center justify-between cursor-pointer`}
                      >
                        <span className="text-white">{selectedPkg.label}</span>
                        <FaChevronDown
                          className={`text-emerald-500 text-xs transition-transform duration-200 ${
                            dropdownOpen ? "rotate-180" : "rotate-0"
                          }`}
                        />
                      </button>

                      <AnimatePresence>
                        {dropdownOpen && (
                          <motion.ul
                            role="listbox"
                            aria-label="Package options"
                            initial={{ opacity: 0, y: -8, scaleY: 0.95 }}
                            animate={{ opacity: 1, y: 0, scaleY: 1 }}
                            exit={{ opacity: 0, y: -8, scaleY: 0.95 }}
                            transition={{ duration: 0.18 }}
                            style={{ transformOrigin: "top" }}
                            className="absolute top-full left-0 right-0 mt-1 z-50 rounded-xl glass-dark border border-emerald-500/20 shadow-2xl overflow-hidden"
                          >
                            {PACKAGES.map((pkg) => (
                              <li key={pkg.value} role="option" aria-selected={packageId === pkg.value}>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setPackageId(pkg.value);
                                    setDropdownOpen(false);
                                  }}
                                  className={`w-full text-left px-4 py-3 flex items-center justify-between transition-colors ${
                                    packageId === pkg.value
                                      ? "text-emerald-400 bg-emerald-500/8"
                                      : "text-slate-300 hover:bg-emerald-500/10"
                                  }`}
                                >
                                  <span className="text-sm font-medium">{pkg.label}</span>
                                  <span className="text-xs text-slate-500 ml-3 shrink-0">
                                    {pkg.price}
                                  </span>
                                </button>
                              </li>
                            ))}
                          </motion.ul>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Guest counter ----------------------------------------- */}
                  <div>
                    <label className={labelCls}>Number of Guests</label>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                        <button
                          type="button"
                          onClick={() => setGuests((g) => Math.max(g - 1, 1))}
                          aria-label="Decrease guest count"
                          className="w-7 h-7 rounded-lg bg-white/10 hover:bg-emerald-500/20 text-white font-bold flex items-center justify-center transition-colors text-sm select-none"
                        >
                          −
                        </button>
                        <span className="text-white font-bold text-lg w-8 text-center tabular-nums">
                          {guests}
                        </span>
                        <button
                          type="button"
                          onClick={() => setGuests((g) => Math.min(g + 1, 50))}
                          aria-label="Increase guest count"
                          className="w-7 h-7 rounded-lg bg-white/10 hover:bg-emerald-500/20 text-white font-bold flex items-center justify-center transition-colors text-sm select-none"
                        >
                          +
                        </button>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400 text-sm">
                        <FaUsers className="text-emerald-500" />
                        <span>
                          {guests} {guests === 1 ? "guest" : "guests"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Name -------------------------------------------------- */}
                  <div>
                    <label className={labelCls} htmlFor="booking-name">
                      Your Name
                    </label>
                    <input
                      id="booking-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Full name"
                      className={inputCls}
                      autoComplete="name"
                      required
                    />
                  </div>

                  {/* Phone ------------------------------------------------- */}
                  <div>
                    <label className={labelCls} htmlFor="booking-phone">
                      Phone Number
                    </label>
                    <input
                      id="booking-phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+94 7XX XXX XXX"
                      className={inputCls}
                      autoComplete="tel"
                      required
                    />
                  </div>

                  {/* CTA buttons ------------------------------------------- */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-2">
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      disabled={loading}
                      className="w-full sm:flex-1 py-4 px-6 font-semibold text-sm sm:text-base rounded-xl flex items-center justify-center gap-2 tracking-wide shadow-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white transition-all duration-300 btn-glow disabled:opacity-60"
                    >
                      {loading ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Submitting…
                        </>
                      ) : (
                        <>
                          <FaAnchor className="text-xs" />
                          Confirm Request
                        </>
                      )}
                    </motion.button>

                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handleWhatsApp}
                      className="w-full sm:flex-1 py-4 px-6 font-semibold text-sm sm:text-base rounded-xl flex items-center justify-center gap-2 tracking-wide shadow-lg bg-green-600/20 border border-green-500/30 hover:bg-green-500/20 text-green-400 transition-all duration-300"
                    >
                      <FaWhatsapp className="text-base" />
                      WhatsApp Us
                    </motion.button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* ── Right column: live summary + contact + policy ──────────────── */}
      <motion.div variants={colVariants} className="w-full flex flex-col gap-4 justify-between h-full">
        {/* Live booking summary */}
        <div className="glass-card rounded-3xl border border-emerald-500/20 p-6 flex-1 flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <HiSparkles className="text-emerald-500" />
              Booking Summary
            </h4>
            <dl className="space-y-0">
              <div className="flex items-center justify-between w-full py-2 border-b border-white/5">
                <dt className="text-sm text-slate-400 text-left">Package</dt>
                <dd className="text-sm font-semibold text-white text-right font-display pl-4">
                  {selectedPkg.label}
                </dd>
              </div>
              <div className="flex items-center justify-between w-full py-2 border-b border-white/5">
                <dt className="text-sm text-slate-400 text-left">Pricing</dt>
                <dd className="text-sm font-bold text-emerald-400 text-right">{selectedPkg.price}</dd>
              </div>
              <div className="flex items-center justify-between w-full py-2 border-b border-white/5">
                <dt className="text-sm text-slate-400 text-left">Date</dt>
                <dd className="text-sm font-semibold text-white text-right">{formattedDate}</dd>
              </div>
              <div className="flex items-center justify-between w-full py-2 border-b border-white/5 last:border-0">
                <dt className="text-sm text-slate-400 text-left">Guests</dt>
                <dd className="text-sm font-semibold text-white text-right">{guests}</dd>
              </div>
            </dl>
          </div>
          <div className="pt-3 border-t border-white/10 mt-4">
            <p className="text-xs text-slate-500">
              Final pricing confirmed on call. Group rates apply for 15+ guests.
            </p>
          </div>
        </div>

        {/* Contact card */}
        <div className="glass-card rounded-3xl border border-white/10 p-6 flex flex-col items-start w-full text-left">
          <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 text-left">
            Reach Us Directly
          </h4>
          <div className="flex flex-col gap-3 w-full text-left">
            <a
              href="tel:+94712345678"
              className="flex items-center gap-3 text-sm text-slate-300 hover:text-emerald-400 transition-colors group justify-start w-full text-left"
            >
              <span className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500/20 transition-colors flex-shrink-0">
                <FaPhone className="text-xs" />
              </span>
              <span className="text-left">+94 71 234 5678</span>
            </a>
            <a
              href="https://wa.me/94712345678"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 text-sm text-slate-300 hover:text-green-400 transition-colors group justify-start w-full text-left"
            >
              <span className="w-9 h-9 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400 group-hover:bg-green-500/20 transition-colors flex-shrink-0">
                <FaWhatsapp className="text-sm" />
              </span>
              <span className="text-left">WhatsApp Chat</span>
            </a>
          </div>
        </div>

        {/* Policy card */}
        <div className="glass-card rounded-3xl border border-white/10 p-5">
          <ul className="space-y-2.5">
            {POLICY_ITEMS.map((item) => (
              <li key={item} className="flex items-center gap-2 text-xs text-slate-400">
                <FaCheckCircle className="text-emerald-500 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </motion.div>
    </motion.div>
  );
}
