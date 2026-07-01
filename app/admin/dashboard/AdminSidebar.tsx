"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useBranding } from "@/app/components/BrandingProvider";
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
}

interface AdminSidebarProps {
  counts?: {
    bookings?: number;
    packages?: number;
    assets?: number;
    activities?: number;
    users?: number;
  };
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard Overview",   href: "/admin/dashboard",     icon: LayoutDashboard },
  { label: "Reservations Console", href: "/admin/reservations",  icon: CalendarDays },
  { label: "Lakeside Packages",    href: "/admin/packages",      icon: Layers },
  { label: "Assets & Add-ons",     href: "/admin/assets",        icon: Tag },
  { label: "Resort Activities",    href: "/admin/activities",    icon: Compass },
  { label: "User Management",      href: "/admin/users",         icon: Users },
];

const SYSTEM_ITEMS: NavItem[] = [
  { label: "System Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminSidebar({ counts = {} }: AdminSidebarProps) {
  const pathname = usePathname();
  const { config } = useBranding();

  // Map badge counts by route
  const badgeMap: Record<string, number | undefined> = {
    "/admin/reservations": counts.bookings,
    "/admin/packages":     counts.packages,
    "/admin/assets":       counts.assets,
    "/admin/activities":   counts.activities,
    "/admin/users":        counts.users,
  };

  const NavLink = ({ item }: { item: NavItem }) => {
    const active = pathname === item.href || pathname.startsWith(item.href + "/");
    const Icon = item.icon;
    const badge = badgeMap[item.href];

    return (
      <Link
        href={item.href}
        className={`
          relative w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium
          transition-all duration-200 group
          ${active
            ? "bg-emerald-50/80 text-emerald-800"
            : "text-slate-555 hover:bg-slate-50 hover:text-slate-900"
          }
        `}
      >
        {/* 3px left accent bar — only visible when active */}
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

        {badge !== undefined && badge > 0 && (
          <span className={`
            text-[10px] font-semibold px-2 py-0.5 rounded-full border leading-none
            ${active
              ? "bg-emerald-100 text-emerald-700 border-emerald-200"
              : "bg-slate-100 text-slate-600 border-slate-200"
            }
          `}>
            {badge}
          </span>
        )}
      </Link>
    );
  };

  return (
    <aside className="w-[240px] min-h-[calc(100vh-60px)] bg-white border-r border-slate-100/80 flex flex-col py-5 px-3 sticky top-[60px] shadow-[1px_0_0_0_rgba(0,0,0,0.03)] flex-shrink-0">

      {/* Section label */}
      <div className="px-4 mb-3">
        <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-350">
          Resort Management
        </span>
      </div>

      {/* Primary nav */}
      <nav className="flex-1 flex flex-col gap-0.5">
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.href} item={item} />
        ))}
      </nav>

      {/* Divider */}
      <div className="my-3 border-t border-slate-100/80" />

      {/* System nav */}
      <nav className="flex flex-col gap-0.5">
        {SYSTEM_ITEMS.map((item) => (
          <NavLink key={item.href} item={item} />
        ))}
      </nav>

      {/* Footer mark */}
      <div className="mt-4 px-4 pt-3 border-t border-slate-100/80">
        <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-350">
          {config.systemName}
        </p>
        <p className="text-[9px] text-slate-300 mt-0.5">Admin Console v2.0</p>
      </div>
    </aside>
  );
}
