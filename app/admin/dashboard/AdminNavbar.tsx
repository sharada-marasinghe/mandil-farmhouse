"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import Image from "next/image";
import { useBranding } from "@/app/components/BrandingProvider";
import { 
  Anchor, 
  Sparkles,
  Shield,
  LogOut,
  ChevronDown,
  User,
  LayoutDashboard
} from "lucide-react";

interface AdminNavbarProps {
  user: any;
}

export default function AdminNavbar({ user }: AdminNavbarProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const { config } = useBranding();

  const initials = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "A";

  return (
    <nav className="w-full bg-white/95 backdrop-blur-sm border-b border-slate-100 sticky top-0 z-40 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
      <div className="px-6 h-[60px] flex items-center justify-between">

        {/* ── Brand Logo ───────────────────────────────────────────────── */}
        <Link href="/admin/dashboard" className="flex items-center gap-3 group">
          {config.logoUrl ? (
            <div className="relative w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center shadow-md transition-transform duration-200 group-hover:scale-105">
              <Image
                src={config.logoUrl}
                alt={config.systemName}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-md shadow-emerald-200 group-hover:shadow-emerald-300 transition-shadow duration-300">
              <Anchor className="text-white" size={16} strokeWidth={2} />
              <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-amber-400 border-2 border-white flex items-center justify-center">
                <Sparkles size={7} className="text-amber-800" />
              </div>
            </div>
          )}
          <div className="flex flex-col">
            <span className="font-bold text-[15px] text-slate-900 leading-none tracking-tight">
              {config.systemName.split(" ")[0]}
            </span>
            <span className="text-[9px] font-bold tracking-[0.18em] text-emerald-600 uppercase leading-none mt-[3px]">
              {config.systemName.split(" ").slice(1).join(" ") || "Resort"} Admin
            </span>
          </div>
        </Link>

        {/* ── Right Controls ───────────────────────────────────────────── */}
        <div className="flex items-center gap-2">

          {/* Role Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700">
            <Shield size={12} strokeWidth={2} />
            <span className="text-[11px] font-semibold tracking-wide">
              {user?.role?.replace("_", " ") || "Administrator"}
            </span>
          </div>

          {/* User Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all duration-200 cursor-pointer group"
            >
              {/* Avatar */}
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white text-[10px] font-bold shadow-sm">
                {initials}
              </div>
              <span className="hidden sm:block text-xs font-semibold text-slate-700 max-w-[100px] truncate">
                {user?.name || "Admin"}
              </span>
              <ChevronDown 
                size={12} 
                strokeWidth={2.5}
                className={`text-slate-400 transition-transform duration-200 ${profileOpen ? "rotate-180" : ""}`} 
              />
            </button>

            {/* Dropdown */}
            {profileOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/70 z-20 overflow-hidden">
                  {/* User info header */}
                  <div className="px-4 py-3 border-b border-slate-50">
                    <p className="text-xs font-bold text-slate-900 truncate">{user?.name || "Admin"}</p>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">{user?.email || ""}</p>
                  </div>
                  {/* Menu items */}
                  <div className="p-1.5">
                    <Link
                      href="/admin/dashboard"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-650 hover:bg-slate-50 hover:text-slate-900 transition-colors font-medium cursor-pointer"
                    >
                      <LayoutDashboard size={13} strokeWidth={1.75} />
                      Dashboard
                    </Link>
                    <Link
                      href="/admin/users"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-650 hover:bg-slate-50 hover:text-slate-900 transition-colors font-medium cursor-pointer"
                    >
                      <User size={13} strokeWidth={1.75} />
                      User Management
                    </Link>
                  </div>
                  {/* Sign out */}
                  <div className="p-1.5 border-t border-slate-50">
                    <button
                      onClick={() => signOut({ callbackUrl: "/login" })}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors font-medium cursor-pointer"
                    >
                      <LogOut size={13} strokeWidth={1.75} />
                      Sign Out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Quick Log Out button */}
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-150 hover:border-red-100 hover:bg-red-50 text-[11px] font-semibold text-slate-500 hover:text-red-600 transition-all duration-200 cursor-pointer"
          >
            <LogOut size={12} strokeWidth={2} />
            <span className="hidden sm:block">Log Out</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
