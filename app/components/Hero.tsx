"use client";

import Image from "next/image";
import { FiAnchor, FiCalendar, FiChevronDown } from "react-icons/fi";
import { HiOutlineSparkles } from "react-icons/hi";

export default function Hero() {
  const handleScroll = (id: string) => {
    const el = document.querySelector(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section
      id="hero"
      className="relative h-screen min-h-[600px] w-full flex items-center justify-center overflow-hidden bg-slate-50"
      style={{ minHeight: "100dvh" }}
    >
      {/* Background Image */}
      <div className="absolute inset-0 z-0 w-full h-full">
        <Image
          src="/hero-bg.png"
          alt="Bolgoda Lake aerial view at golden hour sunset"
          fill
          priority
          quality={90}
          className="object-cover object-center"
          sizes="100vw"
        />
      </div>

      {/* Light Gradient Overlay for readability */}
      <div className="absolute inset-0 z-10 bg-gradient-to-r from-white/95 via-white/80 to-transparent md:to-white/10" />

      {/* Hero Content */}
      <div className="relative z-20 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center md:items-start text-center md:text-left py-20 pt-28">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-semibold tracking-wide mb-6">
          <HiOutlineSparkles className="text-emerald-600" size={14} />
          <span>Sri Lanka&apos;s Premier Lakeside Escape</span>
        </div>

        {/* Main Headline */}
        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.15] text-slate-900 mb-6 max-w-2xl">
          Escape to Bolgoda&apos;s <span className="text-emerald-700">Finest</span> Lakeside Retreat
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-slate-600 font-normal max-w-xl mb-8 leading-relaxed">
          Discover <span className="text-emerald-700 font-semibold">Mandil Farmhouse</span> — where tropical serenity meets luxury boat safaris, traditional feasts, and unforgettable family moments on Bolgoda Lake.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <button
            onClick={() => handleScroll("#packages")}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-colors shadow-sm"
          >
            <FiAnchor size={16} />
            <span>Explore Safaris</span>
          </button>

          <button
            onClick={() => handleScroll("#booking")}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-sm transition-colors"
          >
            <FiCalendar size={16} />
            <span>Check Availability</span>
          </button>
        </div>

        {/* Mini Stats row */}
        <div className="flex items-center justify-center md:justify-start gap-8 mt-12 pt-8 border-t border-slate-200/80 w-full max-w-xl">
          {[
            { value: "500+", label: "Happy Guests" },
            { value: "4.9★", label: "Google Rating" },
            { value: "15km²", label: "Lake Area" },
          ].map((stat) => (
            <div key={stat.label} className="flex-1 text-center md:text-left">
              <div className="text-xl font-bold text-slate-900">
                {stat.value}
              </div>
              <div className="text-xs text-slate-500 mt-0.5 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1 cursor-pointer" onClick={() => handleScroll("#packages")}>
        <span className="text-[10px] text-slate-400 tracking-widest uppercase font-semibold">
          Scroll Down
        </span>
        <FiChevronDown className="text-emerald-600 animate-bounce" size={16} />
      </div>

      {/* Bottom wave shape filled with clean slate-50 to blend with packages section */}
      <div className="absolute bottom-0 left-0 right-0 z-20">
        <svg
          viewBox="0 0 1440 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full"
          preserveAspectRatio="none"
          style={{ height: "40px" }}
        >
          <path
            d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z"
            fill="#f8fafc"
          />
        </svg>
      </div>
    </section>
  );
}
