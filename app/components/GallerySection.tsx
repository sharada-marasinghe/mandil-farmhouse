"use client";

// ─── GallerySection ───────────────────────────────────────────────────────────
// Fetches all image objects from the Supabase "images-b" storage bucket and
// renders them in a masonry-style grid with a lightbox viewer.
//
// Image URL format:
//   https://<project>.supabase.co/storage/v1/object/public/images-b/<path>
//
// The bucket must be set to PUBLIC in Supabase → Storage → images-b → Settings.
// ─────────────────────────────────────────────────────────────────────────────

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { HiSparkles } from "react-icons/hi";
import { FaExpand, FaTimes, FaChevronLeft, FaChevronRight, FaImages } from "react-icons/fa";
import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";

// ── Constants ─────────────────────────────────────────────────────────────────

const BUCKET_NAME = "images-b";

/** Max images to display — keeps the grid performant */
const MAX_GALLERY_IMAGES = 12;

// ── Types ─────────────────────────────────────────────────────────────────────

interface GalleryImage {
  /** Public CDN URL */
  url: string;
  /** Filename used as alt text fallback */
  name: string;
  /** Grid span class for masonry effect — assigned by position */
  span: string;
}

// ── Span pattern for the masonry grid (repeats for all images) ────────────────
// Positions 0, 5, 10, … get a large 2×2 hero tile; all others get 1×1.
const SPAN_PATTERN: string[] = [
  "col-span-2 row-span-2", // 0 — hero
  "col-span-1 row-span-1", // 1
  "col-span-1 row-span-1", // 2
  "col-span-1 row-span-1", // 3
  "col-span-1 row-span-1", // 4
];

