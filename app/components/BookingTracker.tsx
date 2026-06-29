"use client";

import { useState } from "react";
import {
  FiSearch,
  FiDownload,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiInfo,
  FiPhone,
  FiUser,
  FiCalendar,
  FiUsers,
  FiHash,
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { HiReceiptTax } from "react-icons/hi";

type BookingStatus = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";

interface BookingRecord {
  id: string;
  bookingNumber: string;
  guestName: string;
  guestPhone: string;
  guestEmail: string | null;
  bookingDate: string;
  numberOfGuests: number;
  totalPrice: number;
  status: BookingStatus;
  packageName: string;
  createdAt: string;
}

const WHATSAPP_NUMBER = "94712345678";
const WHATSAPP_DISPLAY = "+94 71 234 5678";

const BANK_DETAILS = {
  bank: "Commercial Bank of Ceylon PLC",
  accountName: "Mandil Farmhouse (Pvt) Ltd",
  accountNumber: "1234567890",
  branch: "Panadura Branch",
} as const;

function normaliseBookingNumber(raw: string): string {
  const cleaned = raw.trim().replace(/^#/, "").toUpperCase().replace(/\s+/g, "");
  if (/^MF\d+$/.test(cleaned)) {
    return `MF-${cleaned.slice(2)}`;
  }
  return cleaned;
}

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

export default function BookingTracker() {
  const [inputValue, setInputValue] = useState<string>("");
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [booking, setBooking] = useState<BookingRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState<boolean>(false);

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const query = normaliseBookingNumber(inputValue);
    if (!query) return;

    setIsSearching(true);
    setError(null);
    setBooking(null);
    setSearched(false);

    try {
      const response = await fetch(`/api/bookings?bookingNumber=${encodeURIComponent(query)}`);
      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(
          result.error || `No booking found for "${query}". Please check the number and try again.`
        );
      } else {
        setBooking(result.booking as BookingRecord);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error(err);
    } finally {
      setIsSearching(false);
      setSearched(true);
    }
  };

  const handleDownloadPDF = () => {
    if (!booking) return;
    window.print();
  };

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 rounded-md">
            <FiClock className="text-sm" />
            PAYMENT PENDING
          </span>
        );
      case "CONFIRMED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md">
            <FiCheckCircle className="text-sm" />
            CONFIRMED
          </span>
        );
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-sky-700 bg-sky-50 border border-sky-200 rounded-md">
            <FiCheckCircle className="text-sm" />
            COMPLETED
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-red-700 bg-red-50 border border-red-200 rounded-md">
            <FiXCircle className="text-sm" />
            CANCELLED
          </span>
        );
    }
  };

  // Build pre-filled WhatsApp message
  const getWhatsAppLink = (bookingRecord: BookingRecord) => {
    const statusLabel = bookingRecord.status === "PENDING" ? "PAYMENT PENDING" : bookingRecord.status;
    const text = encodeURIComponent(
      `Hi Mandil Farmhouse Admin,\n\n` +
      `I would like to verify payment for my booking:\n` +
      `• Booking ID: #${bookingRecord.bookingNumber}\n` +
      `• Guest Name: ${bookingRecord.guestName}\n` +
      `• Package: ${bookingRecord.packageName}\n` +
      `• Date: ${formatDate(bookingRecord.bookingDate)}\n` +
      `• Guests: ${bookingRecord.numberOfGuests}\n` +
      `• Status: ${statusLabel}\n\n` +
      `Please let me know once verified. Thank you!`
    );
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 pt-28 pb-16 sm:pt-36 sm:pb-24 px-4 sm:px-6 lg:px-8 border-b border-slate-200">
      <div className="max-w-2xl mx-auto flex flex-col items-center">
        
        {/* Title area */}
        <div className="text-center mb-10 w-full">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/50 text-emerald-800 text-xs font-semibold uppercase tracking-wider mb-4">
            <HiReceiptTax className="text-sm" />
            Booking Verification
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 mb-3 tracking-tight">
            Track Your Reservation
          </h1>
          <p className="text-slate-600 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
            Enter your booking number below to view payment instructions, print your receipt, or verify details with our admin team.
          </p>
        </div>

        {/* Search Form */}
        <form
          onSubmit={handleSearch}
          className="w-full max-w-lg flex flex-col sm:flex-row gap-2 mb-12"
          noValidate
        >
          <div className="relative flex-1">
            <FiHash className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Booking Number (e.g., #MF-1024)"
              aria-label="Booking Number"
              autoComplete="off"
              spellCheck={false}
              className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-4 py-3.5 text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-all font-mono"
            />
          </div>
          <button
            type="submit"
            disabled={isSearching || !inputValue.trim()}
            className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 disabled:cursor-not-allowed transition-colors shadow-sm duration-200 cursor-pointer"
          >
            {isSearching ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Tracking…
              </>
            ) : (
              <>
                <FiSearch className="text-xs" />
                Track
              </>
            )}
          </button>
        </form>

        {/* Results Area */}
        <div className="w-full">
          {searched && error && (
            <div className="flex flex-col items-center gap-4 py-8 text-center bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-500 border border-red-100">
                <FiInfo className="text-lg" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 mb-1">
                  Reservation Not Found
                </h2>
                <p className="text-slate-600 text-xs sm:text-sm max-w-sm leading-relaxed">
                  {error}
                </p>
              </div>
            </div>
          )}

          {booking && (
            <div
              id="booking-receipt"
              className="bg-white border border-slate-300/80 rounded-2xl shadow-sm overflow-hidden"
            >
              {/* Receipt Header */}
              <div className="px-6 py-6 sm:px-8 border-b border-slate-200 bg-slate-50/50">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div>
                    <h2 className="font-display text-lg font-bold text-slate-900 tracking-tight">
                      Mandil Farmhouse, Bolgoda
                    </h2>
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mt-0.5">
                      Lakeside Sanctuary
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="block text-xs font-mono font-bold text-emerald-800">
                      ID: #{booking.bookingNumber}
                    </span>
                    <span className="block text-[11px] text-slate-500 mt-0.5">
                      Date Generated: {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </div>
                </div>

                <div className="mt-4">
                  {getStatusBadge(booking.status)}
                </div>
              </div>

              {/* Grid Details */}
              <div className="px-6 py-6 sm:px-8">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Reservation Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm pb-6 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <FiUser className="text-slate-400 text-base" />
                    <div>
                      <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                        Customer Name
                      </span>
                      <span className="font-semibold text-slate-900">{booking.guestName}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <FiUsers className="text-slate-400 text-base" />
                    <div>
                      <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                        No of Guests
                      </span>
                      <span className="font-semibold text-slate-900">{booking.numberOfGuests} Guests</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <FiInfo className="text-slate-400 text-base" />
                    <div>
                      <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                        Package Type
                      </span>
                      <span className="font-semibold text-slate-900">{booking.packageName}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <FiCalendar className="text-slate-400 text-base" />
                    <div>
                      <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                        Reservation Date
                      </span>
                      <span className="font-semibold text-slate-900">{formatDate(booking.bookingDate)}</span>
                    </div>
                  </div>
                </div>

                {/* Bank Information Box */}
                {booking.status === "PENDING" && (
                  <div className="mt-6 rounded-xl border border-amber-200/80 bg-amber-50/40 p-5">
                    <h3 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <FiInfo className="text-sm" />
                      Wire Transfer Instructions
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed mb-4">
                      Please transfer the total amount of <span className="font-bold text-slate-900">LKR {booking.totalPrice.toLocaleString()}</span> to the account below and share the receipt slip via WhatsApp to verify your reservation.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4 text-xs">
                      <div>
                        <span className="block text-[10px] font-medium text-slate-400 uppercase tracking-wider">Bank Name</span>
                        <span className="font-bold text-slate-800">{BANK_DETAILS.bank}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] font-medium text-slate-400 uppercase tracking-wider">Account Name</span>
                        <span className="font-bold text-slate-800">{BANK_DETAILS.accountName}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] font-medium text-slate-400 uppercase tracking-wider">Account Number</span>
                        <span className="font-bold text-slate-800 font-mono">{BANK_DETAILS.accountNumber}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] font-medium text-slate-400 uppercase tracking-wider">Branch</span>
                        <span className="font-bold text-slate-800">{BANK_DETAILS.branch}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="mt-6 flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={handleDownloadPDF}
                    className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-slate-300 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm cursor-pointer"
                  >
                    <FiDownload className="text-base" />
                    Download PDF Receipt
                  </button>

                  <a
                    href={getWhatsAppLink(booking)}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm text-center cursor-pointer"
                  >
                    <FaWhatsapp className="text-lg" />
                    WhatsApp Receipt to Admin
                  </a>
                </div>
              </div>

              {/* Watermark */}
              <div className="border-t border-slate-100 bg-slate-50/50 px-6 py-3 sm:px-8 flex items-center justify-between text-[10px] text-slate-400">
                <span>System-generated booking invoice.</span>
                <span className="font-mono">#{booking.bookingNumber}</span>
              </div>
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}
