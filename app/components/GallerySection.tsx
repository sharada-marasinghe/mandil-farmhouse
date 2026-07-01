"use client";

import Image from "next/image";
import { HiOutlineSparkles } from "react-icons/hi";
import { FiMaximize2, FiX, FiChevronLeft, FiChevronRight, FiImage } from "react-icons/fi";
import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";

const BUCKET_NAME = "images-b";
const MAX_GALLERY_IMAGES = 12;

interface GalleryImage {
  url: string;
  name: string;
  span: string;
}

const SPAN_PATTERN: string[] = [
  "col-span-2 row-span-2",
  "col-span-1 row-span-1",
  "col-span-1 row-span-1",
  "col-span-1 row-span-1",
  "col-span-1 row-span-1",
];

function getSpan(index: number): string {
  return SPAN_PATTERN[index % SPAN_PATTERN.length] ?? "col-span-1 row-span-1";
}

function nameToAlt(name: string): string {
  return name
    .replace(/\.[^/.]+$/, "")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function GallerySkeleton() {
  return (
    <div className="w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 auto-rows-[180px]">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className={`rounded-2xl bg-slate-100 animate-pulse ${getSpan(i)}`}
        />
      ))}
    </div>
  );
}

export default function GallerySection() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    async function fetchGalleryImages() {
      try {
        const supabase = createClient();
        const { data, error: storageError } = await supabase.storage
          .from(BUCKET_NAME)
          .list("gallery", {
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

        const imageFiles = data.filter((file) =>
          file.name !== ".emptyFolderPlaceholder" &&
          /\.(jpg|jpeg|png|webp|avif|gif)$/i.test(file.name)
        );

        const galleryImages: GalleryImage[] = imageFiles.map((file, index) => {
          const filePath = `gallery/${file.name}`;
          const { data: urlData } = supabase.storage
            .from(BUCKET_NAME)
            .getPublicUrl(filePath);

          return {
            url: urlData.publicUrl,
            name: file.name,
            span: getSpan(index),
          };
        });

        setImages(galleryImages);
      } catch (err: any) {
        const message = err.message || "Failed to load gallery images.";
        console.error("[GallerySection] Supabase storage error:", err);
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    fetchGalleryImages();
  }, []);

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

  const activeLightboxImage = lightboxIndex !== null ? images[lightboxIndex] : null;

  return (
    <section
      id="gallery"
      className="w-full bg-white border-b border-slate-100"
    >
      <div className="w-full max-w-6xl mx-auto px-4 md:px-6 py-16 flex flex-col items-center text-center">
        
        {/* Section Header */}
        <div className="w-full max-w-3xl mx-auto flex flex-col items-center text-center justify-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-semibold tracking-wider uppercase mb-4">
            <HiOutlineSparkles size={14} />
            Gallery
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">
            Glimpses of Paradise
          </h2>
          <p className="text-slate-500 text-sm max-w-xl">
            Every corner of Mandil Farmhouse is a frame-worthy moment waiting to be captured.
          </p>
        </div>

        {/* Loading skeleton */}
        {loading && <GallerySkeleton />}

        {/* Error state */}
        {!loading && error && (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center">
              <FiImage className="text-red-500 text-lg" />
            </div>
            <p className="text-slate-500 text-xs max-w-xs">
              Could not load gallery images. Please try again later.
            </p>
          </div>
        )}

        {/* Empty bucket state */}
        {!loading && !error && images.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center">
              <FiImage className="text-slate-400 text-lg" />
            </div>
            <p className="text-slate-400 text-xs">
              No gallery images yet. Upload photos to the <code className="text-emerald-600 font-mono text-xs">images-b</code> bucket in Supabase.
            </p>
          </div>
        )}

        {/* Photo grid */}
        {!loading && !error && images.length > 0 && (
          <div className="w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 auto-rows-[180px]">
            {images.map((image, i) => (
              <div
                key={image.url}
                className={`relative rounded-2xl overflow-hidden cursor-pointer group border border-slate-100 ${image.span}`}
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
                  className="object-cover group-hover:scale-102 transition-transform duration-500 ease-out"
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/20 transition-all duration-300" />
                {/* Expand icon */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <div className="w-9 h-9 rounded-full bg-white/90 border border-slate-200 flex items-center justify-center shadow-xs">
                    <FiMaximize2 className="text-slate-700 text-sm" />
                  </div>
                </div>
                {/* Image counter badge for hero tile */}
                {i === 0 && images.length > 1 && (
                  <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-slate-900/60 backdrop-blur-xs text-white text-[10px] font-semibold">
                    {images.length} photos
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {activeLightboxImage && lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-xs p-4"
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
        >
          {/* Lightbox image container */}
          <div
            className="relative max-w-5xl w-full max-h-[85vh] aspect-video rounded-xl overflow-hidden shadow-2xl"
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
          </div>

          {/* Close button */}
          <button
            onClick={closeLightbox}
            aria-label="Close gallery lightbox"
            className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/90 border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-white transition-colors z-10 shadow-sm"
          >
            <FiX className="text-sm" />
          </button>

          {/* Prev button */}
          {images.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); goPrev(); }}
              aria-label="Previous image"
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-white transition-colors z-10 shadow-sm"
            >
              <FiChevronLeft className="text-sm" />
            </button>
          )}

          {/* Next button */}
          {images.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); goNext(); }}
              aria-label="Next image"
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-white transition-colors z-10 shadow-sm"
            >
              <FiChevronRight className="text-sm" />
            </button>
          )}

          {/* Image counter */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-white/90 border border-slate-200 text-slate-800 text-xs font-semibold shadow-sm">
            {lightboxIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </section>
  );
}
