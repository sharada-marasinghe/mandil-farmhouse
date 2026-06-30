"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  FiCalendar, 
  FiUsers, 
  FiPhone, 
  FiMail, 
  FiUser, 
  FiCheckCircle, 
  FiAlertTriangle, 
  FiChevronDown, 
  FiMenu, 
  FiX, 
  FiInfo, 
  FiStar, 
  FiArrowRight,
  FiHelpCircle,
  FiAnchor,
  FiMaximize2,
  FiChevronLeft,
  FiChevronRight,
  FiImage,
  FiClock,
  FiMapPin,
  FiInstagram,
  FiFacebook,
  FiArrowUp
} from "react-icons/fi";
import { HiSparkles, HiOutlineSparkles } from "react-icons/hi";
import { createClient } from "@/utils/supabase/client";

// ─── Types and Interfaces ───────────────────────────────────────────────────
interface Package {
  id: string;
  name: string;
  basePrice: number;
  pricingModel: string;
  description?: string | null;
  isActive: boolean;
}

interface GalleryImage {
  url: string;
  name: string;
  span: string;
}

// ─── Data Arrays ─────────────────────────────────────────────────────────────
const DEFAULT_PACKAGES: Package[] = [
  {
    id: "boat-safari-1h",
    name: "Boat Safari — 1 Hour",
    basePrice: 8500,
    pricingModel: "PER_BOAT",
    description: "Explore Bolgoda Lake on a guided 1-hour boat tour.",
    isActive: true
  },
  {
    id: "boat-safari-2h",
    name: "Boat Safari — 2 Hours",
    basePrice: 15000,
    pricingModel: "PER_BOAT",
    description: "Detailed exploration of Bolgoda Lake with bird watching.",
    isActive: true
  },
  {
    id: "boat-safari-sunset",
    name: "Sunset Safari Charter (3h)",
    basePrice: 22000,
    pricingModel: "PER_BOAT",
    description: "Beautiful sunset cruise on the lake with refreshments.",
    isActive: true
  },
  {
    id: "family-adult",
    name: "Family Day-Out (Adults only)",
    basePrice: 3500,
    pricingModel: "PER_PERSON",
    description: "Day use of the villa facilities with buffet lunch included.",
    isActive: true
  },
  {
    id: "family-mixed",
    name: "Family Day-Out (Mixed ages)",
    basePrice: 0,
    pricingModel: "CUSTOM",
    description: "Custom day-out package tailored for all age groups.",
    isActive: true
  }
];

const MARKETING_PACKAGES = [
  {
    id: "boat-safari",
    tag: "Premium Safari",
    image: "/boat-safari.png",
    imageAlt: "Luxury pontoon boat gliding on Bolgoda Lake at sunset",
    title: "Exclusive Bolgoda Boat Safari",
    description: "Glide across the peaceful waters of Bolgoda Lake on a premium private pontoon. Experience stunning views, spot local wildlife, and capture the perfect sunset.",
    duration: "2 Hours",
    capacity: "Up to 12 Guests",
    price: "Rs. 15,000 / Group",
  },
  {
    id: "family-package",
    tag: "All-Inclusive",
    image: "/family-package.png",
    imageAlt: "Family enjoying lakeside farmhouse retreat with traditional Sri Lankan buffet",
    title: "Ultimate Family Day-Out",
    description: "Spend a relaxing day by the lakeside. Package includes full-day access to our private pool, outdoor lawn games, a scenic boat ride, and a traditional buffet lunch.",
    duration: "8 Hours",
    capacity: "Min 5 - Max 20 Guests",
    price: "Rs. 3,500 / Person",
  },
  {
    id: "sunset-canopy",
    tag: "Luxury Setup",
    image: "/sunset-canopy.png",
    imageAlt: "Intimate lakeside picnic canopy dining setup during sunset golden hour",
    title: "Lakeside Sunset Canopy",
    description: "An intimate, beautifully styled lakeside canopy setup. Perfect for romantic high tea, anniversaries, or private celebrations with scenic sunset views.",
    duration: "3 Hours",
    capacity: "2 - 6 Guests",
    price: "Rs. 12,500 / Group",
  },
];

const TESTIMONIALS = [
  {
    id: 1,
    initials: "PR",
    name: "Priya & Rohan",
    location: "Colombo",
    package: "Sunset Boat Safari",
    text: "Absolutely magical! The sunset boat safari was the highlight of our anniversary weekend. The crew was professional, the pontoon was immaculate, and the views were beyond words. Mandil Farmhouse is a hidden gem.",
    rating: 5
  },
  {
    id: 2,
    initials: "WF",
    name: "The Wijesooriya Family",
    location: "Kandy",
    package: "Family Day-Out Package",
    text: "We came as a family of 12 for our annual outing. The buffet was incredible — so much authentic Sri Lankan food. Kids loved the pool and the short boat ride was the perfect surprise. Highly recommend!",
    rating: 5
  },
  {
    id: 3,
    initials: "AS",
    name: "Alex & Sarah",
    location: "Australia",
    package: "2-Hour Boat Safari",
    text: "We were visiting Sri Lanka and stumbled upon Mandil Farmhouse. Best decision ever! The lake scenery is stunning, the welcome drink refreshing, and the staff made us feel like royalty. Will be back!",
    rating: 5
  }
];

