"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import {
  FiSearch,
  FiPlus,
  FiUploadCloud,
  FiTrash2,
  FiStar,
  FiLayers,
  FiClock,
  FiUsers,
  FiEdit,
  FiImage,
  FiCheck,
  FiX,
  FiPlusCircle,
} from "react-icons/fi";
import "md-editor-rt/lib/style.css";
import "md-editor-rt/lib/preview.css";

const MdEditor = dynamic(() => import("md-editor-rt").then((mod) => mod.MdEditor), {
  ssr: false,
});
const MdPreview = dynamic(() => import("md-editor-rt").then((mod) => mod.MdPreview), {
  ssr: false,
});

interface Package {
  id: string;
  name: string;
  description: string | null;
  basePrice: number;
  pricingModel: string;
  isActive: boolean;
  images?: string[];
  whatsIncluded?: string[];
  whatsExcluded?: string[];
  timeline?: any;
  aboutMarkdown?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Amenity {
  id: string;
  name: string;
  price: number;
  billingType: string;
}

interface Activity {
  id: string;
  name: string;
  description: string | null;
}

interface PackagesClientProps {
  initialPackages: Package[];
  amenities: Amenity[];
  activities: Activity[];
}

export default function PackagesClient({
  initialPackages,
  amenities,
  activities,
}: PackagesClientProps) {
  const [packages, setPackages] = useState<Package[]>(initialPackages);
  const [packageMeta, setPackageMeta] = useState<
    Record<
      string,
      {
        duration: string;
        capacity: string;
        isPopular: boolean;
        images: string[];
        assets?: string[];
        activities?: string[];
      }
    >
  >({});

  // Form States
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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  
  // Rich details states
  const [whatsIncluded, setWhatsIncluded] = useState<string[]>([]);
  const [whatsExcluded, setWhatsExcluded] = useState<string[]>([]);
  const [timeline, setTimeline] = useState<{ time: string; title: string; description: string }[]>([]);
  
  // Temporary input helper states
  const [includedInput, setIncludedInput] = useState("");
  const [excludedInput, setExcludedInput] = useState("");
  const [stepTime, setStepTime] = useState("");
  const [stepTitle, setStepTitle] = useState("");
  const [stepDesc, setStepDesc] = useState("");
  
  // Markdown states
  const [aboutMarkdown, setAboutMarkdown] = useState("");
  const [mdTab, setMdTab] = useState<"edit" | "preview">("edit");

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      const droppedFiles = Array.from(e.dataTransfer.files).filter((file) =>
        /\.(jpg|jpeg|png|webp|avif)$/i.test(file.name)
      );
      setPkgImages((prev) => [...prev, ...droppedFiles]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setPkgImages((prev) => [...prev, ...selectedFiles]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setPkgImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setPkgTitle("");
    setPkgDescription("");
    setPkgBasePrice("");
    setPkgDuration("");
    setPkgCapacity("");
    setPkgPricingModel("PER_PERSON");
    setPkgIsPopular(false);
    setPkgImages([]);
    setExistingImages([]);
    setSelectedAssets([]);
    setSelectedActivities([]);
    setWhatsIncluded([]);
    setWhatsExcluded([]);
    setTimeline([]);
    setIncludedInput("");
    setExcludedInput("");
    setStepTime("");
    setStepTitle("");
    setStepDesc("");
    setAboutMarkdown("");
    setMdTab("edit");
    setPkgError(null);
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
      formData.append("whatsIncluded", JSON.stringify(whatsIncluded));
      formData.append("whatsExcluded", JSON.stringify(whatsExcluded));
      formData.append("timeline", JSON.stringify(timeline));
      formData.append("aboutMarkdown", aboutMarkdown);

      pkgImages.forEach((file) => {
        formData.append("images", file);
      });

      let response;
      if (editingId) {
        formData.append("existingImages", JSON.stringify(existingImages));
        response = await fetch(`/api/packages/${editingId}`, {
          method: "PUT",
          body: formData,
        });
      } else {
        response = await fetch("/api/packages", {
          method: "POST",
          body: formData,
        });
      }

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || `Failed to ${editingId ? "update" : "create"} package.`);
      }

      const savedPkg = result.package;
      const finalImageUrls = savedPkg.images || [];

      const newMeta = {
        duration: pkgDuration.trim() || "N/A",
        capacity: pkgCapacity.trim() || "N/A",
        isPopular: pkgIsPopular,
        images: finalImageUrls,
        assets: selectedAssets
          .map((id) => amenities.find((a) => a.id === id)?.name)
          .filter(Boolean) as string[],
        activities: selectedActivities
          .map((id) => activities.find((a) => a.id === id)?.name)
          .filter(Boolean) as string[],
      };

      const updatedMeta = { ...packageMeta, [savedPkg.id]: newMeta };
      setPackageMeta(updatedMeta);
      localStorage.setItem("mandil_package_metadata", JSON.stringify(updatedMeta));

      if (editingId) {
        setPackages((prev) => prev.map((p) => (p.id === editingId ? savedPkg : p)));
      } else {
        setPackages((prev) => [savedPkg, ...prev]);
      }

      handleCancelEdit();
      setPkgSuccess(true);
      setTimeout(() => setPkgSuccess(false), 3000);
    } catch (err: any) {
      setPkgError(err.message || `Failed to ${editingId ? "update" : "create"} package.`);
    } finally {
      setPkgCreating(false);
    }
  };

  const handleEditPackage = (pkg: Package) => {
    const meta = packageMeta[pkg.id] || {
      duration: "",
      capacity: "",
      isPopular: false,
      images: [],
      assets: [],
      activities: [],
    };
    setEditingId(pkg.id);
    setExistingImages(pkg.images || meta.images || []);
    setPkgTitle(pkg.name);
    setPkgDescription(pkg.description || "");
    setPkgBasePrice(pkg.basePrice.toString());
    setPkgDuration(meta.duration || "");
    setPkgCapacity(meta.capacity || "");
    setPkgPricingModel(pkg.pricingModel);
    setPkgIsPopular(meta.isPopular || false);

    setWhatsIncluded(pkg.whatsIncluded || []);
    setWhatsExcluded(pkg.whatsExcluded || []);
    
    let parsedTimeline = [];
    if (pkg.timeline) {
      try {
        parsedTimeline = typeof pkg.timeline === "string" ? JSON.parse(pkg.timeline) : pkg.timeline;
      } catch (e) {
        console.error("Error parsing timeline in edit mode", e);
      }
    }
    setTimeline(parsedTimeline);
    setAboutMarkdown(pkg.aboutMarkdown || "");

    const matchedAssetIds = (meta.assets || [])
      .map((name) => amenities.find((a) => a.name === name)?.id)
      .filter(Boolean) as string[];
    const matchedActivityIds = (meta.activities || [])
      .map((name) => activities.find((a) => a.name === name)?.id)
      .filter(Boolean) as string[];

    setSelectedAssets(matchedAssetIds);
    setSelectedActivities(matchedActivityIds);
  };

  const handleDeletePackage = async (pkgId: string) => {
    if (!confirm("Are you sure you want to delete this package?")) return;

    try {
      const response = await fetch(`/api/packages/${pkgId}`, {
        method: "DELETE",
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to delete package.");
      }

      setPackages((prev) => prev.filter((p) => p.id !== pkgId));

      const newMeta = { ...packageMeta };
      delete newMeta[pkgId];
      setPackageMeta(newMeta);
      localStorage.setItem("mandil_package_metadata", JSON.stringify(newMeta));

      if (editingId === pkgId) {
        handleCancelEdit();
      }
    } catch (err: any) {
      alert(err.message || "Failed to delete package.");
    }
  };

  return (
    <div className="p-8 space-y-6 w-full">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Packages Management</h2>
        <p className="text-slate-500 text-xs mt-1">
          Configure active packages, durations, capacities, and marketing features.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">
        {/* Form card */}
        <form
          onSubmit={handleCreatePackage}
          className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4"
        >
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center justify-between gap-2">
            <span className="flex items-center gap-2">
              <FiPlus className="text-emerald-700" /> {editingId ? "Edit Villa Package" : "Create Villa Package"}
            </span>
            {editingId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="text-[10px] text-slate-400 hover:text-slate-600 font-bold transition-colors cursor-pointer"
              >
                Cancel Edit
              </button>
            )}
          </h3>

          {pkgError && (
            <div className="p-3 bg-red-50 border border-red-100 text-red-800 text-xs rounded-xl font-medium">
              {pkgError}
            </div>
          )}
          {pkgSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs rounded-xl font-medium">
              {editingId ? "Package updated successfully!" : "Package added successfully!"}
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="pkgTitle" className="text-xs font-bold text-slate-600 block">
              Package Name *
            </label>
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
              <label htmlFor="pkgBasePrice" className="text-xs font-bold text-slate-600 block">
                Base Price (LKR) *
              </label>
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
              <label htmlFor="pkgPricingModel" className="text-xs font-bold text-slate-600 block">
                Pricing Model
              </label>
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
              <label htmlFor="pkgDuration" className="text-xs font-bold text-slate-600 block">
                Duration
              </label>
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
              <label htmlFor="pkgCapacity" className="text-xs font-bold text-slate-600 block">
                Capacity Limit
              </label>
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
            <label htmlFor="pkgDescription" className="text-xs font-bold text-slate-600 block">
              Description
            </label>
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
            
            {/* Existing Images Display */}
            {existingImages.length > 0 && (
              <div className="space-y-1.5 pb-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Current Saved Images ({existingImages.length})
                </span>
                <div className="grid grid-cols-5 gap-2.5">
                  {existingImages.map((url, idx) => (
                    <div
                      key={idx}
                      className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-100"
                    >
                      <Image src={url} alt={`existing-${idx}`} fill className="object-cover" />
                      <button
                        type="button"
                        onClick={() => setExistingImages((prev) => prev.filter((_, i) => i !== idx))}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-50 text-red-650 flex items-center justify-center shadow-sm cursor-pointer hover:bg-red-100 transition-colors"
                        title="Remove existing image"
                      >
                        <FiTrash2 size={9} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 hover:border-emerald-600 bg-slate-50 p-6 rounded-2xl text-center cursor-pointer transition-colors flex flex-col items-center justify-center gap-2 group"
            >
              <input
                type="file"
                multiple
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              <FiUploadCloud
                className="text-slate-400 group-hover:text-emerald-600 transition-colors"
                size={24}
              />
              <p className="text-[11px] font-semibold text-slate-700">Click or drag images to upload</p>
            </div>
            {pkgImages.length > 0 && (
              <div className="grid grid-cols-5 gap-2.5 pt-2">
                {pkgImages.map((file, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-100"
                  >
                    <Image src={URL.createObjectURL(file)} alt={file.name} fill className="object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-50 text-red-650 flex items-center justify-center shadow-sm cursor-pointer hover:bg-red-100 transition-colors"
                    >
                      <FiTrash2 size={9} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 1: What's Included & Excluded (Dynamic Lists) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Whats Included */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
              <label className="text-xs font-bold text-slate-700 block">What's Included</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={includedInput}
                  onChange={(e) => setIncludedInput(e.target.value)}
                  placeholder="Add included item..."
                  className="flex-1 px-3 py-1.5 bg-white border border-slate-300 focus:border-emerald-600 rounded-xl text-slate-800 outline-none text-xs transition-colors"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      if (includedInput.trim()) {
                        setWhatsIncluded((prev) => [...prev, includedInput.trim()]);
                        setIncludedInput("");
                      }
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (includedInput.trim()) {
                      setWhatsIncluded((prev) => [...prev, includedInput.trim()]);
                      setIncludedInput("");
                    }
                  }}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
                >
                  Add
                </button>
              </div>
              <ul className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {whatsIncluded.map((item, idx) => (
                  <li key={idx} className="flex items-center justify-between text-xs text-slate-700 bg-white border border-slate-200 px-2.5 py-1.5 rounded-xl shadow-2xs">
                    <span className="flex items-center gap-1.5 min-w-0">
                      <FiCheck className="text-emerald-600 text-sm flex-shrink-0" />
                      <span className="truncate">{item}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setWhatsIncluded((prev) => prev.filter((_, i) => i !== idx))}
                      className="text-slate-400 hover:text-red-500 cursor-pointer p-0.5 flex-shrink-0"
                    >
                      <FiX className="text-xs" />
                    </button>
                  </li>
                ))}
                {whatsIncluded.length === 0 && (
                  <p className="text-[10px] text-slate-400 italic">No inclusions added yet.</p>
                )}
              </ul>
            </div>

            {/* Whats Excluded */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
              <label className="text-xs font-bold text-slate-700 block">What's Excluded</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={excludedInput}
                  onChange={(e) => setExcludedInput(e.target.value)}
                  placeholder="Add excluded item..."
                  className="flex-1 px-3 py-1.5 bg-white border border-slate-300 focus:border-emerald-600 rounded-xl text-slate-800 outline-none text-xs transition-colors"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      if (excludedInput.trim()) {
                        setWhatsExcluded((prev) => [...prev, excludedInput.trim()]);
                        setExcludedInput("");
                      }
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (excludedInput.trim()) {
                      setWhatsExcluded((prev) => [...prev, excludedInput.trim()]);
                      setExcludedInput("");
                    }
                  }}
                  className="px-3.5 py-1.5 bg-slate-650 hover:bg-slate-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
                >
                  Add
                </button>
              </div>
              <ul className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {whatsExcluded.map((item, idx) => (
                  <li key={idx} className="flex items-center justify-between text-xs text-slate-750 bg-white border border-slate-200 px-2.5 py-1.5 rounded-xl shadow-2xs">
                    <span className="flex items-center gap-1.5 min-w-0">
                      <FiX className="text-slate-450 text-xs flex-shrink-0" />
                      <span className="truncate text-slate-500">{item}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setWhatsExcluded((prev) => prev.filter((_, i) => i !== idx))}
                      className="text-slate-400 hover:text-red-500 cursor-pointer p-0.5 flex-shrink-0"
                    >
                      <FiX className="text-xs" />
                    </button>
                  </li>
                ))}
                {whatsExcluded.length === 0 && (
                  <p className="text-[10px] text-slate-400 italic">No exclusions added yet.</p>
                )}
              </ul>
            </div>
          </div>

          {/* Section 2: Experience Timeline (Dynamic Itinerary Builder) */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-4">
            <label className="text-xs font-bold text-slate-750 block">Experience Timeline</label>
            
            {timeline.length > 0 && (
              <div className="space-y-3.5 border-l-2 border-emerald-500 pl-4 ml-2">
                {timeline.map((step, idx) => (
                  <div key={idx} className="relative group space-y-1">
                    <div className="absolute -left-[23px] top-1.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white shadow-xs" />
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[9px] font-bold text-emerald-700 bg-emerald-55/75 px-1.5 py-0.5 rounded-md">
                          {step.time}
                        </span>
                        <h4 className="text-xs font-bold text-slate-800 mt-1">{step.title}</h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => setTimeline((prev) => prev.filter((_, i) => i !== idx))}
                        className="text-slate-400 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex-shrink-0"
                        title="Delete Step"
                      >
                        <FiTrash2 size={11} />
                      </button>
                    </div>
                    {step.description && (
                      <p className="text-[11px] text-slate-500 leading-normal">{step.description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="bg-white border border-slate-150 rounded-xl p-3.5 space-y-2.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Add Itinerary Step</span>
              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 block">Time / Duration</label>
                  <input
                    type="text"
                    value={stepTime}
                    onChange={(e) => setStepTime(e.target.value)}
                    placeholder="e.g. 08:30 AM or Hour 1"
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 outline-none text-xs focus:border-emerald-600 transition-colors"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 block">Step Title</label>
                  <input
                    type="text"
                    value={stepTitle}
                    onChange={(e) => setStepTitle(e.target.value)}
                    placeholder="e.g. Welcome & Drinks"
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 outline-none text-xs focus:border-emerald-600 transition-colors"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 block">Short Description</label>
                <textarea
                  value={stepDesc}
                  onChange={(e) => setStepDesc(e.target.value)}
                  placeholder="Describe activity briefly..."
                  rows={2}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 outline-none text-xs focus:border-emerald-600 resize-none transition-colors"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  if (stepTime.trim() && stepTitle.trim()) {
                    setTimeline((prev) => [
                      ...prev,
                      { time: stepTime.trim(), title: stepTitle.trim(), description: stepDesc.trim() },
                    ]);
                    setStepTime("");
                    setStepTitle("");
                    setStepDesc("");
                  }
                }}
                className="w-full py-2 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-800 rounded-xl text-xs font-bold cursor-pointer transition-colors flex items-center justify-center gap-1.5"
              >
                <FiPlusCircle size={13} /> Add Itinerary Step
              </button>
            </div>
          </div>

          {/* Section 3: About This Experience (Markdown Editor) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 block">About This Experience (Markdown)</label>
              <div className="flex bg-slate-100 border border-slate-200 rounded-xl p-0.5">
                <button
                  type="button"
                  onClick={() => setMdTab("edit")}
                  className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                    mdTab === "edit" ? "bg-white text-emerald-700 shadow-xs" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Edit Content
                </button>
                <button
                  type="button"
                  onClick={() => setMdTab("preview")}
                  className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                    mdTab === "preview" ? "bg-white text-emerald-700 shadow-xs" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Preview Markdown
                </button>
              </div>
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
              {mdTab === "edit" ? (
                <MdEditor
                  modelValue={aboutMarkdown}
                  onChange={setAboutMarkdown}
                  language="en-US"
                  placeholder="Provide detailed description of the experience using markdown formatting..."
                  theme="light"
                  style={{ height: "300px" }}
                  toolbars={[
                    "bold",
                    "underline",
                    "italic",
                    "-",
                    "strikeThrough",
                    "sub",
                    "sup",
                    "quote",
                    "unorderedList",
                    "orderedList",
                    "-",
                    "code",
                    "link",
                    "image",
                    "table",
                    "-",
                    "revoke",
                    "next",
                    "preview",
                  ]}
                />
              ) : (
                <div className="p-4 prose max-w-none text-xs min-h-[300px] max-h-[300px] overflow-y-auto bg-slate-50">
                  <MdPreview
                    modelValue={aboutMarkdown}
                    language="en-US"
                    theme="light"
                    style={{ backgroundColor: "transparent" }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Attach Assets/Add-ons */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-600 block">Attach Assets/Add-ons (Optional)</label>
            {amenities.length === 0 ? (
              <p className="text-[10px] text-slate-400 font-medium">
                No assets in database. Create them in the Assets tab first.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-2 max-h-28 overflow-y-auto border border-slate-200 rounded-xl p-2.5 bg-slate-50">
                {amenities.map((am) => (
                  <label
                    key={am.id}
                    className="flex items-center gap-2 text-[10px] text-slate-700 font-medium cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedAssets.includes(am.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedAssets((prev) => [...prev, am.id]);
                        } else {
                          setSelectedAssets((prev) => prev.filter((id) => id !== am.id));
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

          {/* Attach Resort Activities */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-600 block">Attach Resort Activities (Optional)</label>
            {activities.length === 0 ? (
              <p className="text-[10px] text-slate-400 font-medium">
                No activities in database. Create them in the Activities tab first.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-2 max-h-28 overflow-y-auto border border-slate-200 rounded-xl p-2.5 bg-slate-50">
                {activities.map((act) => (
                  <label
                    key={act.id}
                    className="flex items-center gap-2 text-[10px] text-slate-700 font-medium cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedActivities.includes(act.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedActivities((prev) => [...prev, act.id]);
                        } else {
                          setSelectedActivities((prev) => prev.filter((id) => id !== act.id));
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
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
                pkgIsPopular ? "bg-emerald-600" : "bg-slate-200"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  pkgIsPopular ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
            <span className="text-xs font-semibold text-slate-700">Featured Popular Package</span>
          </div>

          {/* Real-time Package Cost Summary */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
              Package Cost Summary
            </span>
            <div className="flex items-center justify-between text-[11px] text-slate-600">
              <span>Base Price</span>
              <span className="font-mono">LKR {Number(pkgBasePrice || 0).toLocaleString()}</span>
            </div>
            {selectedAssets.length > 0 && (
              <div className="flex items-center justify-between text-[11px] text-slate-600">
                <span>Attached Assets ({selectedAssets.length})</span>
                <span className="font-mono">
                  LKR{" "}
                  {selectedAssets
                    .reduce((sum, id) => sum + (amenities.find((a) => a.id === id)?.price || 0), 0)
                    .toLocaleString()}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between text-xs font-bold text-slate-900 border-t border-slate-200 pt-2 mt-1">
              <span>Net Total Cost</span>
              <span className="text-emerald-700 font-extrabold">
                LKR{" "}
                {(
                  Number(pkgBasePrice || 0) +
                  selectedAssets.reduce((sum, id) => sum + (amenities.find((a) => a.id === id)?.price || 0), 0)
                ).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            {editingId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="flex-1 py-3 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl shadow-xs transition-colors duration-200 text-center cursor-pointer"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={pkgCreating}
              className={`flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors duration-200 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50`}
            >
              {pkgCreating ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : editingId ? (
                "Save Changes"
              ) : (
                "Save Package"
              )}
            </button>
          </div>
        </form>

        {/* Listing */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <FiLayers className="text-emerald-700" /> Active Packages ({packages.length})
            </h3>

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
                    <FiSearch size={20} className="text-slate-355 animate-pulse" />
                    <span className="text-[11px] font-medium text-slate-450">
                      No packages match your search filter.
                    </span>
                  </div>
                );
              }
              return filtered.map((pkg) => {
                const meta = packageMeta[pkg.id] || { duration: "N/A", capacity: "N/A", isPopular: false, images: [], assets: [], activities: [] };
                const firstImage =
                  pkg.images && pkg.images.length > 0
                    ? pkg.images[0]
                    : meta.images && meta.images.length > 0
                    ? meta.images[0]
                    : null;

                // Find all attached assets and calculate total cost
                const attachedAmenities = (meta.assets || [])
                  .map((name) => amenities.find((a) => a.name === name))
                  .filter(Boolean) as Amenity[];
                const attachedAssetsCost = attachedAmenities.reduce((sum, am) => sum + am.price, 0);
                const netTotal = pkg.basePrice + attachedAssetsCost;

                return (
                  <div
                    key={pkg.id}
                    className="bg-white border border-slate-200 rounded-2xl shadow-xs flex flex-col overflow-hidden hover:border-slate-300 transition-all duration-200 group relative"
                  >
                    {meta.isPopular && (
                      <div className="absolute top-3 right-3 z-10 text-amber-500 bg-white/95 p-1 rounded-lg shadow-sm border border-slate-100">
                        <FiStar size={13} className="fill-amber-500 text-amber-500" />
                      </div>
                    )}

                    {firstImage ? (
                      <img
                        src={firstImage}
                        alt={pkg.name}
                        className="w-full h-36 object-cover bg-slate-100 border-b border-slate-100"
                      />
                    ) : (
                      <div className="w-full h-36 bg-slate-50 border-b border-slate-100 flex flex-col items-center justify-center text-slate-450 gap-1.5">
                        <FiImage size={22} className="text-slate-355" />
                        <span className="text-[9px] font-bold tracking-wider uppercase text-slate-400">
                          No Image Available
                        </span>
                      </div>
                    )}

                    <div className="p-4 flex flex-col flex-1 justify-between gap-3">
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-100 text-emerald-800 text-[8px] font-bold uppercase tracking-wider">
                            {pkg.pricingModel.replace("_", " ")}
                          </span>
                          <span className="text-[9px] text-slate-400 font-mono">ID: {pkg.id.slice(0, 8)}...</span>
                        </div>
                        <h4
                          className="text-slate-900 font-bold text-xs mt-2.5 leading-tight truncate"
                          title={pkg.name}
                        >
                          {pkg.name}
                        </h4>
                        <p className="text-slate-500 text-[11px] mt-1.5 leading-relaxed line-clamp-2">
                          {pkg.description || "No description provided."}
                        </p>

                        {/* Attached Assets cost list */}
                        {attachedAmenities.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-dashed border-slate-100 space-y-1">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                              Attached Assets & Cost
                            </span>
                            <div className="space-y-1">
                              {attachedAmenities.map((am) => (
                                <div key={am.id} className="flex items-center justify-between text-[10px] text-slate-650">
                                  <span className="truncate max-w-[130px] font-medium">{am.name}</span>
                                  <span className="font-mono text-slate-400">LKR {am.price.toLocaleString()}</span>
                                </div>
                              ))}
                              <div className="flex items-center justify-between text-[10px] font-bold text-slate-700 pt-1 border-t border-slate-50">
                                <span>Assets Total Cost</span>
                                <span>LKR {attachedAssetsCost.toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="border-t border-slate-100 pt-3 mt-auto">
                        <div className="flex items-center justify-between text-[10px] text-slate-500 mb-2">
                          <span className="flex items-center gap-1">
                            <FiClock size={11} className="text-emerald-600" /> {meta.duration}
                          </span>
                          <span className="flex items-center gap-1">
                            <FiUsers size={11} className="text-emerald-600" /> {meta.capacity}
                          </span>
                        </div>
                        
                        {/* Base Price & Net Total pricing label */}
                        <div className="border-t border-slate-100/50 pt-2.5 space-y-2">
                          <div className="flex flex-col gap-1 text-[10px]">
                            <div className="flex items-center justify-between text-slate-500">
                              <span>Base Price</span>
                              <span className="font-bold text-slate-700">LKR {pkg.basePrice.toLocaleString()}</span>
                            </div>
                            {attachedAssetsCost > 0 && (
                              <div className="flex items-center justify-between text-slate-500">
                                <span>Assets cost</span>
                                <span className="font-bold text-slate-700">LKR {attachedAssetsCost.toLocaleString()}</span>
                              </div>
                            )}
                          </div>
                          
                          <div className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl border ${
                            attachedAssetsCost > 0 
                              ? "bg-emerald-50 border-emerald-100 text-emerald-800" 
                              : "bg-slate-50 border-slate-100 text-slate-750"
                          }`}>
                            <span className="text-[10px] font-bold">Net Total</span>
                            <span className="font-extrabold text-xs">LKR {netTotal.toLocaleString()}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 mt-3 pt-2 border-t border-slate-100/50">
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
                );
              });
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}
