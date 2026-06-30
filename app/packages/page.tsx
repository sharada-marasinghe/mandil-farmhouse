"use client";

import { useState, useEffect } from "react";
import { 
  LuClock, 
  LuUsers, 
  LuSearch, 
  LuSlidersHorizontal, 
  LuRefreshCw, 
  LuX, 
  LuCheck, 
  LuSparkles
} from "react-icons/lu";
import { FiHelpCircle } from "react-icons/fi";
import Link from "next/link";
import { motion, AnimatePresence, Variants } from "framer-motion";
import Image from "next/image";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

// Strict type-safety interface matching our unified Package layout
export interface Package {
  id: string;
  name: string;
  description: string;
  price: number;
  priceType: string; // "Group" or "Person"
  duration: string;
  capacity: string;
  image: string;
  badge: string;
  features: string[];
  isPopular: boolean;
  featured: boolean;
  category: string; // boat-safari | day-out | premium-luxury | camping | other
}

// Curated fallbacks for packages if the database has not seeded them yet
const CURATED_DEFAULT_PACKAGES: Package[] = [
  {
    id: "boat-safari-1h",
    name: "Standard Boat Safari",
    description: "Enjoy a scenic 1-hour cruise around the tranquil waters of Bolgoda Lake. A great introduction to the area's rich birdlife and natural scenery.",
    price: 8500,
    priceType: "Group",
    duration: "1 Hour",
    capacity: "Up to 8 Guests",
    image: "/boat-safari.png",
    badge: "GUIDED CRUISE",
    features: ["Standard Pontoon Boat", "Life Jackets Included", "Professional Boat Pilot"],
    isPopular: false,
    featured: false,
    category: "boat-safari"
  },
  {
    id: "boat-safari-2h",
    name: "Exclusive Bolgoda Boat Safari",
    description: "Glide across the peaceful waters of Bolgoda Lake on a premium private pontoon. Experience stunning views, spot local wildlife, and capture the perfect sunset.",
    price: 15000,
    priceType: "Group",
    duration: "2 Hours",
    capacity: "Up to 12 Guests",
    image: "/boat-safari.png",
    badge: "PREMIUM SAFARI",
    features: ["Luxury Pontoon Boat", "JBL PartyBox Speaker", "Safety Gear & Crew Included"],
    isPopular: true,
    featured: true,
    category: "boat-safari"
  },
  {
    id: "boat-safari-sunset",
    name: "Sunset Safari Charter",
    description: "A premium 3-hour private pontoon hire tailored for spectacular sunset viewing. Sit back and watch the colors transition over the peaceful lake waters.",
    price: 22000,
    priceType: "Group",
    duration: "3 Hours",
    capacity: "Up to 12 Guests",
    image: "/sunset-canopy.png",
    badge: "SUNSET SPECIAL",
    features: ["Extended Cruise Time", "Complimentary Fresh Juice", "Lakeside Sunset Views"],
    isPopular: false,
    featured: true,
    category: "premium-luxury"
  },
  {
    id: "family-adult",
    name: "Ultimate Family Day-Out",
    description: "Spend a relaxing day by the lakeside. Package includes full-day access to our private pool, outdoor lawn games, a scenic boat ride, and a traditional buffet lunch.",
    price: 3500,
    priceType: "Person",
    duration: "8 Hours",
    capacity: "Min 5 - Max 20 Guests",
    image: "/family-package.png",
    badge: "ALL-INCLUSIVE",
    features: ["Traditional Buffet Lunch", "Swimming Pool Access", "Lawn Games & Canoeing"],
    isPopular: true,
    featured: false,
    category: "day-out"
  },
  {
    id: "sunset-canopy",
    name: "Lakeside Sunset Canopy",
    description: "An intimate, beautifully styled lakeside canopy setup. Perfect for romantic high tea, anniversaries, or private celebrations with scenic sunset views.",
    price: 12500,
    priceType: "Group",
    duration: "3 Hours",
    capacity: "2 - 6 Guests",
    image: "/sunset-canopy.png",
    badge: "LUXURY SETUP",
    features: ["Bespoke Floral Setup", "Sunset Over Bolgoda", "Complimentary High Tea"],
    isPopular: false,
    featured: true,
    category: "premium-luxury"
  },
  {
    id: "overnight-camping",
    name: "Lakeside Glamping Adventure",
    description: "Sleep under the stars by the edge of Bolgoda Lake. Fully equipped premium tents, bonfire, BBQ dinner, and a refreshing morning lake safari.",
    price: 9500,
    priceType: "Person",
    duration: "Overnight",
    capacity: "2 - 10 Guests",
    image: "/sunset-canopy.png",
    badge: "ADVENTURE",
    features: ["Luxury Dome Tents", "Live Fire BBQ Dinner", "Sunrise Kayak Session"],
    isPopular: false,
    featured: false,
    category: "camping"
  }
];

