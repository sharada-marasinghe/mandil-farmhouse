"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import { 
  FiCalendar, 
  FiSettings, 
  FiCamera, 
  FiLoader, 
  FiCheckCircle, 
  FiAlertCircle,
  FiChevronDown,
  FiChevronUp,
  FiPhone,
  FiMapPin,
  FiLock,
  FiPlus,
  FiHelpCircle
} from "react-icons/fi";

interface Booking {
  id: string;
  bookingNumber: string;
  status: string;
  guestName: string;
  guestPhone: string;
  bookingDate: string;
  numberOfGuests: number;
  totalPrice: number;
  package: {
    name: string;
  };
}

interface Profile {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  avatarUrl: string | null;
}

export default function GuestDashboardPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  // Tab State
  const [activeTab, setActiveTab] = useState<"bookings" | "settings">("bookings");

  // Loaders & Errors
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Expandable Change Password state
  const [showPasswordSection, setShowPasswordSection] = useState(false);

  // Dynamic state stores
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [profile, setProfile] = useState<Profile>({
    id: "",
    name: "",
    email: "",
    phone: "",
    city: "",
    avatarUrl: null,
  });

  // Password fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // Route auth protection
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Load Dashboard Data
  useEffect(() => {
    if (status !== "authenticated") return;

    async function loadData() {
      try {
        setLoading(true);
        // Fetch user profile info
        const profileRes = await fetch("/api/guest/profile");
        const profileData = await profileRes.json();
        if (profileData.success && profileData.profile) {
          setProfile(profileData.profile);
        }

        // Fetch bookings
        const bookingsRes = await fetch("/api/guest/bookings");
        const bookingsData = await bookingsRes.json();
        if (bookingsData.success && bookingsData.bookings) {
          setBookings(bookingsData.bookings);
        }
      } catch (err) {
        console.error("Error loading dashboard data:", err);
        showToast("error", "Failed to retrieve guest data from server.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [status]);

  const showToast = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // Avatar Upload Handler
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setAvatarUploading(true);
    const formData = new FormData();
    formData.append("file", files[0]);

    try {
      const res = await fetch("/api/guest/avatar", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.avatarUrl) {
        // Update local profile state
        setProfile((prev) => ({ ...prev, avatarUrl: data.avatarUrl }));
        
        // Save the updated profile to the DB
        await fetch("/api/guest/profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...profile, avatarUrl: data.avatarUrl }),
        });

        // Trigger session refresh to update the navbar avatar
        await update();
        showToast("success", "Profile picture updated successfully.");
      } else {
        showToast("error", data.error || "Failed to upload avatar image.");
      }
    } catch (err) {
      showToast("error", "An error occurred while uploading avatar.");
    } finally {
      setAvatarUploading(false);
    }
  };

  // Save Settings Handler
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch("/api/guest/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profile.name,
          phone: profile.phone,
          city: profile.city,
          avatarUrl: profile.avatarUrl,
          currentPassword: showPasswordSection ? currentPassword : null,
          newPassword: showPasswordSection ? newPassword : null,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setProfile(data.profile);
        setCurrentPassword("");
        setNewPassword("");
        setShowPasswordSection(false);
        await update(); // refresh navbar details
        showToast("success", "Personal details updated successfully.");
      } else {
        showToast("error", data.error || "Failed to update profile details.");
      }
    } catch (err) {
      showToast("error", "An error occurred while saving profile settings.");
    } finally {
      setSaving(false);
    }
  };

  // Mock Invoice Download
  const handleDownloadInvoice = (booking: Booking) => {
    alert(`Downloading invoice details for Booking #${booking.bookingNumber}\nPackage: ${booking.package.name}\nTotal: LKR ${booking.totalPrice.toLocaleString()}`);
  };

  // Count Statistics
  const totalBookings = bookings.length;
  const upcomingStays = bookings.filter(b => b.status === "CONFIRMED" && new Date(b.bookingDate) >= new Date()).length;
  const completedStays = bookings.filter(b => b.status === "COMPLETED" || new Date(b.bookingDate) < new Date()).length;

  // Render Skeletons during Loading
  if (status === "loading" || loading) {
    return (
      <div className="w-full min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <main className="flex-grow max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
          <div className="h-8 w-48 bg-slate-200 rounded-lg animate-pulse" />
          <div className="h-4 w-96 bg-slate-200 rounded-lg animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            <div className="h-28 bg-white border border-slate-200 rounded-3xl animate-pulse" />
            <div className="h-28 bg-white border border-slate-200 rounded-3xl animate-pulse" />
            <div className="h-28 bg-white border border-slate-200 rounded-3xl animate-pulse" />
          </div>
          <div className="h-96 bg-white border border-slate-200 rounded-3xl animate-pulse" />
        </main>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-grow max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-left">
        
        {/* Toast Alert Banner */}
        {notification && (
          <div className={`fixed top-20 right-6 flex items-center gap-2 px-4 py-3 rounded-xl border shadow-lg text-xs font-semibold z-50 animate-fade-in ${
            notification.type === "success" 
              ? "bg-emerald-50 text-emerald-805 border-emerald-200" 
              : "bg-red-50 text-red-800 border-red-200"
          }`}>
            {notification.type === "success" ? <FiCheckCircle /> : <FiAlertCircle />}
            <span>{notification.message}</span>
          </div>
        )}

        {/* Dashboard Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/60 pb-5">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Guest Portal</h1>
            <p className="text-slate-500 text-xs mt-1">Manage your private bookings, day tours, and tailored lakeside safaris.</p>
          </div>

          {/* Action Tabs Selector */}
          <div className="flex bg-white p-1 rounded-xl border border-slate-200/60 shadow-2xs self-start sm:self-center">
            <button
              onClick={() => setActiveTab("bookings")}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer ${
                activeTab === "bookings"
                  ? "bg-emerald-50 text-emerald-800"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
              }`}
            >
              <FiCalendar />
              My Reservations
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer ${
                activeTab === "settings"
                  ? "bg-emerald-50 text-emerald-800"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
              }`}
            >
              <FiSettings />
              Personal Settings
            </button>
          </div>
        </div>

        {/* ─── TAB 1: MY RESERVATIONS ──────────────────────────────────────── */}
        {activeTab === "bookings" && (
          <div className="space-y-6">
            
            {/* Summary Statistics row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="bg-white border border-slate-200/50 rounded-2xl p-5 shadow-2xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Bookings</span>
                <span className="text-2xl font-black text-slate-900 mt-1 block">{totalBookings}</span>
              </div>
              <div className="bg-white border border-slate-200/50 rounded-2xl p-5 shadow-2xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Upcoming Safaris</span>
                <span className="text-2xl font-black text-slate-900 mt-1 block">{upcomingStays}</span>
              </div>
              <div className="bg-white border border-slate-200/50 rounded-2xl p-5 shadow-2xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Completed Stays</span>
                <span className="text-2xl font-black text-slate-900 mt-1 block">{completedStays}</span>
              </div>
            </div>

            {/* Bookings List container */}
            {bookings.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center flex flex-col items-center justify-center max-w-2xl mx-auto shadow-2xs">
                <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-[#00966B] mb-4">
                  <FiCalendar size={28} />
                </div>
                <h3 className="text-base font-bold text-slate-900">No Reservations Yet</h3>
                <p className="text-slate-450 text-xs mt-1.5 max-w-sm leading-relaxed">
                  You haven't scheduled any experiences with us. Glide across the peaceful waters of Bolgoda Lake on a curated safari.
                </p>
                <Link
                  href="/packages"
                  className="mt-6 px-5 py-3 bg-[#00966B] hover:bg-[#007c58] text-white text-xs font-bold rounded-xl transition-colors shadow-sm flex items-center gap-1.5"
                >
                  <FiPlus />
                  Explore Our Packages
                </Link>
              </div>
            ) : (
              <div className="bg-white border border-slate-200/60 rounded-3xl overflow-hidden shadow-2xs">
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] uppercase font-bold tracking-wider text-slate-400">
                        <th className="py-4 px-6">Booking Number</th>
                        <th className="py-4 px-6">Package Name</th>
                        <th className="py-4 px-6">Reservation Date</th>
                        <th className="py-4 px-6">Total Price</th>
                        <th className="py-4 px-6">Status</th>
                        <th className="py-4 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {bookings.map((booking) => {
                        const statusClass = 
                          booking.status === "CONFIRMED" ? "bg-emerald-50 text-emerald-805 border-emerald-200" :
                          booking.status === "PENDING" ? "bg-yellow-50 text-yellow-700 border-yellow-250" :
                          "bg-slate-100 text-slate-550 border-slate-200";

                        return (
                          <tr key={booking.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-4 px-6 font-mono font-bold text-slate-900">{booking.bookingNumber}</td>
                            <td className="py-4 px-6 font-semibold text-slate-800">{booking.package.name}</td>
                            <td className="py-4 px-6 text-slate-500">
                              {new Date(booking.bookingDate).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric"
                              })}
                            </td>
                            <td className="py-4 px-6 font-semibold text-slate-900">
                              LKR {booking.totalPrice.toLocaleString()}
                            </td>
                            <td className="py-4 px-6">
                              <span className={`px-2 py-0.5 rounded-md border text-[9px] font-bold ${statusClass}`}>
                                {booking.status}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-right space-x-2">
                              <button
                                onClick={() => handleDownloadInvoice(booking)}
                                className="px-3 py-1.5 border border-slate-200 hover:border-emerald-600 hover:text-emerald-700 rounded-lg text-slate-650 transition-colors text-[10px] font-bold cursor-pointer"
                              >
                                Invoice
                              </button>
                              <a
                                href="/contact"
                                className="px-3 py-1.5 bg-[#00966B]/5 hover:bg-[#00966B]/10 text-[#00966B] rounded-lg text-[10px] font-bold transition-colors inline-block"
                              >
                                Help
                              </a>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ─── TAB 2: PERSONAL SETTINGS ────────────────────────────────────── */}
        {activeTab === "settings" && (
          <form onSubmit={handleSaveSettings} className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-2xs space-y-8">
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
              
              {/* Profile Avatar Image uploader block */}
              <div className="relative w-24 h-24 rounded-full overflow-hidden border border-slate-200 shadow-xs group flex-shrink-0">
                {profile.avatarUrl ? (
                  <Image
                    src={profile.avatarUrl}
                    alt={profile.name || "Avatar"}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-emerald-100 text-emerald-800 font-bold text-xl flex items-center justify-center">
                    {profile.name ? profile.name.charAt(0).toUpperCase() : "G"}
                  </div>
                )}

                {/* Hover Camera Icon overlay */}
                <label className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white text-[9px] font-bold opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  {avatarUploading ? (
                    <FiLoader className="text-base animate-spin" />
                  ) : (
                    <>
                      <FiCamera className="text-base mb-0.5" />
                      <span>Change Photo</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    disabled={avatarUploading}
                    className="hidden"
                  />
                </label>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900">Guest Credentials &amp; Profile</h3>
                <p className="text-slate-400 text-xs mt-0.5">Upload a custom profile photo and manage contact parameters.</p>
              </div>
            </div>

            {/* Profile fields grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Full Name</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  placeholder="John Doe"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-[#00966B] transition-colors text-xs"
                  required
                />
              </div>

              {/* Email Address (disabled / Read-Only) */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Email Address (Read-only)</label>
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-450 text-xs cursor-not-allowed select-none"
                />
              </div>

              {/* WhatsApp Phone Number */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">WhatsApp / Phone Number</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400"><FiPhone className="text-xs" /></span>
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    placeholder="e.g. 0771234567"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-[#00966B] transition-colors text-xs"
                  />
                </div>
              </div>

              {/* Country / City Location */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Country / City</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400"><FiMapPin className="text-xs" /></span>
                  <input
                    type="text"
                    value={profile.city}
                    onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                    placeholder="e.g. Colombo, Sri Lanka"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-[#00966B] transition-colors text-xs"
                  />
                </div>
              </div>

            </div>

            {/* Security Change Password Expandable Section */}
            <div className="border-t border-slate-100 pt-6">
              <button
                type="button"
                onClick={() => setShowPasswordSection(!showPasswordSection)}
                className="flex items-center justify-between w-full py-2 text-slate-700 hover:text-slate-900 font-bold text-xs select-none cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <FiLock />
                  Change Account Password
                </span>
                {showPasswordSection ? <FiChevronUp /> : <FiChevronDown />}
              </button>

              {showPasswordSection && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 animate-fade-in">
                  <div className="space-y-1.5">
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Current Password"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-[#00966B] transition-colors text-xs"
                      required={showPasswordSection}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="New Password"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-[#00966B] transition-colors text-xs"
                      required={showPasswordSection}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Save details button */}
            <div className="flex items-center justify-end pt-4 border-t border-slate-100">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-3 rounded-xl bg-[#00966B] hover:bg-[#007c58] text-white font-bold text-xs transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
              >
                {saving && <FiLoader className="animate-spin" />}
                <span>{saving ? "Saving Changes..." : "Save Changes"}</span>
              </button>
            </div>

          </form>
        )}

      </main>
    </div>
  );
}
