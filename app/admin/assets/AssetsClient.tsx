"use client";

import { useState } from "react";
import { AmenityBilling } from "@/app/generated/prisma/enums";
import { FiTag, FiDollarSign, FiTrash2, FiPlus } from "react-icons/fi";

interface Amenity {
  id: string;
  name: string;
  price: number;
  billingType: AmenityBilling;
}

interface Props {
  initialAmenities: Amenity[];
}

export default function AssetsClient({ initialAmenities }: Props) {
  const [amenities, setAmenities] = useState<Amenity[]>(initialAmenities);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [billingType, setBillingType] = useState<AmenityBilling>("FLAT_RATE");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price.trim()) { setError("Name and price are required."); return; }
    setCreating(true); setError(null);
    try {
      const res = await fetch("/api/admin/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "CREATE_AMENITY", name: name.trim(), price: parseFloat(price), billingType }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to create.");
      setAmenities((prev) => [data.amenity, ...prev]);
      setName(""); setPrice(""); setBillingType("FLAT_RATE");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this asset?")) return;
    try {
      const res = await fetch("/api/admin/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "DELETE_AMENITY", id }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setAmenities((prev) => prev.filter((a) => a.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="p-8 space-y-6 w-full">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Assets & Add-ons</h2>
        <p className="text-slate-400 text-xs mt-1">Manage bookable resort amenities and rental add-ons.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start w-full">

        {/* Add form */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs space-y-5">
          <h3 className="text-sm font-bold text-slate-900">Add New Asset</h3>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Asset / Amenity Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400"><FiTag size={13} /></span>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Life Jacket, Kayak…"
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:border-emerald-500 outline-none" required />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Rental Price (LKR)</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400"><FiDollarSign size={13} /></span>
                <input type="number" value={price} onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:border-emerald-500 outline-none" required />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Billing Type</label>
              <select value={billingType} onChange={(e) => setBillingType(e.target.value as AmenityBilling)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:border-emerald-500 outline-none">
                <option value="FLAT_RATE">Flat Rate (per booking)</option>
                <option value="PER_PERSON">Per Person</option>
                <option value="PER_HOUR">Per Hour</option>
              </select>
            </div>
            {error && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
            <button type="submit" disabled={creating}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-sm disabled:opacity-50 cursor-pointer">
              <FiPlus size={13} />
              {creating ? "Adding…" : "Add Asset"}
            </button>
          </form>
        </div>

        {/* Asset list */}
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-xs">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Current Assets <span className="text-slate-400 font-normal">({amenities.length})</span>
            </h3>
          </div>
          {amenities.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-xs">No assets added yet.</div>
          ) : (
            <div className="divide-y divide-slate-50">
              {amenities.map((a) => (
                <div key={a.id} className="flex items-center justify-between px-6 py-3.5 hover:bg-slate-50/50 transition-colors">
                  <div>
                    <span className="text-sm font-semibold text-slate-800">{a.name}</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-slate-400 font-mono">LKR {a.price.toLocaleString()}</span>
                      <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-md font-semibold">{a.billingType.replace("_", " ")}</span>
                    </div>
                  </div>
                  <button onClick={() => handleDelete(a.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-100 transition-colors cursor-pointer">
                    <FiTrash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
