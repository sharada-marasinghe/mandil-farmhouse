"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import { FaAnchor, FaSignOutAlt, FaUserShield } from "react-icons/fa";
import { HiOutlineSparkles } from "react-icons/hi";

interface AdminNavbarProps {
  user: any;
}

export default function AdminNavbar({ user }: AdminNavbarProps) {
  return (
    <nav className="w-full bg-[#0a101b] border-b border-white/5 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand logo */}
        <Link href="/admin/dashboard" className="flex items-center gap-2.5 group">
          <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
            <FaAnchor className="text-white text-xs" />
            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-400 flex items-center justify-center">
              <HiOutlineSparkles className="text-[6px] text-amber-900" />
            </div>
          </div>
          <div>
            <span className="font-display font-bold text-sm text-white">
              Mandil
            </span>
            <span className="block text-[8px] font-medium tracking-widest text-emerald-400 uppercase leading-none mt-0.5">
              Farmhouse Admin
            </span>
          </div>
        </Link>

        {/* Right side controls */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <FaUserShield className="text-xs" />
            {user?.name || "Admin"}
          </div>

          <button
            onClick={() => signOut({ callbackUrl: "/admin" })}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg hover:bg-red-500/10 hover:text-red-400 border border-transparent hover:border-red-500/20 text-xs font-semibold text-slate-400 transition-all duration-200 cursor-pointer"
          >
            <FaSignOutAlt className="text-xs" />
            Log Out
          </button>
        </div>
      </div>
    </nav>
  );
}