const STATS = [
  { value: "500+", label: "Happy Guests" },
  { value: "4.9★", label: "Google Rating" },
  { value: "3+", label: "Years of Excellence" },
  { value: "100%", label: "Satisfaction Rate" },
];

const POLICIES = [
  "Instant booking confirmation",
  "Free cancellation up to 24 hours before your visit",
  "No hidden booking charges or credit card fees",
  "Special group discount rates for 15+ guests"
];

const SPAN_PATTERN = [
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

export default function LakesideGuestLayout() {
  // ─── State Management ──────────────────────────────────────────────────────
  const [packages, setPackages] = useState<Package[]>(DEFAULT_PACKAGES);
  const [hasGalleryImages, setHasGalleryImages] = useState<boolean | null>(null);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [galleryLoading, setGalleryLoading] = useState<boolean>(true);
  const [galleryError, setGalleryError] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Form State
  const [selectedPackageId, setSelectedPackageId] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [numberOfGuests, setNumberOfGuests] = useState(1);
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  
  // Submit & Loading State
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [createdBooking, setCreatedBooking] = useState<any | null>(null);

  // ─── Scroll Effects & Data Fetching ────────────────────────────────────────
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Fetch active packages from backend
    async function fetchPackages() {
      try {
        const res = await fetch("/api/packages");
        const data = await res.json();
        if (data.success && data.packages && data.packages.length > 0) {
          setPackages(data.packages);
        }
      } catch (err) {
        console.warn("Could not fetch active packages from DB, using fallback defaults.");
      }
    }

    // Verify Supabase bucket status and fetch gallery images
    async function fetchGalleryImages() {
      try {
        const supabase = createClient();
        const { data, error: storageError } = await supabase.storage
          .from("images-b")
          .list("", {
            limit: 12,
            offset: 0,
            sortBy: { column: "created_at", order: "desc" },
          });

        if (storageError) {
          throw storageError;
        }

        if (!data || data.length === 0) {
          setHasGalleryImages(false);
          setGalleryImages([]);
          setGalleryLoading(false);
          return;
        }

        const imageFiles = data.filter((file) =>
          /\.(jpg|jpeg|png|webp|avif|gif)$/i.test(file.name)
        );

        if (imageFiles.length === 0) {
          setHasGalleryImages(false);
          setGalleryImages([]);
          setGalleryLoading(false);
          return;
        }

        setHasGalleryImages(true);

        const imagesWithUrls: GalleryImage[] = imageFiles.map((file, index) => {
          const { data: urlData } = supabase.storage
            .from("images-b")
            .getPublicUrl(file.name);

          return {
            url: urlData.publicUrl,
            name: file.name,
            span: getSpan(index),
          };
        });

        setGalleryImages(imagesWithUrls);
      } catch (err) {
        console.warn("Could not fetch gallery images from Supabase storage:", err);
        setHasGalleryImages(false);
        setGalleryError("Failed to load gallery images.");
      } finally {
        setGalleryLoading(false);
      }
    }

    fetchPackages();
    fetchGalleryImages();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Set default package when packages list is loaded
  useEffect(() => {
    if (packages.length > 0 && !selectedPackageId) {
      setSelectedPackageId(packages[0].id);
    }
  }, [packages, selectedPackageId]);

  // Keyboard navigation for lightbox
  const goNext = useCallback(() => {
    setLightboxIndex((prev) =>
      prev === null ? 0 : (prev + 1) % galleryImages.length
    );
  }, [galleryImages.length]);

  const goPrev = useCallback(() => {
    setLightboxIndex((prev) =>
      prev === null ? 0 : (prev - 1 + galleryImages.length) % galleryImages.length
    );
  }, [galleryImages.length]);

  const closeLightbox = useCallback(() => {
    setLightboxIndex(null);
  }, []);

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

  // Scroll to layout sections
  const handleNavClick = (href: string) => {
    setMobileMenuOpen(false);
    if (href.startsWith("#")) {
      const el = document.querySelector(href);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Get active package details
  const activePackage = packages.find(p => p.id === selectedPackageId);

  // Calculate pricing breakdown
  const calculateTotal = () => {
    if (!activePackage) return { amount: 0, text: "LKR 0" };
    
    if (activePackage.pricingModel === "PER_BOAT") {
      return { 
        amount: activePackage.basePrice, 
        text: `LKR ${activePackage.basePrice.toLocaleString("en-US")}` 
      };
    }
    
    if (activePackage.pricingModel === "PER_PERSON") {
      const total = activePackage.basePrice * numberOfGuests;
      return { 
        amount: total, 
        text: `LKR ${total.toLocaleString("en-US")}` 
      };
    }
    
    return { amount: 0, text: "Custom Quote (Admin will confirm)" };
  };

  const totalPriceObj = calculateTotal();

  // Form Submission
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPackageId || !bookingDate || !guestName.trim() || !guestPhone.trim()) {
      setSubmitError("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const payload = {
        guestName: guestName.trim(),
        guestPhone: guestPhone.trim(),
        guestEmail: guestEmail.trim() || undefined,
        bookingDate,
        numberOfGuests,
        packageId: selectedPackageId
      };

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Failed to create booking request.");
      }

      if (result.success && result.booking) {
        setCreatedBooking(result.booking);
      } else {
        throw new Error("Invalid response from server.");
      }
    } catch (err: any) {
      setSubmitError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
  };

  const activeLightboxImage = lightboxIndex !== null ? galleryImages[lightboxIndex] : null;
  const currentYear = new Date().getFullYear();

  return (
    <div className="w-full min-h-screen bg-white text-slate-900 flex flex-col items-center overflow-x-hidden">
      
      {/* ─── 1. Navbar ──────────────────────────────────────────────────────── */}
      <div className="w-full sticky top-0 z-50 flex flex-col">
        <nav className={`w-full bg-white border-b border-slate-100 h-16 flex items-center transition-shadow ${
          scrolled ? "shadow-sm" : ""
        }`}>
          <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-full">
            {/* Logo */}
            <Link
              href="/"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="flex items-center gap-2 group cursor-pointer flex-shrink-0"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold shadow-sm transition-transform duration-200 group-hover:scale-105">
                M
              </div>
              <div>
                <span className="font-semibold text-slate-900 text-base leading-none block">
                  Mandil
                </span>
                <span className="block text-[9px] font-bold tracking-widest text-emerald-600 uppercase leading-none mt-0.5">
                  Farmhouse
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-6">
              <button
                onClick={() => handleNavClick("#packages")}
                className="text-sm font-medium text-slate-500 hover:text-emerald-600 transition-colors cursor-pointer"
              >
                Packages
              </button>
              <button
                onClick={() => handleNavClick("#gallery")}
                className="text-sm font-medium text-slate-500 hover:text-emerald-600 transition-colors cursor-pointer"
              >
                Gallery
              </button>
              <button
                onClick={() => handleNavClick("#testimonials")}
                className="text-sm font-medium text-slate-500 hover:text-emerald-600 transition-colors cursor-pointer"
              >
                Reviews
              </button>
              <Link
                href="/track-booking"
                className="text-sm font-medium text-slate-500 hover:text-emerald-600 transition-colors"
              >
                Track Booking
              </Link>
              <button
                onClick={() => handleNavClick("#contact")}
                className="text-sm font-medium text-slate-500 hover:text-emerald-600 transition-colors cursor-pointer"
              >
                Contact
              </button>
            </div>

            {/* Desktop CTA Button */}
            <div className="hidden md:flex items-center gap-4">
              <button
                onClick={() => handleNavClick("#booking")}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors shadow-sm cursor-pointer"
              >
                Book Now
              </button>
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-slate-50 transition-colors"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
            </button>
          </div>
        </nav>

        {/* Mobile Drawer Overlay */}
        {mobileMenuOpen && (
          <div 
            className="fixed inset-0 top-16 bg-slate-900/20 backdrop-blur-xs z-40 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Mobile Menu Drawer */}
        <div className={`fixed top-16 right-0 bottom-0 w-64 bg-white border-l border-slate-100 shadow-xl z-40 md:hidden transition-transform duration-300 ${
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}>
          <div className="flex flex-col gap-1 p-6">
            <button
              onClick={() => handleNavClick("#packages")}
              className="text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:text-emerald-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Packages
            </button>
            <button
              onClick={() => handleNavClick("#gallery")}
              className="text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:text-emerald-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Gallery
            </button>
            <button
              onClick={() => handleNavClick("#testimonials")}
              className="text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:text-emerald-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Reviews
            </button>
            <Link
              href="/track-booking"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:text-emerald-600 hover:bg-slate-50 block transition-colors"
            >
              Track Booking
            </Link>
            <button
              onClick={() => handleNavClick("#contact")}
              className="text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:text-emerald-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Contact
            </button>
            <div className="mt-4 pt-4 border-t border-slate-100">
              <button
                onClick={() => handleNavClick("#booking")}
                className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold text-center block transition-colors shadow-sm cursor-pointer"
              >
                Book Now
              </button>
            </div>
          </div>
        </div>

        {/* Warning/Alert Banner */}
        {hasGalleryImages === false && (
          <div className="w-full bg-amber-50 text-amber-800 py-3 px-4 text-center text-sm border-b border-amber-200 flex justify-center items-center">
            <div className="flex items-center justify-center gap-2">
              <FiAlertTriangle className="text-amber-600 flex-shrink-0" size={16} />
              <span>
                No gallery images yet. Upload photos to the <code className="bg-amber-100/60 px-1.5 py-0.5 rounded font-mono text-xs text-amber-900">images-b</code> bucket in Supabase.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ─── 2. Hero Section ────────────────────────────────────────────────── */}
      <section className="w-full py-16 md:py-24 flex flex-col items-center justify-center bg-white relative overflow-hidden min-h-[600px] md:min-h-[70vh]">
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

        {/* Light Gradient Overlay */}
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-white/95 via-white/80 to-white/95" />

        {/* Inner Content */}
        <div className="w-full max-w-6xl mx-auto px-4 md:px-6 flex flex-col items-center text-center relative z-20">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-semibold tracking-wide mb-6">
            <HiOutlineSparkles className="text-emerald-600" size={14} />
            <span>Sri Lanka&apos;s Premier Lakeside Escape</span>
          </div>

          {/* Main Headline */}
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.15] text-slate-900 mb-6 max-w-3xl">
            Escape to Bolgoda&apos;s <span className="text-emerald-700 font-extrabold">Finest</span> Lakeside Retreat
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-600 font-normal max-w-2xl mb-8 leading-relaxed">
            Discover <span className="text-emerald-700 font-semibold">Mandil Farmhouse</span> — where tropical serenity meets luxury boat safaris, traditional feasts, and unforgettable family moments on Bolgoda Lake.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
            <button
              onClick={() => handleNavClick("#packages")}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-colors shadow-sm cursor-pointer"
            >
              <FiAnchor size={16} />
              <span>Explore Safaris</span>
            </button>

            <button
              onClick={() => handleNavClick("#booking")}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-sm transition-colors cursor-pointer"
            >
              <FiCalendar size={16} />
              <span>Check Availability</span>
            </button>
          </div>
        </div>
      </section>

      {/* ─── 3. Packages Section ────────────────────────────────────────────── */}
      <section id="packages" className="w-full py-16 md:py-24 flex flex-col items-center justify-center bg-slate-50 border-b border-slate-200">
        <div className="w-full max-w-6xl mx-auto px-4 md:px-6 flex flex-col items-center text-center">
          
          {/* Section Header */}
          <div className="w-full max-w-3xl mx-auto flex flex-col items-center text-center justify-center mb-12">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/50 text-emerald-800 text-xs font-semibold tracking-wider uppercase mb-4">
              <HiSparkles className="text-sm text-emerald-600" />
              Curated Lakeside Escapes
            </div>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-slate-900 mb-4 tracking-tight">
              Choose Your <span className="text-emerald-700">Perfect Getaway</span>
            </h2>
            <p className="text-slate-600 text-base sm:text-lg max-w-xl">
              Immerse yourself in the tranquility of Bolgoda Lake. Handcrafted nature experiences with luxury details.
            </p>
          </div>

          {/* Packages Grid */}
          <div className="grid w-full grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-stretch">
            {MARKETING_PACKAGES.map((pkg) => (
              <article 
                key={pkg.id} 
                className="w-full flex flex-col h-full bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden group text-left"
              >
                {/* Image Container */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
                  <Image
                    src={pkg.image}
                    alt={pkg.imageAlt}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 text-[11px] font-semibold tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200/50 rounded-full uppercase">
                      {pkg.tag}
                    </span>
                  </div>
                </div>

                {/* Content Container */}
                <div className="flex flex-col flex-1 p-6 justify-between">
                  <div>
                    <h3 className="font-display text-xl font-bold text-slate-900 leading-tight mb-2">
                      {pkg.title}
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed mb-5">
                      {pkg.description}
                    </p>
                  </div>

                  <div>
                    {/* Duration & Capacity */}
                    <div className="flex items-center gap-4 text-slate-500 text-xs font-medium mb-5 border-t border-slate-100 pt-4">
                      <div className="flex items-center gap-1.5">
                        <FiClock className="text-emerald-600 text-sm" />
                        <span>{pkg.duration}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <FiUsers className="text-emerald-600 text-sm" />
                        <span>{pkg.capacity}</span>
                      </div>
                    </div>

                    {/* Pricing Info */}
                    <div className="flex items-baseline gap-1.5 mb-4">
                      <span className="text-sm font-semibold text-slate-400">From</span>
                      <span className="text-xl font-bold text-emerald-700">{pkg.price}</span>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => handleNavClick("#booking")}
                      className="w-full py-3 px-4 font-semibold text-sm rounded-xl transition-all duration-200 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm hover:shadow-emerald-600/10 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      Book This Package
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

        </div>
      </section>

      {/* ─── 4. Gallery Section ─────────────────────────────────────────────── */}
      <section id="gallery" className="w-full py-16 md:py-24 flex flex-col items-center justify-center bg-white border-b border-slate-100">
        <div className="w-full max-w-6xl mx-auto px-4 md:px-6 flex flex-col items-center text-center">
          
          {/* Section Header */}
          <div className="w-full max-w-3xl mx-auto flex flex-col items-center text-center justify-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-semibold tracking-wider uppercase mb-4">
              <HiOutlineSparkles className="text-emerald-600" size={14} />
              Gallery
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">
              Glimpses of Paradise
            </h2>
            <p className="text-slate-500 text-sm max-w-xl">
              Every corner of Mandil Farmhouse is a frame-worthy moment waiting to be captured.
            </p>
          </div>

          {/* Loading Skeletons */}
          {galleryLoading && (
            <div className="w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 auto-rows-[180px]">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className={`rounded-2xl bg-slate-100 animate-pulse ${getSpan(i)}`}
                />
              ))}
            </div>
          )}

          {/* Error State */}
          {!galleryLoading && galleryError && (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center">
                <FiImage className="text-red-500 text-lg" />
              </div>
              <p className="text-slate-500 text-xs max-w-xs">
                Could not load gallery images. Please try again later.
              </p>
            </div>
          )}

          {/* Empty State */}
          {!galleryLoading && !galleryError && galleryImages.length === 0 && (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center">
                <FiImage className="text-slate-400 text-lg" />
              </div>
              <p className="text-slate-400 text-xs">
                No gallery images yet. Upload photos to the <code className="text-emerald-600 font-mono text-xs">images-b</code> bucket in Supabase.
              </p>
            </div>
          )}

          {/* Photo Grid */}
          {!galleryLoading && !galleryError && galleryImages.length > 0 && (
            <div className="w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 auto-rows-[180px]">
              {galleryImages.map((image, i) => (
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
                  {/* Photos count badge */}
                  {i === 0 && galleryImages.length > 1 && (
                    <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-slate-900/60 backdrop-blur-xs text-white text-[10px] font-semibold">
                      {galleryImages.length} photos
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─── 5. Testimonials Section ────────────────────────────────────────── */}
      <section id="testimonials" className="w-full py-16 md:py-24 flex flex-col items-center justify-center bg-slate-50 border-b border-slate-100">
        <div className="w-full max-w-6xl mx-auto px-4 md:px-6 flex flex-col items-center text-center">
          
          {/* Stats Row */}
          <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-6 py-8 px-6 bg-slate-50 rounded-2xl my-12 text-center">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center flex flex-col items-center justify-center">
                <div className="text-3xl font-extrabold text-emerald-600 mb-1">
                  {stat.value}
                </div>
                <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Section Header */}
          <div className="w-full max-w-3xl mx-auto flex flex-col items-center text-center justify-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight text-center">
              Stories from Our Happy Guests
            </h2>
            <p className="text-slate-500 text-sm mt-3 max-w-xl">
              Real experiences from the families and adventurers who made Mandil their favourite escape.
            </p>
          </div>

          {/* Testimonials Grid */}
          <div className="grid w-full grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-stretch">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                className="w-full flex flex-col h-full bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow p-6 text-left"
              >
                <div>
                  {/* Rating Stars */}
                  <div className="flex gap-0.5 mb-4 text-emerald-500">
                    {[...Array(t.rating)].map((_, j) => (
                      <FiStar key={j} className="fill-emerald-500" size={14} />
                    ))}
                  </div>
                  {/* Quote Text */}
                  <p className="text-slate-600 text-sm leading-relaxed mb-6 italic">
                    &ldquo;{t.text}&rdquo;
                  </p>
                </div>

                {/* User Metadata */}
                <div className="flex items-center gap-3 border-t border-slate-200/50 pt-4 mt-auto">
                  <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs uppercase flex-shrink-0">
                    {t.initials}
                  </div>
                  <div>
                    <h4 className="text-slate-900 font-semibold text-xs leading-none">
                      {t.name}
                    </h4>
                    <span className="text-slate-500 text-[10px] block mt-1 font-medium">
                      {t.location} · {t.package}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ─── 6. Booking Section ─────────────────────────────────────────────── */}
      <section id="booking" className="w-full py-16 md:py-24 flex flex-col items-center justify-center bg-white border-b border-slate-100">
        <div className="w-full max-w-6xl mx-auto px-4 md:px-6 flex flex-col items-center text-center">
          
          {/* Section Header */}
          <div className="w-full max-w-3xl mx-auto flex flex-col items-center text-center justify-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-semibold tracking-wider uppercase mb-4">
              <HiOutlineSparkles size={14} />
              Book Your Experience
            </div>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
              Reserve Your Getaway
            </h2>
            <p className="text-slate-500 text-sm mt-2">
              Secure your spot in minutes. We&apos;ll confirm within 2 hours with a personal call.
            </p>
          </div>

          {/* Form & Summary Grid */}
          <div className="w-full text-left">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-start w-full">
              
              {/* Left Column - Availability Form */}
              <div className="bg-white p-8 md:p-10 border border-slate-200 rounded-2xl shadow-sm lg:col-span-7">
                {createdBooking ? (
                  // Success State View
                  <div className="text-center py-6">
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100">
                      <FiCheckCircle size={24} />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      Reservation Request Placed!
                    </h3>
                    <p className="text-slate-500 text-xs mt-2 max-w-sm mx-auto leading-relaxed">
                      Thank you, <span className="font-semibold text-slate-800">{createdBooking.guestName}</span>. 
                      Your booking number is <span className="font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-sm">{createdBooking.bookingNumber}</span>.
                    </p>
                    
                    <div className="my-6 p-4 rounded-xl border border-slate-100 bg-slate-50 text-left text-xs space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Package:</span>
                        <span className="font-semibold text-slate-800">{createdBooking.package?.name || activePackage?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Date:</span>
                        <span className="font-semibold text-slate-800">
                          {new Date(createdBooking.bookingDate).toLocaleDateString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric"
                          })}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Guests:</span>
                        <span className="font-semibold text-slate-800">{createdBooking.numberOfGuests}</span>
                      </div>
                      <div className="flex justify-between border-t border-slate-200/60 pt-2 mt-2 font-medium">
                        <span className="text-slate-600">Total Price:</span>
                        <span className="text-emerald-600 font-bold">LKR {createdBooking.totalPrice.toLocaleString("en-US")}</span>
                      </div>
                    </div>

                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      We will call you shortly on <span className="font-medium text-slate-600">{createdBooking.guestPhone}</span> to coordinate payment details.
                    </p>

                    <button
                      onClick={() => {
                        setCreatedBooking(null);
                        setGuestName("");
                        setGuestPhone("");
                        setGuestEmail("");
                        setBookingDate("");
                        setNumberOfGuests(1);
                      }}
                      className="mt-6 w-full py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-xs transition-colors cursor-pointer"
                    >
                      Place Another Booking
                    </button>
                  </div>
                ) : (
                  // Form Fields View
                  <form onSubmit={handleFormSubmit} className="space-y-4">
                    {submitError && (
                      <div className="p-3 bg-red-50 border border-red-100 text-red-700 rounded-xl text-xs flex items-start gap-2 font-medium">
                        <FiAlertTriangle className="flex-shrink-0 mt-0.5" size={14} />
                        <span>{submitError}</span>
                      </div>
                    )}

                    {/* Date Field */}
                    <div className="space-y-1.5">
                      <label htmlFor="bookingDate" className="text-xs font-semibold text-slate-700 block">
                        Choose Your Visit Date <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                          <FiCalendar size={15} />
                        </span>
                        <input
                          id="bookingDate"
                          type="date"
                          required
                          min={new Date().toISOString().split("T")[0]}
                          value={bookingDate}
                          onChange={(e) => setBookingDate(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl text-slate-900 text-xs outline-none transition-colors"
                        />
                      </div>
                    </div>

                    {/* Package Selector */}
                    <div className="space-y-1.5">
                      <label htmlFor="packageSelect" className="text-xs font-semibold text-slate-700 block">
                        Select Package <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                          <FiInfo size={15} />
                        </span>
                        <select
                          id="packageSelect"
                          value={selectedPackageId}
                          onChange={(e) => setSelectedPackageId(e.target.value)}
                          className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl text-slate-900 text-xs outline-none transition-colors appearance-none"
                        >
                          {packages.map((pkg) => (
                            <option key={pkg.id} value={pkg.id}>
                              {pkg.name} — {pkg.pricingModel === "CUSTOM" ? "Custom quote" : `LKR ${pkg.basePrice.toLocaleString("en-US")}`}
                            </option>
                          ))}
                        </select>
                        <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 pointer-events-none">
                          <FiChevronDown size={14} />
                        </span>
                      </div>
                    </div>

                    {/* Guest Counter */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 block">
                        Number of Guests <span className="text-red-500">*</span>
                      </label>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center border border-slate-300 rounded-xl bg-white flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => setNumberOfGuests(Math.max(1, numberOfGuests - 1))}
                            className="px-3.5 py-2 text-slate-500 hover:text-emerald-600 font-bold transition-colors select-none cursor-pointer"
                          >
                            &minus;
                          </button>
                          <span className="px-3 font-semibold text-slate-800 text-xs">
                            {numberOfGuests}
                          </span>
                          <button
                            type="button"
                            onClick={() => setNumberOfGuests(Math.min(500, numberOfGuests + 1))}
                            className="px-3.5 py-2 text-slate-500 hover:text-emerald-600 font-bold transition-colors select-none cursor-pointer"
                          >
                            &#43;
                          </button>
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {activePackage?.pricingModel === "PER_BOAT" 
                            ? "(Flat-rate package. Pricing doesn't change with guests)"
                            : "(Per-person package. Pricing changes based on guest count)"}
                        </span>
                      </div>
                    </div>

                    {/* Guest Name */}
                    <div className="space-y-1.5">
                      <label htmlFor="guestName" className="text-xs font-semibold text-slate-700 block">
                        Your Full Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                          <FiUser size={15} />
                        </span>
                        <input
                          id="guestName"
                          type="text"
                          required
                          value={guestName}
                          onChange={(e) => setGuestName(e.target.value)}
                          placeholder="John Doe"
                          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl text-slate-900 text-xs outline-none transition-colors"
                        />
                      </div>
                    </div>

                    {/* Guest Phone */}
                    <div className="space-y-1.5">
                      <label htmlFor="guestPhone" className="text-xs font-semibold text-slate-700 block">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                          <FiPhone size={15} />
                        </span>
                        <input
                          id="guestPhone"
                          type="tel"
                          required
                          value={guestPhone}
                          onChange={(e) => setGuestPhone(e.target.value)}
                          placeholder="e.g. +94771234567"
                          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl text-slate-900 text-xs outline-none transition-colors"
                        />
                      </div>
                    </div>

                    {/* Guest Email */}
                    <div className="space-y-1.5">
                      <label htmlFor="guestEmail" className="text-xs font-semibold text-slate-700 block">
                        Email Address <span className="text-slate-400 font-normal">(Optional)</span>
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                          <FiMail size={15} />
                        </span>
                        <input
                          id="guestEmail"
                          type="email"
                          value={guestEmail}
                          onChange={(e) => setGuestEmail(e.target.value)}
                          placeholder="john@example.com"
                          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl text-slate-900 text-xs outline-none transition-colors"
                        />
                      </div>
                    </div>

                    <div className="text-[10px] text-slate-400 flex items-start gap-1.5 pt-1">
                      <FiHelpCircle className="flex-shrink-0 mt-0.5 text-slate-400" size={13} />
                      <span>Fields marked with asterisk (*) are required. We keep your information private.</span>
                    </div>
                  </form>
                )}
              </div>

              {/* Right Column - Booking Summary */}
              <div className="bg-white p-8 md:p-10 border border-slate-200 rounded-2xl shadow-sm lg:col-span-5 w-full flex flex-col justify-between h-full">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 border-b border-slate-100 pb-3 mb-4">
                    Booking Summary
                  </h3>

                  <div className="space-y-3.5 text-xs">
                    <div className="flex justify-between items-start">
                      <span className="text-slate-400">Selected Package:</span>
                      <span className="font-medium text-slate-900 text-right max-w-[200px]">
                        {activePackage ? activePackage.name : "None selected"}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Visit Date:</span>
                      <span className="font-medium text-slate-900">
                        {bookingDate ? new Date(bookingDate).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric"
                        }) : <span className="text-slate-300 italic">Not set</span>}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Guests Count:</span>
                      <span className="font-medium text-slate-900">
                        {numberOfGuests} guest{numberOfGuests > 1 ? "s" : ""}
                      </span>
                    </div>

                    <div className="flex justify-between items-start pt-3 border-t border-slate-100">
                      <span className="text-slate-700 font-medium">Estimated Total Price:</span>
                      <div className="text-right">
                        <span className="text-emerald-600 font-bold text-sm block">
                          {totalPriceObj.text}
                        </span>
                        {activePackage && activePackage.pricingModel === "PER_BOAT" && (
                          <span className="text-[9px] text-slate-400 italic block mt-0.5">
                            (Flat rate LKR {activePackage.basePrice.toLocaleString("en-US")} per boat)
                          </span>
                        )}
                        {activePackage && activePackage.pricingModel === "PER_PERSON" && (
                          <span className="text-[9px] text-slate-400 italic block mt-0.5">
                            (LKR {activePackage.basePrice.toLocaleString("en-US")} × {numberOfGuests} guest{numberOfGuests > 1 ? "s" : ""})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Policies Checklist */}
                  <div className="mt-8 pt-6 border-t border-slate-100">
                    <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-3.5">
                      Our Reservation Policies
                    </h4>
                    <ul className="space-y-2.5">
                      {POLICIES.map((policy, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-slate-500">
                          <FiCheckCircle className="text-emerald-500 mt-0.5 flex-shrink-0" size={13} />
                          <span>{policy}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Conversion Actions */}
                <div className="mt-8 pt-6 border-t border-slate-100 space-y-3">
                  <button
                    type="button"
                    disabled={submitting || !!createdBooking}
                    onClick={handleFormSubmit}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                  >
                    {submitting ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Confirm Reservation Request</span>
                        <FiArrowRight size={13} />
                      </>
                    )}
                  </button>

                  <p className="text-[10px] text-slate-400 text-center leading-relaxed">
                    Have urgent questions? Reach out directly via phone or messaging at <span className="font-semibold text-slate-600">+94 77 991 1825</span>.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ─── 7. Footer ──────────────────────────────────────────────────────── */}
      <footer id="contact" className="w-full py-16 md:py-24 flex flex-col items-center justify-center bg-slate-50 border-t border-slate-200/80">
        <div className="w-full max-w-6xl mx-auto px-4 md:px-6 flex flex-col items-stretch text-left">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            {/* Brand */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold shadow-sm">
                  M
                </div>
                <div>
                  <span className="font-semibold text-slate-900 text-base leading-none block">
                    Mandil
                  </span>
                  <span className="block text-[9px] font-bold tracking-widest text-emerald-600 uppercase leading-none mt-0.5">
                    Farmhouse
                  </span>
                </div>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed max-w-xs mb-6">
                Nestled on the serene shores of Bolgoda Lake, Mandil Farmhouse offers an authentic escape into nature — luxury boat safaris, traditional feasts, and memories that last a lifetime.
              </p>
              <div className="flex items-center gap-3">
                <a 
                  href="https://instagram.com" 
                  target="_blank" 
                  rel="noreferrer" 
                  aria-label="Instagram"
                  className="w-9 h-9 rounded-lg border border-slate-200 hover:border-emerald-600/30 flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:bg-slate-100 transition-colors"
                >
                  <FiInstagram className="text-sm" />
                </a>
                <a 
                  href="https://facebook.com" 
                  target="_blank" 
                  rel="noreferrer" 
                  aria-label="Facebook"
                  className="w-9 h-9 rounded-lg border border-slate-200 hover:border-emerald-600/30 flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:bg-slate-100 transition-colors"
                >
                  <FiFacebook className="text-sm" />
                </a>
              </div>
            </div>

            {/* Quick links */}
            <div>
              <h5 className="text-slate-900 font-semibold text-xs mb-4 uppercase tracking-wider">Explore</h5>
              <ul className="space-y-2.5 text-sm">
                {[
                  { label: "Boat Safaris", id: "#packages" },
                  { label: "Family Packages", id: "#packages" },
                  { label: "Gallery", id: "#gallery" },
                  { label: "Book Now", id: "#booking" },
                ].map((item) => (
                  <li key={item.label}>
                    <button
                      onClick={() => document.querySelector(item.id)?.scrollIntoView({ behavior: "smooth" })}
                      className="text-slate-500 hover:text-emerald-600 transition-colors text-left cursor-pointer"
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h5 className="text-slate-900 font-semibold text-xs mb-4 uppercase tracking-wider">Contact</h5>
              <ul className="space-y-3 text-sm">
                <li>
                  <a href="tel:+94712345678" className="flex items-start gap-2 text-slate-500 hover:text-emerald-600 transition-colors">
                    <FiPhone className="mt-0.5 text-emerald-600 flex-shrink-0 text-xs" />
                    +94 71 234 5678
                  </a>
                </li>
                <li>
                  <span className="flex items-start gap-2 text-slate-500">
                    <FiMapPin className="mt-0.5 text-emerald-600 flex-shrink-0 text-xs" />
                    Bolgoda Lake, Panadura, Western Province, Sri Lanka
                  </span>
                </li>
              </ul>
              <div className="mt-4 p-3 rounded-lg bg-emerald-50/50 border border-emerald-100">
                <p className="text-xs text-emerald-800 font-bold uppercase tracking-wider">Open Daily</p>
                <p className="text-xs text-slate-500 mt-0.5">7:00 AM – 7:00 PM</p>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-slate-200/80 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-slate-400">
              © {currentYear} Mandil Farmhouse. All rights reserved.
            </p>
            <button
              onClick={scrollToTop}
              className="text-xs text-slate-400 hover:text-emerald-600 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>Back to top</span>
              <FiArrowUp size={12} />
            </button>
          </div>

        </div>
      </footer>

      {/* ─── Lightbox Modal ─────────────────────────────────────────────────── */}
      {activeLightboxImage && lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-xs p-4"
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
        >
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

          {/* Image counter */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-white/90 border border-slate-200 text-slate-800 text-xs font-semibold shadow-sm">
            {lightboxIndex + 1} / {galleryImages.length}
          </div>
        </div>
      )}

    </div>
  );
}
