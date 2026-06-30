"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
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
  FiChevronRight
} from "react-icons/fi";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

interface Package {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  pricingModel: string;
  isActive: boolean;
  images: string[];
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
  itinerary: { title: string; description: string }[];
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

  // Lightbox index
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
        const features = Array.isArray(raw.features) ? raw.features : [...(meta.assets || []), ...(meta.activities || [])];
        if (features.length === 0) {
          features.push("Scenic Lake Excursion", "Farmhouse Access");
        }

        const nameLower = raw.name.toLowerCase();
        const descLower = (raw.description || "").toLowerCase();
        let category = "other";

        if (nameLower.includes("safari") || nameLower.includes("boat") || descLower.includes("boat")) {
          category = "boat-safari";
        } else if (nameLower.includes("day") || nameLower.includes("family") || descLower.includes("buffet")) {
          category = "day-out";
        } else if (nameLower.includes("canopy") || nameLower.includes("sunset") || nameLower.includes("luxury")) {
          category = "premium-luxury";
        } else if (nameLower.includes("camping") || nameLower.includes("camp") || nameLower.includes("overnight")) {
          category = "camping";
        }

        // Determine inclusions, exclusions and itinerary based on category
        let inclusions: string[] = [];
        let exclusions: string[] = [];
        let itinerary: { title: string; description: string }[] = [];

        if (category === "boat-safari") {
          inclusions = [
            "Private pontoon boat charter",
            "Experienced local captain & safety guide",
            "Life jackets & safety gear",
            "Welcome drinks & fresh coconut refreshment",
            "Premium sound system access",
            "Lakeside docking & photo-ops"
          ];
          exclusions = [
            "Personal towels & swimwear",
            "Alcoholic beverages (corkage fee applies)",
            "Lunches or heavy meals (unless pre-ordered)",
            "Transportation to and from Mandil Farmhouse"
          ];
          itinerary = [
            {
              title: "Welcome & Safety Briefing",
              description: "Arrive at Mandil Farmhouse, meet your captain, and receive a short briefing on the boat's premium features and safety protocols."
            },
            {
              title: "Lakeside Pontoon Onboarding",
              description: "Board our custom pontoon boat. Cruise across the peaceful waters of Bolgoda Lake, spotting local birds and wildlife."
            },
            {
              title: "Golden Hour Sunsets",
              description: "Anchor at a scenic spot in the center of the lake to capture the breathtaking sunset views while enjoying your drinks."
            },
            {
              title: "Return & Onshore Docking",
              description: "Return to the private jetty at Mandil Farmhouse. Relax at our onshore garden deck."
            }
          ];
        } else if (category === "day-out") {
          inclusions = [
            "Full resort garden & deck access (8 Hours)",
            "Authentic Sri Lankan buffet lunch",
            "Lakeside swimming pool access",
            "Welcome tea & evening snacks",
            "Cricket ground & outdoor games access",
            "Standard boat cruise (30 minutes)"
          ];
          exclusions = [
            "Private room access (available for add-on)",
            "Corkage fee for outside beverages",
            "Personal towel rental"
          ];
          itinerary = [
            {
              title: "Arrival & Welcome Refreshment",
              description: "Arrive at 9:00 AM and enjoy our local woodapple or lime welcome juice at the garden terrace."
            },
            {
              title: "Poolside & Activities",
              description: "Swim in our private pool or engage in outdoor cricket and badminton games with your family."
            },
            {
              title: "Traditional Buffet Feast",
              description: "Savor our renowned Sri Lankan rice and curry buffet, cooked in traditional clay pots with fresh lake catches."
            },
            {
              title: "Lakeside Relaxation & Tea",
              description: "Enjoy a short boat safari around Bolgoda Lake, followed by evening tea, hoppers or snacks before departure at 5:00 PM."
            }
          ];
        } else if (category === "premium-luxury") {
          inclusions = [
            "Dedicated private lounge setup",
            "Sunset canopy dining deck access",
            "Premium multi-course custom dinner",
            "Champagne welcome bottle",
            "Personal butler service",
            "Exclusive 1-hour night boat cruise"
          ];
          exclusions = [
            "Overnight stay (available for custom quote)",
            "Tips and gratuities"
          ];
          itinerary = [
            {
              title: "VIP Reception",
              description: "Arrive at the private farmhouse entrance and get escorted to your custom lakeside canopy lounge."
            },
            {
              title: "Sunset Serenade & Cruise",
              description: "Embark on a private sunset pontoon ride with premium appetizers served on board."
            },
            {
              title: "Lakeside Candlelit Dining",
              description: "Enjoy a five-course gourmet meal prepared by our private resort chef under the canopy stars."
            },
            {
              title: "Late Night Departure",
              description: "Relax by the lakeside fireplace bonfire before checking out."
            }
          ];
        } else {
          inclusions = [
            "Scenic lake views & resort deck access",
            "Welcome drink on arrival",
            "Private security & parking space",
            "Dedicated guest support coordinator"
          ];
          exclusions = [
            "Meals & beverages (unless specified)",
            "Personal sports equipment"
          ];
          itinerary = [
            {
              title: "Check-In & Onboarding",
              description: "Meet our resort manager for a private tour of the lawns and facilities."
            },
            {
              title: "Resort Leisure",
              description: "Relax on the deck chairs, walk the manicured lakeside path, or enjoy indoor games."
            },
            {
              title: "Custom Event/Charter",
              description: "Use the space for your planned event, photography session, or private cruise."
            }
          ];
        }

