"use client";

import { useState } from "react";
import { FiCompass, FiTrash2, FiPlus } from "react-icons/fi";

interface Activity {
  id: string;
  name: string;
  description: string | null;
}

interface Props {
  initialActivities: Activity[];
}

export default function ActivitiesClient({ initialActivities }: Props) {
  const [activities, setActivities] = useState<Activity[]>(initialActivities);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError("Activity name is required."); return; }
    setCreating(true); setError(null);
    try {
      const res = await fetch("/api/admin/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "CREATE_ACTIVITY", name: name.trim(), description: description.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to create.");
      setActivities((prev) => [data.activity, ...prev]);
      setName(""); setDescription("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this activity?")) return;
    try {
      const res = await fetch("/api/admin/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "DELETE_ACTIVITY", id }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setActivities((prev) => prev.filter((a) => a.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="p-8 space-y-6 w-full">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Resort Activities</h2>
        <p className="text-slate-400 text-xs mt-1">Manage activities offered to guests at Mandil Farmhouse.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start w-full">

        {/* Add form */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs space-y-5">
          <h3 className="text-sm font-bold text-slate-900">Add New Activity</h3>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Activity Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400"><FiCompass size={13} /></span>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Boat Safari, Fishing…"
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:border-emerald-500 outline-none" required />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Description (Optional)</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                rows={3} placeholder="Short description of the activity…"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:border-emerald-500 outline-none resize-none" />
            </div>
            {error && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
            <button type="submit" disabled={creating}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-sm disabled:opacity-50 cursor-pointer">
              <FiPlus size={13} />
              {creating ? "Adding…" : "Add Activity"}
            </button>
          </form>
        </div>

        {/* Activity list */}
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-xs">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Current Activities <span className="text-slate-400 font-normal">({activities.length})</span>
            </h3>
          </div>
          {activities.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-xs">No activities added yet.</div>
          ) : (
            <div className="divide-y divide-slate-50">
              {activities.map((a) => (
                <div key={a.id} className="flex items-center justify-between px-6 py-3.5 hover:bg-slate-50/50 transition-colors">
                  <div>
                    <span className="text-sm font-semibold text-slate-800">{a.name}</span>
                    {a.description && <p className="text-[10px] text-slate-400 mt-0.5">{a.description}</p>}
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