function getSpan(index: number): string {
  return SPAN_PATTERN[index % SPAN_PATTERN.length] ?? "col-span-1 row-span-1";
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Convert a storage file name to a human-readable alt text */
function nameToAlt(name: string): string {
  return name
    .replace(/\.[^/.]+$/, "") // strip extension
    .replace(/[-_]/g, " ")   // replace dashes/underscores with spaces
    .replace(/\b\w/g, (c) => c.toUpperCase()); // Title Case
}

// ── Skeleton loader ───────────────────────────────────────────────────────────

function GallerySkeleton() {
  return (
    <div className="w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 auto-rows-[180px]">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className={`rounded-2xl bg-white/5 animate-pulse ${getSpan(i)}`}
        />
      ))}
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function GallerySection() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // ── Fetch images from Supabase storage ─────────────────────────────────────

  useEffect(() => {
    async function fetchGalleryImages() {
      try {
        const supabase = createClient();

        const { data, error: storageError } = await supabase.storage
          .from(BUCKET_NAME)
          .list("", {
            limit: MAX_GALLERY_IMAGES,
            offset: 0,
            sortBy: { column: "created_at", order: "desc" },
          });

        if (storageError) {
          throw new Error(storageError.message);
        }

        if (!data || data.length === 0) {
          setImages([]);
          return;
        }

        // Filter to image file types only
        const imageFiles = data.filter((file) =>
          /\.(jpg|jpeg|png|webp|avif|gif)$/i.test(file.name)
        );

        // Build public CDN URLs
        const galleryImages: GalleryImage[] = imageFiles.map((file, index) => {
          const { data: urlData } = supabase.storage
            .from(BUCKET_NAME)
            .getPublicUrl(file.name);

          return {
            url: urlData.publicUrl,
            name: file.name,
            span: getSpan(index),
          };
        });

        setImages(galleryImages);
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to load gallery images.";
        console.error("[GallerySection] Supabase storage error:", err);
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    fetchGalleryImages();
  }, []);

  // ── Lightbox keyboard navigation ────────────────────────────────────────────

  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index);
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxIndex(null);
  }, []);

  const goNext = useCallback(() => {
    setLightboxIndex((prev) =>
      prev === null ? 0 : (prev + 1) % images.length
    );
  }, [images.length]);

  const goPrev = useCallback(() => {
    setLightboxIndex((prev) =>
      prev === null ? 0 : (prev - 1 + images.length) % images.length
    );
  }, [images.length]);

  useEffect(() => {
    if (lightboxIndex === null) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [lightboxIndex, closeLightbox, goNext, goPrev]);

  // ── Render ──────────────────────────────────────────────────────────────────

  const activeLightboxImage =
    lightboxIndex !== null ? images[lightboxIndex] : null;

  return (
    <section
      id="gallery"
      className="w-full flex flex-col items-center py-20 md:py-28 px-4 sm:px-6 lg:px-8 bg-[#0a1628] relative overflow-hidden"
    >
      {/* Top accent rule */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-teal-500/30 to-transparent" />

      {/* ── Content boundary ─────────────────────────────────────────────── */}
      <div className="relative w-full max-w-6xl mx-auto flex flex-col items-center">

        {/* ── Section header ───────────────────────────────────────────────── */}
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

        {/* ── Loading skeleton ─────────────────────────────────────────────── */}
        {loading && <GallerySkeleton />}

        {/* ── Error state ──────────────────────────────────────────────────── */}
        {!loading && error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-3 py-16 text-center"
          >
            <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <FaImages className="text-red-400 text-lg" />
            </div>
            <p className="text-slate-400 text-sm max-w-xs">
              Could not load gallery images. Please try again later.
            </p>
          </motion.div>
        )}

        {/* ── Empty bucket state ───────────────────────────────────────────── */}
        {!loading && !error && images.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-3 py-16 text-center"
          >
            <div className="w-12 h-12 rounded-xl bg-slate-700/50 border border-slate-600/30 flex items-center justify-center">
              <FaImages className="text-slate-500 text-lg" />
            </div>
            <p className="text-slate-500 text-sm">
              No gallery images yet. Upload photos to the{" "}
              <code className="text-emerald-400 font-mono text-xs">images-b</code>{" "}
              bucket in Supabase.
            </p>
          </motion.div>
        )}

        {/* ── Photo grid ───────────────────────────────────────────────────── */}
        {!loading && !error && images.length > 0 && (
          <div className="w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 auto-rows-[180px]">
            {images.map((image, i) => (
              <motion.div
                key={image.url}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className={`relative rounded-2xl overflow-hidden cursor-pointer group ${image.span}`}
                onClick={() => openLightbox(i)}
                role="button"
                tabIndex={0}
                aria-label={`View ${nameToAlt(image.name)}`}
                onKeyDown={(e) => e.key === "Enter" && openLightbox(i)}
              >
                <Image
                  src={image.url}
                  alt={nameToAlt(image.name)}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-[#0a1628]/0 group-hover:bg-[#0a1628]/40 transition-all duration-300" />
                {/* Expand icon */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <div className="w-10 h-10 rounded-full glass border border-white/30 flex items-center justify-center">
                    <FaExpand className="text-white text-sm" />
                  </div>
                </div>
                {/* Image counter badge for hero tile */}
                {i === 0 && images.length > 1 && (
                  <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-black/50 backdrop-blur-sm text-white text-xs font-semibold">
                    {images.length} photos
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* ── Lightbox ─────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {activeLightboxImage && lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/92 backdrop-blur-sm p-4"
            onClick={closeLightbox}
            aria-label="Gallery lightbox"
            role="dialog"
            aria-modal="true"
          >
            {/* Lightbox image */}
            <motion.div
              key={lightboxIndex}
              initial={{ opacity: 0, scale: 0.88 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="relative max-w-5xl w-full max-h-[85vh] aspect-video rounded-2xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={activeLightboxImage.url}
                alt={nameToAlt(activeLightboxImage.name)}
                fill
                className="object-contain"
                sizes="90vw"
                priority
              />
            </motion.div>

            {/* Close button */}
            <button
              onClick={closeLightbox}
              aria-label="Close gallery lightbox"
              className="absolute top-5 right-5 w-10 h-10 rounded-full glass border border-white/20 flex items-center justify-center text-white hover:bg-white/10 transition-colors z-10"
            >
              <FaTimes className="text-sm" />
            </button>

            {/* Prev button */}
            {images.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); goPrev(); }}
                aria-label="Previous image"
                className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full glass border border-white/20 flex items-center justify-center text-white hover:bg-white/10 transition-colors z-10"
              >
                <FaChevronLeft className="text-sm" />
              </button>
            )}

            {/* Next button */}
            {images.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); goNext(); }}
                aria-label="Next image"
                className="absolute right-16 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full glass border border-white/20 flex items-center justify-center text-white hover:bg-white/10 transition-colors z-10"
              >
                <FaChevronRight className="text-sm" />
              </button>
            )}

            {/* Image counter */}
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-sm text-white text-xs font-semibold">
              {lightboxIndex + 1} / {images.length}
            </div>

            {/* Filename caption */}
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 text-slate-400 text-xs max-w-xs text-center truncate">
              {nameToAlt(activeLightboxImage.name)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
