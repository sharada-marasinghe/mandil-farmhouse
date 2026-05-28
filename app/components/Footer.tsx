"use client";

import { motion } from "framer-motion";
import { FaLeaf, FaAnchor, FaPhone, FaWhatsapp, FaMapMarkerAlt, FaInstagram, FaFacebook } from "react-icons/fa";

export default function Footer() {
  const year = new Date().getFullYear();

  const scrollTo = (id: string) => document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <footer
      id="contact"
      className="bg-[#060e1c] border-t border-white/5 py-16 md:py-20 px-4 sm:px-6 lg:px-8 w-full flex flex-col items-center"
    >
      {/* ── Content boundary — Standardized max-w-6xl container ─────────── */}
      <div className="w-full max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
                <FaAnchor className="text-white text-sm" />
              </div>
              <div>
                <span className="font-display font-bold text-xl text-white">Mandil Farmhouse</span>
                <p className="text-[11px] text-emerald-400 tracking-widest uppercase font-medium">Bolgoda Lake Retreat</p>
              </div>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs mb-6">
              Nestled on the serene shores of Bolgoda Lake, Mandil Farmhouse offers an authentic escape into nature — luxury boat safaris, traditional feasts, and memories that last a lifetime.
            </p>
            <div className="flex items-center gap-3">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram"
                className="w-9 h-9 rounded-xl glass border border-white/10 hover:border-emerald-500/40 flex items-center justify-center text-slate-400 hover:text-emerald-400 transition-all duration-200">
                <FaInstagram className="text-sm" />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook"
                className="w-9 h-9 rounded-xl glass border border-white/10 hover:border-emerald-500/40 flex items-center justify-center text-slate-400 hover:text-emerald-400 transition-all duration-200">
                <FaFacebook className="text-sm" />
              </a>
              <a href="https://wa.me/94712345678" target="_blank" rel="noreferrer" aria-label="WhatsApp"
                className="w-9 h-9 rounded-xl glass border border-white/10 hover:border-green-500/40 flex items-center justify-center text-slate-400 hover:text-green-400 transition-all duration-200">
                <FaWhatsapp className="text-sm" />
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h5 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider font-display">Explore</h5>
            <ul className="space-y-2.5">
              {[
                { label: "Boat Safaris", id: "#safaris" },
                { label: "Family Packages", id: "#packages" },
                { label: "Gallery", id: "#gallery" },
                { label: "Book Now", id: "#booking" },
              ].map((item) => (
                <li key={item.label}>
                  <button
                    onClick={() => scrollTo(item.id)}
                    className="text-slate-400 hover:text-emerald-400 text-sm transition-colors duration-200 flex items-center gap-2 group"
                  >
                    <FaLeaf className="text-[10px] text-emerald-600 group-hover:text-emerald-400 transition-colors" />
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h5 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider font-display">Contact</h5>
            <ul className="space-y-3">
              <li>
                <a href="tel:+94712345678" className="flex items-start gap-2 text-sm text-slate-400 hover:text-emerald-400 transition-colors group">
                  <FaPhone className="mt-0.5 text-emerald-600 group-hover:text-emerald-400 flex-shrink-0 text-xs" />
                  +94 71 234 5678
                </a>
              </li>
              <li>
                <a href="https://wa.me/94712345678" target="_blank" rel="noreferrer" className="flex items-start gap-2 text-sm text-slate-400 hover:text-green-400 transition-colors group">
                  <FaWhatsapp className="mt-0.5 text-green-600 group-hover:text-green-400 flex-shrink-0 text-xs" />
                  WhatsApp Enquiry
                </a>
              </li>
              <li>
                <span className="flex items-start gap-2 text-sm text-slate-400">
                  <FaMapMarkerAlt className="mt-0.5 text-emerald-600 flex-shrink-0 text-xs" />
                  Bolgoda Lake, Panadura, Western Province, Sri Lanka
                </span>
              </li>
            </ul>
            <div className="mt-4 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
              <p className="text-xs text-emerald-400 font-medium">Open Daily</p>
              <p className="text-xs text-slate-400 mt-0.5">7:00 AM – 7:00 PM</p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-600">
            © {year} Mandil Farmhouse. All rights reserved.
          </p>
          <p className="text-xs text-slate-600 flex items-center gap-1">
            Built with <span className="text-emerald-600">♥</span> for Bolgoda Lake
          </p>
        </div>
      </div>
    </footer>
  );
}
