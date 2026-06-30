"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { 
  FiMenu, 
  FiX, 
  FiAlertTriangle, 
  FiUser, 
  FiLogOut, 
  FiSettings, 
  FiHelpCircle 
} from "react-icons/fi";
import { createClient } from "@/utils/supabase/client";

const navLinks = [
  { label: "Packages",      href: "/packages" },
  { label: "Gallery",       href: "/gallery" },
  { label: "Reviews",       href: "/reviews" },
  { label: "Track Booking", href: "/track-booking" },
  { label: "Contact",       href: "/contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [hasGalleryImages, setHasGalleryImages] = useState<boolean | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll, { passive: true });

    async function checkGalleryBucket() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.storage
          .from("images-b")
          .list("", { limit: 1 });
        if (error || !data || data.length === 0) {
          setHasGalleryImages(false);
        } else {
          setHasGalleryImages(true);
        }
      } catch (err) {
        setHasGalleryImages(false);
      }
    }

    checkGalleryBucket();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown on window click
  useEffect(() => {
    if (!profileDropdownOpen) return;
    const closeDropdown = () => setProfileDropdownOpen(false);
    window.addEventListener("click", closeDropdown);
    return () => window.removeEventListener("click", closeDropdown);
  }, [profileDropdownOpen]);

  const handleNavClick = (href: string) => {
    setMobileOpen(false);
    if (window.location.pathname !== "/") {
      window.location.href = `/${href}`;
      return;
    }
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Generate fallback initials
  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="w-full sticky top-0 z-50 flex flex-col">
      {/* Navbar Container */}
      <nav className={`w-full bg-white border-b border-slate-100 h-16 flex items-center transition-shadow ${
        scrolled ? "shadow-sm" : ""
      }`}>
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-full">
          {/* Logo */}
          <Link
            href="/"
            onClick={(e) => {
              if (window.location.pathname === "/") {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
            className="flex items-center gap-2 group cursor-pointer flex-shrink-0"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold shadow-sm transition-transform duration-200 group-hover:scale-105">
              M
            </div>
            <div>
              <span className="font-semibold text-slate-900 text-base leading-none block">
                Mandil
              </span>
              <span className="block text-[9px] font-bold tracking-widest text-emerald-600 uppercase leading-none mt-0.5">
                Farmhouse
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`text-sm font-medium transition-colors relative py-1 cursor-pointer ${
                    isActive ? "text-emerald-700 font-semibold" : "text-slate-555 hover:text-emerald-600"
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-emerald-600 rounded-full" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Desktop CTA & Profile Button Section */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={() => handleNavClick("#booking")}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors shadow-sm cursor-pointer"
            >
              Book Now
            </button>

            {session ? (
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setProfileDropdownOpen(!profileDropdownOpen);
                  }}
                  className="w-8 h-8 rounded-full bg-emerald-100 hover:ring-2 hover:ring-emerald-500/50 flex items-center justify-center text-emerald-800 font-bold text-xs overflow-hidden cursor-pointer transition-all duration-200"
                >
                  {session.user?.image ? (
                    <Image
                      src={session.user.image}
                      alt={session.user.name || "Avatar"}
                      width={32}
                      height={32}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    getInitials(session.user?.name)
                  )}
                </button>

                {/* Dropdown Menu */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2.5 w-56 bg-white rounded-xl shadow-xl border border-slate-100 z-50 py-1.5 text-left animate-fade-in">
                    <div className="px-4 py-2 text-xs">
                      <span className="block font-bold text-slate-800 truncate">{session.user?.name}</span>
                      <span className="block text-slate-400 truncate mt-0.5">{session.user?.email}</span>
                    </div>
                    <div className="h-px bg-slate-100 my-1.5" />
                    
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-semibold transition-colors"
                    >
                      <FiUser className="text-slate-400" />
                      My Profile &amp; Bookings
                    </Link>
                    
                    <Link
                      href="/contact"
                      className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-semibold transition-colors"
                    >
                      <FiHelpCircle className="text-slate-400" />
                      Support &amp; Help
                    </Link>
                    
                    <div className="h-px bg-slate-100 my-1.5" />
                    
                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-xs text-red-600 hover:bg-red-50 font-semibold transition-colors cursor-pointer"
                    >
                      <FiLogOut className="text-red-400" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 rounded-lg border border-slate-200 text-slate-650 hover:bg-slate-50 text-sm font-semibold transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-slate-505 hover:text-emerald-600 hover:bg-slate-50 transition-colors"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 top-16 bg-slate-900/20 backdrop-blur-xs z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Menu Drawer */}
      <div className={`fixed top-16 right-0 bottom-0 w-64 bg-white border-l border-slate-100 shadow-xl z-40 md:hidden transition-transform duration-300 ${
        mobileOpen ? "translate-x-0" : "translate-x-full"
      }`}>
        <div className="flex flex-col h-full justify-between p-6">
          <div className="flex flex-col gap-1">
            {session && (
              <div className="flex items-center gap-3 px-3 py-4 border-b border-slate-100 mb-2">
                {session.user?.image ? (
                  <div className="relative w-9 h-9 rounded-full overflow-hidden border border-slate-205 flex-shrink-0">
                    <Image 
                      src={session.user.image} 
                      alt={session.user.name || "Avatar"} 
                      fill 
                      className="object-cover" 
                    />
                  </div>
                ) : (
                  <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 font-bold text-xs flex-shrink-0">
                    {getInitials(session.user?.name)}
                  </div>
                )}
                <div className="truncate max-w-[140px]">
                  <span className="block text-xs font-bold text-slate-800 truncate">{session.user?.name}</span>
                  <span className="block text-[10px] text-slate-400 truncate">{session.user?.email}</span>
                </div>
              </div>
            )}

            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`px-3 py-2.5 rounded-lg text-sm font-medium block transition-colors text-left ${
                    isActive 
                      ? "bg-emerald-50 text-[#007351] font-bold" 
                      : "text-slate-650 hover:text-[#007351] hover:bg-slate-50"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}

            {session && (
              <Link
                href="/dashboard"
                onClick={() => setMobileOpen(false)}
                className={`px-3 py-2.5 rounded-lg text-sm font-medium block transition-colors text-left ${
                  pathname === "/dashboard"
                    ? "bg-emerald-50 text-[#007351] font-bold" 
                    : "text-slate-655 hover:text-[#007351] hover:bg-slate-50"
                }`}
              >
                My Dashboard
              </Link>
            )}
          </div>

          <div className="space-y-2.5 pt-4 border-t border-slate-100">
            <button
              onClick={() => handleNavClick("#booking")}
              className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold text-center block transition-colors shadow-sm cursor-pointer"
            >
              Book Now
            </button>
            {session ? (
              <button
                onClick={() => {
                  setMobileOpen(false);
                  signOut({ callbackUrl: "/" });
                }}
                className="w-full py-2.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-sm font-semibold text-center block transition-colors cursor-pointer"
              >
                Sign Out
              </button>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="w-full py-2.5 rounded-lg border border-slate-205 text-slate-700 hover:bg-slate-50 text-sm font-semibold text-center block transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Warning/Alert Banner (Static below Navbar) */}
      {hasGalleryImages === false && (
        <div className="w-full bg-amber-50 text-amber-800 py-3 px-4 text-center text-sm border-b border-amber-200 flex justify-center items-center">
          <div className="flex items-center justify-center gap-2">
            <FiAlertTriangle className="text-amber-600 flex-shrink-0" size={16} />
            <span>
              No gallery images yet. Upload photos to the <code className="bg-amber-100/60 px-1.5 py-0.5 rounded font-mono text-xs text-amber-900">images-b</code> bucket in Supabase.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
