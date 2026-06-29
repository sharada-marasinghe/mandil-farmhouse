"use client";

// ─── BookingTracker ───────────────────────────────────────────────────────────
// A fully-interactive Client Component that:
//  1. Lets the customer search by Booking Number (e.g. #MF-1024).
//  2. Queries Supabase for the matching booking row.
//  3. Renders a high-end digital receipt when found, with:
//     - Status badge, guest details grid, bank details card.
//     - Download PDF (mock) and WhatsApp Share buttons.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useRef } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  FaSearch,
  FaWhatsapp,
  FaDownload,
  FaBuilding,
  FaPhone,
  FaUser,
  FaCalendarAlt,
  FaUsers,
  FaTag,
  FaHashtag,
  FaExclamationTriangle,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
} from "react-icons/fa";
import { HiReceiptTax } from "react-icons/hi";
import { MdPayment } from "react-icons/md";
import { createClient } from "@/utils/supabase/client";

// ─── Types ────────────────────────────────────────────────────────────────────

type BookingStatus =
  | "payment_pending"
  | "confirmed"
  | "completed"
  | "cancelled";

interface BookingRecord {
  id: string;
  booking_number: string;
  guest_name: string;
  phone: string;
  package_name: string;
  visit_date: string;          // ISO date string e.g. "2026-07-15"
  guests: number;
  status: BookingStatus;
  created_at: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const WHATSAPP_NUMBER = "94712345678"; // Official number (no + prefix for wa.me)
const WHATSAPP_DISPLAY = "+94 71 234 5678";

const BANK_DETAILS = {
  bank: "Commercial Bank of Ceylon PLC",
  accountName: "Mandil Farmhouse (Pvt) Ltd",
  accountNumber: "1234567890",
  branch: "Panadura Branch",
} as const;

// ─── Status configuration ─────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  BookingStatus,
  { label: string; color: string; bg: string; border: string; Icon: React.ComponentType<{ className?: string }> }
> = {
  payment_pending: {
    label: "PAYMENT PENDING",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/40",
    Icon: FaClock,
  },
  confirmed: {
    label: "CONFIRMED",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/40",
    Icon: FaCheckCircle,
  },
  completed: {
    label: "COMPLETED",
    color: "text-sky-400",
    bg: "bg-sky-500/10",
    border: "border-sky-500/40",
    Icon: FaCheckCircle,
  },
  cancelled: {
    label: "CANCELLED",
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/40",
    Icon: FaTimesCircle,
  },
};

// ─── Animation variants ───────────────────────────────────────────────────────

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    y: -16,
    transition: { duration: 0.3, ease: "easeIn" },
  },
};

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const rowVariant: Variants = {
  hidden: { opacity: 0, x: -12 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
};

// ─── Helper: normalise booking number input ───────────────────────────────────

function normaliseBookingNumber(raw: string): string {
  // Accept "MF-1024", "#MF-1024", "mf1024" — normalise to "MF-1024"
  const cleaned = raw.trim().replace(/^#/, "").toUpperCase().replace(/\s+/g, "");
  // Insert dash if missing: "MF1024" → "MF-1024"
  if (/^MF\d+$/.test(cleaned)) {
    return `MF-${cleaned.slice(2)}`;
  }
  return cleaned;
}

// ─── Helper: format date ──────────────────────────────────────────────────────

function formatDate(isoDate: string): string {
  try {
    return new Date(isoDate).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return isoDate;
  }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface DetailRowProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}

function DetailRow({ icon, label, value }: DetailRowProps) {
  return (
    <motion.div
      variants={rowVariant}
      className="flex items-start gap-3 py-3.5 border-b border-slate-700/60 last:border-0"
    >
      <span className="mt-0.5 flex-shrink-0 w-8 h-8 rounded-lg bg-slate-700/50 border border-slate-600/40 flex items-center justify-center text-emerald-400 text-sm">
        {icon}
      </span>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-0.5 sm:gap-4">
        <dt className="text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
          {label}
        </dt>
        <dd className="text-sm font-semibold text-white text-left sm:text-right">
          {value}
        </dd>
      </div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function BookingTracker() {
  const [inputValue, setInputValue] = useState<string>("");
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [booking, setBooking] = useState<BookingRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState<boolean>(false);

  const receiptRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  // ── Search handler ────────────────────────────────────────────────────────

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const query = normaliseBookingNumber(inputValue);
    if (!query) return;

    setIsSearching(true);
    setError(null);
    setBooking(null);
    setSearched(false);

    try {
      const { data, error: dbError } = await supabase
        .from("bookings")
        .select("*")
        .eq("booking_number", query)
        .single();

      if (dbError || !data) {
        setError(
          `No booking found for "${query}". Please double-check the number and try again.`
        );
      } else {
        setBooking(data as BookingRecord);
      }
    } catch {
      setError("Something went wrong. Please try again in a moment.");
    } finally {
      setIsSearching(false);
      setSearched(true);
    }
  };

  // ── WhatsApp Share ────────────────────────────────────────────────────────

  const handleWhatsAppShare = () => {
    if (!booking) return;
    const text = encodeURIComponent(
      `Hi Mandil Farmhouse, here is my receipt for Booking Number #${booking.booking_number}.\n\n` +
        `Guest: ${booking.guest_name}\n` +
        `Package: ${booking.package_name}\n` +
        `Date: ${formatDate(booking.visit_date)}\n` +
        `Guests: ${booking.guests}\n` +
        `Status: ${STATUS_CONFIG[booking.status]?.label ?? booking.status}`
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, "_blank");
  };

  // ── PDF Download (mock) ───────────────────────────────────────────────────

  const handleDownloadPDF = () => {
    if (!booking) return;
    // Mock: open the receipt section in print view as a lightweight PDF proxy.
    // Replace with a proper PDF library (e.g. jsPDF / react-pdf) as needed.
    window.print();
  };

  // ── Status badge ──────────────────────────────────────────────────────────

  const statusCfg = booking
    ? (STATUS_CONFIG[booking.status] ?? STATUS_CONFIG["payment_pending"])
    : null;

  // ── Receipt date (today formatted) ────────────────────────────────────────

  const receiptDate = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-start px-4 py-16 sm:py-24">
      {/* ── Page heading ──────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-10 w-full max-w-xl"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold uppercase tracking-widest mb-4">
          <HiReceiptTax className="text-base" />
          Booking Tracker
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-white mb-3">
          Track Your Booking
        </h1>
        <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
          Enter your booking number below to view your reservation details and
          payment receipt.
        </p>
      </motion.div>

      {/* ── Search bar ────────────────────────────────────────────────────── */}
      <motion.form
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.1 }}
        onSubmit={handleSearch}
        className="w-full max-w-xl flex flex-col sm:flex-row gap-3 mb-10"
        noValidate
      >
        <div className="relative flex-1">
          <FaHashtag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm pointer-events-none" />
          <input
            id="booking-number-input"
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="MF-1024"
            aria-label="Booking Number"
            autoComplete="off"
            spellCheck={false}
            className="w-full bg-slate-800/60 border border-slate-700/80 rounded-xl pl-10 pr-4 py-4 text-white text-sm font-mono placeholder-slate-600 focus:outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/30 focus:bg-slate-800 transition-all duration-200"
          />
        </div>
        <motion.button
          type="submit"
          disabled={isSearching || !inputValue.trim()}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center justify-center gap-2 px-7 py-4 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-emerald-900/30 btn-glow"
        >
          {isSearching ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Searching…
            </>
          ) : (
            <>
              <FaSearch className="text-xs" />
              Track Booking
            </>
          )}
        </motion.button>
      </motion.form>

      {/* ── Result area ───────────────────────────────────────────────────── */}
      <div className="w-full max-w-2xl">
        <AnimatePresence mode="wait">
          {/* ── Error state ──────────────────────────────────────────────── */}
          {searched && error && (
            <motion.div
              key="error"
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="flex flex-col items-center gap-4 py-12 text-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                <FaExclamationTriangle className="text-red-400 text-xl" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white mb-1">
                  Booking Not Found
                </h2>
                <p className="text-slate-400 text-sm max-w-sm mx-auto leading-relaxed">
                  {error}
                </p>
              </div>
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-600/15 border border-green-500/30 text-green-400 text-sm font-semibold hover:bg-green-500/20 transition-colors"
              >
                <FaWhatsapp className="text-base" />
                Contact us on WhatsApp
              </a>
            </motion.div>
          )}

          {/* ── Receipt ──────────────────────────────────────────────────── */}
          {booking && statusCfg && (
            <motion.div
              key="receipt"
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              exit="exit"
              ref={receiptRef}
              id="booking-receipt"
              className="bg-slate-900 border border-slate-700/80 rounded-3xl overflow-hidden shadow-2xl shadow-black/50"
            >
              {/* ── Receipt top accent bar ────────────────────────────────── */}
              <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600" />

              {/* ── Receipt Header ────────────────────────────────────────── */}
              <div className="px-6 sm:px-8 pt-7 pb-5 border-b border-slate-700/60">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  {/* Property info */}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                        <FaBuilding className="text-emerald-400 text-xs" />
                      </div>
                      <h2 className="font-display text-lg font-bold text-white tracking-tight">
                        Mandil Farmhouse
                      </h2>
                    </div>
                    <p className="text-xs text-slate-500 ml-10">
                      Bolgoda Lake, Sri Lanka
                    </p>
                  </div>

                  {/* Receipt meta */}
                  <div className="text-left sm:text-right space-y-1">
                    <div className="flex sm:flex-row-reverse items-center gap-1.5 text-xs text-slate-500">
                      <span>{receiptDate}</span>
                      <FaCalendarAlt className="text-slate-600 text-[10px]" />
                    </div>
                    <p className="text-xs font-mono font-semibold text-emerald-400">
                      #{booking.booking_number}
                    </p>
                  </div>
                </div>

                {/* Status badge */}
                <div className="mt-5">
                  <span
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold uppercase tracking-widest ${statusCfg.color} ${statusCfg.bg} ${statusCfg.border}`}
                  >
                    <statusCfg.Icon className="text-sm" />
                    {statusCfg.label}
                  </span>
                </div>
              </div>

              {/* ── Booking Details Grid ──────────────────────────────────── */}
              <div className="px-6 sm:px-8 py-5">
                <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                  Reservation Details
                </h3>
                <motion.dl
                  variants={stagger}
                  initial="hidden"
                  animate="visible"
                  className="divide-y divide-slate-700/40"
                >
                  <DetailRow
                    icon={<FaUser className="text-xs" />}
                    label="Guest Name"
                    value={booking.guest_name}
                  />
                  <DetailRow
                    icon={<FaPhone className="text-xs" />}
                    label="Phone"
                    value={booking.phone}
                  />
                  <DetailRow
                    icon={<FaTag className="text-xs" />}
                    label="Package"
                    value={booking.package_name}
                  />
                  <DetailRow
                    icon={<FaCalendarAlt className="text-xs" />}
                    label="Visit Date"
                    value={formatDate(booking.visit_date)}
                  />
                  <DetailRow
                    icon={<FaUsers className="text-xs" />}
                    label="Guests"
                    value={`${booking.guests} ${booking.guests === 1 ? "person" : "persons"}`}
                  />
                </motion.dl>
              </div>

              {/* ── Bank Details Card ─────────────────────────────────────── */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.45 }}
                className="mx-6 sm:mx-8 mb-5 rounded-2xl border border-amber-500/25 bg-amber-500/5 p-5"
              >
                <div className="flex items-center gap-2 mb-4">
                  <MdPayment className="text-amber-400 text-base" />
                  <h3 className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                    Payment Details
                  </h3>
                </div>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                  {[
                    { label: "Bank", value: BANK_DETAILS.bank },
                    { label: "Account Name", value: BANK_DETAILS.accountName },
                    { label: "Account No.", value: BANK_DETAILS.accountNumber },
                    { label: "Branch", value: BANK_DETAILS.branch },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <dt className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                        {label}
                      </dt>
                      <dd className="text-sm font-semibold text-white font-mono">
                        {value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </motion.div>

              {/* ── Contact Footnote ──────────────────────────────────────── */}
              <div className="mx-6 sm:mx-8 mb-6 rounded-2xl bg-green-500/5 border border-green-500/20 px-5 py-4 flex items-center gap-3">
                <FaWhatsapp className="text-green-400 text-xl flex-shrink-0" />
                <p className="text-sm text-slate-300 leading-relaxed">
                  Questions? Reach us on WhatsApp at{" "}
                  <a
                    href={`https://wa.me/${WHATSAPP_NUMBER}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-green-400 hover:text-green-300 transition-colors"
                  >
                    {WHATSAPP_DISPLAY}
                  </a>
                </p>
              </div>

              {/* ── Action Buttons ────────────────────────────────────────── */}
              <div className="px-6 sm:px-8 pb-7 flex flex-col sm:flex-row gap-3">
                {/* Download PDF */}
                <motion.button
                  onClick={handleDownloadPDF}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  id="download-pdf-btn"
                  className="flex-1 flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-xl border border-slate-600/70 bg-slate-800/60 text-slate-300 text-sm font-semibold hover:border-slate-500 hover:bg-slate-700/60 hover:text-white transition-all duration-200"
                >
                  <FaDownload className="text-base text-slate-400" />
                  Download PDF
                </motion.button>

                {/* WhatsApp Share */}
                <motion.button
                  onClick={handleWhatsAppShare}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  id="whatsapp-share-btn"
                  className="flex-1 flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-xl font-semibold text-sm text-white bg-[#25D366] hover:bg-[#1ebe5c] shadow-lg shadow-green-900/30 transition-all duration-200"
                >
                  <FaWhatsapp className="text-lg" />
                  Share on WhatsApp
                </motion.button>
              </div>

              {/* ── Receipt footer watermark ──────────────────────────────── */}
              <div className="border-t border-slate-700/60 px-6 sm:px-8 py-3 flex items-center justify-between">
                <p className="text-[10px] text-slate-600">
                  This is a system-generated receipt.
                </p>
                <p className="text-[10px] text-slate-600 font-mono">
                  #{booking.booking_number}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
