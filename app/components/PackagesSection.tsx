"use client";

import { useState, useEffect } from "react";
import { FiUsers, FiClock, FiImage } from "react-icons/fi";
import { HiSparkles } from "react-icons/hi";

interface LocalPackageMeta {
  duration: string;
  capacity: string;
  isPopular: boolean;
  images: string[];
  assets?: string[];
  activities?: string[];
}

interface Package {
  id: string;
  name: string;
  description: string | null;
  basePrice: number;
  pricingModel: string;
  isActive: boolean;
  images: string[];
}

// Default fallback packages when no popular packages exist in the database yet
const FALLBACK_POPULAR_PACKAGES = [
  {
    id: "boat-safari",
    name: "Exclusive Bolgoda Boat Safari",
    description: "Glide across the peaceful waters of Bolgoda Lake on a premium private pontoon. Experience stunning views, spot local wildlife, and capture the perfect sunset.",
    basePrice: 15000,
    pricingModel: "PER_BOAT",
    isActive: true,
    images: ["/boat-safari.png", "/family-package.png", "/sunset-canopy.png"],
    meta: {
      duration: "2 Hours",
      capacity: "Up to 12 Guests",
      isPopular: true,
      assets: ["Luxury Pontoon Boat", "JBL PartyBox Speaker"],
      activities: ["Lake Fishing Hooks & Bait", "Jet Ski Ride"]
    }
  },
  {
    id: "family-package",
    name: "Ultimate Family Day-Out",
    description: "Spend a relaxing day by the lakeside. Package includes full-day access to our private pool, outdoor lawn games, a scenic boat ride, and a traditional buffet lunch.",
    basePrice: 3500,
    pricingModel: "PER_PERSON",
    isActive: true,
    images: ["/family-package.png", "/sunset-canopy.png", "/boat-safari.png"],
    meta: {
      duration: "8 Hours",
      capacity: "Min 5 - Max 20 Guests",
      isPopular: true,
      assets: ["BBQ Machine & Charcoal Setup"],
      activities: ["Lake Fishing Hooks & Bait"]
    }
  },
  {
    id: "sunset-canopy",
    name: "Lakeside Sunset Canopy",
    description: "An intimate, beautifully styled lakeside canopy setup. Perfect for romantic high tea, anniversaries, or private celebrations with scenic sunset views.",
    basePrice: 12500,
    pricingModel: "CUSTOM",
    isActive: true,
    images: ["/sunset-canopy.png", "/boat-safari.png", "/family-package.png"],
    meta: {
      duration: "3 Hours",
      capacity: "2 - 6 Guests",
      isPopular: true,
      assets: ["JBL PartyBox Speaker", "BBQ Machine & Charcoal Setup"],
      activities: ["Lake Fishing Hooks & Bait"]
    }
  }
];

