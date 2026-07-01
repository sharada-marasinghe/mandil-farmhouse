"use client";

import { useState, useEffect } from "react";
import { 
  FiCalendar, 
  FiUser, 
  FiPhone, 
  FiMail, 
  FiCheckCircle, 
  FiAlertTriangle, 
  FiChevronDown, 
  FiInfo, 
  FiArrowRight,
  FiHelpCircle
} from "react-icons/fi";

interface Package {
  id: string;
  name: string;
  basePrice: number;
  pricingModel: string;
  description?: string | null;
  isActive: boolean;
}

const DEFAULT_PACKAGES: Package[] = [
  {
    id: "boat-safari-1h",
    name: "Boat Safari — 1 Hour",
    basePrice: 8500,
    pricingModel: "PER_BOAT",
    isActive: true
  },
  {
    id: "boat-safari-2h",
    name: "Boat Safari — 2 Hours",
    basePrice: 15000,
    pricingModel: "PER_BOAT",
    isActive: true
  },
  {
    id: "boat-safari-sunset",
    name: "Sunset Safari Charter (3h)",
    basePrice: 22000,
    pricingModel: "PER_BOAT",
    isActive: true
  },
  {
    id: "family-adult",
    name: "Family Day-Out (Adults only)",
    basePrice: 3500,
    pricingModel: "PER_PERSON",
    isActive: true
  },
  {
    id: "family-mixed",
    name: "Family Day-Out (Mixed ages)",
    basePrice: 0,
    pricingModel: "CUSTOM",
    isActive: true
  }
];

const POLICIES = [
  "Instant booking confirmation",
  "Free cancellation up to 24 hours before your visit",
  "No hidden booking charges or credit card fees",
  "Special group discount rates for 15+ guests"
];

