"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { HiSparkles } from "react-icons/hi";
import { FaExpand } from "react-icons/fa";
import { useState } from "react";

// ─── Gallery data ─────────────────────────────────────────────────────────────

const galleryItems = [
  {
    src: "/hero-bg.png",
    alt: "Aerial view of Bolgoda Lake at golden hour",
    span: "col-span-2 row-span-2",
  },
  {
    src: "/boat-safari.png",
    alt: "Luxury pontoon boat at sunset on Bolgoda Lake",
    span: "col-span-1 row-span-1",
  },
  {
    src: "/family-package.png",
    alt: "Family feast at lakeside buffet",
    span: "col-span-1 row-span-1",
  },
  {
    src: "/boat-safari.png",
    alt: "Boat gliding through lily pads",
    span: "col-span-1 row-span-1",
  },
  {
    src: "/family-package.png",
    alt: "Infinity pool overlooking Bolgoda Lake",
    span: "col-span-1 row-span-1",
  },
];

// ─── Section ──────────────────────────────────────────────────────────────────

export default function GallerySection() {
  const [lightbox, setLightbox] = useState<string | null>(null);

  return (
    <section
      id="gallery"
      className="w-full flex flex-col items-center py-20 md:py-28 px-4 sm:px-6 lg:px-8 bg-[#0a1628] relative overflow-hidden"
    >
      {/* Top accent rule */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-teal-500/30 to-transparent" />

      {/* ── Content boundary — Standardized max-w-6xl container ─────────── */}
      <div className="relative w-full max-w-6xl mx-auto flex flex-col items-center">

        {/* ── Section header — Standardized ───────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="w-full max-w-3xl mx-auto flex flex-col items-center text-center justify-center mb-12 md:mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold tracking-widest uppercase mb-4">
            <HiSparkles /> Gallery
          </div>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-white mb-4">
            Glimpses of <span className="text-gradient">Paradise</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-xl">
            Every corner of Mandil Farmhouse is a frame-worthy moment waiting to
            be captured.
          </p>
        </motion.div>

        {/* ── Photo grid ───────────────────────────────────────────────────── */}
        <div className="w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 auto-rows-[180px]">
          {galleryItems.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className={`relative rounded-2xl overflow-hidden cursor-pointer group ${item.span}`}
              style={{ position: "relative" }}
              onClick={() => setLightbox(item.src)}
              suppressHydrationWarning={true}
            >
              <Image
                src={item.src}
                alt={item.alt}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                sizes="(max-width: 768px) 50vw, 33vw"
                style={{ objectFit: "cover" }}
              />
              {/* Hover overlay */}
              <div suppressHydrationWarning={true} className="absolute inset-0 bg-[#0a1628]/0 group-hover:bg-[#0a1628]/40 transition-all duration-300" />
              {/* Expand icon */}
              <div suppressHydrationWarning={true} className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                <div suppressHydrationWarning={true} className="w-10 h-10 rounded-full glass border border-white/30 flex items-center justify-center">
                  <FaExpand className="text-white text-sm" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Lightbox ─────────────────────────────────────────────────────── */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
          onClick={() => setLightbox(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            className="relative max-w-4xl w-full aspect-video rounded-3xl overflow-hidden"
            style={{ position: "relative" }}
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={lightbox}
              alt="Gallery image enlarged"
              fill
              className="object-cover"
              sizes="90vw"
              style={{ objectFit: "cover" }}
            />
          </motion.div>
          <button
            onClick={() => setLightbox(null)}
            aria-label="Close gallery lightbox"
            className="absolute top-6 right-6 w-10 h-10 rounded-full glass border border-white/20 flex items-center justify-center text-white hover:bg-white/10 transition-colors text-lg"
          >
            ✕
          </button>
        </div>
      )}
    </section>
  );
}
