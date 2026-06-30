"use client";

import { useState } from "react";
import { BookingStatus } from "@/app/generated/prisma/enums";
import {
  FiSearch,
  FiUser,
  FiPhone,
  FiMail,
  FiCalendar,
  FiUsers,
  FiDollarSign,
  FiInfo,
  FiCheckCircle,
  FiAlertCircle,
  FiClock,
  FiList,
} from "react-icons/fi";

interface ActivityLog {
  id: string;
  action: string;
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
  package: { id: string; name: string; basePrice: number; pricingModel: string };
  activityLogs: ActivityLog[];
}

interface Props {
  initialBookings: Booking[];
}

const STATUS_COLORS: Record<string, string> = {
  PENDING:   "bg-amber-50 text-amber-800 border-amber-200",
  CONFIRMED: "bg-emerald-50 text-emerald-800 border-emerald-200",
  COMPLETED: "bg-slate-100 text-slate-800 border-slate-200",
  CANCELLED: "bg-red-50 text-red-800 border-red-200",
};

export default function ReservationsClient({ initialBookings }: Props) {
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [editStatus, setEditStatus] = useState<BookingStatus>("PENDING");
  const [editNotes, setEditNotes] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  const filtered = bookings.filter((b) => {
    const q = searchQuery.toLowerCase();
    const matchQ = b.bookingNumber.toLowerCase().includes(q) ||
      b.guestName.toLowerCase().includes(q) ||
      b.guestPhone.includes(q);
    const matchS = statusFilter === "ALL" || b.status === statusFilter;
    return matchQ && matchS;
  });

  const handleSelect = (b: Booking) => {
    setSelectedBooking(b);
    setEditStatus(b.status);
    setEditNotes(b.adminNotes || "");
    setUpdateError(null);
    setUpdateSuccess(false);
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking) return;
    setIsUpdating(true);
    setUpdateError(null);
    try {
      const res = await fetch(`/api/bookings/${selectedBooking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: editStatus, adminNotes: editNotes }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to update booking.");
      setBookings((prev) =>
        prev.map((b) =>
          b.id === selectedBooking.id
            ? { ...result.booking, totalPrice: parseFloat(result.booking.totalPrice), package: b.package, activityLogs: result.booking.activityLogs || b.activityLogs }
            : b
        )
      );
      setSelectedBooking((prev) => prev ? { ...prev, status: editStatus, adminNotes: editNotes, activityLogs: result.booking.activityLogs || prev.activityLogs } : null);
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (err: any) {
      setUpdateError(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="p-8 space-y-6 w-full">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Reservations Console</h2>
        <p className="text-slate-400 text-xs mt-1">Review guest itineraries, confirm deposits, and record admin logs.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between w-full">
        <div className="relative w-full md:max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400"><FiSearch size={14} /></span>
          <input
            type="text"
            placeholder="Search by guest name, phone, or booking ID…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 focus:border-emerald-500 rounded-xl text-slate-800 placeholder-slate-400 outline-none text-xs shadow-xs transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Filter:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 focus:border-emerald-500 outline-none text-xs shadow-xs"
          >
            {["ALL", "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"].map((s) => (
              <option key={s} value={s}>{s === "ALL" ? "All Statuses" : s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table + Detail panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">

        {/* Bookings Table */}
        <div className="lg:col-span-7 bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] uppercase font-bold tracking-wider text-slate-400 bg-slate-50/60">
                  {["Booking No", "Guest", "Date", "Guests", "Status", "Amount"].map((h) => (
                    <th key={h} className="py-3.5 px-5">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-xs">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-slate-400">No reservations found.</td>
                  </tr>
                ) : (
                  filtered.map((b) => (
                    <tr
                      key={b.id}
                      onClick={() => handleSelect(b)}
                      className={`cursor-pointer transition-colors hover:bg-slate-50 ${selectedBooking?.id === b.id ? "bg-emerald-50/30" : ""}`}
                    >
                      <td className="py-4 px-5 font-mono font-bold text-slate-900">{b.bookingNumber}</td>
                      <td className="py-4 px-5">
                        <div className="font-semibold text-slate-800">{b.guestName}</div>
                        <div className="text-[10px] text-slate-400">{b.guestPhone}</div>
                      </td>
                      <td className="py-4 px-5 text-slate-600">{new Date(b.bookingDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</td>
                      <td className="py-4 px-5 font-semibold text-slate-700">{b.numberOfGuests}</td>
                      <td className="py-4 px-5">
                        <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${STATUS_COLORS[b.status] || ""}`}>{b.status}</span>
                      </td>
                      <td className="py-4 px-5 text-right font-bold text-slate-900">LKR {b.totalPrice.toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail / Edit Panel */}
        <div className="lg:col-span-5">
          {!selectedBooking ? (
            <div className="bg-white border border-slate-100 rounded-2xl p-8 text-center shadow-xs">
              <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 mx-auto mb-3"><FiInfo size={16} /></div>
              <h3 className="text-slate-800 font-bold text-xs mb-1">Select a reservation</h3>
              <p className="text-slate-400 text-[11px] leading-relaxed">Click any row to view guest details, billing info, and admin controls.</p>
            </div>
          ) : (
            <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-xs">
              {/* Accent bar */}
              <div className="h-1 bg-emerald-600" />
              <div className="p-6 space-y-5">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest block">Itinerary Detail</span>
                    <span className="font-mono text-base font-bold text-slate-900 block mt-0.5">{selectedBooking.bookingNumber}</span>
                  </div>
                  <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full border ${STATUS_COLORS[selectedBooking.status] || ""}`}>{selectedBooking.status}</span>
                </div>

                {/* Guest info grid */}
                <div className="space-y-3 text-xs border-b border-slate-100 pb-5">
                  {[
                    { icon: FiUser, label: "Guest Name", value: selectedBooking.guestName },
                    { icon: FiPhone, label: "Phone", value: selectedBooking.guestPhone },
                    ...(selectedBooking.guestEmail ? [{ icon: FiMail, label: "Email", value: selectedBooking.guestEmail }] : []),
                    { icon: FiCalendar, label: "Visit Date", value: new Date(selectedBooking.bookingDate).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }) },
                    { icon: FiUsers, label: "Guests / Package", value: `${selectedBooking.numberOfGuests} guests — ${selectedBooking.package.name}` },
                    { icon: FiDollarSign, label: "Total Amount", value: `LKR ${selectedBooking.totalPrice.toLocaleString()}` },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-start gap-3">
                      <Icon size={13} className="text-slate-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="text-[9px] uppercase font-bold text-slate-400 block">{label}</span>
                        <span className="text-slate-800 font-semibold block mt-0.5">{value}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Admin edit form */}
                <form onSubmit={handleUpdateStatus} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Update Status</label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value as BookingStatus)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:border-emerald-500 outline-none"
                    >
                      {["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"].map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Admin Notes</label>
                    <textarea
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      rows={3}
                      placeholder="Add internal admin notes…"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:border-emerald-500 outline-none resize-none"
                    />
                  </div>
                  {updateError && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{updateError}</p>}
                  {updateSuccess && <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 flex items-center gap-1.5"><FiCheckCircle size={12} /> Booking updated successfully.</p>}
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
                  >
                    {isUpdating ? "Saving…" : "Save Changes"}
                  </button>
                </form>

                {/* Activity logs */}
                {selectedBooking.activityLogs.length > 0 && (
                  <div className="border-t border-slate-100 pt-4 space-y-2">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><FiList size={11} />Admin Audit Trail</h4>
                    <div className="space-y-1.5 max-h-40 overflow-y-auto">
                      {selectedBooking.activityLogs.map((log) => (
                        <div key={log.id} className="flex justify-between text-[10px] text-slate-500">
                          <span className="font-semibold text-slate-700">{log.action}</span>
                          <span className="text-slate-400">{new Date(log.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
