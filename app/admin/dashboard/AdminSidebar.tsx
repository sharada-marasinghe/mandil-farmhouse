"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  Layers,
  Tag,
  Compass,
  Users,
  Settings,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
  matchExact?: boolean;
}

interface AdminSidebarProps {
  /** Badge counts to show on nav items — keyed by href */
  counts?: {
    bookings?: number;
    packages?: number;
    assets?: number;
    activities?: number;
    users?: number;
  };
}

export default function AdminSidebar({ counts = {} }: AdminSidebarProps) {
  const pathname = usePathname();

  const primaryNav: NavItem[] = [
    {
      label: "Dashboard Overview",
      href: "/admin/dashboard",
      icon: LayoutDashboard,
      matchExact: true,
    },
    {
      label: "Reservations Console",
      href: "/admin/dashboard?tab=bookings",
      icon: CalendarDays,
      badge: counts.bookings,
    },
    {
      label: "Lakeside Packages",
      href: "/admin/dashboard?tab=packages",
      icon: Layers,
      badge: counts.packages,
    },
    {
      label: "Assets & Add-ons",
      href: "/admin/dashboard?tab=assets",
      icon: Tag,
      badge: counts.assets,
    },
    {
      label: "Resort Activities",
      href: "/admin/dashboard?tab=activities",
      icon: Compass,
      badge: counts.activities,
    },
    {
      label: "User Management",
      href: "/admin/users",
      icon: Users,
      badge: counts.users,
    },
  ];

  const systemNav: NavItem[] = [
    {
      label: "System Settings",
      href: "/admin/settings",
      icon: Settings,
    },
  ];

  // Determine active item
  const isActive = (item: NavItem) => {
    if (item.matchExact) {
      return pathname === item.href;
    }
    // For href with query, match pathname + the tab param
    const [basePath, query] = item.href.split("?");
    if (query) {
      const params = new URLSearchParams(query);
      const tab = params.get("tab");
      // Check current URL for this tab via window.location if available
      if (typeof window !== "undefined") {
        const currentTab = new URLSearchParams(window.location.search).get("tab");
        return pathname === basePath && currentTab === tab;
      }
      return false;
    }
    // Exact path match
    return pathname === item.href;
  };

  const NavLink = ({ item }: { item: NavItem }) => {
    const active = isActive(item);
    const Icon = item.icon;

    return (
      <Link
        href={item.href}
        className={`
          relative w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium
          transition-all duration-200 group
          ${active
            ? "bg-emerald-50/80 text-emerald-800"
            : "text-slate-550 hover:bg-slate-50 hover:text-slate-900"
          }
        `}
      >
        {/* Left accent bar for active state */}
        {active && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full bg-emerald-600" />
        )}

        <Icon
          size={18}
          strokeWidth={1.75}
          className={`flex-shrink-0 transition-colors duration-200 ${
            active ? "text-emerald-700" : "text-slate-400 group-hover:text-slate-650"
          }`}
        />

        <span className="flex-1 leading-none">{item.label}</span>

        {/* Count badge */}
        {item.badge !== undefined && item.badge > 0 && (
          <span className={`
            text-[10px] font-semibold px-2 py-0.5 rounded-full border leading-none
            ${active
              ? "bg-emerald-100 text-emerald-700 border-emerald-200"
              : "bg-slate-100 text-slate-600 border-slate-150"
            }
          `}>
            {item.badge}
          </span>
        )}
      </Link>
    );
  };

  return (
    <aside className="w-[240px] min-h-[calc(100vh-60px)] bg-white border-r border-slate-100/80 flex flex-col py-5 px-3 sticky top-[60px] shadow-[1px_0_0_0_rgba(0,0,0,0.03)] flex-shrink-0">

      {/* ── Section Label ───────────────────────────────────────────────── */}
      <div className="px-4 mb-3">
        <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-350">
          Resort Management
        </span>
      </div>

      {/* ── Primary Navigation ───────────────────────────────────────────── */}
      <nav className="flex-1 flex flex-col gap-0.5">
        {primaryNav.map((item) => (
          <NavLink key={item.href} item={item} />
        ))}
      </nav>

      {/* ── Divider ─────────────────────────────────────────────────────── */}
      <div className="my-3 border-t border-slate-100/80" />

      {/* ── System Navigation ───────────────────────────────────────────── */}
      <nav className="flex flex-col gap-0.5">
        {systemNav.map((item) => (
          <NavLink key={item.href} item={item} />
        ))}
      </nav>

      {/* ── Footer Brand Mark ───────────────────────────────────────────── */}
      <div className="mt-4 px-4 pt-3 border-t border-slate-100/80">
        <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-300">
          Mandil Farmhouse
        </p>
        <p className="text-[9px] text-slate-300 mt-0.5">Admin Console v2.0</p>
      </div>
    </aside>
  );
}