// Animation Configurations
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 25 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 90, damping: 17 }
  }
};

export default function AllPackagesPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [maxPrice, setMaxPrice] = useState(30000);
  const [selectedDuration, setSelectedDuration] = useState("all");

  // Load packages
  useEffect(() => {
    async function loadPackages() {
      try {
        const res = await fetch("/api/packages");
        const data = await res.json();

        if (data.success && Array.isArray(data.packages) && data.packages.length > 0) {
          const mapped: Package[] = data.packages.map((pkg: any, idx: number) => {
            // Retrieve local storage metadata if exists
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

            const price = pkg.price !== undefined ? Number(pkg.price) : Number(pkg.basePrice || 0);
            const priceType = pkg.priceType || (pkg.pricingModel === "PER_PERSON" ? "Person" : "Group");
            const duration = pkg.duration || meta.duration || (idx === 0 ? "2 Hours" : idx === 1 ? "8 Hours" : "3 Hours");
            const capacity = pkg.capacity || meta.capacity || (idx === 0 ? "Up to 12 Guests" : idx === 1 ? "Min 5 - Max 20" : "2 - 6 Guests");
            
            let image = "/boat-safari.png";
            if (pkg.image) {
              image = pkg.image;
            } else if (pkg.images && pkg.images.length > 0) {
              image = pkg.images[0];
            } else if (meta.images && meta.images.length > 0) {
              image = meta.images[0];
            } else if (idx === 1) {
              image = "/family-package.png";
            } else if (idx === 2) {
              image = "/sunset-canopy.png";
            }

            const isPopular = pkg.isPopular !== undefined ? !!pkg.isPopular : (meta.isPopular !== undefined ? !!meta.isPopular : false);
            const featured = pkg.featured !== undefined ? !!pkg.featured : (meta.featured !== undefined ? !!meta.featured : false);
            const badge = pkg.badge || (isPopular ? "POPULAR" : "") || (idx % 3 === 0 ? "SAFARI SPECIAL" : idx % 3 === 1 ? "ALL-INCLUSIVE" : "LAKESIDE ESCAPE");

            const features = Array.isArray(pkg.features) 
              ? pkg.features 
              : [...(meta.assets || []), ...(meta.activities || [])];

            if (features.length === 0) {
              features.push("Scenic Lake Excursion", "Farmhouse Access");
            }

            // Categorize packages dynamically based on string heuristics
            let category = "other";
            const nameLower = pkg.name.toLowerCase();
            const descLower = (pkg.description || "").toLowerCase();
            
            if (nameLower.includes("safari") || nameLower.includes("boat") || descLower.includes("boat")) {
              category = "boat-safari";
            } else if (nameLower.includes("day") || nameLower.includes("family") || descLower.includes("buffet")) {
              category = "day-out";
            } else if (nameLower.includes("canopy") || nameLower.includes("sunset") || nameLower.includes("luxury")) {
              category = "premium-luxury";
            } else if (nameLower.includes("camping") || nameLower.includes("camp") || nameLower.includes("overnight")) {
              category = "camping";
            }

            return {
              id: pkg.id,
              name: pkg.name,
              description: pkg.description || "Enjoy a premium curated escape tailored for relaxation and adventure.",
              price,
              priceType,
              duration,
              capacity,
              image,
              badge,
              features,
              isPopular,
              featured,
              category
            };
          });

          setPackages(mapped);
        } else {
          setPackages(CURATED_DEFAULT_PACKAGES);
        }
      } catch (err) {
        console.error("Failed to load packages from database:", err);
        setPackages(CURATED_DEFAULT_PACKAGES);
      } finally {
        setLoading(false);
      }
    }

    loadPackages();
  }, []);

  // Filter package logic
  const filteredPackages = packages.filter((pkg) => {
    // Search Filter
    const searchMatch = 
      pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkg.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Category Filter
    const categoryMatch = selectedCategory === "all" || pkg.category === selectedCategory;

    // Price Filter
    const priceMatch = pkg.price <= maxPrice;

    // Duration Filter
    let durationMatch = true;
    if (selectedDuration !== "all") {
      const durationLower = pkg.duration.toLowerCase();
      if (selectedDuration === "short") {
        durationMatch = durationLower.includes("hour") && parseInt(durationLower) <= 3;
      } else if (selectedDuration === "full-day") {
        durationMatch = durationLower.includes("hour") && parseInt(durationLower) >= 6;
      } else if (selectedDuration === "overnight") {
        durationMatch = durationLower.includes("overnight") || durationLower.includes("day") && !durationLower.includes("hour");
      }
    }

    return searchMatch && categoryMatch && priceMatch && durationMatch;
  });

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setMaxPrice(35000);
    setSelectedDuration("all");
  };

  const handleBookClick = (pkgId: string) => {
    // Redirect to homepage booking form with selected package ID pre-filled
    window.location.href = `/?package=${pkgId}#booking`;
  };

  // Count active filters
  const activeFiltersCount = 
    (searchTerm ? 1 : 0) + 
    (selectedCategory !== "all" ? 1 : 0) + 
    (maxPrice < 35000 ? 1 : 0) + 
    (selectedDuration !== "all" ? 1 : 0);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 pb-24">
        {/* Header Hero */}
        <section className="bg-white border-b border-slate-200 py-16 md:py-20 text-center">
          <div className="max-w-4xl mx-auto px-4">
            <span className="inline-flex items-center gap-1.5 px-4.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/50 text-[#007351] text-[11px] font-bold tracking-widest uppercase mb-4 shadow-2xs">
              <LuSparkles className="text-xs text-[#00966B]" />
              LUXURY RETREAT EXPERIENCES
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight mb-5">
              Explore All <span className="text-[#00966B] italic font-serif">Experiences</span>
            </h1>
            <p className="text-slate-500 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
              Filter and find the perfect lakeside adventure tailored for you. From high-speed safaris to serene canopy sunset setups.
            </p>
          </div>
        </section>

        {/* Content & Interactive Filtering Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
          
          {/* Mobile Filter Toggle Bar */}
          <div className="md:hidden flex items-center justify-between bg-white border border-slate-200 rounded-2xl p-4 mb-6 shadow-sm">
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="flex items-center gap-2 text-slate-800 font-bold text-sm"
            >
              <LuSlidersHorizontal className="text-emerald-700" />
              <span>Filters {activeFiltersCount > 0 ? `(${activeFiltersCount})` : ""}</span>
            </button>
            {activeFiltersCount > 0 && (
              <button
                onClick={handleClearFilters}
                className="text-emerald-700 font-bold text-xs flex items-center gap-1"
              >
                <LuRefreshCw className="text-[10px]" />
                Reset
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
            
            {/* ─── Column 1: Filter Sidebar (Desktop or Collapsible Mobile) ─── */}
            <aside className={`bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-7 md:block ${
              showMobileFilters ? "block" : "hidden"
            }`}>
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <LuSlidersHorizontal className="text-slate-400" />
                  Filter Options
                </h3>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={handleClearFilters}
                    className="text-slate-450 hover:text-emerald-700 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <LuRefreshCw className="text-[10px]" />
                    Clear
                  </button>
                )}
              </div>

              {/* 1. Search Bar */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
                  Search
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                    <LuSearch size={15} />
                  </span>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search name/desc..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl text-slate-900 text-xs outline-none transition-colors"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      <LuX size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* 2. Category Filter */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
                  Category
                </label>
                <div className="flex flex-col gap-1.5">
                  {[
                    { label: "All Categories", value: "all" },
                    { label: "Boat Safaris", value: "boat-safari" },
                    { label: "Family Day-Outs", value: "day-out" },
                    { label: "Premium Luxury", value: "premium-luxury" },
                    { label: "Camping & Outdoors", value: "camping" },
                  ].map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => setSelectedCategory(cat.value)}
                      className={`text-left px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-all duration-150 ${
                        selectedCategory === cat.value
                          ? "bg-emerald-50 border border-emerald-100 text-[#007351] font-bold"
                          : "bg-transparent border border-transparent text-slate-650 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <span>{cat.label}</span>
                      {selectedCategory === cat.value && <LuCheck className="text-xs font-black" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Price Filter Slider */}
              <div className="space-y-3">
                <div className="flex justify-between items-baseline">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Max Price
                  </label>
                  <span className="text-xs font-black text-[#00966B]">
                    Rs. {maxPrice.toLocaleString()}
                  </span>
                </div>
                <input
                  type="range"
                  min="3000"
                  max="40000"
                  step="500"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#00966B]"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                  <span>Min: Rs. 3,000</span>
                  <span>Max: Rs. 40,000</span>
                </div>
              </div>

              {/* 4. Duration Filter */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
                  Duration
                </label>
                <div className="flex flex-col gap-1.5">
                  {[
                    { label: "All Durations", value: "all" },
                    { label: "Short (1-3 Hours)", value: "short" },
                    { label: "Full-Day (6-12 Hours)", value: "full-day" },
                    { label: "Overnight", value: "overnight" }
                  ].map((dur) => (
                    <button
                      key={dur.value}
                      onClick={() => setSelectedDuration(dur.value)}
                      className={`text-left px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-all duration-150 ${
                        selectedDuration === dur.value
                          ? "bg-emerald-50 border border-emerald-100 text-[#007351] font-bold"
                          : "bg-transparent border border-transparent text-slate-650 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <span>{dur.label}</span>
                      {selectedDuration === dur.value && <LuCheck className="text-xs font-black" />}
                    </button>
                  ))}
                </div>
              </div>
            </aside>

            {/* ─── Columns 2-4: Package Display Grid ─── */}
            <div className="col-span-1 md:col-span-3">
              {loading ? (
                /* Grid Loading Skeletons */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <div
                      key={n}
                      className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm flex flex-col h-full animate-pulse animate-duration-1000"
                    >
                      <div className="w-full aspect-[16/10] bg-slate-250/70" />
                      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-2">
                          <div className="h-5 bg-slate-200 rounded w-3/4" />
                          <div className="h-3.5 bg-slate-200 rounded w-full" />
                          <div className="h-3.5 bg-slate-200 rounded w-5/6" />
                        </div>
                        <div className="h-10 bg-slate-200 rounded-xl w-full" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredPackages.length === 0 ? (
                /* Empty state */
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-3xl border border-slate-255 border-dashed p-16 text-center shadow-xs flex flex-col items-center justify-center max-w-lg mx-auto mt-6"
                >
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4 text-slate-400">
                    <FiHelpCircle size={24} />
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">No Packages Found</h3>
                  <p className="text-slate-500 text-xs mt-2 leading-relaxed max-w-xs">
                    We couldn&apos;t find any excursions matching your current criteria. Try widening your price range or search terms.
                  </p>
                  <button
                    onClick={handleClearFilters}
                    className="mt-6 bg-[#00966B] hover:bg-[#007f5a] text-white font-bold text-xs py-3 px-6 rounded-xl transition-colors cursor-pointer shadow-sm"
                  >
                    Reset All Filters
                  </button>
                </motion.div>
              ) : (
                /* Card List */
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                  <AnimatePresence mode="popLayout">
                    {filteredPackages.map((pkg) => (
                      <motion.article
                        key={pkg.id}
                        layout
                        variants={cardVariants}
                        whileHover={{ y: -8, scale: 1.015 }}
                        transition={{ duration: 0.28, ease: "easeOut" }}
                        className="w-full flex flex-col bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300 group text-left h-full"
                      >
                        {/* Image Container */}
                        <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100 flex-shrink-0">
                          <Image
                            src={pkg.image}
                            alt={pkg.name}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="object-cover group-hover:scale-103 transition-transform duration-700 ease-out"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
                          
                          {/* Translucent badge */}
                          {pkg.badge && (
                            <div className="absolute top-4 left-4 z-10">
                              <span className="inline-block backdrop-blur-md bg-white/75 border border-white/40 text-[#007351] text-[10px] font-extrabold uppercase tracking-widest px-3 py-1.5 rounded-full shadow-2xs">
                                {pkg.badge}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Description Details */}
                        <div className="flex flex-col flex-1 p-6 justify-between gap-5">
                          <div className="space-y-3">
                            <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#00966B] transition-colors duration-200 leading-snug">
                              {pkg.name}
                            </h3>
                            <p className="text-xs text-gray-600 leading-relaxed line-clamp-3">
                              {pkg.description}
                            </p>

                            {/* Features list */}
                            {pkg.features && pkg.features.length > 0 && (
                              <ul className="space-y-1.5 pt-2">
                                {pkg.features.slice(0, 3).map((feat, idx) => (
                                  <li key={idx} className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                                    <span className="flex-shrink-0 w-3.5 h-3.5 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                                      <LuCheck className="text-[#00966B] text-[8px] stroke-[4]" />
                                    </span>
                                    <span className="truncate">{feat}</span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>

                          <div>
                            {/* Meta specifications */}
                            <div className="flex items-center gap-4 text-slate-500 text-[11px] font-semibold mb-5 border-t border-slate-100 pt-4">
                              <div className="flex items-center gap-1.5">
                                <LuClock className="text-slate-400" />
                                <span>{pkg.duration}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <LuUsers className="text-slate-400" />
                                <span>{pkg.capacity}</span>
                              </div>
                            </div>

                            {/* Pricing details */}
                            <div className="flex items-baseline gap-1 mb-4">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">From</span>
                              <span className="text-lg font-black text-[#00966B] ml-1">
                                Rs. {pkg.price.toLocaleString("en-US")}
                              </span>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-1">
                                / {pkg.priceType}
                              </span>
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
                  </AnimatePresence>
                </motion.div>
              )}
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
