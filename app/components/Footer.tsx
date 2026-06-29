"use client";

import { FiArrowUp, FiPhone, FiMapPin, FiInstagram, FiFacebook } from "react-icons/fi";

export default function Footer() {
  const year = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer
      id="contact"
      className="bg-slate-50 border-t border-slate-200/80 py-16 px-4 sm:px-6 lg:px-8 w-full flex flex-col items-center text-slate-600"
    >
      <div className="w-full max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold shadow-sm">
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
            </div>
            <p className="text-slate-500 text-sm leading-relaxed max-w-xs mb-6">
              Nestled on the serene shores of Bolgoda Lake, Mandil Farmhouse offers an authentic escape into nature — luxury boat safaris, traditional feasts, and memories that last a lifetime.
            </p>
            <div className="flex items-center gap-3">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram"
                className="w-9 h-9 rounded-lg border border-slate-200 hover:border-emerald-600/30 flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:bg-slate-100 transition-colors">
                <FiInstagram className="text-sm" />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook"
                className="w-9 h-9 rounded-lg border border-slate-200 hover:border-emerald-600/30 flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:bg-slate-100 transition-colors">
                <FiFacebook className="text-sm" />
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h5 className="text-slate-900 font-semibold text-xs mb-4 uppercase tracking-wider">Explore</h5>
            <ul className="space-y-2.5 text-sm">
              {[
                { label: "Boat Safaris", id: "#safaris" },
                { label: "Family Packages", id: "#packages" },
                { label: "Gallery", id: "#gallery" },
                { label: "Book Now", id: "#booking" },
              ].map((item) => (
                <li key={item.label}>
                  <button
                    onClick={() => document.querySelector(item.id)?.scrollIntoView({ behavior: "smooth" })}
                    className="text-slate-500 hover:text-emerald-600 transition-colors"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h5 className="text-slate-900 font-semibold text-xs mb-4 uppercase tracking-wider">Contact</h5>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="tel:+94712345678" className="flex items-start gap-2 text-slate-500 hover:text-emerald-600 transition-colors">
                  <FiPhone className="mt-0.5 text-emerald-600 flex-shrink-0 text-xs" />
                  +94 71 234 5678
                </a>
              </li>
              <li>
                <span className="flex items-start gap-2 text-slate-500">
                  <FiMapPin className="mt-0.5 text-emerald-600 flex-shrink-0 text-xs" />
                  Bolgoda Lake, Panadura, Western Province, Sri Lanka
                </span>
              </li>
            </ul>
            <div className="mt-4 p-3 rounded-lg bg-emerald-50/50 border border-emerald-100">
              <p className="text-xs text-emerald-800 font-bold uppercase tracking-wider">Open Daily</p>
              <p className="text-xs text-slate-500 mt-0.5">7:00 AM – 7:00 PM</p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-200/80 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-400">
            © {year} Mandil Farmhouse. All rights reserved.
          </p>
          <button
            onClick={scrollToTop}
            className="text-xs text-slate-400 hover:text-emerald-600 flex items-center gap-1 transition-colors"
          >
            <span>Back to top</span>
            <FiArrowUp size={12} />
          </button>
        </div>
      </div>
    </footer>
  );
}
