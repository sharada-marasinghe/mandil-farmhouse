"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaSearch,
  FaCalendarAlt,
  FaUser,
  FaPhone,
  FaEnvelope,
  FaUsers,
  FaMoneyBillWave,
  FaCheckCircle,
  FaHourglassHalf,
  FaTimesCircle,
  FaListUl,
  FaEdit,
  FaInfoCircle,
  FaHistory,
} from "react-icons/fa";
import { HiOutlineSparkles } from "react-icons/hi";

import { BookingStatus } from "@/app/generated/prisma/enums";


interface ActivityLog {
  id: string;
  bookingId: string;
  action: string;
  previousValue: string | null;
  newValue: string | null;
  performedBy: string;
  createdAt: string;
}

interface Booking {
  id: string;
  bookingNumber: string;
  status: BookingStatus;
  guestName: string;
  guestPhone: string;
  guestEmail: string | null;
  bookingDate: string;
  numberOfGuests: number;
  totalPrice: number;
  adminNotes: string | null;
  packageId: string;
  createdAt: string;
  updatedAt: string;
  package: {
    id: string;
    name: string;
    basePrice: number;
    pricingModel: string;
  };
  activityLogs: ActivityLog[];
}

interface Package {
  id: string;
  name: string;
  basePrice: number;
  pricingModel: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface DashboardClientProps {
  initialBookings: Booking[];
  packages: Package[];
}

export default function DashboardClient({
  initialBookings,
  packages,
}: DashboardClientProps) {
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  // Edit fields
  const [editStatus, setEditStatus] = useState<BookingStatus>(BookingStatus.PENDING);
  const [editNotes, setEditNotes] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  // Stats calculation
  const totalBookings = bookings.length;
  const pendingBookings = bookings.filter((b) => b.status === BookingStatus.PENDING).length;
  const confirmedBookings = bookings.filter((b) => b.status === BookingStatus.CONFIRMED).length;
  
  const totalRevenue = bookings
    .filter((b) => b.status === BookingStatus.CONFIRMED || b.status === BookingStatus.COMPLETED)
    .reduce((sum, b) => sum + b.totalPrice, 0);

  // Filter logic
  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.bookingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.guestPhone.includes(searchQuery);

    const matchesStatus =
      statusFilter === "ALL" || booking.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleRowClick = (booking: Booking) => {
    setSelectedBooking(booking);
    setEditStatus(booking.status);
    setEditNotes(booking.adminNotes || "");
    setUpdateError(null);
    setUpdateSuccess(false);
  };

  const handleUpdateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking) return;

    setIsUpdating(true);
    setUpdateError(null);
    setUpdateSuccess(false);

