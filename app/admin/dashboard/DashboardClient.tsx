"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  FiSearch,
  FiCalendar,
  FiUser,
  FiPhone,
  FiMail,
  FiUsers,
  FiDollarSign,
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiList,
  FiEdit,
  FiInfo,
  FiTrash2,
  FiPlus,
  FiStar,
  FiUploadCloud,
  FiLayers,
  FiCompass,
  FiTag,
  FiFolderPlus,
  FiPieChart,
  FiBox,
  FiChevronRight,
  FiImage
} from "react-icons/fi";
import { HiOutlineSparkles } from "react-icons/hi";
import { BookingStatus, PricingModel, AmenityBilling } from "@/app/generated/prisma/enums";

// ─── Interfaces ─────────────────────────────────────────────────────────────
interface ActivityLog {
  id: string;
  bookingId: string;
  action: string;
  previousValue: string | null;
  newValue: string | null;
  performedBy: string;
  createdAt: string;
}

interface Booking {
  id: string;
  bookingNumber: string;
  status: BookingStatus;
  guestName: string;
  guestPhone: string;
  guestEmail: string | null;
  bookingDate: string;
  numberOfGuests: number;
  totalPrice: number;
  adminNotes: string | null;
  packageId: string;
  createdAt: string;
  updatedAt: string;
  package: {
    id: string;
    name: string;
    basePrice: number;
    pricingModel: string;
  };
  activityLogs: ActivityLog[];
}

interface Package {
  id: string;
  name: string;
  description: string | null;
  basePrice: number;
  pricingModel: string;
  isActive: boolean;
  images?: string[];
  createdAt: string;
  updatedAt: string;
}

interface Amenity {
  id: string;
  name: string;
  price: number;
  billingType: AmenityBilling;
  createdAt: string;
  updatedAt: string;
}

