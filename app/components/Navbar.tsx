"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FiMenu, FiX, FiAlertTriangle } from "react-icons/fi";
import { createClient } from "@/utils/supabase/client";

const navLinks = [
  { label: "Packages",      href: "#packages",      external: false },
  { label: "Safaris",       href: "#safaris",       external: false },
  { label: "Gallery",       href: "#gallery",       external: false },
  { label: "About",         href: "#about",         external: false },
  { label: "Contact",       href: "#contact",       external: false },
  { label: "Track Booking", href: "/track-booking", external: true  },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
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

  const handleNavClick = (href: string) => {
    setMobileOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
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
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
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
            {navLinks.map((link) =>
              link.external ? (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-sm font-medium text-slate-500 hover:text-emerald-600 transition-colors"
                >
                  {link.label}
                </Link>
              ) : (
                <button
                  key={link.label}
                  onClick={() => handleNavClick(link.href)}
                  className="text-sm font-medium text-slate-500 hover:text-emerald-600 transition-colors"
                >
                  {link.label}
                </button>
              )
            )}
          </div>

          {/* Desktop CTA Button */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={() => handleNavClick("#booking")}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors shadow-sm"
            >
              Book Now
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-slate-50 transition-colors"
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
        <div className="flex flex-col gap-1 p-6">
          {navLinks.map((link) =>
            link.external ? (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:text-emerald-600 hover:bg-slate-50 block transition-colors"
              >
                {link.label}
              </Link>
            ) : (
              <button
                key={link.label}
                onClick={() => handleNavClick(link.href)}
                className="text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:text-emerald-600 hover:bg-slate-50 transition-colors"
              >
                {link.label}
              </button>
            )
          )}
          <div className="mt-4 pt-4 border-t border-slate-100">
            <button
              onClick={() => handleNavClick("#booking")}
              className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold text-center block transition-colors shadow-sm"
            >
              Book Now
            </button>
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