    try {
      const response = await fetch(`/api/bookings/${selectedBooking.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: editStatus,
          adminNotes: editNotes,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update booking status");
      }

      // Update local state dynamically
      setBookings((prev) =>
        prev.map((b) => (b.id === selectedBooking.id ? result.booking : b))
      );

      // Update the active detail card state
      setSelectedBooking(result.booking);
      setUpdateSuccess(true);
      
      // Auto fade success alert
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (err: any) {
      setUpdateError(err.message || "Something went wrong.");
    } finally {
      setIsUpdating(false);
    }
  };

  // Helper for status badge formatting
  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.PENDING:
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case BookingStatus.CONFIRMED:
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case BookingStatus.COMPLETED:
        return "bg-teal-500/10 text-teal-400 border-teal-500/20";
      case BookingStatus.CANCELLED:
        return "bg-red-500/10 text-red-400 border-red-500/20";
    }
  };

  return (
    <div className="space-y-8">
      {/* ── Dashboard Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-white flex items-center gap-2">
            Reservations <span className="text-gradient">Console</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Real-time control dashboard for Mandil Farmhouse bookings.
          </p>
        </div>
      </div>

      {/* ── Key Metrics ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="glass-dark border border-white/5 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Total Revenue
            </span>
            <span className="font-display text-2xl font-bold text-white block mt-1">
              LKR {totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
            <FaMoneyBillWave size={18} />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="glass-dark border border-white/5 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Total Bookings
            </span>
            <span className="font-display text-2xl font-bold text-white block mt-1">
              {totalBookings}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/25 flex items-center justify-center text-teal-400">
            <FaListUl size={18} />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="glass-dark border border-white/5 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Confirmed Bookings
            </span>
            <span className="font-display text-2xl font-bold text-emerald-400 block mt-1">
              {confirmedBookings}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
            <FaCheckCircle size={18} />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="glass-dark border border-white/5 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Pending Actions
            </span>
            <span className="font-display text-2xl font-bold text-amber-400 block mt-1">
              {pendingBookings}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400">
            <FaHourglassHalf size={16} />
          </div>
        </div>
      </div>

      {/* ── Filters and Controls ────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
            <FaSearch size={14} />
          </span>
          <input
            type="text"
            placeholder="Search by Guest, Phone, or Booking ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 transition-all duration-300 text-sm"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 self-start md:self-auto w-full md:w-auto">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 whitespace-nowrap">
            Filter Status:
          </span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50 text-sm transition-all"
          >
            <option value="ALL" className="bg-[#0a101b]">All Reservations</option>
            <option value="PENDING" className="bg-[#0a101b]">Pending</option>
            <option value="CONFIRMED" className="bg-[#0a101b]">Confirmed</option>
            <option value="COMPLETED" className="bg-[#0a101b]">Completed</option>
            <option value="CANCELLED" className="bg-[#0a101b]">Cancelled</option>
          </select>
        </div>
      </div>

      {/* ── Main Bookings Grid / Split Pane ────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Bookings Table Pane */}
        <div className="lg:col-span-2 glass-dark border border-white/5 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-slate-400 text-xs font-semibold uppercase tracking-wider bg-white/2">
                  <th className="py-4 px-5">Booking No</th>
                  <th className="py-4 px-5">Guest Name</th>
                  <th className="py-4 px-5">Visit Date</th>
                  <th className="py-4 px-5">Guests</th>
                  <th className="py-4 px-5">Status</th>
                  <th className="py-4 px-5 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500 font-medium">
                      No matching reservations found.
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((booking) => (
                    <tr
                      key={booking.id}
                      onClick={() => handleRowClick(booking)}
                      className={`hover:bg-white/5 transition-colors cursor-pointer ${
                        selectedBooking?.id === booking.id ? "bg-white/5" : ""
                      }`}
                    >
                      <td className="py-4 px-5 font-mono font-bold text-white">
                        {booking.bookingNumber}
                      </td>
                      <td className="py-4 px-5">
                        <div className="font-semibold text-white">{booking.guestName}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{booking.guestPhone}</div>
                      </td>
                      <td className="py-4 px-5 font-medium text-slate-300">
                        {new Date(booking.bookingDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-4 px-5 font-semibold text-slate-300">
                        {booking.numberOfGuests}
                      </td>
                      <td className="py-4 px-5">
                        <span
                          className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-full border ${getStatusColor(
                            booking.status
                          )}`}
                        >
                          {booking.status}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-right font-bold text-white">
                        LKR {booking.totalPrice.toLocaleString("en-US")}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Details and Operations Drawer Pane */}
        <div className="lg:col-span-1 space-y-6">
          <AnimatePresence mode="wait">
            {!selectedBooking ? (
              <motion.div
                key="none-selected"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="glass-dark border border-white/5 rounded-2xl p-8 text-center"
              >
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-slate-500 mx-auto mb-4 border border-white/10">
                  <FaInfoCircle size={18} />
                </div>
                <h3 className="text-white font-semibold text-base mb-1">
                  Select a Reservation
                </h3>
                <p className="text-slate-500 text-xs max-w-xs mx-auto">
                  Click on any reservation row from the table to manage its status, update administrator notes, and audit activity history.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key={selectedBooking.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="glass-dark border border-white/10 rounded-2xl p-6 shadow-xl space-y-6 relative overflow-hidden"
              >
                {/* Accent top line */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />

                {/* Card Title Header */}
                <div className="flex justify-between items-center pb-4 border-b border-white/5">
                  <div>
                    <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest block">
                      Reservation Details
                    </span>
                    <span className="font-mono text-xl font-bold text-white block mt-0.5">
                      {selectedBooking.bookingNumber}
                    </span>
                  </div>
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(
                      selectedBooking.status
                    )}`}
                  >
                    {selectedBooking.status}
                  </span>
                </div>

                {/* Details list */}
                <div className="space-y-4 text-xs">
                  <div className="flex items-start gap-3">
                    <span className="text-slate-500 w-5 mt-0.5"><FaUser /></span>
                    <div>
                      <span className="text-slate-400 block font-medium">Guest Name</span>
                      <span className="text-white font-semibold text-sm mt-0.5 block">{selectedBooking.guestName}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="text-slate-500 w-5 mt-0.5"><FaPhone /></span>
                    <div>
                      <span className="text-slate-400 block font-medium">Phone Number</span>
                      <span className="text-white font-semibold mt-0.5 block">{selectedBooking.guestPhone}</span>
                    </div>
                  </div>

                  {selectedBooking.guestEmail && (
                    <div className="flex items-start gap-3">
                      <span className="text-slate-500 w-5 mt-0.5"><FaEnvelope /></span>
                      <div>
                        <span className="text-slate-400 block font-medium">Email Address</span>
                        <span className="text-white font-semibold mt-0.5 block">{selectedBooking.guestEmail}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <span className="text-slate-500 w-5 mt-0.5"><FaCalendarAlt /></span>
                    <div>
                      <span className="text-slate-400 block font-medium">Reservation Date</span>
                      <span className="text-white font-semibold mt-0.5 block">
                        {new Date(selectedBooking.bookingDate).toLocaleDateString("en-US", {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="text-slate-500 w-5 mt-0.5"><FaUsers /></span>
                    <div>
                      <span className="text-slate-400 block font-medium">Guests / Package</span>
                      <span className="text-white font-semibold mt-0.5 block">
                        {selectedBooking.numberOfGuests} guests on &ldquo;{selectedBooking.package.name}&rdquo;
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="text-slate-500 w-5 mt-0.5"><FaMoneyBillWave /></span>
                    <div>
                      <span className="text-slate-400 block font-medium">Calculated Price</span>
                      <span className="text-white font-bold text-sm mt-0.5 block text-gradient">
                        LKR {selectedBooking.totalPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Operations & Edits Form */}
                <form onSubmit={handleUpdateBooking} className="space-y-4 pt-4 border-t border-white/5">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <FaEdit /> Update Booking Status &amp; Notes
                  </h4>

                  {updateError && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl font-medium">
                      {updateError}
                    </div>
                  )}

                  {updateSuccess && (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl font-medium">
                      Booking updated successfully!
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Workflow Status
                    </label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value as BookingStatus)}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500/50 transition-colors"
                    >
                      <option value={BookingStatus.PENDING} className="bg-[#0a101b]">PENDING</option>
                      <option value={BookingStatus.CONFIRMED} className="bg-[#0a101b]">CONFIRMED</option>
                      <option value={BookingStatus.COMPLETED} className="bg-[#0a101b]">COMPLETED</option>
                      <option value={BookingStatus.CANCELLED} className="bg-[#0a101b]">CANCELLED</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Admin Notes
                    </label>
                    <textarea
                      placeholder="Add private office notes, bank reference details, discount codes, etc..."
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold transition-all duration-300 btn-glow flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUpdating ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      "Apply Modifications"
                    )}
                  </button>
                </form>

                {/* Audit log list */}
                <div className="space-y-3 pt-4 border-t border-white/5">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <FaHistory /> Audit History Log
                  </h4>
                  <div className="max-h-48 overflow-y-auto space-y-3 pr-1 text-[10px]">
                    {selectedBooking.activityLogs.length === 0 ? (
                      <div className="text-slate-600 text-center py-2 italic">
                        No logs created for this booking.
                      </div>
                    ) : (
                      selectedBooking.activityLogs.map((log) => (
                        <div
                          key={log.id}
                          className="p-2.5 bg-white/2 rounded-xl border border-white/5 flex flex-col gap-1"
                        >
                          <div className="font-semibold text-slate-300">
                            {log.action}
                          </div>
                          <div className="flex justify-between items-center text-[9px] text-slate-500 mt-0.5">
                            <span>Actor: {log.performedBy}</span>
                            <span>
                              {new Date(log.createdAt).toLocaleString("en-US", {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