interface Activity {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

interface DashboardClientProps {
  initialBookings: Booking[];
  packages: Package[];
}

export default function DashboardClient({
  initialBookings,
  packages: initialPackages,
}: DashboardClientProps) {
  // ─── Active Sidebar Tab ───────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<"dashboard" | "bookings" | "packages" | "assets" | "activities">("dashboard");

  // ─── Database-fetched state lists ──────────────────────────────────────────
  const [packages, setPackages] = useState<Package[]>(initialPackages);
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  
  // Loader & Metadata states
  const [isLoading, setIsLoading] = useState(true);
  const [packageMeta, setPackageMeta] = useState<Record<string, { duration: string; capacity: string; isPopular: boolean; images: string[]; assets?: string[]; activities?: string[] }>>({});

  // ─── Reservations console states ───────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [editStatus, setEditStatus] = useState<BookingStatus>("PENDING");
  const [editNotes, setEditNotes] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  // ─── Creation Form States ──────────────────────────────────────────────────
  
  // 1. Packages (Component A)
  const [pkgTitle, setPkgTitle] = useState("");
  const [pkgDescription, setPkgDescription] = useState("");
  const [pkgBasePrice, setPkgBasePrice] = useState("");
  const [pkgDuration, setPkgDuration] = useState("");
  const [pkgCapacity, setPkgCapacity] = useState("");
  const [pkgPricingModel, setPkgPricingModel] = useState<string>("PER_PERSON");
  const [pkgIsPopular, setPkgIsPopular] = useState(false);
  const [pkgImages, setPkgImages] = useState<File[]>([]);
  const [pkgCreating, setPkgCreating] = useState(false);
  const [pkgError, setPkgError] = useState<string | null>(null);
  const [pkgSuccess, setPkgSuccess] = useState(false);
  const [pkgSearchQuery, setPkgSearchQuery] = useState("");
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 2. Assets / Amenities (Component B)
  const [amenityName, setAmenityName] = useState("");
  const [amenityPrice, setAmenityPrice] = useState("");
  const [amenityBillingType, setAmenityBillingType] = useState<AmenityBilling>("FLAT_RATE");
  const [amenityCreating, setAmenityCreating] = useState(false);
  const [amenityError, setAmenityError] = useState<string | null>(null);

  // 3. Activities (Component C)
  const [activityName, setActivityName] = useState("");
  const [activityDescription, setActivityDescription] = useState("");
  const [activityCreating, setActivityCreating] = useState(false);
  const [activityError, setActivityError] = useState<string | null>(null);

  // ─── Fetch Inventory from DB on Mount ──────────────────────────────────────
  useEffect(() => {
    async function fetchInventory() {
      try {
        setIsLoading(true);
        const response = await fetch("/api/admin/inventory");
        const data = await response.json();
        
        if (data.success) {
          setPackages(data.packages);
          setAmenities(data.amenities);
          setActivities(data.activities);
        }
      } catch (error) {
        console.error("Failed to load database inventory:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchInventory();

    // Load localStorage metadata
    const savedMeta = localStorage.getItem("mandil_package_metadata");
    if (savedMeta) {
      setPackageMeta(JSON.parse(savedMeta));
    } else {
      const defaultMeta: Record<string, any> = {
        "boat-safari-1h": { duration: "1 Hour", capacity: "Up to 12 Guests", isPopular: false, images: [] },
        "boat-safari-2h": { duration: "2 Hours", capacity: "Up to 12 Guests", isPopular: true, images: [] },
        "boat-safari-sunset": { duration: "3 Hours", capacity: "Up to 12 Guests", isPopular: true, images: [] },
        "family-adult": { duration: "8 Hours", capacity: "Min 5 - Max 20", isPopular: false, images: [] },
      };
      setPackageMeta(defaultMeta);
      localStorage.setItem("mandil_package_metadata", JSON.stringify(defaultMeta));
    }
  }, []);

  // ─── Metric Calculations ───────────────────────────────────────────────────
  const totalBookingsCount = bookings.length;
  const pendingBookingsCount = bookings.filter((b) => b.status === "PENDING").length;
  const confirmedBookingsCount = bookings.filter((b) => b.status === "CONFIRMED").length;
  const totalRevenueAmount = bookings
    .filter((b) => b.status === "CONFIRMED" || b.status === "COMPLETED")
    .reduce((sum, b) => sum + b.totalPrice, 0);

  // ─── Filtered Bookings for Bookings tab ────────────────────────────────────
  const filteredBookingsList = bookings.filter((booking) => {
    const matchesSearch =
      booking.bookingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.guestPhone.includes(searchQuery);

    const matchesStatus =
      statusFilter === "ALL" || booking.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleBookingRowSelect = (booking: Booking) => {
    setSelectedBooking(booking);
    setEditStatus(booking.status);
    setEditNotes(booking.adminNotes || "");
    setUpdateError(null);
    setUpdateSuccess(false);
  };

  // ─── Update Booking Status Handler ─────────────────────────────────────────
  const handleUpdateBookingStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking) return;

    setIsUpdating(true);
    setUpdateError(null);
    setUpdateSuccess(false);

    try {
      const response = await fetch(`/api/bookings/${selectedBooking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: editStatus,
          adminNotes: editNotes,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update booking status");
      }

      setBookings((prev) =>
        prev.map((b) => (b.id === selectedBooking.id ? {
          ...result.booking,
          totalPrice: parseFloat(result.booking.totalPrice),
          package: b.package,
          activityLogs: result.booking.activityLogs || b.activityLogs
        } : b))
      );

      setSelectedBooking((prev) => prev ? {
        ...prev,
        status: editStatus,
        adminNotes: editNotes,
        activityLogs: result.booking.activityLogs || prev.activityLogs
      } : null);

      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (err: any) {
      setUpdateError(err.message || "Something went wrong.");
    } finally {
      setIsUpdating(false);
    }
  };

  // ─── Component A: Packages Drag and Drop Handlers ──────────────────────────
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      const droppedFiles = Array.from(e.dataTransfer.files).filter(file => 
        /\.(jpg|jpeg|png|webp|avif)$/i.test(file.name)
      );
      setPkgImages(prev => [...prev, ...droppedFiles]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setPkgImages(prev => [...prev, ...selectedFiles]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setPkgImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreatePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pkgTitle.trim() || !pkgBasePrice.trim()) {
      setPkgError("Package Title and Base Price are required.");
      return;
    }

    setPkgCreating(true);
    setPkgError(null);
    setPkgSuccess(false);

    try {
      const formData = new FormData();
      formData.append("name", pkgTitle.trim());
      formData.append("description", pkgDescription.trim());
      formData.append("basePrice", pkgBasePrice.trim());
      formData.append("pricingModel", pkgPricingModel);
      formData.append("isActive", "true");
      formData.append("assetIds", JSON.stringify(selectedAssets));
      formData.append("activityIds", JSON.stringify(selectedActivities));
      
      pkgImages.forEach((file) => {
        formData.append("images", file);
      });

      const response = await fetch("/api/packages", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to create package.");
      }

      const createdPkg = result.package;

      const finalImageUrls = createdPkg.images || [];
      const newMeta = {
        duration: pkgDuration.trim() || "N/A",
        capacity: pkgCapacity.trim() || "N/A",
        isPopular: pkgIsPopular,
        images: finalImageUrls,
        assets: selectedAssets.map(id => amenities.find(a => a.id === id)?.name).filter(Boolean) as string[],
        activities: selectedActivities.map(id => activities.find(a => a.id === id)?.name).filter(Boolean) as string[]
      };

      const updatedMeta = { ...packageMeta, [createdPkg.id]: newMeta };
      setPackageMeta(updatedMeta);
      localStorage.setItem("mandil_package_metadata", JSON.stringify(updatedMeta));

      setPackages(prev => [createdPkg, ...prev]);

      setPkgTitle("");
      setPkgDescription("");
      setPkgBasePrice("");
      setPkgDuration("");
      setPkgCapacity("");
      setPkgPricingModel("PER_PERSON");
      setPkgIsPopular(false);
      setPkgImages([]);
      setSelectedAssets([]);
      setSelectedActivities([]);
      setPkgSuccess(true);
      setTimeout(() => setPkgSuccess(false), 3000);
    } catch (err: any) {
      setPkgError(err.message || "Failed to create package.");
    } finally {
      setPkgCreating(false);
    }
  };

  const handleEditPackage = (pkg: Package) => {
    const meta = packageMeta[pkg.id] || { duration: "", capacity: "", isPopular: false, images: [], assets: [], activities: [] };
    setPkgTitle(pkg.name);
    setPkgDescription(pkg.description || "");
    setPkgBasePrice(pkg.basePrice.toString());
    setPkgDuration(meta.duration || "");
    setPkgCapacity(meta.capacity || "");
    setPkgPricingModel(pkg.pricingModel);
    setPkgIsPopular(meta.isPopular || false);

    // Map saved asset names and activity names back to their corresponding database IDs to pre-fill the form checkboxes
    const matchedAssetIds = (meta.assets || []).map(name => amenities.find(a => a.name === name)?.id).filter(Boolean) as string[];
    const matchedActivityIds = (meta.activities || []).map(name => activities.find(a => a.name === name)?.id).filter(Boolean) as string[];
    
    setSelectedAssets(matchedAssetIds);
    setSelectedActivities(matchedActivityIds);

    console.log("Mock Edit Mode: Loaded package details into the creation form for:", pkg.name);
    alert(`Editing mode active: "${pkg.name}" details loaded into the left form.`);
  };

  const handleDeletePackage = (pkgId: string) => {
    if (confirm("Are you sure you want to delete this package?")) {
      setPackages((prev) => prev.filter((p) => p.id !== pkgId));
    }
  };

  // ─── Component B: Assets / Amenities DB Operations ────────────────────────
  const handleAddAmenity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amenityName.trim() || !amenityPrice.trim()) {
      setAmenityError("Amenity Name and Rental Price are required.");
      return;
    }

    setAmenityCreating(true);
    setAmenityError(null);

    try {
      const response = await fetch("/api/admin/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "CREATE_AMENITY",
          name: amenityName.trim(),
          price: parseFloat(amenityPrice) || 0,
          billingType: amenityBillingType,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to create amenity.");
      }

      setAmenities((prev) => [result.amenity, ...prev]);
      setAmenityName("");
      setAmenityPrice("");
      setAmenityBillingType("FLAT_RATE");
    } catch (err: any) {
      setAmenityError(err.message || "Failed to add amenity to database.");
    } finally {
      setAmenityCreating(false);
    }
  };

  const handleDeleteAmenity = async (id: string) => {
    if (!confirm("Are you sure you want to delete this amenity from the database?")) return;
    try {
      const response = await fetch("/api/admin/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "DELETE_AMENITY",
          id,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to delete amenity.");
      }

      setAmenities((prev) => prev.filter((item) => item.id !== id));
    } catch (err: any) {
      alert(err.message || "Failed to delete amenity.");
    }
  };

  // ─── Component C: Activities DB Operations ────────────────────────────────
  const handleAddActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activityName.trim()) {
      setActivityError("Activity Name is required.");
      return;
    }

    setActivityCreating(true);
    setActivityError(null);

    try {
      const response = await fetch("/api/admin/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "CREATE_ACTIVITY",
          name: activityName.trim(),
          description: activityDescription.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to create activity.");
      }

      setActivities((prev) => [result.activity, ...prev]);
      setActivityName("");
      setActivityDescription("");
    } catch (err: any) {
      setActivityError(err.message || "Failed to add activity to database.");
    } finally {
      setActivityCreating(false);
    }
  };

  const handleDeleteActivity = async (id: string) => {
    if (!confirm("Are you sure you want to delete this activity from the database?")) return;
    try {
      const response = await fetch("/api/admin/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "DELETE_ACTIVITY",
          id,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to delete activity.");
      }

      setActivities((prev) => prev.filter((item) => item.id !== id));
    } catch (err: any) {
      alert(err.message || "Failed to delete activity.");
    }
  };

  // Status badge colors
  const getStatusBadgeStyle = (status: BookingStatus) => {
    switch (status) {
      case "PENDING":
        return "bg-amber-50 text-amber-800 border-amber-200";
      case "CONFIRMED":
        return "bg-emerald-50 text-emerald-800 border-emerald-200";
      case "COMPLETED":
        return "bg-slate-100 text-slate-800 border-slate-200";
      case "CANCELLED":
        return "bg-red-50 text-red-800 border-red-200";
    }
  };

  // ─── Loader Layout state ───────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex-1 bg-slate-50 min-h-screen flex items-center justify-center p-8 w-full">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 max-w-sm w-full text-center space-y-4 shadow-sm">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <div>
            <h3 className="text-slate-900 font-bold text-sm">Loading admin workspace...</h3>
            <p className="text-slate-400 text-xs mt-1">Retrieving resort packages, assets, and activities from database.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 w-full min-h-screen bg-slate-50">
      
      {/* ─── Sidebar Navigation (Fixed Desktop View) ────────────────────────── */}
      <aside className="w-64 min-h-screen bg-white border-r border-slate-200 flex flex-col p-6 sticky top-16">
        
        {/* Navigation list */}
        <nav className="flex-1 space-y-2.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-450 block px-4 mb-4">
            Resort Management
          </span>

          <button
            onClick={() => setActiveTab("dashboard")}
            className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-semibold rounded-xl border transition-all duration-200 cursor-pointer ${
              activeTab === "dashboard"
                ? "bg-emerald-50 text-emerald-800 border-emerald-100/70"
                : "bg-transparent text-slate-650 hover:bg-slate-50 hover:text-slate-900 border-transparent"
            }`}
          >
            <FiPieChart size={15} />
            Dashboard Overview
          </button>

          <button
            onClick={() => setActiveTab("bookings")}
            className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-semibold rounded-xl border transition-all duration-200 cursor-pointer ${
              activeTab === "bookings"
                ? "bg-emerald-50 text-emerald-800 border-emerald-100/70"
                : "bg-transparent text-slate-650 hover:bg-slate-50 hover:text-slate-900 border-transparent"
            }`}
          >
            <FiCalendar size={15} />
            Reservations Console
          </button>

          <button
            onClick={() => setActiveTab("packages")}
            className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-semibold rounded-xl border transition-all duration-200 cursor-pointer ${
              activeTab === "packages"
                ? "bg-emerald-50 text-emerald-800 border-emerald-100/70"
                : "bg-transparent text-slate-650 hover:bg-slate-50 hover:text-slate-900 border-transparent"
            }`}
          >
            <FiLayers size={15} />
            Lakeside Packages
          </button>

          <button
            onClick={() => setActiveTab("assets")}
            className={`w-full flex items-center justify-between px-4 py-3 text-xs font-semibold rounded-xl border transition-all duration-200 cursor-pointer ${
              activeTab === "assets"
                ? "bg-emerald-50 text-emerald-800 border-emerald-100/70"
                : "bg-transparent text-slate-650 hover:bg-slate-50 hover:text-slate-900 border-transparent"
            }`}
          >
            <span className="flex items-center gap-3">
              <FiTag size={15} />
              Assets &amp; Add-ons
            </span>
            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-mono">
              {amenities.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("activities")}
            className={`w-full flex items-center justify-between px-4 py-3 text-xs font-semibold rounded-xl border transition-all duration-200 cursor-pointer ${
              activeTab === "activities"
                ? "bg-emerald-50 text-emerald-800 border-emerald-100/70"
                : "bg-transparent text-slate-650 hover:bg-slate-50 hover:text-slate-900 border-transparent"
            }`}
          >
            <span className="flex items-center gap-3">
              <FiCompass size={15} />
              Resort Activities
            </span>
            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-mono">
              {activities.length}
            </span>
          </button>
        </nav>
      </aside>

      {/* ─── Main Content Workspace ─────────────────────────────────────────── */}
      <main className="flex-1 bg-slate-50 p-8 w-full min-h-screen flex flex-col items-start space-y-6 overflow-y-auto">
        
        {/* ─── TAB: DASHBOARD OVERVIEW ──────────────────────────────────────── */}
        {activeTab === "dashboard" && (
          <div className="w-full space-y-6">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Overview metrics</h2>
              <p className="text-slate-500 text-xs mt-1">General dashboard stats and resort reservation summaries.</p>
            </div>

            {/* Metrics cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
              <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between shadow-2xs">
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Total Revenue</span>
                  <span className="text-2xl font-bold text-slate-900 block mt-1">LKR {totalRevenueAmount.toLocaleString()}</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700"><FiDollarSign size={18} /></div>
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between shadow-2xs">
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Total Bookings</span>
                  <span className="text-2xl font-bold text-slate-900 block mt-1">{totalBookingsCount}</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-650"><FiList size={18} /></div>
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between shadow-2xs">
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Confirmed Bookings</span>
                  <span className="text-2xl font-bold text-emerald-800 block mt-1">{confirmedBookingsCount}</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700"><FiCheckCircle size={18} /></div>
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between shadow-2xs">
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Pending Bookings</span>
                  <span className="text-2xl font-bold text-amber-800 block mt-1">{pendingBookingsCount}</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-700"><FiClock size={16} /></div>
              </div>
            </div>

            {/* Recent reservation activities block */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs w-full">
              <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                <FiClock className="text-emerald-700" /> Recent Administrative Audit Logs
              </h3>
              <div className="divide-y divide-slate-100">
                {bookings.slice(0, 5).flatMap((b) => b.activityLogs).length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs italic">No recent system logs.</div>
                ) : (
                  bookings
                    .flatMap((b) => b.activityLogs)
                    .slice(0, 5)
                    .map((log) => (
                      <div key={log.id} className="py-3 flex justify-between items-center text-xs text-slate-650">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-800">{log.action}</span>
                          <span className="text-slate-400 text-[10px] font-mono">({log.performedBy})</span>
                        </div>
                        <span className="text-slate-400 text-[10px]">
                          {new Date(log.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB: RESERVATIONS CONSOLE ────────────────────────────────────── */}
        {activeTab === "bookings" && (
          <div className="w-full space-y-6">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Reservations Console</h2>
              <p className="text-slate-500 text-xs mt-1">Review guest itineraries, confirm deposits, and record admin log details.</p>
            </div>

            {/* Filter controls */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between w-full">
              <div className="relative w-full md:max-w-md">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400"><FiSearch size={14} /></span>
                <input
                  type="text"
                  placeholder="Search reservations by Guest, Phone, or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 rounded-xl text-slate-800 placeholder-slate-400 outline-none text-xs transition-all shadow-2xs"
                />
              </div>
              <div className="flex items-center gap-2 self-start md:self-auto">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Filter Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 focus:border-emerald-600 outline-none text-xs shadow-2xs transition-colors"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="PENDING">PENDING</option>
                  <option value="CONFIRMED">CONFIRMED</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>
            </div>

            {/* Booking split tables */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">
              <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-550 text-[10px] font-bold uppercase tracking-wider bg-slate-50/70">
                        <th className="py-4 px-5">Booking No</th>
                        <th className="py-4 px-5">Guest Detail</th>
                        <th className="py-4 px-5">Visit Date</th>
                        <th className="py-4 px-5">Guests</th>
                        <th className="py-4 px-5">Status</th>
                        <th className="py-4 px-5 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
                      {filteredBookingsList.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-16 text-center text-slate-400 font-medium">No reservations found.</td>
                        </tr>
                      ) : (
                        filteredBookingsList.map((booking) => (
                          <tr
                            key={booking.id}
                            onClick={() => handleBookingRowSelect(booking)}
                            className={`hover:bg-slate-50 transition-colors cursor-pointer ${selectedBooking?.id === booking.id ? "bg-slate-50/80 font-medium" : ""}`}
                          >
                            <td className="py-4 px-5 font-mono font-bold text-slate-900">{booking.bookingNumber}</td>
                            <td className="py-4 px-5">
                              <div className="font-semibold text-slate-800">{booking.guestName}</div>
                              <div className="text-[10px] text-slate-400 mt-0.5">{booking.guestPhone}</div>
                            </td>
                            <td className="py-4 px-5">{new Date(booking.bookingDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</td>
                            <td className="py-4 px-5 font-semibold text-slate-700">{booking.numberOfGuests}</td>
                            <td className="py-4 px-5">
                              <span className={`inline-block px-2.5 py-1 text-[10px] font-bold rounded-full border ${getStatusBadgeStyle(booking.status)}`}>
                                {booking.status}
                              </span>
                            </td>
                            <td className="py-4 px-5 text-right font-bold text-slate-900">LKR {booking.totalPrice.toLocaleString()}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Booking edit detail container */}
              <div className="lg:col-span-4">
                {!selectedBooking ? (
                  <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-2xs">
                    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 mx-auto mb-3"><FiInfo size={16} /></div>
                    <h3 className="text-slate-800 font-bold text-xs mb-1">Select a booking</h3>
                    <p className="text-slate-400 text-[11px] leading-relaxed">Click any row in the bookings table to display customer data, billing logs, and administrative options.</p>
                  </div>
                ) : (
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-6 relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-600" />
                    
                    <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                      <div>
                        <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest block">Itinerary Detail</span>
                        <span className="font-mono text-base font-bold text-slate-900 block mt-0.5">{selectedBooking.bookingNumber}</span>
                      </div>
                      <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full border ${getStatusBadgeStyle(selectedBooking.status)}`}>{selectedBooking.status}</span>
                    </div>

                    <div className="space-y-3.5 text-xs">
                      <div className="flex items-start gap-3">
                        <span className="text-slate-400 mt-0.5"><FiUser size={13} /></span>
                        <div>
                          <span className="text-slate-400 block text-[9px] uppercase font-bold">Guest Name</span>
                          <span className="text-slate-900 font-semibold mt-0.5 block">{selectedBooking.guestName}</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-slate-400 mt-0.5"><FiPhone size={13} /></span>
                        <div>
                          <span className="text-slate-400 block text-[9px] uppercase font-bold">Guest Phone</span>
                          <span className="text-slate-900 font-semibold mt-0.5 block">{selectedBooking.guestPhone}</span>
                        </div>
                      </div>
                      {selectedBooking.guestEmail && (
                        <div className="flex items-start gap-3">
                          <span className="text-slate-400 mt-0.5"><FiMail size={13} /></span>
                          <div>
                            <span className="text-slate-400 block text-[9px] uppercase font-bold">Guest Email</span>
                            <span className="text-slate-900 font-semibold mt-0.5 block">{selectedBooking.guestEmail}</span>
                          </div>
                        </div>
                      )}
                      <div className="flex items-start gap-3">
                        <span className="text-slate-400 mt-0.5"><FiCalendar size={13} /></span>
                        <div>
                          <span className="text-slate-400 block text-[9px] uppercase font-bold">Visit Date</span>
                          <span className="text-slate-900 font-semibold mt-0.5 block">{new Date(selectedBooking.bookingDate).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-slate-400 mt-0.5"><FiUsers size={13} /></span>
                        <div>
                          <span className="text-slate-400 block text-[9px] uppercase font-bold">Package &amp; Capacity</span>
                          <span className="text-slate-900 font-semibold mt-0.5 block">{selectedBooking.numberOfGuests} guests on &ldquo;{selectedBooking.package.name}&rdquo;</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-slate-400 mt-0.5"><FiDollarSign size={13} /></span>
                        <div>
                          <span className="text-slate-400 block text-[9px] uppercase font-bold">Total Bill</span>
                          <span className="text-emerald-700 font-extrabold text-sm mt-0.5 block">LKR {selectedBooking.totalPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                        </div>
                      </div>
                    </div>

                    <form onSubmit={handleUpdateBookingStatus} className="space-y-4 pt-4 border-t border-slate-100">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5"><FiEdit size={12} /> Modify Status</h4>
                      
                      {updateError && <div className="p-3 bg-red-50 border border-red-100 text-red-800 text-[10px] rounded-xl font-medium">{updateError}</div>}
                      {updateSuccess && <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 text-[10px] rounded-xl font-medium">Itinerary status updated!</div>}

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase text-slate-500 block">Workflow State</label>
                        <select
                          value={editStatus}
                          onChange={(e) => setEditStatus(e.target.value as BookingStatus)}
                          className="w-full px-3 py-2 bg-white border border-slate-300 focus:border-emerald-600 rounded-xl text-slate-800 text-xs outline-none transition-colors"
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="CONFIRMED">CONFIRMED</option>
                          <option value="COMPLETED">COMPLETED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase text-slate-500 block">Staff notes</label>
                        <textarea
                          value={editNotes}
                          onChange={(e) => setEditNotes(e.target.value)}
                          placeholder="Add receipt transaction reference numbers or dietary requests..."
                          rows={2}
                          className="w-full px-3 py-2 bg-white border border-slate-300 focus:border-emerald-600 rounded-xl text-slate-800 text-xs outline-none placeholder-slate-400 transition-colors resize-none"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isUpdating}
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors duration-200 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        {isUpdating ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : "Modify Booking"}
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB: LAKESIDE PACKAGES ───────────────────────────────────────── */}
        {activeTab === "packages" && (
          <div className="w-full space-y-6">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Packages Management</h2>
              <p className="text-slate-500 text-xs mt-1">Configure active packages, durations, capacities, and marketing features.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">
              {/* Form card */}
              <form onSubmit={handleCreatePackage} className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2"><FiPlus className="text-emerald-700" /> Create Villa Package</h3>

                {pkgError && <div className="p-3 bg-red-50 border border-red-100 text-red-800 text-xs rounded-xl font-medium">{pkgError}</div>}
                {pkgSuccess && <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs rounded-xl font-medium">Package added successfully!</div>}

                <div className="space-y-1.5">
                  <label htmlFor="pkgTitle" className="text-xs font-bold text-slate-600 block">Package Name *</label>
                  <input
                    id="pkgTitle"
                    type="text"
                    required
                    value={pkgTitle}
                    onChange={(e) => setPkgTitle(e.target.value)}
                    placeholder="e.g. Standard Overnight Stay"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 rounded-xl text-slate-800 outline-none text-xs transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="pkgBasePrice" className="text-xs font-bold text-slate-600 block">Base Price (LKR) *</label>
                    <input
                      id="pkgBasePrice"
                      type="number"
                      required
                      min="0"
                      value={pkgBasePrice}
                      onChange={(e) => setPkgBasePrice(e.target.value)}
                      placeholder="e.g. 45000"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 rounded-xl text-slate-800 outline-none text-xs transition-colors"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="pkgPricingModel" className="text-xs font-bold text-slate-600 block">Pricing Model</label>
                    <select
                      id="pkgPricingModel"
                      value={pkgPricingModel}
                      onChange={(e) => setPkgPricingModel(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 focus:border-emerald-600 rounded-xl text-slate-800 outline-none text-xs transition-colors"
                    >
                      <option value="PER_PERSON">Per Person</option>
                      <option value="PER_BOAT">Per Boat</option>
                      <option value="CUSTOM">Custom Quote</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="pkgDuration" className="text-xs font-bold text-slate-600 block">Duration</label>
                    <input
                      id="pkgDuration"
                      type="text"
                      value={pkgDuration}
                      onChange={(e) => setPkgDuration(e.target.value)}
                      placeholder="e.g. 24 Hours"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 rounded-xl text-slate-800 outline-none text-xs transition-colors"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="pkgCapacity" className="text-xs font-bold text-slate-600 block">Capacity Limit</label>
                    <input
                      id="pkgCapacity"
                      type="text"
                      value={pkgCapacity}
                      onChange={(e) => setPkgCapacity(e.target.value)}
                      placeholder="e.g. Min 2 — Max 8"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 rounded-xl text-slate-800 outline-none text-xs transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="pkgDescription" className="text-xs font-bold text-slate-600 block">Description</label>
                  <textarea
                    id="pkgDescription"
                    value={pkgDescription}
                    onChange={(e) => setPkgDescription(e.target.value)}
                    placeholder="Describe details of menu inclusions, amenities, check-in rules..."
                    rows={3}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 focus:border-emerald-600 rounded-xl text-slate-800 outline-none text-xs transition-colors resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 block">Media Upload</label>
                  <div
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-200 hover:border-emerald-600 bg-slate-50 p-6 rounded-2xl text-center cursor-pointer transition-colors flex flex-col items-center justify-center gap-2 group"
                  >
                    <input type="file" multiple ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                    <FiUploadCloud className="text-slate-400 group-hover:text-emerald-600 transition-colors" size={24} />
                    <p className="text-[11px] font-semibold text-slate-700">Click or drag images to upload</p>
                  </div>
                  {pkgImages.length > 0 && (
                    <div className="grid grid-cols-5 gap-2.5 pt-2">
                      {pkgImages.map((file, idx) => (
                        <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                          <Image src={URL.createObjectURL(file)} alt={file.name} fill className="object-cover" />
                          <button type="button" onClick={() => handleRemoveImage(idx)} className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-50 text-red-600 flex items-center justify-center shadow-sm cursor-pointer"><FiTrash2 size={9} /></button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Attach Assets/Add-ons (Optional) */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 block">Attach Assets/Add-ons (Optional)</label>
                  {amenities.length === 0 ? (
                    <p className="text-[10px] text-slate-400 font-medium">No assets in database. Create them in the Assets tab first.</p>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 max-h-28 overflow-y-auto border border-slate-200 rounded-xl p-2.5 bg-slate-50">
                      {amenities.map((am) => (
                        <label key={am.id} className="flex items-center gap-2 text-[10px] text-slate-700 font-medium cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedAssets.includes(am.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedAssets(prev => [...prev, am.id]);
                              } else {
                                setSelectedAssets(prev => prev.filter(id => id !== am.id));
                              }
                            }}
                            className="rounded border-slate-350 text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5 cursor-pointer"
                          />
                          <span className="truncate">{am.name}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Attach Resort Activities (Optional) */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 block">Attach Resort Activities (Optional)</label>
                  {activities.length === 0 ? (
                    <p className="text-[10px] text-slate-400 font-medium">No activities in database. Create them in the Activities tab first.</p>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 max-h-28 overflow-y-auto border border-slate-200 rounded-xl p-2.5 bg-slate-50">
                      {activities.map((act) => (
                        <label key={act.id} className="flex items-center gap-2 text-[10px] text-slate-700 font-medium cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedActivities.includes(act.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedActivities(prev => [...prev, act.id]);
                              } else {
                                setSelectedActivities(prev => prev.filter(id => id !== act.id));
                              }
                            }}
                            className="rounded border-slate-350 text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5 cursor-pointer"
                          />
                          <span className="truncate">{act.name}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setPkgIsPopular(!pkgIsPopular)}
                    role="switch"
                    aria-checked={pkgIsPopular}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${pkgIsPopular ? "bg-emerald-600" : "bg-slate-200"}`}
                  >
                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${pkgIsPopular ? "translate-x-5" : "translate-x-0"}`} />
                  </button>
                  <span className="text-xs font-semibold text-slate-700">Featured Popular Package</span>
                </div>

                <button
                  type="submit"
                  disabled={pkgCreating}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors duration-200 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {pkgCreating ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : "Save Package"}
                </button>
              </form>

              {/* Grid cards listing */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <FiLayers className="text-emerald-700" /> Active Packages ({packages.length})
                  </h3>
                  
                  {/* Inline Search Bar */}
                  <div className="relative w-full sm:w-64">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <FiSearch size={13} />
                    </div>
                    <input
                      type="text"
                      value={pkgSearchQuery}
                      onChange={(e) => setPkgSearchQuery(e.target.value)}
                      placeholder="Search active packages by name..."
                      className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-xl text-[11px] bg-white text-slate-900 focus:outline-none focus:border-slate-350 transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[640px] overflow-y-auto pr-1">
                  {(() => {
                    const filtered = packages.filter((pkg) =>
                      pkg.name.toLowerCase().includes(pkgSearchQuery.toLowerCase())
                    );
                    if (filtered.length === 0) {
                      return (
                        <div className="col-span-full py-12 flex flex-col items-center justify-center bg-white border border-dashed border-slate-200 rounded-2xl text-slate-450 gap-2">
                          <FiSearch size={20} className="text-slate-350 animate-pulse" />
                          <span className="text-[11px] font-medium text-slate-450">No packages match your search filter.</span>
                        </div>
                      );
                    }
                    return filtered.map((pkg) => {
                      const meta = packageMeta[pkg.id] || { duration: "N/A", capacity: "N/A", isPopular: false, images: [] };
                      const firstImage = (pkg.images && pkg.images.length > 0) ? pkg.images[0] : (meta.images && meta.images.length > 0) ? meta.images[0] : null;
                      return (
                        <div key={pkg.id} className="bg-white border border-slate-200 rounded-2xl shadow-2xs flex flex-col overflow-hidden hover:border-slate-300 transition-all duration-200 group relative">
                          {meta.isPopular && (
                            <div className="absolute top-3 right-3 z-10 text-amber-500 bg-white/95 p-1 rounded-lg shadow-sm border border-slate-100">
                              <FiStar size={13} className="fill-amber-500 text-amber-500" />
                            </div>
                          )}
                          
                          {/* Image Preview Box */}
                          {firstImage ? (
                            <img
                              src={firstImage}
                              alt={pkg.name}
                              className="w-full h-36 object-cover bg-slate-100 border-b border-slate-100"
                            />
                          ) : (
                            <div className="w-full h-36 bg-slate-50 border-b border-slate-100 flex flex-col items-center justify-center text-slate-450 gap-1.5">
                              <FiImage size={22} className="text-slate-355" />
                              <span className="text-[9px] font-bold tracking-wider uppercase text-slate-400">No Image Available</span>
                            </div>
                          )}

                          {/* Data Typography Alignment */}
                          <div className="p-4 flex flex-col flex-1 justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-100 text-emerald-800 text-[8px] font-bold uppercase tracking-wider">{pkg.pricingModel}</span>
                                <span className="text-[9px] text-slate-400 font-mono">ID: {pkg.id.slice(0, 8)}...</span>
                              </div>
                              <h4 className="text-slate-900 font-bold text-xs mt-2.5 leading-tight truncate" title={pkg.name}>{pkg.name}</h4>
                              <p className="text-slate-500 text-[11px] mt-1.5 leading-relaxed line-clamp-2">{pkg.description || "No description provided."}</p>
                            </div>
                            
                            {/* Edit & Delete Action Footer */}
                            <div className="border-t border-slate-100 pt-3 mt-auto">
                              <div className="flex items-center justify-between text-[10px] text-slate-500 mb-2">
                                <span className="flex items-center gap-1"><FiClock size={11} className="text-emerald-600" /> {meta.duration}</span>
                                <span className="flex items-center gap-1"><FiUsers size={11} className="text-emerald-600" /> {meta.capacity}</span>
                              </div>
                              <div className="flex items-center justify-between border-t border-slate-100/50 pt-2">
                                <span className="font-extrabold text-emerald-700 text-xs">LKR {pkg.basePrice.toLocaleString()}</span>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleEditPackage(pkg)}
                                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                                  >
                                    <FiEdit size={10} /> Edit
                                  </button>
                                  <button
                                    onClick={() => handleDeletePackage(pkg.id)}
                                    className="p-1 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                                    title="Delete Package"
                                  >
                                    <FiTrash2 size={12} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB: ASSETS & ADD-ONS (GRID LAYOUT WITH DB INTEGRATION) ──────── */}
        {activeTab === "assets" && (
          <div className="w-full space-y-6">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Assets &amp; Add-on Inventory</h2>
              <p className="text-slate-500 text-xs mt-1">Manage rental options such as pontoon boats, karaoke setups, and BBQ equipment directly synchronized with database.</p>
            </div>

            {/* FULL-WIDTH GRID WITH CREATION FORM ON LEFT & INVENTORY ON RIGHT */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full items-start">
              
              {/* Form Panel (Left) */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <FiPlus className="text-emerald-700" /> Add Asset Item
                </h3>

                {amenityError && (
                  <div className="p-3 bg-red-50 border border-red-100 text-red-800 text-[11px] rounded-xl font-medium">
                    {amenityError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="amenityName" className="text-xs font-bold text-slate-650 block">Asset / Item Name *</label>
                    <input
                      id="amenityName"
                      type="text"
                      value={amenityName}
                      onChange={(e) => setAmenityName(e.target.value)}
                      placeholder="e.g. Luxury Speedboat Setup"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 rounded-xl text-slate-800 placeholder-slate-400 outline-none text-xs transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="amenityPrice" className="text-xs font-bold text-slate-650 block">Rental Price (LKR) *</label>
                    <input
                      id="amenityPrice"
                      type="number"
                      value={amenityPrice}
                      onChange={(e) => setAmenityPrice(e.target.value)}
                      placeholder="e.g. 15000"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 rounded-xl text-slate-800 placeholder-slate-400 outline-none text-xs transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="amenityBillingType" className="text-xs font-bold text-slate-650 block">Billing Scheme</label>
                  <select
                    id="amenityBillingType"
                    value={amenityBillingType}
                    onChange={(e) => setAmenityBillingType(e.target.value as AmenityBilling)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 focus:border-emerald-600 rounded-xl text-slate-800 outline-none text-xs transition-colors"
                  >
                    <option value="PER_HOUR">Hourly Billing (PER_HOUR)</option>
                    <option value="FLAT_RATE">Flat Reservation Rate (FLAT_RATE)</option>
                    <option value="PER_DAY">Daily Billing (PER_DAY)</option>
                  </select>
                </div>

                <button
                  onClick={handleAddAmenity}
                  disabled={amenityCreating}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors duration-200 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {amenityCreating ? (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <FiPlus size={13} /> Add to Database Inventory
                    </>
                  )}
                </button>
              </div>

              {/* Database-Fetched List Panel (Right) */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <FiBox className="text-emerald-700" /> Database-Fetched Active Inventory ({amenities.length})
                </h3>

                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[9px] tracking-wider">
                        <th className="py-3.5 px-4">Item description</th>
                        <th className="py-3.5 px-4">Pricing structure</th>
                        <th className="py-3.5 px-4 text-right">Delete action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-600">
                      {amenities.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="py-8 text-center text-slate-400 italic">No amenities registered in database.</td>
                        </tr>
                      ) : (
                        amenities.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-4 px-4 font-semibold text-slate-800">{item.name}</td>
                            <td className="py-4 px-4 font-medium text-slate-700">LKR {item.price.toLocaleString()} ({item.billingType})</td>
                            <td className="py-4 px-4 text-right">
                              <button
                                onClick={() => handleDeleteAmenity(item.id)}
                                className="p-1.5 text-red-500 hover:bg-red-50 hover:text-red-700 rounded-lg transition-all cursor-pointer inline-flex items-center justify-center border border-transparent hover:border-red-100"
                                title="Remove Item from Database"
                              >
                                <FiTrash2 size={13} />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ─── TAB: RESORT ACTIVITIES (GRID LAYOUT WITH DB INTEGRATION) ─────── */}
        {activeTab === "activities" && (
          <div className="w-full space-y-6">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Resort Activities Manager</h2>
              <p className="text-slate-500 text-xs mt-1">Configure active activities offered to guests, fully managed inside the database.</p>
            </div>

            {/* FULL-WIDTH GRID WITH CREATION FORM ON LEFT & ACTIVITIES ON RIGHT */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full items-start">
              
              {/* Form Panel (Left) */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <FiPlus className="text-emerald-700" /> Register Resort Activity
                </h3>

                {activityError && (
                  <div className="p-3 bg-red-50 border border-red-100 text-red-800 text-[11px] rounded-xl font-medium">
                    {activityError}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label htmlFor="activityName" className="text-xs font-bold text-slate-650 block">Activity Title *</label>
                  <input
                    id="activityName"
                    type="text"
                    value={activityName}
                    onChange={(e) => setActivityName(e.target.value)}
                    placeholder="e.g. Guided Bird Watching Boat Tour"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 rounded-xl text-slate-800 placeholder-slate-400 outline-none text-xs transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="activityDescription" className="text-xs font-bold text-slate-650 block">Itinerary / Rules description</label>
                  <textarea
                    id="activityDescription"
                    value={activityDescription}
                    onChange={(e) => setActivityDescription(e.target.value)}
                    placeholder="Describe duration details, life jacket rules, boat setup guide..."
                    rows={4}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 focus:border-emerald-600 rounded-xl text-slate-850 placeholder-slate-400 outline-none text-xs transition-colors resize-none"
                  />
                </div>

                <button
                  onClick={handleAddActivity}
                  disabled={activityCreating}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors duration-200 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {activityCreating ? (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <FiPlus size={13} /> Save Activity to Database
                    </>
                  )}
                </button>
              </div>

              {/* Database-Fetched Activities List (Right) */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <FiCompass className="text-emerald-700" /> Database-Fetched Active Activities ({activities.length})
                </h3>

                <div className="grid grid-cols-1 gap-4 max-h-[460px] overflow-y-auto pr-1">
                  {activities.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 italic text-xs bg-slate-50 rounded-2xl border border-slate-200">
                      No activities registered in database.
                    </div>
                  ) : (
                    activities.map((act) => (
                      <div
                        key={act.id}
                        className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex items-start justify-between gap-4 group hover:border-slate-300 transition-colors"
                      >
                        <div className="space-y-1.5">
                          <h4 className="text-slate-900 font-bold text-xs flex items-center gap-1.5">
                            {act.name}
                            <span className="text-[9px] text-slate-400 font-mono">ID: {act.id.slice(0, 8)}...</span>
                          </h4>
                          <p className="text-slate-500 text-[11px] leading-relaxed">
                            {act.description || "No description provided."}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteActivity(act.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition-colors border border-transparent hover:border-red-100 cursor-pointer flex-shrink-0"
                          title="Delete Activity from Database"
                        >
                          <FiTrash2 size={13} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

      </main>

    </div>
  );
}
