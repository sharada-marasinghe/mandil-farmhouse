"use client";

import { useState, useEffect } from "react";
import { LuClock, LuUsers, LuSparkles, LuCheck } from "react-icons/lu";
import { motion, Variants } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

// Define strict TypeScript types for the Package interface
export interface Package {
  id: string;
  name: string;
  description: string;
  price: number;
  basePrice?: number;
  attachedAssetsCost?: number;
  priceType: string; // e.g., "Group", "Person"
  duration: string;
  capacity: string;
  image: string;
  badge: string;
  features: string[];
  isPopular: boolean;
  featured: boolean;
}


// Staggered grid item animation variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12
    }
  }
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 90,
      damping: 18
    }
  }
};

// Loading Skeleton Component to prevent layout shifts
export function PackagesSectionSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-7xl px-4">
      {[1, 2, 3].map((n) => (
        <div
          key={n}
          className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm flex flex-col h-full animate-pulse"
        >
          <div className="w-full aspect-[16/10] bg-slate-200" />
          <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
            <div className="space-y-3">
              <div className="h-6 bg-slate-250/75 rounded-md w-2/3" />
              <div className="space-y-2">
                <div className="h-3.5 bg-slate-200 rounded w-full" />
                <div className="h-3.5 bg-slate-200 rounded w-4/5" />
              </div>
            </div>
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="flex gap-4">
                <div className="h-4 bg-slate-200 rounded-md w-16" />
                <div className="h-4 bg-slate-200 rounded-md w-20" />
              </div>
              <div className="h-6 bg-slate-250/70 rounded-md w-1/3" />
              <div className="h-11 bg-slate-250 rounded-xl w-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function PackagesSection() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function loadPackages() {
      try {
        setError(false);
        const [res, inventoryRes] = await Promise.all([
          fetch("/api/packages"),
          fetch("/api/admin/inventory")
        ]);
        const data = await res.json();
        const inventoryData = await inventoryRes.json();
        const allAmenities = inventoryData.success ? inventoryData.amenities : [];

        if (data.success && Array.isArray(data.packages)) {
          // Map API models into strict Unified Package shape
          const mapped: Package[] = data.packages.map((pkg: any, idx: number) => {
            // Check metadata from local storage
            let meta = { duration: "", capacity: "", isPopular: false, featured: false, images: [], assets: [], activities: [] };
            try {
              const stored = localStorage.getItem("mandil_package_metadata");
              if (stored) {
                const metaMap = JSON.parse(stored);
                if (metaMap[pkg.id]) {
                  meta = metaMap[pkg.id];
                }
              }
            } catch (e) {
              console.warn("Could not retrieve package metadata:", e);
            }

            const basePrice = pkg.price !== undefined ? Number(pkg.price) : Number(pkg.basePrice || 0);
            
            // Find attached assets and calculate cost
            const attachedAmenities = (meta.assets || [])
              .map((name: string) => allAmenities.find((a: any) => a.name === name))
              .filter(Boolean);
            const attachedAssetsCost = attachedAmenities.reduce((sum: number, am: any) => sum + (am.price || 0), 0);
            const price = basePrice + attachedAssetsCost;

            const priceType = pkg.priceType || (pkg.pricingModel === "PER_PERSON" ? "Person" : "Group");
            const duration = pkg.duration || meta.duration || "N/A";
            const capacity = pkg.capacity || meta.capacity || "N/A";
            
            let image = "/boat-safari.png";
            if (pkg.image) {
              image = pkg.image;
            } else if (pkg.images && pkg.images.length > 0) {
              image = pkg.images[0];
            } else if (meta.images && meta.images.length > 0) {
              image = meta.images[0];
            }

            const isPopular = pkg.isPopular !== undefined ? !!pkg.isPopular : (meta.isPopular !== undefined ? !!meta.isPopular : false);
            const featured = pkg.featured !== undefined ? !!pkg.featured : (meta.featured !== undefined ? !!meta.featured : false);

            const badge = pkg.badge || (isPopular ? "POPULAR Choice" : "") || (featured ? "FEATURED" : "");
            const features = Array.isArray(pkg.features) 
              ? pkg.features 
              : [...(meta.assets || []), ...(meta.activities || [])];

            if (features.length === 0) {
              features.push("Scenic Lake Excursion", "Farmhouse Access");
            }

            return {
              id: pkg.id,
              name: pkg.name,
              description: pkg.description || "Enjoy a premium curated escape tailored for relaxation and adventure.",
              price,
              basePrice,
              attachedAssetsCost,
              priceType,
              duration,
              capacity,
              image,
              badge,
              features,
              isPopular,
              featured
            };
          });

          if (mapped.length > 0) {
            const prioritized = mapped.filter((p) => p.isPopular || p.featured);
            if (prioritized.length > 0) {
              setPackages(prioritized.slice(0, 4));
            } else {
              setPackages(mapped.slice(0, 4));
            }
          } else {
            setPackages([]);
          }
        } else {
          setError(true);
          setPackages([]);
        }
      } catch (err) {
        console.error("API fetching error:", err);
        setError(true);
        setPackages([]);
      } finally {
        setLoading(false);
      }
    }

    loadPackages();
  }, []);

  const handleBookClick = (pkgId: string) => {
    const bookingSection = document.querySelector("#booking");
    if (bookingSection) {
      bookingSection.scrollIntoView({ behavior: "smooth" });
    }

    setTimeout(() => {
      const selectEl = document.getElementById("packageSelect") as HTMLSelectElement | null;
      if (selectEl) {
        selectEl.value = pkgId;
        const changeEvent = new Event("change", { bubbles: true });
        selectEl.dispatchEvent(changeEvent);
      }
    }, 450);
  };

  if (!loading && packages.length === 0) {
    return null;
  }

  return (
    <section
      id="packages"
      className="w-full bg-slate-50 border-b border-slate-200 py-20 md:py-28"
    >
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 flex flex-col items-center">
        
        {/* Section Header */}
        <div className="w-full max-w-3xl mx-auto flex flex-col items-center text-center justify-center mb-16 md:mb-20">
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-250/50 text-[#007351] text-[11px] font-bold tracking-widest uppercase mb-4 shadow-2xs">
            <LuSparkles className="text-sm text-emerald-600" />
            CURATED LAKESIDE ESCAPES
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight mb-5">
            Choose Your <span className="text-[#00966B] italic font-serif">Perfect Getaway</span>
          </h2>
          <p className="text-slate-600 text-sm sm:text-base max-w-xl leading-relaxed">
            Immerse yourself in the tranquility of Bolgoda Lake. Handcrafted nature experiences with luxury details, premium pontoon rides, and private pools.
          </p>
          {error && (
            <p className="text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-1 text-xs mt-4">
              Database offline. Displaying local curated specials.
            </p>
          )}
        </div>

        {/* Dynamic States */}
        {loading ? (
          <PackagesSectionSkeleton />
        ) : (
          /* Staggered mount animations */
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-7xl px-2 items-stretch"
          >
            {packages.map((pkg) => (
              <motion.article
                key={pkg.id}
                variants={cardVariants}
                whileHover={{ y: -8, scale: 1.015 }}
                transition={{ duration: 0.28, ease: "easeOut" }}
                className="w-full flex flex-col bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300 group text-left h-full"
              >
                {/* Image Wrapper */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100 flex-shrink-0">
                  <Image
                    src={pkg.image}
                    alt={pkg.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-103 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
                  
                  {/* Absolute Badge top-left */}
                  {pkg.badge && (
                    <div className="absolute top-4 left-4 z-10">
                      <span className="inline-block backdrop-blur-md bg-white/75 border border-white/40 text-[#007351] text-[10px] font-extrabold uppercase tracking-widest px-3 py-1.5 rounded-full shadow-2xs">
                        {pkg.badge}
                      </span>
                    </div>
                  )}
                </div>

                {/* Content Details */}
                <div className="flex flex-col flex-1 p-6 justify-between gap-5">
                  <div className="space-y-3.5">
                    {/* Title */}
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#00966B] transition-colors duration-200 leading-snug">
                      {pkg.name}
                    </h3>
                    
                    {/* Description */}
                    <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
                      {pkg.description}
                    </p>

                    {/* Features checklist */}
                    {pkg.features && pkg.features.length > 0 && (
                      <ul className="space-y-1.5 pt-2">
                        {pkg.features.slice(0, 3).map((feat, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                            <span className="flex-shrink-0 w-4 h-4 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                              <LuCheck className="text-[#00966B] text-[10px] stroke-[3]" />
                            </span>
                            <span className="truncate">{feat}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div>
                    {/* Meta stats duration and capacity */}
                    <div className="flex items-center gap-4 text-slate-500 text-xs font-semibold mb-5 border-t border-slate-100 pt-4">
                      <div className="flex items-center gap-1.5">
                        <LuClock className="text-slate-400 text-sm" />
                        <span>{pkg.duration}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <LuUsers className="text-slate-400 text-sm" />
                        <span>{pkg.capacity}</span>
                      </div>
                    </div>

                    {/* Pricing text */}
                    <div className="flex flex-col gap-1 mb-4">
                      <div className="flex items-baseline gap-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Price</span>
                        <span className="text-xl font-black text-[#00966B] ml-1">
                          Rs. {pkg.price.toLocaleString("en-US")}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-1">
                          / {pkg.priceType}
                        </span>
                      </div>
                      {pkg.attachedAssetsCost && pkg.attachedAssetsCost > 0 ? (
                        <span className="text-[10px] text-slate-500 font-medium">
                          (Base Rs. {pkg.basePrice?.toLocaleString("en-US")} + Rs. {pkg.attachedAssetsCost.toLocaleString("en-US")} assets)
                        </span>
                      ) : null}
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2 mt-4">
                      <Link
                        href={`/packages/${pkg.id}`}
                        className="w-full border border-[#00966B] text-[#00966B] hover:bg-[#00966B]/5 font-bold text-xs py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer text-center block"
                      >
                        View Package
                      </Link>
                      <button
                        onClick={() => handleBookClick(pkg.id)}
                        className="w-full bg-[#00966B] hover:bg-[#007c58] active:bg-[#006447] text-white font-bold text-xs py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:shadow-md active:scale-[0.985]"
                      >
                        Book This Package
                      </button>
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