export default function BookingForm() {
  const [mounted, setMounted] = useState(false);
  const [packages, setPackages] = useState<Package[]>(DEFAULT_PACKAGES);

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

  const [amenities, setAmenities] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);

    async function fetchData() {
      try {
        const [res, inventoryRes] = await Promise.all([
          fetch("/api/packages"),
          fetch("/api/admin/inventory")
        ]);
        const data = await res.json();
        const inventoryData = await inventoryRes.json();
        if (data.success && data.packages && data.packages.length > 0) {
          setPackages(data.packages);
        }
        if (inventoryData.success && inventoryData.amenities) {
          setAmenities(inventoryData.amenities);
        }
      } catch (err) {
        console.warn("Could not fetch active packages or inventory, using default fallbacks.");
      }
    }

    fetchData();
  }, []);

  // Set default package when packages are loaded, with query param pre-select support
  useEffect(() => {
    if (packages.length > 0) {
      const searchParams = new URLSearchParams(window.location.search);
      const urlPackageId = searchParams.get("package");
      if (urlPackageId && packages.some(p => p.id === urlPackageId)) {
        setSelectedPackageId(urlPackageId);
      } else if (!selectedPackageId) {
        setSelectedPackageId(packages[0].id);
      }
    }
  }, [packages, selectedPackageId]);

  // Prevent SSR hydration warnings
  if (!mounted) {
    return <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-start w-full opacity-0" />;
  }

  const activePackage = packages.find(p => p.id === selectedPackageId);

  // Find metadata for the active package to sum attached assets cost
  let attachedAssetsCost = 0;
  if (activePackage) {
    try {
      const stored = localStorage.getItem("mandil_package_metadata");
      if (stored) {
        const metaMap = JSON.parse(stored);
        const meta = metaMap[activePackage.id];
        if (meta && meta.assets) {
          const attachedAmenities = meta.assets.map((name: string) => {
            const matched = amenities.find((a: any) => a.name === name);
            return matched ? { name, price: matched.price } : { name, price: 0 };
          });
          attachedAssetsCost = attachedAmenities.reduce((sum: number, asset: any) => sum + (asset.price || 0), 0);
        }
      }
    } catch (e) {
      console.warn("Error reading package metadata in BookingForm:", e);
    }
  }

  const calculateTotal = () => {
    if (!activePackage) return { amount: 0, baseAmount: 0, assetsAmount: 0, text: "LKR 0" };
    
    if (activePackage.pricingModel === "PER_BOAT") {
      const base = activePackage.basePrice;
      const total = base + attachedAssetsCost;
      return { 
        amount: total, 
        baseAmount: base,
        assetsAmount: attachedAssetsCost,
        text: `LKR ${total.toLocaleString("en-US")}` 
      };
    }
    
    if (activePackage.pricingModel === "PER_PERSON") {
      const base = activePackage.basePrice * numberOfGuests;
      const total = base + attachedAssetsCost;
      return { 
        amount: total, 
        baseAmount: base,
        assetsAmount: attachedAssetsCost,
        text: `LKR ${total.toLocaleString("en-US")}` 
      };
    }
    
    return { amount: 0, baseAmount: 0, assetsAmount: 0, text: "Custom Quote (Admin will confirm)" };
  };

  const totalPriceObj = calculateTotal();

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
        packageId: selectedPackageId,
        totalPrice: totalPriceObj.amount > 0 ? totalPriceObj.amount : undefined
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-start w-full">
      {/* Left Column - Availability Form */}
      <div className="bg-white p-8 md:p-10 rounded-2xl border border-slate-200 shadow-sm lg:col-span-7">
        {createdBooking ? (
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
              className="mt-6 w-full py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-xs transition-colors"
            >
              Place Another Booking
            </button>
          </div>
        ) : (
          <form onSubmit={handleFormSubmit} className="space-y-6">
            {submitError && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-700 rounded-xl text-xs flex items-start gap-2 font-medium">
                <FiAlertTriangle className="flex-shrink-0 mt-0.5" size={14} />
                <span>{submitError}</span>
              </div>
            )}

            {/* Date Field */}
            <div className="space-y-2">
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
            <div className="space-y-2">
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
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 block">
                Number of Guests <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-slate-300 rounded-xl bg-white flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => setNumberOfGuests(Math.max(1, numberOfGuests - 1))}
                    className="px-3.5 py-2 text-slate-500 hover:text-emerald-600 font-bold transition-colors select-none"
                  >
                    &minus;
                  </button>
                  <span className="px-3 font-semibold text-slate-800 text-xs">
                    {numberOfGuests}
                  </span>
                  <button
                    type="button"
                    onClick={() => setNumberOfGuests(Math.min(500, numberOfGuests + 1))}
                    className="px-3.5 py-2 text-slate-500 hover:text-emerald-600 font-bold transition-colors select-none"
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

            {/* Name */}
            <div className="space-y-2">
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

            {/* Phone */}
            <div className="space-y-2">
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

            {/* Email */}
            <div className="space-y-2">
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
      <div className="bg-white p-8 md:p-10 rounded-2xl border border-slate-200 lg:col-span-5 w-full flex flex-col justify-between">
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

            {totalPriceObj.assetsAmount > 0 && (
              <div className="space-y-1 text-[10px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100 mt-2">
                <div className="flex justify-between">
                  <span>Base Package:</span>
                  <span className="font-semibold">LKR {totalPriceObj.baseAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Included Assets:</span>
                  <span className="font-semibold">LKR {totalPriceObj.assetsAmount.toLocaleString()}</span>
                </div>
              </div>
            )}

            <div className="flex justify-between items-start pt-3 border-t border-slate-100 mt-3">
              <span className="text-slate-700 font-medium">Estimated Total Price:</span>
              <div className="text-right">
                <span className="text-emerald-600 font-bold text-sm block">
                  {totalPriceObj.text}
                </span>
                {activePackage && activePackage.pricingModel === "PER_BOAT" && (
                  <span className="text-[9px] text-slate-400 italic block mt-0.5">
                    (Flat rate LKR {activePackage.basePrice.toLocaleString("en-US")} per boat + assets)
                  </span>
                )}
                {activePackage && activePackage.pricingModel === "PER_PERSON" && (
                  <span className="text-[9px] text-slate-400 italic block mt-0.5">
                    (LKR {activePackage.basePrice.toLocaleString("en-US")} × {numberOfGuests} guest{numberOfGuests > 1 ? "s" : ""} + assets)
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
  );
}
