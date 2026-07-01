"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { 
  FiClock, 
  FiUsers, 
  FiMapPin, 
  FiCheckCircle, 
  FiXCircle, 
  FiChevronDown, 
  FiChevronUp, 
  FiCalendar, 
  FiInfo, 
  FiArrowLeft,
  FiMaximize2,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiImage
} from "react-icons/fi";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import "md-editor-rt/lib/preview.css";

const MdPreview = dynamic(() => import("md-editor-rt").then((mod) => mod.MdPreview), {
  ssr: false,
});

interface Package {
  id: string;
  name: string;
  description: string | null;
  basePrice: number;
  pricingModel: string;
  isActive: boolean;
  images: string[];
  whatsIncluded?: string[];
  whatsExcluded?: string[];
  timeline?: any;
  aboutMarkdown?: string | null;
}

interface MappedPackage extends Package {
  price: number;
  priceType: string;
  duration: string;
  capacity: string;
  image: string;
  badge: string;
  features: string[];
  inclusions: string[];
  exclusions: string[];
  itinerary: { title: string; description: string; time?: string }[];
  attachedAssets: any[];
  attachedActivities: any[];
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function PackageDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const [pkg, setPkg] = useState<MappedPackage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Accordion active step index
  const [activeStep, setActiveStep] = useState<number | null>(0);

