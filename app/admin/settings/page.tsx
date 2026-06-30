"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  FiPieChart, 
  FiCalendar, 
  FiLayers, 
  FiTag, 
  FiCompass, 
  FiSettings,
  FiLayout,
  FiImage,
  FiUsers,
  FiUploadCloud,
  FiTrash2,
  FiUserPlus,
  FiCheckCircle,
  FiAlertCircle,
  FiLock,
  FiMail,
  FiUser,
  FiUserCheck
} from "react-icons/fi";

interface Config {
  systemName: string;
  logoUrl: string;
  themeColor: string;
}

interface GalleryImage {
  id: string;
  name: string;
  url: string;
  filePath: string;
}

interface User {
  id: string;
  username: string;
  name: string | null;
  role: string;
  createdAt: string;
}

export default function AdminSettingsPage() {
  // Navigation active tab inside settings page
  const [settingsTab, setSettingsTab] = useState<"branding" | "gallery" | "team">("branding");

  // Loaders & Alerts
  const [loading, setLoading] = useState(true);
  const [brandingSaving, setBrandingSaving] = useState(false);
  const [galleryUploading, setGalleryUploading] = useState(false);
  const [userCreating, setUserCreating] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Dynamic state stores
  const [config, setConfig] = useState<Config>({
    systemName: "Mandil Farmhouse",
    logoUrl: "/boat-safari.png",
    themeColor: "emerald",
  });
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  // Add User Form States
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [userRole, setUserRole] = useState("SUPER_ADMIN");

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        // Fetch configurations
        const configRes = await fetch("/api/admin/config");
        const configData = await configRes.json();
        if (configData.success && configData.config) {
          setConfig(configData.config);
        }

        // Fetch gallery images
        const galleryRes = await fetch("/api/admin/gallery");
        const galleryData = await galleryRes.json();
        if (galleryData.success && galleryData.images) {
          setGallery(galleryData.images);
        }

        // Fetch users
        const usersRes = await fetch("/api/admin/users");
        const usersData = await usersRes.json();
        if (usersData.success && usersData.users) {
          setUsers(usersData.users);
        }
      } catch (error) {
        console.error("Failed to load settings data:", error);
        triggerNotification("error", "Failed to retrieve system settings from server.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const triggerNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // ─── Save Branding Config Handler ──────────────────────────────────────────
  const handleSaveBranding = async (e: React.FormEvent) => {
    e.preventDefault();
    setBrandingSaving(true);
    try {
      const res = await fetch("/api/admin/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      if (data.success) {
        triggerNotification("success", "Branding preferences saved successfully.");
      } else {
        triggerNotification("error", data.error || "Failed to save branding configurations.");
      }
    } catch (err) {
      triggerNotification("error", "Network error. Failed to save branding details.");
    } finally {
      setBrandingSaving(false);
    }
  };

  // ─── Gallery Image Upload Handler ──────────────────────────────────────────
  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setGalleryUploading(true);
    const formData = new FormData();
    formData.append("file", files[0]);

    try {
      const res = await fetch("/api/admin/gallery", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.image) {
        setGallery((prev) => [data.image, ...prev]);
        triggerNotification("success", `Image "${files[0].name}" uploaded to gallery.`);
      } else {
        triggerNotification("error", data.error || "Failed to upload image.");
      }
    } catch (err) {
      triggerNotification("error", "Error uploading image to storage.");
    } finally {
      setGalleryUploading(false);
      // Reset input element
      e.target.value = "";
    }
  };

  // ─── Delete Gallery Image Handler ──────────────────────────────────────────
  const handleDeleteGalleryItem = async (img: GalleryImage) => {
    if (!confirm(`Are you sure you want to delete image "${img.name}" from the gallery?`)) return;

    try {
      const res = await fetch(`/api/admin/gallery?name=${encodeURIComponent(img.name)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setGallery((prev) => prev.filter((item) => item.id !== img.id));
        triggerNotification("success", "Image removed from gallery.");
      } else {
        triggerNotification("error", data.error || "Failed to delete image.");
      }
    } catch (err) {
      triggerNotification("error", "Error deleting image from storage.");
    }
  };

  // ─── Create User Handler ───────────────────────────────────────────────────
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !username || !password) {
      triggerNotification("error", "Please fill in all team member credentials.");
      return;
    }

    setUserCreating(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fullName,
          username,
          password,
          role: userRole,
        }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUsers((prev) => [data.user, ...prev]);
        setFullName("");
        setUsername("");
        setPassword("");
        triggerNotification("success", `Team member "${fullName}" added successfully.`);
      } else {
        triggerNotification("error", data.error || "Failed to create team member.");
      }
    } catch (err) {
      triggerNotification("error", "Error creating team member.");
    } finally {
      setUserCreating(false);
    }
  };

  // ─── Delete User Handler ───────────────────────────────────────────────────
  const handleDeleteUser = async (user: User) => {
    if (!confirm(`Are you sure you want to revoke admin dashboard access for "${user.name || user.username}"?`)) return;

    try {
      const res = await fetch(`/api/admin/users?id=${user.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setUsers((prev) => prev.filter((u) => u.id !== user.id));
        triggerNotification("success", "User credentials revoked.");
      } else {
        triggerNotification("error", data.error || "Failed to revoke access.");
      }
    } catch (err) {
      triggerNotification("error", "Error deleting user.");
    }
  };

  // Dynamic Theme Color Swatches helper styling
  const colorSwatches = [
    { name: "emerald", label: "Resort Emerald Green", colorHex: "#00966B" },
    { name: "teal", label: "Deep Sea Teal", colorHex: "#008080" },
    { name: "blue", label: "Ocean Blue", colorHex: "#1D4ED8" },
    { name: "olive", label: "Earthy Olive", colorHex: "#556B2F" }
  ];

  return (
    <div className="flex flex-1 w-full min-h-screen bg-slate-50">
      
      {/* ─── SIDEBAR NAVIGATION ─────────────────────────────────────────────── */}
      <aside className="w-64 min-h-screen bg-white border-r border-slate-200 flex flex-col p-6 sticky top-16">
        <nav className="flex-1 space-y-2.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block px-4 mb-4">
            Resort Management
          </span>

          <Link
            href="/admin/dashboard"
            className="w-full flex items-center gap-3 px-4 py-3 text-xs font-semibold rounded-xl border transition-all duration-200 cursor-pointer bg-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-transparent"
          >
            <FiPieChart size={15} />
            Dashboard Overview
          </Link>

          <Link
            href="/admin/dashboard?tab=bookings"
            className="w-full flex items-center gap-3 px-4 py-3 text-xs font-semibold rounded-xl border transition-all duration-200 cursor-pointer bg-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-transparent"
          >
            <FiCalendar size={15} />
            Reservations Console
          </Link>

          <Link
            href="/admin/dashboard?tab=packages"
            className="w-full flex items-center gap-3 px-4 py-3 text-xs font-semibold rounded-xl border transition-all duration-200 cursor-pointer bg-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-transparent"
          >
            <FiLayers size={15} />
            Lakeside Packages
          </Link>

          <Link
            href="/admin/dashboard?tab=assets"
            className="w-full flex items-center gap-3 px-4 py-3 text-xs font-semibold rounded-xl border transition-all duration-200 cursor-pointer bg-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-transparent"
          >
            <FiTag size={15} />
            Assets &amp; Add-ons
          </Link>

          <Link
            href="/admin/dashboard?tab=activities"
            className="w-full flex items-center gap-3 px-4 py-3 text-xs font-semibold rounded-xl border transition-all duration-200 cursor-pointer bg-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-transparent"
          >
            <FiCompass size={15} />
            Resort Activities
          </Link>

          <div className="pt-2.5 mt-2.5 border-t border-slate-100">
            <Link
              href="/admin/settings"
              className="w-full flex items-center gap-3 px-4 py-3 text-xs font-semibold rounded-xl border transition-all duration-200 cursor-pointer bg-emerald-50 text-emerald-800 border-emerald-100/70"
            >
              <FiSettings size={15} />
              System Settings
            </Link>
          </div>
        </nav>
      </aside>

      {/* ─── MAIN WORKSPACE CONTENT ─────────────────────────────────────────── */}
      <main className="flex-1 bg-slate-50 p-8 w-full min-h-screen flex flex-col items-start space-y-6 overflow-y-auto">
        
        {/* Header Title */}
        <div className="w-full flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">System Settings</h2>
            <p className="text-slate-500 text-xs mt-1">Configure resort branding, media library, and dashboard team credentials.</p>
          </div>

          {/* Toast Notification Banner */}
          {notification && (
            <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border shadow-sm text-xs font-semibold animate-fade-in ${
              notification.type === "success" 
                ? "bg-emerald-50 text-emerald-805 border-emerald-200" 
                : "bg-red-50 text-red-800 border-red-200"
            }`}>
              {notification.type === "success" ? <FiCheckCircle /> : <FiAlertCircle />}
              <span>{notification.message}</span>
            </div>
          )}
        </div>

        {/* State-based Tab Bar */}
        <div className="w-full border-b border-slate-200 flex gap-1 mb-2 bg-white px-2 py-1.5 rounded-2xl shadow-xs">
          <button
            onClick={() => setSettingsTab("branding")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-200 cursor-pointer ${
              settingsTab === "branding"
                ? "bg-emerald-50 text-emerald-800"
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
            }`}
          >
            <FiLayout />
            Appearance &amp; Branding
          </button>
          <button
            onClick={() => setSettingsTab("gallery")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-200 cursor-pointer ${
              settingsTab === "gallery"
                ? "bg-emerald-50 text-emerald-800"
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
            }`}
          >
            <FiImage />
            Media Gallery
          </button>
          <button
            onClick={() => setSettingsTab("team")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-200 cursor-pointer ${
              settingsTab === "team"
                ? "bg-emerald-50 text-emerald-800"
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
            }`}
          >
            <FiUsers />
            Team Management
          </button>
        </div>

        {/* ─── Loading Skeletons ────────────────────────────────────────────── */}
        {loading ? (
          <div className="w-full space-y-6">
            <div className="bg-white border border-slate-200 rounded-3xl p-8 h-96 animate-pulse" />
          </div>
        ) : (
          <div className="w-full">
            
            {/* ─── TAB 1: APPEARANCE & BRANDING ─────────────────────────────── */}
            {settingsTab === "branding" && (
              <form onSubmit={handleSaveBranding} className="w-full bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-xs space-y-8 text-left">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Branding Preferences</h3>
                  <p className="text-slate-400 text-xs mt-0.5">Customize global display details and color palette across the website.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* System Name */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">System / Resort Name</label>
                    <input
                      type="text"
                      value={config.systemName}
                      onChange={(e) => setConfig({ ...config, systemName: e.target.value })}
                      placeholder="e.g. Mandil Farmhouse"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-emerald-600 transition-colors text-sm"
                      required
                    />
                  </div>

                  {/* Theme Color Picker Grid */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Primary Theme Color Swatch</label>
                    <div className="grid grid-cols-2 gap-3">
                      {colorSwatches.map((swatch) => {
                        const isSelected = config.themeColor === swatch.name;
                        return (
                          <button
                            key={swatch.name}
                            type="button"
                            onClick={() => setConfig({ ...config, themeColor: swatch.name })}
                            className={`flex items-center gap-2.5 p-3 rounded-xl border text-left cursor-pointer transition-all duration-200 ${
                              isSelected 
                                ? "border-[#00966B] bg-emerald-50/20 shadow-2xs font-semibold text-[#00966B]" 
                                : "border-slate-200 bg-white text-slate-600 hover:border-slate-350"
                            }`}
                          >
                            <span 
                              className="w-4 h-4 rounded-full border border-slate-100 flex-shrink-0"
                              style={{ backgroundColor: swatch.colorHex }}
                            />
                            <span className="text-xs truncate">{swatch.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Submit Action */}
                <div className="flex items-center justify-end border-t border-slate-100 pt-6">
                  <button
                    type="submit"
                    disabled={brandingSaving}
                    className="px-5 py-3 rounded-xl bg-[#00966B] hover:bg-[#007c58] text-white font-bold text-xs transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
                  >
                    {brandingSaving ? "Saving Config..." : "Save Branding"}
                  </button>
                </div>
              </form>
            )}

            {/* ─── TAB 2: MEDIA GALLERY MANAGER ─────────────────────────────── */}
            {settingsTab === "gallery" && (
              <div className="w-full bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-xs space-y-6 text-left">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Resort Media Gallery</h3>
                  <p className="text-slate-400 text-xs mt-0.5">Upload guest website gallery assets directly to the Supabase cloud bucket.</p>
                </div>

                {/* Drag-and-drop Media Uploader Box */}
                <div className="relative border-2 border-dashed border-slate-250 hover:border-[#00966B] bg-slate-50 hover:bg-emerald-50/10 rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all duration-200 group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleGalleryUpload}
                    disabled={galleryUploading}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <FiUploadCloud className="text-3xl text-slate-400 group-hover:text-[#00966B] transition-colors mb-3" />
                  <span className="text-xs font-semibold text-slate-800">
                    {galleryUploading ? "Uploading file..." : "Click or drag &amp; drop to upload file"}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-1">PNG, JPG, WEBP up to 5MB</span>
                </div>

                {/* Gallery Images Preview Grid */}
                {gallery.length === 0 ? (
                  <div className="py-12 text-center text-slate-405 border border-slate-100 rounded-2xl text-xs">
                    No images uploaded to this bucket gallery yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-6">
                    {gallery.map((img) => (
                      <div 
                        key={img.id} 
                        className="relative aspect-square rounded-xl overflow-hidden border border-slate-200/60 shadow-2xs bg-slate-100 group"
                      >
                        <Image
                          src={img.url}
                          alt={img.name}
                          fill
                          className="object-cover group-hover:scale-102 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-slate-950/0 group-hover:bg-slate-950/40 transition-all duration-300" />
                        
                        {/* Delete Trash Button */}
                        <button
                          onClick={() => handleDeleteGalleryItem(img)}
                          className="absolute top-2 right-2 w-7 h-7 bg-white/90 hover:bg-red-50 border border-slate-200 hover:border-red-200 rounded-lg flex items-center justify-center text-slate-600 hover:text-red-600 shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer"
                          title="Delete image"
                        >
                          <FiTrash2 size={13} />
                        </button>

                        <div className="absolute bottom-2 left-2 right-2 bg-black/60 backdrop-blur-xs px-2 py-1 rounded text-[9px] text-white truncate max-w-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          {img.name}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ─── TAB 3: TEAM MANAGEMENT & ACCESS CONTROL ───────────────────── */}
            {settingsTab === "team" && (
              <div className="w-full space-y-6 text-left">
                
                {/* Add User Form Card */}
                <form onSubmit={handleCreateUser} className="w-full bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-xs space-y-6">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Add Team Credentials</h3>
                    <p className="text-slate-400 text-xs mt-0.5">Register new resort staff and set system role permissions.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Full Name */}
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400"><FiUserCheck className="text-sm" /></span>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Full Name"
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-emerald-600 transition-colors text-xs"
                        required
                      />
                    </div>

                    {/* Username */}
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400"><FiUser className="text-sm" /></span>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Email / Username"
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-emerald-600 transition-colors text-xs"
                        required
                      />
                    </div>

                    {/* Password */}
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400"><FiLock className="text-sm" /></span>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Secret Password"
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-emerald-600 transition-colors text-xs"
                        required
                      />
                    </div>

                    {/* Select Role */}
                    <div className="relative">
                      <select
                        value={userRole}
                        onChange={(e) => setUserRole(e.target.value)}
                        className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-650 focus:outline-none focus:border-emerald-600 transition-colors text-xs appearance-none"
                      >
                        <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                        <option value="RESORT_MANAGER">RESORT_MANAGER</option>
                        <option value="FRONT_DESK_STAFF">FRONT_DESK_STAFF</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-500">
                        ▼
                      </div>
                    </div>
                  </div>

                  {/* Form actions */}
                  <div className="flex items-center justify-end pt-2 border-t border-slate-50">
                    <button
                      type="submit"
                      disabled={userCreating}
                      className="px-5 py-3 rounded-xl bg-[#00966B] hover:bg-[#007c58] text-white font-bold text-xs transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                    >
                      <FiUserPlus />
                      <span>{userCreating ? "Creating User..." : "Add User"}</span>
                    </button>
                  </div>
                </form>

                {/* Team Members List Card */}
                <div className="w-full bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-xs space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 border-b border-slate-50 pb-2">
                    Active Team Members
                  </h3>

                  <div className="overflow-x-auto w-full">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 text-[10px] uppercase font-bold tracking-wider text-slate-400">
                          <th className="py-3 px-4">Full Name</th>
                          <th className="py-3 px-4">Email / Username</th>
                          <th className="py-3 px-4">Access Role</th>
                          <th className="py-3 px-4">Created Date</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 text-xs">
                        {users.map((user) => {
                          const isSuperAdmin = user.role === "SUPER_ADMIN";
                          const isManager = user.role === "RESORT_MANAGER";
                          
                          let badgeStyle = "bg-slate-50 text-slate-750 border-slate-205";
                          if (isSuperAdmin) {
                            badgeStyle = "bg-emerald-50 text-emerald-805 border-emerald-200";
                          } else if (isManager) {
                            badgeStyle = "bg-teal-50 text-teal-800 border-teal-200";
                          }

                          return (
                            <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="py-3 px-4 font-semibold text-slate-900">{user.name || "N/A"}</td>
                              <td className="py-3 px-4 text-slate-500 font-mono">{user.username}</td>
                              <td className="py-3 px-4">
                                <span className={`px-2 py-0.5 rounded-md border text-[9px] font-bold ${badgeStyle}`}>
                                  {user.role}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-slate-400">
                                {new Date(user.createdAt).toLocaleDateString()}
                              </td>
                              <td className="py-3 px-4 text-right">
                                <button
                                  onClick={() => handleDeleteUser(user)}
                                  className="p-1.5 bg-transparent hover:bg-red-50 text-slate-400 hover:text-red-650 border border-transparent hover:border-red-100 rounded-lg transition-colors cursor-pointer"
                                  title="Revoke User Access"
                                >
                                  <FiTrash2 size={13} />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

          </div>
        )}

      </main>

    </div>
  );
}
