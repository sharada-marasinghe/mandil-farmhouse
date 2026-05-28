"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform, Variants } from "framer-motion";
import { FaAnchor, FaCalendarCheck, FaChevronDown } from "react-icons/fa";
import { HiSparkles } from "react-icons/hi";

const floatVariants: Variants = {
  initial: { y: 0 },
  animate: {
    y: [-10, 10, -10],
    transition: { duration: 5, repeat: Infinity, ease: "easeInOut" },
  },
};

const floatDelayedVariants: Variants = {
  initial: { y: 0 },
  animate: {
    y: [8, -8, 8],
    transition: { duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 },
  },
};

const textReveal: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] as const, delay: i * 0.15 },
  }),
};

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });
  const opacityOverlay = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  const handleScroll = (id: string) => {
    document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      ref={containerRef}
      id="hero"
      className="relative h-screen min-h-[600px] w-full flex items-center justify-center overflow-hidden"
      style={{ minHeight: "100dvh" }}
    >
      {/* Background Image — explicit inset ensures fill image renders */}
      <div
        className="absolute inset-0 z-0"
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, width: "100%", height: "100%" }}
      >
        <Image
          src="/hero-bg.png"
          alt="Bolgoda Lake aerial view at golden hour sunset"
          fill
          priority
          quality={90}
          className="object-cover object-center"
          sizes="100vw"
          style={{ objectFit: "cover" }}
        />
      </div>

      {/* Hero Overlay */}
      <motion.div
        style={{ opacity: opacityOverlay }}
        className="absolute inset-0 z-10 hero-overlay"
      />

      {/* Animated particles / floating orbs */}
      <div className="absolute inset-0 z-10 overflow-hidden pointer-events-none">
        <motion.div
          variants={floatVariants}
          initial="initial"
          animate="animate"
          className="absolute top-1/4 left-1/6 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl"
        />
        <motion.div
          variants={floatDelayedVariants}
          initial="initial"
          animate="animate"
          className="absolute bottom-1/3 right-1/6 w-80 h-80 rounded-full bg-teal-500/10 blur-3xl"
        />
        <motion.div
          variants={floatVariants}
          initial="initial"
          animate="animate"
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-emerald-700/5 blur-3xl"
          style={{ animationDelay: "2s" }}
        />
      </div>

      {/* Hero Content — Standardized container to match unified vertical grid */}
      <div className="relative z-20 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center py-20 pt-28">
        {/* Badge */}
        <motion.div
          custom={0}
          variants={textReveal}
          initial="hidden"
          animate="visible"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-emerald-500/30 mb-5"
        >
          <HiSparkles className="text-gold-400 text-sm" />
          <span className="text-sm font-medium text-emerald-300 tracking-wide">
            Sri Lanka&apos;s Premier Lakeside Escape
          </span>
          <HiSparkles className="text-gold-400 text-sm" />
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          custom={1}
          variants={textReveal}
          initial="hidden"
          animate="visible"
          className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] mb-6"
        >
          <span className="text-white">Escape to</span>
          <br />
          <span className="shimmer-text">Bolgoda&apos;s Finest</span>
          <br />
          <span className="text-white">Lakeside Retreat</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          custom={2}
          variants={textReveal}
          initial="hidden"
          animate="visible"
          className="text-lg sm:text-xl md:text-2xl text-slate-300 font-light max-w-2xl mx-auto mb-4 leading-relaxed"
        >
          Discover{" "}
          <span className="text-emerald-400 font-medium">Mandil Farmhouse</span>{" "}
          — where tropical serenity meets luxury boat safaris, traditional feasts,
          and unforgettable family moments on Bolgoda Lake.
        </motion.p>

        {/* Sub-badge */}
        <motion.div
          custom={3}
          variants={textReveal}
          initial="hidden"
          animate="visible"
          className="hidden sm:flex items-center justify-center gap-6 mb-8 text-sm text-slate-400"
        >
          {["Luxury Pontoon Safaris", "Family Day Packages", "Sunset Views"].map((item, i) => (
            <span key={i} className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {item}
            </span>
          ))}
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          custom={4}
          variants={textReveal}
          initial="hidden"
          animate="visible"
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <motion.button
            whileHover={{ scale: 1.06, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleScroll("#safaris")}
            className="group flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-lg transition-all duration-300 btn-glow shadow-xl"
          >
            <FaAnchor className="text-base group-hover:rotate-12 transition-transform duration-300" />
            Explore Safaris
            <motion.span
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-emerald-300"
            >
              →
            </motion.span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.06, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleScroll("#booking")}
            className="group flex items-center gap-3 px-8 py-4 rounded-2xl glass border border-emerald-500/40 hover:border-emerald-400/60 hover:bg-emerald-500/10 text-white font-semibold text-lg transition-all duration-300"
          >
            <FaCalendarCheck className="text-emerald-400 group-hover:scale-110 transition-transform duration-300" />
            Check Availability
          </motion.button>
        </motion.div>

        {/* Stats row */}
        <motion.div
          custom={5}
          variants={textReveal}
          initial="hidden"
          animate="visible"
          className="flex items-center justify-center gap-6 sm:gap-8 mt-8 sm:mt-14 pt-6 sm:pt-8 border-t border-white/10 w-full max-w-2xl"
        >
          {[
            { value: "500+", label: "Happy Guests" },
            { value: "4.9★", label: "Google Rating" },
            { value: "15km²", label: "Lake to Explore" },
          ].map((stat) => (
            <div key={stat.label} className="text-center flex-1">
              <div className="text-2xl sm:text-3xl font-bold text-gradient font-display">
                {stat.value}
              </div>
              <div className="text-xs sm:text-sm text-slate-400 mt-0.5 font-medium">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
      >
        <span className="text-xs text-slate-400 tracking-widest uppercase font-medium">
          Scroll
        </span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <FaChevronDown className="text-emerald-400 text-base" />
        </motion.div>
      </motion.div>

      {/* Bottom wave shape */}
      <div className="absolute bottom-0 left-0 right-0 z-20">
        <svg
          viewBox="0 0 1440 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full"
          preserveAspectRatio="none"
        >
          <path
            d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z"
            fill="#0a1628"
          />
        </svg>
      </div>
    </section>
  );
}