function AutoSlidingImageSlider({ images, title }: { images: string[]; title: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [images]);

  if (images.length === 0) {
    return (
      <div className="w-full h-48 relative overflow-hidden rounded-t-2xl bg-slate-100 flex flex-col items-center justify-center text-slate-400 gap-1.5 border-b border-slate-200">
        <FiImage size={24} className="text-slate-350" />
        <span className="text-[10px] font-medium tracking-wider uppercase text-slate-400">No images</span>
      </div>
    );
  }

  return (
    <div className="w-full h-48 relative overflow-hidden rounded-t-2xl bg-slate-100 border-b border-slate-200">
      <img
        src={images[currentIndex]}
        alt={`${title} - slide ${currentIndex + 1}`}
        className="w-full h-full object-cover"
      />
      {images.length > 1 && (
        <div className="absolute bottom-3 right-3 flex gap-1 z-10 bg-black/40 px-2 py-0.5 rounded-full">
          {images.map((_, idx) => (
            <div
              key={idx}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                idx === currentIndex ? "bg-white w-3.5" : "bg-white/50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function PopularPackageCard({
  pkg,
  meta
}: {
  pkg: Package;
  meta: LocalPackageMeta;
}) {
  const handleScrollToBooking = () => {
    document.querySelector("#booking")?.scrollIntoView({ behavior: "smooth" });
  };

  const images = pkg.images && pkg.images.length > 0 ? pkg.images : meta.images && meta.images.length > 0 ? meta.images : [];

  return (
    <article className="w-full flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group">
      {/* Top Slider Image Block */}
      <AutoSlidingImageSlider images={images} title={pkg.name} />

      {/* Content Section */}
      <div className="flex flex-col flex-1 p-6 justify-between gap-4">
        <div>
          {/* Header row with tags */}
          <div className="flex items-center justify-between mb-3">
            <span className="px-2.5 py-0.5 text-[9px] font-bold tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200/50 rounded-full uppercase">
              {pkg.pricingModel.replace("_", " ")}
            </span>
            <span className="px-2.5 py-0.5 text-[9px] font-bold tracking-wider text-amber-800 bg-amber-50 border border-amber-200/50 rounded-full uppercase flex items-center gap-1">
              <HiSparkles /> Popular
            </span>
          </div>

          {/* Package Title */}
          <h3 className="font-display text-lg font-extrabold text-slate-900 leading-snug mb-2 group-hover:text-emerald-700 transition-colors">
            {pkg.name}
          </h3>
          
          {/* Brief Description */}
          <p className="text-slate-600 text-xs leading-relaxed mb-4 line-clamp-3">
            {pkg.description || "No description provided."}
          </p>

          {/* Duration & Capacity */}
          <div className="flex items-center gap-4 text-slate-500 text-[11px] font-medium border-t border-slate-100 pt-3.5 mb-4">
            <div className="flex items-center gap-1.5">
              <FiClock className="text-emerald-600" />
              <span>{meta.duration || "N/A"}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <FiUsers className="text-emerald-600" />
              <span>{meta.capacity || "N/A"}</span>
            </div>
          </div>

          {/* Attached Assets & Activities Tags */}
          {((meta.assets && meta.assets.length > 0) || (meta.activities && meta.activities.length > 0)) && (
            <div className="flex flex-wrap gap-1.5 mt-3 border-t border-slate-100 pt-3">
              {meta.assets?.map((asset, i) => (
                <span key={`asset-${i}`} className="px-2 py-0.5 bg-slate-50 border border-slate-200 rounded text-[9px] font-medium text-slate-600">
                  + Includes {asset}
                </span>
              ))}
              {meta.activities?.map((activity, i) => (
                <span key={`act-${i}`} className="px-2 py-0.5 bg-slate-50 border border-slate-200 rounded text-[9px] font-medium text-slate-600">
                  + {activity}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Pricing and Action Footer */}
        <div>
          <div className="flex items-baseline gap-1 mb-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Rate</span>
            <span className="text-lg font-black text-emerald-700">LKR {pkg.basePrice.toLocaleString()}</span>
          </div>

          {/* Action Footer split buttons */}
          <div className="grid grid-cols-2 gap-3 mt-2">
            <button
              onClick={handleScrollToBooking}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold py-2.5 rounded-xl text-center cursor-pointer transition-colors"
            >
              View Details
            </button>
            <button
              onClick={handleScrollToBooking}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold py-2.5 rounded-xl text-center cursor-pointer transition-colors"
            >
              Book Now
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function PackagesSection() {
  const [popularPackages, setPopularPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/packages");
        const data = await res.json();
        
        if (data.success && data.packages) {
          // Read metadata
          let metaMap: Record<string, any> = {};
          try {
            const stored = localStorage.getItem("mandil_package_metadata");
            if (stored) {
              metaMap = JSON.parse(stored);
            }
          } catch (e) {
            console.error(e);
          }

          // Merge package fields with metadata
          const items = data.packages.map((p: any) => {
            const m = metaMap[p.id] || { duration: "N/A", capacity: "N/A", isPopular: false, images: [], assets: [], activities: [] };
            return {
              ...p,
              meta: m
            };
          });

          // Filter popular packages
          const popular = items.filter((item: any) => item.meta.isPopular);
          setPopularPackages(popular);
        }
      } catch (err) {
        console.error("Failed to load live packages:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const displayPackages = !loading && popularPackages.length > 0 ? popularPackages : FALLBACK_POPULAR_PACKAGES;

  return (
    <section
      id="packages"
      className="w-full bg-slate-50 border-b border-slate-200 py-16 md:py-24"
    >
      <div className="w-full max-w-6xl mx-auto px-4 md:px-6 flex flex-col items-center">
        
        {/* Section Header */}
        <div className="w-full max-w-3xl mx-auto flex flex-col items-center text-center justify-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/50 text-emerald-800 text-xs font-semibold tracking-wider uppercase mb-4">
            <HiSparkles className="text-sm" />
            Lakeside Popular Specials
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
            Our Most Popular <span className="text-emerald-700">Lakeside Packages</span>
          </h2>
          <p className="text-slate-500 text-sm sm:text-base max-w-xl leading-relaxed text-center">
            Discover our curated, guest-favorite nature experiences featuring premium amenities and custom boating excursions on Bolgoda Lake.
          </p>
        </div>

        {/* Dynamic Centered Popular Package Grid */}
        <div className="grid w-full grid-cols-1 md:grid-cols-3 gap-8 justify-items-stretch">
          {displayPackages.map((pkg) => (
            <PopularPackageCard key={pkg.id} pkg={pkg} meta={pkg.meta} />
          ))}
        </div>
      </div>
    </section>
  );
}