        setPkg({
          ...raw,
          price,
          priceType,
          duration,
          capacity,
          image: raw.images && raw.images.length > 0 ? raw.images[0] : "/boat-safari.png",
          badge,
          features,
          inclusions,
          exclusions,
          itinerary
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

  // Construct Gallery Images
  const mainImage = pkg?.image || "/boat-safari.png";
  const galleryImages = pkg ? [mainImage, ...pkg.images.slice(1)] : [];

  const fallbackPool = [
    "/boat-safari.png",
    "/sunset-canopy.png",
    "/family-package.png",
    "/hero-bg.png"
  ];

  if (pkg) {
    while (galleryImages.length < 5) {
      const nextFallback = fallbackPool.find(img => !galleryImages.includes(img));
      if (nextFallback) {
        galleryImages.push(nextFallback);
      } else {
        galleryImages.push(fallbackPool[galleryImages.length % fallbackPool.length]);
      }
    }
  }

  // Lightbox navigation handlers
  const closeLightbox = () => setLightboxIndex(null);
  const goNext = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex + 1) % galleryImages.length);
    }
  };
  const goPrev = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex - 1 + galleryImages.length) % galleryImages.length);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
        <Navbar />
        <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-12 space-y-12">
          {/* Back button skeleton */}
          <div className="w-24 h-6 bg-slate-200 animate-pulse rounded-lg" />
          
          {/* Collage skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 h-[380px]">
            <div className="md:col-span-2 bg-slate-200 animate-pulse rounded-2xl h-full" />
            <div className="grid grid-cols-2 gap-3 h-full">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-slate-200 animate-pulse rounded-xl" />
              ))}
            </div>
          </div>

          {/* Columns skeleton */}
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
        <section className="grid grid-cols-1 md:grid-cols-12 gap-3 h-[300px] md:h-[420px] rounded-2xl overflow-hidden mb-10 shadow-xs border border-slate-200/50">
          
          {/* Main Large Image */}
          <div 
            className="md:col-span-8 relative h-full w-full cursor-pointer group overflow-hidden bg-slate-100"
            onClick={() => setLightboxIndex(0)}
          >
            <Image
              src={galleryImages[0]}
              alt={`${pkg.name} Main Image`}
              fill
              className="object-cover group-hover:scale-102 transition-transform duration-700 ease-out"
              sizes="(max-width: 768px) 100vw, 66vw"
              priority
            />
            {/* Hover visual details */}
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
                onClick={() => setLightboxIndex(i + 1)}
              >
                <Image
                  src={img}
                  alt={`${pkg.name} Gallery Image ${i + 2}`}
                  fill
                  className="object-cover group-hover:scale-103 transition-transform duration-700 ease-out"
                  sizes="16vw"
                />
                <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/20 transition-all duration-300" />
                {/* Visual count label on the last tile */}
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
        </section>

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
              
              {/* Meta details row */}
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

            {/* Description */}
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="text-lg font-bold text-slate-900 font-serif">About This Experience</h3>
              <p className="text-slate-650 text-sm leading-relaxed whitespace-pre-line">
                {pkg.description}
              </p>
            </div>

            {/* Inclusions and Exclusions split card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Inclusions */}
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

              {/* Exclusions */}
              <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2">
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
            </div>

            {/* Itinerary / Program Accordion */}
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
                        className="w-full px-4 py-3.5 flex items-center justify-between text-left cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            isOpen ? "bg-[#00966B] text-white" : "bg-slate-100 text-slate-605"
                          }`}>
                            {idx + 1}
                          </span>
                          <span className="font-semibold text-xs md:text-sm text-slate-800">{step.title}</span>
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

          </div>

          {/* RIGHT COLUMN: STICKY BOOKING CARD */}
          <div className="lg:col-span-4 lg:sticky lg:top-20 space-y-6">
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              
              {/* Price Details */}
              <div className="border-b border-slate-100 pb-5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Price</span>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-3xl font-black text-[#00966B] tracking-tight">
                    Rs. {pkg.price.toLocaleString("en-US")}
                  </span>
                  <span className="text-xs font-bold text-slate-500">
                    / {pkg.priceType}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-2 italic">
                  * Pricing is base rate, customizable for customized menus or longer rentals.
                </p>
              </div>

              {/* Package summary specs list */}
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

              {/* Book CTA Link */}
              <Link
                href={`/?package=${pkg.id}#booking`}
                className="w-full bg-[#00966B] hover:bg-[#007c58] text-white font-bold text-xs py-4 px-4 rounded-xl transition-colors shadow-sm hover:shadow-md active:scale-[0.985] text-center block"
              >
                Book This Experience Now
              </Link>

              {/* Quick note badge */}
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
              src={galleryImages[lightboxIndex]}
              alt={`${pkg.name} Enlarged Gallery Image ${lightboxIndex + 1}`}
              fill
              className="object-contain"
              sizes="90vw"
              priority
            />
          </div>

          {/* Close button */}
          <button
            onClick={closeLightbox}
            aria-label="Close image showcase lightbox"
            className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/90 border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-white transition-colors z-10 shadow-sm cursor-pointer"
          >
            <FiX className="text-sm" />
          </button>

          {/* Prev button */}
          {galleryImages.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); goPrev(); }}
              aria-label="Previous image"
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-white transition-colors z-10 shadow-sm cursor-pointer"
            >
              <FiChevronLeft className="text-sm" />
            </button>
          )}

          {/* Next button */}
          {galleryImages.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); goNext(); }}
              aria-label="Next image"
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-white transition-colors z-10 shadow-sm cursor-pointer"
            >
              <FiChevronRight className="text-sm" />
            </button>
          )}

          {/* Count Badge */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-white/90 border border-slate-200 text-slate-800 text-xs font-semibold shadow-sm">
            {lightboxIndex + 1} / {galleryImages.length}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