  // Gallery and Lightbox images
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    async function fetchPackage() {
      try {
        const res = await fetch(`/api/packages/${id}`);
        const data = await res.json();

        if (!data.success || !data.package) {
          setError(data.error || "Package not found.");
          setLoading(false);
          return;
        }

        const raw = data.package;

        // Fetch amenities and activities from database inventory to map images and descriptions
        const inventoryRes = await fetch(`/api/admin/inventory`);
        const inventoryData = await inventoryRes.json();
        const allAmenities = inventoryData.success ? inventoryData.amenities : [];
        const allActivities = inventoryData.success ? inventoryData.activities : [];

        // Retrieve local storage metadata configured in admin dashboard
        let meta = { duration: "", capacity: "", isPopular: false, featured: false, images: [], assets: [], activities: [] };
        try {
          const stored = localStorage.getItem("mandil_package_metadata");
          if (stored) {
            const metaMap = JSON.parse(stored);
            if (metaMap[raw.id]) {
              meta = metaMap[raw.id];
            }
          }
        } catch (e) {
          console.warn("Could not retrieve package metadata from localStorage:", e);
        }

        // Standardize properties
        const price = Number(raw.basePrice || 0);
        const priceType = raw.pricingModel === "PER_PERSON" ? "Person" : "Group";
        const duration = raw.duration || meta.duration || (raw.name.toLowerCase().includes("1h") ? "1 Hour" : raw.name.toLowerCase().includes("2h") ? "2 Hours" : "3 Hours");
        const capacity = raw.capacity || meta.capacity || (raw.pricingModel === "PER_PERSON" ? "Min 2 - Max 15" : "Up to 12 Guests");
        const isPopular = !!meta.isPopular;
        const badge = isPopular ? "POPULAR ESCAPE" : "CURATED EXPERIENCE";
        
        // Map attached assets with their DB images/descriptions
        const attachedAssets = (meta.assets || []).map((name: string) => {
          const matched = allAmenities.find((a: any) => a.name === name);
          return matched ? {
            id: matched.id,
            name: matched.name,
            description: matched.description || "",
            price: matched.price,
            billingType: matched.billingType,
            images: matched.images || []
          } : { name, description: "", price: 0, billingType: "FLAT_RATE", images: [] };
        });

        // Map attached activities with their DB images/descriptions
        const attachedActivities = (meta.activities || []).map((name: string) => {
          const matched = allActivities.find((a: any) => a.name === name);
          return matched ? {
            id: matched.id,
            name: matched.name,
            description: matched.description || "",
            images: matched.images || []
          } : { name, description: "", images: [] };
        });

        const features: string[] = [...(meta.assets || []), ...(meta.activities || [])];
        if (features.length === 0) {
          features.push("Scenic Lake Excursion", "Farmhouse Access");
        }

        // Inclusions and Exclusions from actual DB columns
        const inclusions = Array.isArray(raw.whatsIncluded) && raw.whatsIncluded.length > 0
          ? raw.whatsIncluded
          : [];
        const exclusions = Array.isArray(raw.whatsExcluded) && raw.whatsExcluded.length > 0
          ? raw.whatsExcluded
          : [];

        // Itinerary from actual DB timeline json
        let itinerary: { title: string; description: string; time?: string }[] = [];
        if (raw.timeline) {
          try {
            const parsed = typeof raw.timeline === "string" ? JSON.parse(raw.timeline) : raw.timeline;
            if (Array.isArray(parsed)) {
              itinerary = parsed.map((item: any) => ({
                title: item.title || "",
                description: item.description || "",
                time: item.time || ""
              }));
            }
          } catch (e) {
            console.error("Error parsing timeline JSON:", e);
          }
        }

        // Setup collage and gallery images
        const pkgImages = raw.images && raw.images.length > 0 ? raw.images : [];
        const mainImg = pkgImages.length > 0 ? pkgImages[0] : "";
        setGalleryImages(pkgImages);

        setPkg({
          ...raw,
          price,
          priceType,
          duration,
          capacity,
          image: mainImg,
          badge,
          features,
          inclusions,
          exclusions,
          itinerary,
          attachedAssets,
          attachedActivities
        });
      } catch (err: any) {
        console.error("Failed to load package details:", err);
        setError("Error loading package details. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchPackage();
  }, [id]);

  // Lightbox navigation handlers
  const closeLightbox = () => setLightboxIndex(null);
  const goNext = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex + 1) % lightboxImages.length);
    }
  };
  const goPrev = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex - 1 + lightboxImages.length) % lightboxImages.length);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
        <Navbar />
        <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-12 space-y-12">
          <div className="w-24 h-6 bg-slate-200 animate-pulse rounded-lg" />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 h-[380px]">
            <div className="md:col-span-2 bg-slate-200 animate-pulse rounded-2xl h-full" />
            <div className="grid grid-cols-2 gap-3 h-full">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-slate-200 animate-pulse rounded-xl" />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-8 space-y-6">
              <div className="w-1/3 h-5 bg-slate-200 animate-pulse rounded" />
              <div className="w-3/4 h-10 bg-slate-200 animate-pulse rounded" />
              <div className="space-y-2">
                <div className="w-full h-4 bg-slate-200 animate-pulse rounded" />
                <div className="w-full h-4 bg-slate-200 animate-pulse rounded" />
                <div className="w-2/3 h-4 bg-slate-200 animate-pulse rounded" />
              </div>
            </div>
            <div className="lg:col-span-4">
              <div className="bg-white border border-slate-200 rounded-3xl p-6 h-64 animate-pulse" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !pkg) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center py-20 text-center px-4">
          <div className="w-16 h-16 rounded-full bg-red-50 border border-red-155 flex items-center justify-center mb-6">
            <FiInfo className="text-red-500 text-2xl" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Could Not Load Experience</h2>
          <p className="text-slate-500 text-sm mt-2 max-w-sm">
            {error || "The package details are unavailable at this moment."}
          </p>
          <Link
            href="/packages"
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-colors"
          >
            <FiArrowLeft />
            <span>Back to All Experiences</span>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const attachedAssetsCost = pkg?.attachedAssets ? pkg.attachedAssets.reduce((sum: number, am: any) => sum + Number(am.price || 0), 0) : 0;
  const netTotal = (pkg?.price || 0) + attachedAssetsCost;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        
        {/* Back Link */}
        <Link
          href="/packages"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-emerald-700 text-xs font-semibold mb-6 transition-colors group"
        >
          <FiArrowLeft className="group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to All Experiences</span>
        </Link>

        {/* ─── IMAGE SHOWCASE COLLAGE ───────────────────────────────────────── */}
        {galleryImages.length > 0 && (
          <section className="rounded-2xl overflow-hidden mb-10 shadow-xs border border-slate-200/50">
            {galleryImages.length === 1 ? (
              // 1 Image: Full width
              <div 
                className="relative h-[300px] md:h-[420px] w-full cursor-pointer group overflow-hidden bg-slate-100"
                onClick={() => {
                  setLightboxImages(galleryImages);
                  setLightboxIndex(0);
                }}
              >
                <Image
                  src={galleryImages[0]}
                  alt={`${pkg.name} Main Image`}
                  fill
                  className="object-cover group-hover:scale-102 transition-transform duration-700 ease-out"
                  sizes="100vw"
                  priority
                />
                <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/20 transition-all duration-300" />
                <div className="absolute bottom-4 left-4 w-9 h-9 rounded-full bg-white/90 border border-slate-200 flex items-center justify-center shadow-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <FiMaximize2 className="text-slate-700 text-sm" />
                </div>
              </div>
            ) : galleryImages.length === 2 ? (
              // 2 Images: 50/50 split
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 h-[300px] md:h-[420px]">
                {galleryImages.map((img, idx) => (
                  <div 
                    key={idx}
                    className="relative h-full w-full cursor-pointer group overflow-hidden bg-slate-100"
                    onClick={() => {
                      setLightboxImages(galleryImages);
                      setLightboxIndex(idx);
                    }}
                  >
                    <Image
                      src={img}
                      alt={`${pkg.name} Image ${idx + 1}`}
                      fill
                      className="object-cover group-hover:scale-102 transition-transform duration-700 ease-out"
                      sizes="50vw"
                      priority={idx === 0}
                    />
                    <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/20 transition-all duration-300" />
                    <div className="absolute bottom-4 left-4 w-9 h-9 rounded-full bg-white/90 border border-slate-200 flex items-center justify-center shadow-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <FiMaximize2 className="text-slate-700 text-sm" />
                    </div>
                  </div>
                ))}
              </div>
            ) : galleryImages.length === 3 ? (
              // 3 Images: 2/3 and two 1/3 stacked
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 h-[300px] md:h-[420px]">
                {/* Main Large Image */}
                <div 
                  className="md:col-span-8 relative h-full w-full cursor-pointer group overflow-hidden bg-slate-100"
                  onClick={() => {
                    setLightboxImages(galleryImages);
                    setLightboxIndex(0);
                  }}
                >
                  <Image
                    src={galleryImages[0]}
                    alt={`${pkg.name} Main Image`}
                    fill
                    className="object-cover group-hover:scale-102 transition-transform duration-700 ease-out"
                    sizes="(max-width: 768px) 100vw, 66vw"
                    priority
                  />
                  <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/20 transition-all duration-300" />
                  <div className="absolute bottom-4 left-4 w-9 h-9 rounded-full bg-white/90 border border-slate-200 flex items-center justify-center shadow-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <FiMaximize2 className="text-slate-700 text-sm" />
                  </div>
                </div>
                {/* Side Stack of 2 Images */}
                <div className="hidden md:grid md:col-span-4 grid-rows-2 gap-3 h-full">
                  {galleryImages.slice(1, 3).map((img, i) => (
                    <div
                      key={i}
                      className="relative h-full w-full cursor-pointer group overflow-hidden bg-slate-100"
                      onClick={() => {
                        setLightboxImages(galleryImages);
                        setLightboxIndex(i + 1);
                      }}
                    >
                      <Image
                        src={img}
                        alt={`${pkg.name} Gallery Image ${i + 2}`}
                        fill
                        className="object-cover group-hover:scale-103 transition-transform duration-700 ease-out"
                        sizes="33vw"
                      />
                      <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/20 transition-all duration-300" />
                      <div className="absolute bottom-3 right-3 w-7 h-7 rounded-full bg-white/95 border border-slate-200 flex items-center justify-center shadow-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <FiMaximize2 className="text-slate-700 text-xs" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : galleryImages.length === 4 ? (
              // 4 Images: Main (2/3 width) and 3 side images stacked (1/3 width)
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 h-[300px] md:h-[420px]">
                {/* Main Large Image */}
                <div 
                  className="md:col-span-8 relative h-full w-full cursor-pointer group overflow-hidden bg-slate-100"
                  onClick={() => {
                    setLightboxImages(galleryImages);
                    setLightboxIndex(0);
                  }}
                >
                  <Image
                    src={galleryImages[0]}
                    alt={`${pkg.name} Main Image`}
                    fill
                    className="object-cover group-hover:scale-102 transition-transform duration-700 ease-out"
                    sizes="(max-width: 768px) 100vw, 66vw"
                    priority
                  />
                  <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/20 transition-all duration-300" />
                  <div className="absolute bottom-4 left-4 w-9 h-9 rounded-full bg-white/90 border border-slate-200 flex items-center justify-center shadow-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <FiMaximize2 className="text-slate-700 text-sm" />
                  </div>
                </div>
                {/* Side Stack of 3 Images */}
                <div className="hidden md:grid md:col-span-4 grid-rows-3 gap-3 h-full">
                  {galleryImages.slice(1, 4).map((img, i) => (
                    <div
                      key={i}
                      className="relative h-full w-full cursor-pointer group overflow-hidden bg-slate-100"
                      onClick={() => {
                        setLightboxImages(galleryImages);
                        setLightboxIndex(i + 1);
                      }}
                    >
                      <Image
                        src={img}
                        alt={`${pkg.name} Gallery Image ${i + 2}`}
                        fill
                        className="object-cover group-hover:scale-103 transition-transform duration-700 ease-out"
                        sizes="33vw"
                      />
                      <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/20 transition-all duration-300" />
                      <div className="absolute bottom-3 right-3 w-7 h-7 rounded-full bg-white/95 border border-slate-200 flex items-center justify-center shadow-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <FiMaximize2 className="text-slate-700 text-xs" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              // 5+ Images: Standard 2/3 main and 2x2 side grid
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 h-[300px] md:h-[420px]">
                {/* Main Large Image */}
                <div 
                  className="md:col-span-8 relative h-full w-full cursor-pointer group overflow-hidden bg-slate-100"
                  onClick={() => {
                    setLightboxImages(galleryImages);
                    setLightboxIndex(0);
                  }}
                >
                  <Image
                    src={galleryImages[0]}
                    alt={`${pkg.name} Main Image`}
                    fill
                    className="object-cover group-hover:scale-102 transition-transform duration-700 ease-out"
                    sizes="(max-width: 768px) 100vw, 66vw"
                    priority
                  />
                  <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/20 transition-all duration-300" />
                  <div className="absolute bottom-4 left-4 w-9 h-9 rounded-full bg-white/90 border border-slate-200 flex items-center justify-center shadow-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <FiMaximize2 className="text-slate-700 text-sm" />
                  </div>
                </div>

                {/* 2x2 Grid of Smaller Images */}
                <div className="hidden md:grid md:col-span-4 grid-cols-2 gap-3 h-full">
                  {galleryImages.slice(1, 5).map((img, i) => (
                    <div
                      key={i}
                      className="relative h-full w-full cursor-pointer group overflow-hidden bg-slate-100"
                      onClick={() => {
                        setLightboxImages(galleryImages);
                        setLightboxIndex(i + 1);
                      }}
                    >
                      <Image
                        src={img}
                        alt={`${pkg.name} Gallery Image ${i + 2}`}
                        fill
                        className="object-cover group-hover:scale-103 transition-transform duration-700 ease-out"
                        sizes="16vw"
                      />
                      <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/20 transition-all duration-300" />
                      {i === 3 && galleryImages.length > 5 && (
                        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center text-white font-bold text-sm">
                          + {galleryImages.length - 5} More
                        </div>
                      )}
                      <div className="absolute bottom-3 right-3 w-7 h-7 rounded-full bg-white/95 border border-slate-200 flex items-center justify-center shadow-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <FiMaximize2 className="text-slate-700 text-xs" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* ─── CONTENT GRID (TWO COLUMNS) ───────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* LEFT COLUMN: DESCRIPTION & DETAILS */}
          <div className="lg:col-span-8 space-y-10">
            
            {/* Header / Badges */}
            <div className="space-y-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-805 text-[10px] font-bold tracking-wider uppercase">
                {pkg.badge}
              </span>
              <h1 className="font-serif text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                {pkg.name}
              </h1>
              
              <div className="flex flex-wrap items-center gap-6 pt-2 text-slate-500 text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <FiClock className="text-emerald-600 text-sm" />
                  <span>{pkg.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiUsers className="text-emerald-600 text-sm" />
                  <span>{pkg.capacity}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiMapPin className="text-emerald-600 text-sm" />
                  <span>Bolgoda Lake, Panadura</span>
                </div>
              </div>
            </div>

            {/* Description (supports Markdown) */}
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="text-lg font-bold text-slate-900 font-serif">About This Experience</h3>
              {pkg.aboutMarkdown ? (
                <div className="prose max-w-none text-xs">
                  <MdPreview
                    modelValue={pkg.aboutMarkdown}
                    language="en-US"
                    theme="light"
                    style={{ backgroundColor: "transparent", padding: 0 }}
                  />
                </div>
              ) : (
                <p className="text-slate-650 text-sm leading-relaxed whitespace-pre-line">
                  {pkg.description || "No description provided."}
                </p>
              )}
            </div>

            {/* Inclusions and Exclusions split card */}
            {(pkg.inclusions.length > 0 || pkg.exclusions.length > 0) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Inclusions */}
                {pkg.inclusions.length > 0 && (
                  <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-emerald-800 border-b border-emerald-50 pb-2">
                      What&apos;s Included
                    </h4>
                    <ul className="space-y-3">
                      {pkg.inclusions.map((item, idx) => (
                        <li key={idx} className="flex gap-2.5 items-start text-xs text-slate-600 leading-normal">
                          <FiCheckCircle className="text-emerald-600 flex-shrink-0 text-sm mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Exclusions */}
                {pkg.exclusions.length > 0 && (
                  <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-slate-805 border-b border-slate-100 pb-2">
                      What&apos;s Excluded
                    </h4>
                    <ul className="space-y-3">
                      {pkg.exclusions.map((item, idx) => (
                        <li key={idx} className="flex gap-2.5 items-start text-xs text-slate-600 leading-normal">
                          <FiXCircle className="text-slate-400 flex-shrink-0 text-sm mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Itinerary / Program Accordion */}
            {pkg.itinerary.length > 0 && (
              <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
                <h3 className="text-lg font-bold text-slate-900 font-serif">Experience Timeline</h3>
                
                <div className="space-y-3">
                  {pkg.itinerary.map((step, idx) => {
                    const isOpen = activeStep === idx;
                    return (
                      <div 
                        key={idx} 
                        className={`border rounded-xl transition-all duration-200 ${
                          isOpen ? "border-emerald-200 bg-emerald-50/20" : "border-slate-200 hover:border-slate-350"
                        }`}
                      >
                        <button
                          onClick={() => setActiveStep(isOpen ? null : idx)}
                          className="w-full px-4 py-3.5 flex items-center justify-between text-left cursor-pointer focus:outline-none"
                        >
                          <div className="flex items-center gap-3">
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                              isOpen ? "bg-[#00966B] text-white" : "bg-slate-100 text-slate-605"
                            }`}>
                              {idx + 1}
                            </span>
                            <div className="flex flex-col">
                              {step.time && (
                                <span className="text-[9px] font-bold text-emerald-800 uppercase tracking-wider">
                                  {step.time}
                                </span>
                              )}
                              <span className="font-semibold text-xs md:text-sm text-slate-800">{step.title}</span>
                            </div>
                          </div>
                          {isOpen ? <FiChevronUp className="text-slate-500" /> : <FiChevronDown className="text-slate-500" />}
                        </button>

                        {isOpen && (
                          <div className="px-4 pb-4 pl-13 border-t border-slate-100 pt-3 text-xs text-slate-500 leading-relaxed">
                            {step.description}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Attached Assets & Activities with Multiple Images Viewers */}
            {(pkg.attachedAssets.length > 0 || pkg.attachedActivities.length > 0) && (
              <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
                <h3 className="text-lg font-bold text-slate-900 font-serif">Included Resort Assets & Activities</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  
                  {/* Assets */}
                  {pkg.attachedAssets.map((asset, idx) => (
                    <div key={`asset-${idx}`} className="flex flex-col sm:flex-row gap-4 p-4 border border-slate-150 rounded-2xl bg-slate-50/50">
                      <div className="flex-shrink-0 flex flex-col items-center">
                        {asset.images && asset.images.length > 0 ? (
                          <>
                            <div 
                              className="relative w-20 h-20 rounded-xl overflow-hidden bg-slate-200 cursor-pointer group shadow-2xs border border-slate-250/30"
                              onClick={() => {
                                setLightboxImages(asset.images);
                                setLightboxIndex(0);
                              }}
                            >
                              <Image
                                src={asset.images[0]}
                                alt={asset.name}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                            {asset.images.length > 1 && (
                              <div className="flex gap-1 mt-2 max-w-[80px] overflow-x-auto py-0.5 scrollbar-thin">
                                {asset.images.map((img: string, i: number) => (
                                  <button
                                    key={i}
                                    type="button"
                                    onClick={() => {
                                      setLightboxImages(asset.images);
                                      setLightboxIndex(i);
                                    }}
                                    className="relative w-5 h-5 rounded overflow-hidden border border-slate-200 flex-shrink-0 cursor-pointer hover:border-emerald-600 transition-colors"
                                  >
                                    <Image src={img} alt={`${asset.name}-${i}`} fill className="object-cover" />
                                  </button>
                                ))}
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="w-20 h-20 rounded-xl bg-slate-100 border border-slate-200/60 flex items-center justify-center text-slate-400">
                            <FiImage className="text-xl" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[9px] font-bold text-emerald-805 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                            Resort Asset
                          </span>
                          {asset.price !== undefined && asset.price > 0 && (
                            <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                              Value: Rs. {Number(asset.price).toLocaleString()} / {asset.billingType === "PER_HOUR" ? "Hour" : asset.billingType === "PER_DAY" ? "Day" : "Flat"}
                            </span>
                          )}
                        </div>
                        <h4 className="text-xs font-bold text-slate-800 mt-1.5">{asset.name}</h4>
                        {asset.description ? (
                          <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">{asset.description}</p>
                        ) : (
                          <p className="text-[11px] text-slate-400 mt-1.5 italic">Resort asset inclusion.</p>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Activities */}
                  {pkg.attachedActivities.map((act, idx) => (
                    <div key={`act-${idx}`} className="flex flex-col sm:flex-row gap-4 p-4 border border-slate-150 rounded-2xl bg-slate-50/50">
                      <div className="flex-shrink-0 flex flex-col items-center">
                        {act.images && act.images.length > 0 ? (
                          <>
                            <div 
                              className="relative w-20 h-20 rounded-xl overflow-hidden bg-slate-200 cursor-pointer group shadow-2xs border border-slate-250/30"
                              onClick={() => {
                                setLightboxImages(act.images);
                                setLightboxIndex(0);
                              }}
                            >
                              <Image
                                src={act.images[0]}
                                alt={act.name}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                            {act.images.length > 1 && (
                              <div className="flex gap-1 mt-2 max-w-[80px] overflow-x-auto py-0.5 scrollbar-thin">
                                {act.images.map((img: string, i: number) => (
                                  <button
                                    key={i}
                                    type="button"
                                    onClick={() => {
                                      setLightboxImages(act.images);
                                      setLightboxIndex(i);
                                    }}
                                    className="relative w-5 h-5 rounded overflow-hidden border border-slate-200 flex-shrink-0 cursor-pointer hover:border-emerald-600 transition-colors"
                                  >
                                    <Image src={img} alt={`${act.name}-${i}`} fill className="object-cover" />
                                  </button>
                                ))}
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="w-20 h-20 rounded-xl bg-slate-100 border border-slate-200/60 flex items-center justify-center text-slate-400">
                            <FiImage className="text-xl" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-[9px] font-bold text-emerald-805 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Resort Activity
                        </span>
                        <h4 className="text-xs font-bold text-slate-800 mt-1.5">{act.name}</h4>
                        {act.description ? (
                          <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">{act.description}</p>
                        ) : (
                          <p className="text-[11px] text-slate-400 mt-1.5 italic">Resort activity inclusion.</p>
                        )}
                      </div>
                    </div>
                  ))}

                </div>
              </div>
            )}

          </div>

          {/* RIGHT COLUMN: STICKY BOOKING CARD */}
          <div className="lg:col-span-4 lg:sticky lg:top-20 space-y-6">
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              
              <div className="border-b border-slate-100 pb-5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Price (All Inclusive)</span>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-3xl font-black text-[#00966B] tracking-tight">
                    Rs. {netTotal.toLocaleString("en-US")}
                  </span>
                  <span className="text-xs font-bold text-slate-500">
                    / {pkg.priceType}
                  </span>
                </div>

                {attachedAssetsCost > 0 && (
                  <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-150 text-[11px] text-slate-650 space-y-1.5">
                    <span className="font-bold text-slate-700 uppercase tracking-wider text-[9px] block">Pricing Breakdown</span>
                    <div className="flex justify-between items-center">
                      <span>Base Package Rate</span>
                      <span className="font-semibold text-slate-800">Rs. {pkg.price.toLocaleString("en-US")}</span>
                    </div>
                    <div className="space-y-1 border-t border-slate-200/50 pt-1.5 mt-1.5">
                      <span className="font-semibold text-slate-400 text-[9px] block">INCLUDED ASSETS VALUE:</span>
                      {pkg.attachedAssets.map((asset: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center text-slate-600 pl-1">
                          <span className="truncate max-w-[140px]">{asset.name}</span>
                          <span className="font-mono text-xs">Rs. {Number(asset.price || 0).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between items-center border-t border-slate-200 pt-1.5 mt-1.5 font-bold text-emerald-800 text-[12px]">
                      <span>All-Inclusive Total</span>
                      <span>Rs. {netTotal.toLocaleString("en-US")}</span>
                    </div>
                  </div>
                )}
                
                <p className="text-[10px] text-slate-400 mt-3 italic leading-normal">
                  * Pricing is all-inclusive of listed assets. Customization is available on booking request.
                </p>
              </div>

              <div className="space-y-4 text-xs text-slate-650">
                <div className="flex justify-between">
                  <span className="text-slate-400">Duration</span>
                  <span className="font-semibold text-slate-800">{pkg.duration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Capacity</span>
                  <span className="font-semibold text-slate-800">{pkg.capacity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Type</span>
                  <span className="font-semibold text-slate-800">{pkg.priceType} Pricing</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Location</span>
                  <span className="font-semibold text-slate-850">Bolgoda, Panadura</span>
                </div>
              </div>

              <Link
                href={`/?package=${pkg.id}#booking`}
                className="w-full bg-[#00966B] hover:bg-[#007c58] text-white font-bold text-xs py-4 px-4 rounded-xl transition-colors shadow-sm hover:shadow-md active:scale-[0.985] text-center block"
              >
                Book This Experience Now
              </Link>

              <div className="flex items-start gap-2.5 p-3.5 bg-slate-50 rounded-xl border border-slate-200/50">
                <FiInfo className="text-emerald-600 mt-0.5 flex-shrink-0 text-sm" />
                <p className="text-[10px] text-slate-500 leading-normal">
                  Clicking book redirects to the main calendar scheduler with this package details pre-selected.
                </p>
              </div>
            </div>
          </div>

        </div>

      </main>

      {/* Lightbox Modal */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-xs p-4"
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative max-w-5xl w-full max-h-[80vh] aspect-video rounded-xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={lightboxImages[lightboxIndex]}
              alt={`Enlarged Gallery Image ${lightboxIndex + 1}`}
              fill
              className="object-contain"
              sizes="90vw"
              priority
            />
          </div>

          <button
            onClick={closeLightbox}
            aria-label="Close image showcase lightbox"
            className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/90 border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-white transition-colors z-10 shadow-sm cursor-pointer"
          >
            <FiX className="text-sm" />
          </button>

          {lightboxImages.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); goPrev(); }}
              aria-label="Previous image"
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-white transition-colors z-10 shadow-sm cursor-pointer"
            >
              <FiChevronLeft className="text-sm" />
            </button>
          )}

          {lightboxImages.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); goNext(); }}
              aria-label="Next image"
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-white transition-colors z-10 shadow-sm cursor-pointer"
            >
              <FiChevronRight className="text-sm" />
            </button>
          )}

          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-white/90 border border-slate-200 text-slate-800 text-xs font-semibold shadow-sm">
            {lightboxIndex + 1} / {lightboxImages.length}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
