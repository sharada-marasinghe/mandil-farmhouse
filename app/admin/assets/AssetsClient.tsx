"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { AmenityBilling } from "@/app/generated/prisma/enums";
import {
  FiTag,
  FiDollarSign,
  FiTrash2,
  FiPlus,
  FiUploadCloud,
  FiImage,
  FiEdit3,
  FiX,
  FiSave,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";

interface Amenity {
  id: string;
  name: string;
  price: number;
  billingType: AmenityBilling;
  description?: string | null;
  images?: string[];
}

interface Props {
  initialAmenities: Amenity[];
}

function ImageSlider({ images, name }: { images: string[]; name: string }) {
  const [index, setIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="w-16 h-16 rounded-xl border border-slate-200 overflow-hidden bg-slate-50 flex items-center justify-center text-slate-400 flex-shrink-0">
        <FiImage size={20} className="text-slate-300" />
      </div>
    );
  }

  if (images.length === 1) {
    return (
      <div className="w-16 h-16 rounded-xl border border-slate-200 overflow-hidden bg-slate-50 relative flex-shrink-0">
        <Image src={images[0]} alt={name} fill className="object-cover" />
      </div>
    );
  }

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="w-16 h-16 rounded-xl border border-slate-200 overflow-hidden bg-slate-50 relative flex-shrink-0 group">
      <Image src={images[index]} alt={`${name}-${index}`} fill className="object-cover transition-all duration-300" />
      
      {/* Navigation Chevrons */}
      <button
        type="button"
        onClick={handlePrev}
        className="absolute left-0.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-black/60 hover:bg-black/85 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
      >
        <FiChevronLeft size={10} />
      </button>
      <button
        type="button"
        onClick={handleNext}
        className="absolute right-0.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-black/60 hover:bg-black/85 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
      >
        <FiChevronRight size={10} />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-1 left-0 right-0 flex justify-center gap-0.5">
        {images.map((_, i) => (
          <span
            key={i}
            className={`w-1 h-1 rounded-full transition-all duration-200 ${
              index === i ? "bg-white scale-110 w-1.5" : "bg-white/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default function AssetsClient({ initialAmenities }: Props) {
  const [amenities, setAmenities] = useState<Amenity[]>(initialAmenities);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [billingType, setBillingType] = useState<AmenityBilling>("FLAT_RATE");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      const droppedFiles = Array.from(e.dataTransfer.files).filter((file) =>
        /\.(jpg|jpeg|png|webp|avif)$/i.test(file.name)
      );
      setImages((prev) => [...prev, ...droppedFiles]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setImages((prev) => [...prev, ...selectedFiles]);
    }
  };

  const handleRemoveNewImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleStartEdit = (asset: Amenity) => {
    setEditingId(asset.id);
    setName(asset.name);
    setPrice(String(asset.price));
    setBillingType(asset.billingType);
    setDescription(asset.description || "");
    setExistingImages(asset.images || []);
    setImages([]);
    setError(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setName("");
    setPrice("");
    setBillingType("FLAT_RATE");
    setDescription("");
    setExistingImages([]);
    setImages([]);
    setError(null);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price.trim()) {
      setError("Name and price are required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("action", editingId ? "UPDATE_AMENITY" : "CREATE_AMENITY");
      if (editingId) {
        formData.append("id", editingId);
      }
      formData.append("name", name.trim());
      formData.append("price", price.trim());
      formData.append("billingType", billingType);
      formData.append("description", description.trim());

      // Append existing retained images
      existingImages.forEach((url) => {
        formData.append("existingImages", url);
      });

      // Append new file uploads
      images.forEach((file) => {
        formData.append("images", file);
      });

      const res = await fetch("/api/admin/inventory", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || `Failed to ${editingId ? "save" : "create"} asset.`);
      }

      if (editingId) {
        setAmenities((prev) =>
          prev.map((a) => (a.id === editingId ? data.amenity : a))
        );
      } else {
        setAmenities((prev) => [data.amenity, ...prev]);
      }

      handleCancelEdit();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this asset?")) return;
    try {
      const res = await fetch("/api/admin/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "DELETE_AMENITY", id }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setAmenities((prev) => prev.filter((a) => a.id !== id));
      if (editingId === id) {
        handleCancelEdit();
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="p-8 space-y-6 w-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Assets & Add-ons</h2>
          <p className="text-slate-400 text-xs mt-1">Manage bookable resort amenities and rental add-ons.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">
        {/* Add / Edit form */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              {editingId ? "Edit Asset" : "Add New Asset"}
            </h3>
            {editingId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1 cursor-pointer"
              >
                <FiX size={12} /> Cancel
              </button>
            )}
          </div>
          
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Asset / Amenity Name *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <FiTag size={13} />
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Luxury Pontoon Boat, JBL Speaker…"
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:border-emerald-500 outline-none"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Rental Price (LKR) *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <FiDollarSign size={13} />
                  </span>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:border-emerald-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Billing Type</label>
                <select
                  value={billingType}
                  onChange={(e) => setBillingType(e.target.value as AmenityBilling)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:border-emerald-500 outline-none"
                >
                  <option value="FLAT_RATE">Flat Rate</option>
                  <option value="PER_HOUR">Per Hour</option>
                  <option value="PER_DAY">Per Day</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Description (Optional)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe details, inclusions, capacity limitations..."
                rows={3}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:border-emerald-500 outline-none resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Media Upload</label>
              
              {/* Existing Images Display */}
              {existingImages.length > 0 && (
                <div className="space-y-1.5 pb-2">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Current Images</p>
                  <div className="grid grid-cols-5 gap-2">
                    {existingImages.map((url, idx) => (
                      <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-slate-250 bg-slate-50">
                        <Image src={url} alt={`existing-${idx}`} fill className="object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveExistingImage(idx)}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-50 text-red-600 flex items-center justify-center shadow-sm cursor-pointer border border-red-100"
                        >
                          <FiTrash2 size={9} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload Dropzone */}
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
                <FiUploadCloud className="text-slate-400 group-hover:text-emerald-600 transition-colors" size={24} />
                <p className="text-[11px] font-semibold text-slate-700">Click or drag new images to upload</p>
              </div>

              {/* New File Previews */}
              {images.length > 0 && (
                <div className="space-y-1.5 pt-2">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">New Images to Upload</p>
                  <div className="grid grid-cols-5 gap-2.5">
                    {images.map((file, idx) => (
                      <div
                        key={idx}
                        className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-100"
                      >
                        <Image src={URL.createObjectURL(file)} alt={file.name} fill className="object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveNewImage(idx)}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-50 text-red-650 flex items-center justify-center shadow-sm cursor-pointer"
                        >
                          <FiTrash2 size={9} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {error && <p className="text-xs text-red-650 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
            
            <div className="flex gap-3">
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors cursor-pointer text-center"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={saving}
                className="flex-[2] flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {editingId ? <FiSave size={13} /> : <FiPlus size={13} />}
                {saving ? "Saving…" : editingId ? "Save Changes" : "Add Asset"}
              </button>
            </div>
          </form>
        </div>

        {/* Asset list */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Current Assets <span className="text-slate-400 font-normal">({amenities.length})</span>
            </h3>
          </div>
          {amenities.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-xs">No assets added yet.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {amenities.map((a) => {
                const firstImage = a.images && a.images.length > 0 ? a.images[0] : null;
                const isCurrentlyEditing = editingId === a.id;
                return (
                  <div
                    key={a.id}
                    className={`flex items-start justify-between p-6 hover:bg-slate-50/50 transition-colors gap-4 ${
                      isCurrentlyEditing ? "bg-emerald-50/30 hover:bg-emerald-50/30 border-l-4 border-emerald-500" : ""
                    }`}
                  >
                    <div className="flex gap-4 items-start">
                      {/* Image Thumbnail */}
                      <ImageSlider images={a.images || []} name={a.name} />

                      <div className="space-y-1">
                        <span className="text-sm font-bold text-slate-800">{a.name}</span>
                        {a.description && (
                          <p className="text-xs text-slate-500 leading-relaxed max-w-lg">{a.description}</p>
                        )}
                        <div className="flex items-center gap-2 pt-0.5">
                          <span className="text-xs font-extrabold text-emerald-700">LKR {a.price.toLocaleString()}</span>
                          <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-md font-semibold">
                            {a.billingType.replace("_", " ")}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => handleStartEdit(a)}
                        className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                          isCurrentlyEditing
                            ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                            : "text-slate-400 border-transparent hover:text-slate-700 hover:bg-slate-100"
                        }`}
                        title="Edit Asset"
                      >
                        <FiEdit3 size={13} />
                      </button>
                      <button
                        onClick={() => handleDelete(a.id)}
                        className="p-1.5 text-slate-400 hover:text-red-650 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-100 transition-colors cursor-pointer"
                        title="Delete Asset"
                      >
                        <FiTrash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
