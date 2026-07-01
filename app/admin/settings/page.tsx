"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import AdminSidebar from "@/app/admin/dashboard/AdminSidebar";
import { useBranding } from "@/app/components/BrandingProvider";
import { 
  FiUploadCloud,
  FiTrash2,
  FiCheckCircle,
  FiAlertCircle
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

export default function AdminSettingsPage() {
  const { updateConfig } = useBranding();
  const [settingsTab, setSettingsTab] = useState<"branding" | "gallery">("branding");
  const [loading, setLoading] = useState(true);
  const [brandingSaving, setBrandingSaving] = useState(false);
  const [galleryUploading, setGalleryUploading] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [config, setConfig] = useState<Config>({
    systemName: "Mandil Farmhouse",
    logoUrl: "/boat-safari.png",
    themeColor: "emerald",
  });
  const [gallery, setGallery] = useState<GalleryImage[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const configRes = await fetch("/api/admin/config");
        const configData = await configRes.json();
        if (configData.success && configData.config) setConfig(configData.config);

        const galleryRes = await fetch("/api/admin/gallery");
        const galleryData = await galleryRes.json();
        if (galleryData.success && galleryData.images) setGallery(galleryData.images);
      } catch (error) {
        triggerNotification("error", "Failed to retrieve system settings.");
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
        updateConfig(data.config);
        triggerNotification("success", "Branding preferences saved successfully.");
      } else {
        triggerNotification("error", data.error || "Failed to save branding.");
      }
    } catch {
      triggerNotification("error", "Network error saving branding.");
    } finally {
      setBrandingSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setLogoUploading(true);
    const formData = new FormData();
    formData.append("file", files[0]);
    try {
      const res = await fetch("/api/admin/upload-logo", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success && data.url) {
        setConfig((prev) => ({ ...prev, logoUrl: data.url }));
        triggerNotification("success", "Logo image uploaded successfully. Click Save to apply.");
      } else {
        triggerNotification("error", data.error || "Logo upload failed.");
      }
    } catch {
      triggerNotification("error", "Error uploading logo.");
    } finally {
      setLogoUploading(false);
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setGalleryUploading(true);
    const formData = new FormData();
    formData.append("file", files[0]);
    try {
      const res = await fetch("/api/admin/gallery", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success && data.image) {
        setGallery((prev) => [data.image, ...prev]);
        triggerNotification("success", `Image "${files[0].name}" uploaded.`);
      } else {
        triggerNotification("error", data.error || "Upload failed.");
      }
    } catch {
      triggerNotification("error", "Error uploading image.");
    } finally {
      setGalleryUploading(false);
      e.target.value = "";
    }
  };

  const handleDeleteGalleryItem = async (img: GalleryImage) => {
    if (!confirm(`Delete "${img.name}"?`)) return;
    try {
      const res = await fetch(`/api/admin/gallery?name=${encodeURIComponent(img.name)}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setGallery((prev) => prev.filter((item) => item.id !== img.id));
        triggerNotification("success", "Image removed.");
      } else {
        triggerNotification("error", data.error || "Delete failed.");
      }
    } catch {
      triggerNotification("error", "Error deleting image.");
    }
  };

  const colorSwatches = [
    { name: "emerald", label: "Resort Emerald", colorHex: "#00966B" },
    { name: "teal", label: "Deep Sea Teal", colorHex: "#008080" },
    { name: "blue", label: "Ocean Blue", colorHex: "#1D4ED8" },
    { name: "olive", label: "Earthy Olive", colorHex: "#556B2F" }
  ];

  return (
    <div className="p-8 space-y-6 w-full">

        {/* Header */}
        <div className="w-full flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">System Settings</h2>
            <p className="text-slate-400 text-xs mt-1">Configure resort branding and upload media gallery assets.</p>
          </div>
          {notification && (
            <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border shadow-sm text-xs font-semibold ${
              notification.type === "success"
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-red-50 text-red-800 border-red-200"
            }`}>
              {notification.type === "success" ? <FiCheckCircle /> : <FiAlertCircle />}
              <span>{notification.message}</span>
            </div>
          )}
        </div>

        {/* Tab Bar */}
        <div className="w-full flex gap-1 bg-white px-2 py-1.5 rounded-2xl border border-slate-100 shadow-xs">
          {(["branding", "gallery"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setSettingsTab(tab)}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-200 cursor-pointer ${
                settingsTab === tab
                  ? "bg-emerald-50 text-emerald-800"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
              }`}
            >
              {tab === "branding" ? "Appearance & Branding" : "Media Gallery"}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="w-full bg-white border border-slate-100 rounded-3xl p-8 h-96 animate-pulse" />
        ) : (
          <div className="w-full">

            {/* Branding Tab */}
            {settingsTab === "branding" && (
              <form onSubmit={handleSaveBranding} className="w-full bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-xs space-y-8 text-left">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Branding Preferences</h3>
                  <p className="text-slate-400 text-xs mt-0.5">Customize the global display name and primary color palette.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Resort Name</label>
                    <input
                      type="text"
                      value={config.systemName}
                      onChange={(e) => setConfig({ ...config, systemName: e.target.value })}
                      placeholder="Mandil Farmhouse"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-emerald-500 transition-colors text-sm"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Theme Color</label>
                    <div className="grid grid-cols-2 gap-3">
                      {colorSwatches.map((swatch) => (
                        <button
                          key={swatch.name}
                          type="button"
                          onClick={() => setConfig({ ...config, themeColor: swatch.name })}
                          className={`flex items-center gap-2.5 p-3 rounded-xl border text-left cursor-pointer transition-all duration-200 ${
                            config.themeColor === swatch.name
                              ? "border-emerald-400 bg-emerald-50/30 text-emerald-800 font-semibold"
                              : "border-slate-200 bg-white text-slate-650 hover:border-slate-300"
                          }`}
                        >
                          <span className="w-4 h-4 rounded-full flex-shrink-0 border border-white/50 shadow-sm" style={{ backgroundColor: swatch.colorHex }} />
                          <span className="text-xs truncate">{swatch.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 col-span-1 md:col-span-2 border-t border-slate-100 pt-6">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">Resort Logo</label>
                    <div className="flex items-center gap-6 mt-2">
                      <div className="relative w-16 h-16 rounded-xl border border-slate-200 overflow-hidden bg-slate-50 flex items-center justify-center">
                        {config.logoUrl ? (
                          <Image
                            src={config.logoUrl}
                            alt="Resort Logo"
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <span className="text-slate-300 text-xs">No Logo</span>
                        )}
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 cursor-pointer transition-colors w-fit">
                          {logoUploading ? "Uploading..." : "Upload Logo Image"}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            disabled={logoUploading}
                            className="hidden"
                          />
                        </label>
                        <p className="text-[10px] text-slate-400">PNG, JPG, WEBP recommended. Translucent backgrounds look best.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end border-t border-slate-100 pt-6">
                  <button
                    type="submit"
                    disabled={brandingSaving}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
                  >
                    {brandingSaving ? "Saving…" : "Save Branding"}
                  </button>
                </div>
              </form>
            )}

            {/* Gallery Tab */}
            {settingsTab === "gallery" && (
              <div className="w-full bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-xs space-y-6 text-left">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Resort Media Gallery</h3>
                  <p className="text-slate-400 text-xs mt-0.5">Upload gallery assets to the Supabase cloud bucket.</p>
                </div>

                <div className="relative border-2 border-dashed border-slate-200 hover:border-emerald-400 bg-slate-50 hover:bg-emerald-50/10 rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all duration-200 group">
                  <input type="file" accept="image/*" onChange={handleGalleryUpload} disabled={galleryUploading} className="absolute inset-0 opacity-0 cursor-pointer" />
                  <FiUploadCloud className="text-3xl text-slate-400 group-hover:text-emerald-600 transition-colors mb-3" />
                  <span className="text-xs font-semibold text-slate-800">
                    {galleryUploading ? "Uploading…" : "Click or drag & drop to upload"}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-1">PNG, JPG, WEBP up to 5MB</span>
                </div>

                {gallery.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 border border-slate-100 rounded-2xl text-xs">
                    No images uploaded yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-6">
                    {gallery.map((img) => (
                      <div key={img.id} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200/60 bg-slate-100 group">
                        <Image src={img.url} alt={img.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-slate-950/0 group-hover:bg-slate-950/40 transition-all duration-300" />
                        <button
                          onClick={() => handleDeleteGalleryItem(img)}
                          className="absolute top-2 right-2 w-7 h-7 bg-white/90 hover:bg-red-50 border border-slate-200 hover:border-red-200 rounded-lg flex items-center justify-center text-slate-600 hover:text-red-600 shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer"
                          title="Delete image"
                        >
                          <FiTrash2 size={13} />
                        </button>
                        <div className="absolute bottom-2 left-2 right-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-[9px] text-white truncate opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          {img.name}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
  );
}
