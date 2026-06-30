"use client";

import Link from "next/link";
import {
  FiDollarSign,
  FiList,
  FiCheckCircle,
  FiClock,
  FiUsers,
  FiLayers,
  FiBox,
  FiCompass,
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
  status: string;
  guestName: string;
  guestPhone: string;
  totalPrice: number;
  bookingDate: string;
  numberOfGuests: number;
  package: { name: string };
  activityLogs: ActivityLog[];
}

interface Props {
  bookings: Booking[];
  packageCount: number;
  amenityCount: number;
  activityCount: number;
}

export default function DashboardOverviewClient({ bookings, packageCount, amenityCount, activityCount }: Props) {
  const totalRevenue = bookings.reduce((sum, b) => sum + b.totalPrice, 0);
  const confirmed  = bookings.filter(b => b.status === "CONFIRMED").length;
  const pending    = bookings.filter(b => b.status === "PENDING").length;

  const recentLogs = bookings
    .flatMap(b => b.activityLogs)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8);

  const stats = [
    { label: "Total Revenue",       value: `LKR ${totalRevenue.toLocaleString()}`, icon: FiDollarSign, bg: "bg-emerald-50 border-emerald-100 text-emerald-700" },
    { label: "Total Bookings",      value: bookings.length,                         icon: FiList,       bg: "bg-slate-100 border-slate-200 text-slate-700" },
    { label: "Confirmed Bookings",  value: confirmed,                               icon: FiCheckCircle, bg: "bg-emerald-50 border-emerald-100 text-emerald-700" },
    { label: "Pending Bookings",    value: pending,                                 icon: FiClock,      bg: "bg-amber-50 border-amber-100 text-amber-700" },
  ];

  const inventory = [
    { label: "Active Packages",   value: packageCount,  icon: FiLayers,  href: "/admin/packages",     color: "text-emerald-600" },
    { label: "Assets & Add-ons",  value: amenityCount,  icon: FiBox,     href: "/admin/assets",       color: "text-teal-600" },
    { label: "Resort Activities", value: activityCount, icon: FiCompass, href: "/admin/activities",   color: "text-blue-600" },
  ];

  return (
    <div className="p-8 space-y-8 w-full">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Overview</h2>
        <p className="text-slate-400 text-xs mt-1">Resort reservation stats and system audit activity.</p>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 w-full">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white border border-slate-100 rounded-2xl p-5 flex items-center justify-between shadow-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{s.label}</span>
                <span className="text-xl font-extrabold text-slate-900 block mt-1.5">{s.value}</span>
              </div>
              <div className={`w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0 ${s.bg}`}>
                <Icon size={17} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Two-column grid: Quick Links + Audit Log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">

        {/* Quick nav shortcuts */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Quick Access</h3>
          <div className="space-y-2">
            {[
              { label: "Reservations Console", href: "/admin/reservations", sub: `${bookings.length} total bookings` },
              ...inventory.map(i => ({ label: i.label, href: i.href, sub: `${i.value} items` })),
              { label: "User Management",      href: "/admin/users",         sub: "Staff & guest accounts" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all group"
              >
                <div>
                  <span className="text-xs font-semibold text-slate-800 group-hover:text-emerald-700 transition-colors">{item.label}</span>
                  <span className="text-[10px] text-slate-400 block">{item.sub}</span>
                </div>
                <span className="text-slate-300 group-hover:text-emerald-500 text-lg leading-none">→</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Audit Log */}
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl p-6 shadow-xs">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            <FiClock className="text-emerald-600" />
            Recent Administrative Audit Logs
          </h3>
          <div className="divide-y divide-slate-50">
            {recentLogs.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs italic">No recent system logs yet.</div>
            ) : (
              recentLogs.map((log) => (
                <div key={log.id} className="py-3 flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800">{log.action}</span>
                    <span className="text-slate-400 text-[10px] font-mono">({log.performedBy})</span>
                  </div>
                  <span className="text-slate-400 text-[10px] flex-shrink-0">
                    {new Date(log.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Bookings mini-table */}
      <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Recent Reservations</h3>
          <Link href="/admin/reservations" className="text-xs text-emerald-600 font-semibold hover:text-emerald-700">
            View All →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] uppercase font-bold tracking-wider text-slate-400 border-b border-slate-100 bg-slate-50/50">
                <th className="py-3 px-5">Booking No</th>
                <th className="py-3 px-5">Guest</th>
                <th className="py-3 px-5">Package</th>
                <th className="py-3 px-5">Date</th>
                <th className="py-3 px-5">Status</th>
                <th className="py-3 px-5 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-xs">
              {bookings.slice(0, 6).map((b) => {
                const statusColors: Record<string, string> = {
                  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
                  CONFIRMED: "bg-emerald-50 text-emerald-700 border-emerald-200",
                  COMPLETED: "bg-slate-100 text-slate-700 border-slate-200",
                  CANCELLED: "bg-red-50 text-red-700 border-red-200",
                };
                return (
                  <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-5 font-mono font-bold text-slate-900">{b.bookingNumber}</td>
                    <td className="py-4 px-5">
                      <div className="font-semibold text-slate-800">{b.guestName}</div>
                      <div className="text-[10px] text-slate-400">{b.guestPhone}</div>
                    </td>
                    <td className="py-4 px-5 text-slate-600">{b.package.name}</td>
                    <td className="py-4 px-5 text-slate-600">
                      {new Date(b.bookingDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    <td className="py-4 px-5">
                      <span className={`inline-block px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${statusColors[b.status] || ""}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-right font-bold text-slate-900">LKR {b.totalPrice.toLocaleString()}</td>
                  </tr>
                );
              })}
              {bookings.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">No reservations yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
