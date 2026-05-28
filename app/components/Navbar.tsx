"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaLeaf, FaBars, FaTimes, FaAnchor } from "react-icons/fa";
import { HiOutlineSparkles } from "react-icons/hi";

// ─── Data ─────────────────────────────────────────────────────────────────────

const navLinks = [
  { label: "Packages", href: "#packages" },
  { label: "Safaris",  href: "#safaris"  },
  { label: "Gallery",  href: "#gallery"  },
  { label: "About",    href: "#about"    },
  { label: "Contact",  href: "#contact"  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function Navbar() {
  const [scrolled,    setScrolled]    = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setMobileOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 w-full z-50 flex justify-center transition-all duration-500 ${
          scrolled
            ? "glass-dark shadow-2xl shadow-emerald-900/20"
            : "bg-transparent"
        }`}
      >
        {/*
         * Standardized to max-w-6xl to align perfectly with all lower content boundaries.
         */}
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16 md:h-20">

          {/* ── Logo ──────────────────────────────────────────────────────── */}
          <motion.a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="flex items-center gap-2.5 group cursor-pointer flex-shrink-0"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg group-hover:shadow-emerald-500/40 transition-all duration-300">
              <FaAnchor className="text-white text-sm" />
              <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-gold-400 flex items-center justify-center">
                <HiOutlineSparkles className="text-[7px] text-amber-900" />
              </div>
            </div>
            <div>
              <span className="font-display font-bold text-lg leading-none text-white">
                Mandil
              </span>
              <span className="block text-[10px] font-medium tracking-widest text-emerald-400 uppercase leading-none mt-0.5">
                Farmhouse
              </span>
            </div>
          </motion.a>

          {/* ── Desktop Links ── Centered midpoint */}
          <div className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
            {navLinks.map((link, i) => (
              <motion.button
                key={link.label}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i + 0.3 }}
                onClick={() => handleNavClick(link.href)}
                className="relative px-4 py-2 text-sm font-medium text-slate-300 hover:text-emerald-400 transition-colors duration-200 rounded-lg hover:bg-white/5 group"
              >
                {link.label}
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-emerald-400 rounded-full group-hover:w-4 transition-all duration-300" />
              </motion.button>
            ))}
          </div>

          {/* ── Right zone: Book Now CTA + mobile hamburger ───────────────── */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleNavClick("#booking")}
              className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-semibold transition-all duration-300 btn-glow"
            >
              <FaLeaf className="text-xs" />
              Book Now
            </motion.button>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg glass text-slate-300 hover:text-emerald-400 transition-colors"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 z-40 w-72 glass-dark shadow-2xl md:hidden"
            aria-label="Mobile navigation menu"
          >
            <div className="flex flex-col h-full pt-20 pb-8 px-6">
              <nav className="flex flex-col gap-2">
                {navLinks.map((link, i) => (
                  <motion.button
                    key={link.label}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    onClick={() => handleNavClick(link.href)}
                    className="text-left px-4 py-3.5 text-base font-medium text-slate-200 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-xl transition-all duration-200 border border-transparent hover:border-emerald-500/20"
                  >
                    {link.label}
                  </motion.button>
                ))}
              </nav>
              <div className="mt-auto">
                <button
                  onClick={() => handleNavClick("#booking")}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold text-base flex items-center justify-center gap-2 btn-glow"
                >
                  <FaLeaf /> Book Now
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>
    </>
  );
}
