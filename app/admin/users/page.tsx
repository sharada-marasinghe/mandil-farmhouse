"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AdminSidebar from "@/app/admin/dashboard/AdminSidebar";
import { 
  FiUserPlus,
  FiSearch,
  FiTrash2,
  FiEdit3,
  FiCheckCircle,
  FiAlertCircle,
  FiUsers,
  FiUserCheck,
  FiLock,
  FiMail,
  FiPhone,
  FiX
} from "react-icons/fi";

interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  role: "SUPER_ADMIN" | "RESORT_MANAGER" | "GUEST";
  isActive: boolean;
  createdAt: string;
}

export default function UserManagementPage() {
  const [activeTab, setActiveTab] = useState<"staff" | "guests">("staff");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Notification banner
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Add User Form States
  const [showAddForm, setShowAddForm] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [userRole, setUserRole] = useState<"SUPER_ADMIN" | "RESORT_MANAGER" | "GUEST">("RESORT_MANAGER");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit User Modal States
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editRole, setEditRole] = useState<"SUPER_ADMIN" | "RESORT_MANAGER" | "GUEST">("GUEST");
  const [editPassword, setEditPassword] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const triggerNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (data.success && data.users) {
        setUsers(data.users);
      } else {
        triggerNotification("error", data.error || "Failed to load users.");
      }
    } catch (err) {
      triggerNotification("error", "Error contacting the users database API.");
    } finally {
      setLoading(false);
    }
  };

  // Add Staff / Guest Handler
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !phone || !password) {
      triggerNotification("error", "Please fill in all mandatory fields.");
      return;
    }

    // Assign GUEST role automatically if on guests tab
    const roleToCreate = activeTab === "guests" ? "GUEST" : userRole;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fullName,
          email,
          phoneNumber: phone,
          password,
          role: roleToCreate,
        }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUsers((prev) => [data.user, ...prev]);
        setFullName("");
        setEmail("");
        setPhone("");
        setPassword("");
        setShowAddForm(false);
        triggerNotification("success", `Account for "${fullName}" created successfully.`);
      } else {
        triggerNotification("error", data.error || "Failed to create user.");
      }
    } catch (err) {
      triggerNotification("error", "Network error when creating user account.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle Account Active / Suspended Status
  const handleToggleStatus = async (user: User) => {
    const nextStatus = !user.isActive;
    const actionLabel = nextStatus ? "activate" : "suspend";
    if (!confirm(`Are you sure you want to ${actionLabel} the account for "${user.name}"?`)) return;

    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: user.id,
          isActive: nextStatus
        }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, isActive: data.user.isActive } : u))
        );
        triggerNotification("success", `Account status changed successfully.`);
      } else {
        triggerNotification("error", data.error || "Failed to update account status.");
      }
    } catch (err) {
      triggerNotification("error", "Error communicating account status update.");
    }
  };

  // Open Edit Dialog
  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditPhone(user.phoneNumber);
    setEditRole(user.role);
    setEditPassword("");
  };

  // Submit Profile & Role Updates
  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setIsUpdating(true);
    try {
      const payload: any = {
        id: editingUser.id,
        name: editName,
        email: editEmail,
        phoneNumber: editPhone,
        role: editRole,
      };
      if (editPassword) {
        payload.password = editPassword;
      }

      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUsers((prev) =>
          prev.map((u) => (u.id === editingUser.id ? data.user : u))
        );
        setEditingUser(null);
        triggerNotification("success", "User details updated successfully.");
      } else {
        triggerNotification("error", data.error || "Failed to update user profile.");
      }
    } catch (err) {
      triggerNotification("error", "Error saving user profile details.");
    } finally {
      setIsUpdating(false);
    }
  };

  // Delete User Account
  const handleDeleteUser = async (user: User) => {
    if (!confirm(`Are you sure you want to permanently delete user "${user.name}"? This action is irreversible.`)) return;

    try {
      const res = await fetch(`/api/admin/users?id=${user.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setUsers((prev) => prev.filter((u) => u.id !== user.id));
        triggerNotification("success", "User account removed from database.");
      } else {
        triggerNotification("error", data.error || "Failed to delete user.");
      }
    } catch (err) {
      triggerNotification("error", "Error executing delete command.");
    }
  };

  // Filters staff vs guests, and query matches
  const filteredUsers = users.filter((u) => {
    const isTabMatch = activeTab === "staff" ? u.role !== "GUEST" : u.role === "GUEST";
    if (!isTabMatch) return false;

    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      u.name.toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query) ||
      u.phoneNumber.toLowerCase().includes(query)
    );
  });

  return (
    <div className="flex flex-1 w-full min-h-screen bg-slate-50">
      
      <AdminSidebar />

      {/* ─── MAIN WORKSPACE CONTENT ─────────────────────────────────────────── */}
      <main className="flex-1 bg-slate-50 p-8 w-full min-h-screen flex flex-col items-start space-y-6 overflow-y-auto">
        
        {/* Header Title */}
        <div className="w-full flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">User Management</h2>
            <p className="text-slate-500 text-xs mt-1">Manage guest accounts, resort staff credentials, roles, and status levels.</p>
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

        {/* Staff & Guest Tab Switcher & Search Section */}
        <div className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-3xl border border-slate-200 shadow-2xs">
          
          {/* Tabs */}
          <div className="flex gap-1.5 p-1 bg-slate-100 rounded-xl max-w-max">
            <button
              onClick={() => { setActiveTab("staff"); setShowAddForm(false); }}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer ${
                activeTab === "staff"
                  ? "bg-white text-slate-900 shadow-3xs"
                  : "text-slate-505 hover:text-slate-900"
              }`}
            >
              Staff Accounts ({users.filter(u => u.role !== "GUEST").length})
            </button>
            <button
              onClick={() => { setActiveTab("guests"); setShowAddForm(false); }}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer ${
                activeTab === "guests"
                  ? "bg-white text-slate-900 shadow-3xs"
                  : "text-slate-505 hover:text-slate-900"
              }`}
            >
              Guest Accounts ({users.filter(u => u.role === "GUEST").length})
            </button>
          </div>

          {/* Search bar & Add User button */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400"><FiSearch className="text-xs" /></span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email..."
                className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-emerald-650 transition-colors text-xs w-48 sm:w-64"
              />
            </div>

            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-4 py-2 rounded-xl bg-[#00966B] hover:bg-[#007c58] text-white font-bold text-xs transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <FiUserPlus />
              <span>{activeTab === "staff" ? "Add Staff" : "Add Guest"}</span>
            </button>
          </div>
        </div>

        {/* ─── ADD USER FORM DRAWER/CARD ────────────────────────────────────── */}
        {showAddForm && (
          <form onSubmit={handleCreateUser} className="w-full bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6 text-left animate-fade-in">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {activeTab === "staff" ? "Add Staff Account" : "Add Guest Account"}
              </h3>
              <p className="text-slate-400 text-[10px] mt-0.5">Initialize credentials and configuration parameters directly in the database.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
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

              {/* Email */}
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400"><FiMail className="text-sm" /></span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Address"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-emerald-600 transition-colors text-xs"
                  required
                />
              </div>

              {/* Phone Number */}
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400"><FiPhone className="text-sm" /></span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="WhatsApp / Phone"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-emerald-650 transition-colors text-xs"
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

              {/* Select Role (Only displayed for Staff Tab) */}
              <div className="relative">
                {activeTab === "staff" ? (
                  <>
                    <select
                      value={userRole}
                      onChange={(e) => setUserRole(e.target.value as any)}
                      className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-650 focus:outline-none focus:border-emerald-600 transition-colors text-xs appearance-none"
                    >
                      <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                      <option value="RESORT_MANAGER">RESORT_MANAGER</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-500">
                      ▼
                    </div>
                  </>
                ) : (
                  <input
                    type="text"
                    value="GUEST"
                    disabled
                    className="w-full px-3.5 py-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-400 text-xs font-semibold"
                  />
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-[#00966B] hover:bg-[#007c58] text-white font-bold text-xs transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
              >
                <span>{isSubmitting ? "Saving Account..." : "Create Account"}</span>
              </button>
            </div>
          </form>
        )}

        {/* ─── LOADING & EMPTY STATE SKELETONS ────────────────────────────────── */}
        {loading ? (
          <div className="w-full bg-white border border-slate-200 rounded-3xl p-8 h-96 animate-pulse" />
        ) : filteredUsers.length === 0 ? (
          <div className="w-full bg-white border border-slate-200 rounded-3xl py-16 px-6 text-center shadow-xs">
            <FiUsers className="mx-auto text-4xl text-slate-300 mb-4" />
            <h3 className="text-sm font-bold text-slate-800">No accounts found</h3>
            <p className="text-slate-400 text-xs mt-1">Try refining your search keyword or add a new user to populate this list.</p>
          </div>
        ) : (
          
          /* ─── USERS DIRECTORY TABLE ────────────────────────────────────────── */
          <div className="w-full bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-xs text-left">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 border-b border-slate-50 pb-2.5">
              {activeTab === "staff" ? "Registered Staff Members" : "Customer Accounts"}
            </h3>

            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] uppercase font-bold tracking-wider text-slate-400">
                    <th className="py-3 px-4">Full Name</th>
                    <th className="py-3 px-4">Email Address</th>
                    <th className="py-3 px-4">Phone Number</th>
                    {activeTab === "staff" && <th className="py-3 px-4">Access Role</th>}
                    <th className="py-3 px-4">Account Status</th>
                    <th className="py-3 px-4">Created Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-xs">
                  {filteredUsers.map((user) => {
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
                        {/* Name */}
                        <td className="py-3.5 px-4 font-semibold text-slate-905">{user.name}</td>
                        {/* Email */}
                        <td className="py-3.5 px-4 text-slate-505 font-mono">{user.email}</td>
                        {/* Phone */}
                        <td className="py-3.5 px-4 text-slate-505 font-mono">{user.phoneNumber}</td>
                        
                        {/* Role (Staff only) */}
                        {activeTab === "staff" && (
                          <td className="py-3.5 px-4">
                            <span className={`px-2 py-0.5 rounded-md border text-[9px] font-bold ${badgeStyle}`}>
                              {user.role}
                            </span>
                          </td>
                        )}

                        {/* Status (Toggle Active/Suspended) */}
                        <td className="py-3.5 px-4">
                          <button
                            onClick={() => handleToggleStatus(user)}
                            className={`px-2.5 py-1 rounded-full border text-[9px] font-bold transition-all duration-200 cursor-pointer shadow-3xs hover:scale-102 flex items-center gap-1 ${
                              user.isActive 
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/50" 
                                : "bg-red-50 text-red-650 border-red-200 hover:bg-red-100/50"
                            }`}
                            title={user.isActive ? "Click to suspend account" : "Click to reactivate account"}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${user.isActive ? "bg-emerald-500" : "bg-red-500"}`} />
                            <span>{user.isActive ? "Active" : "Suspended"}</span>
                          </button>
                        </td>

                        {/* Created Date */}
                        <td className="py-3.5 px-4 text-slate-400">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>

                        {/* Action buttons */}
                        <td className="py-3.5 px-4 text-right space-x-1.5">
                          <button
                            onClick={() => handleOpenEdit(user)}
                            className="p-1.5 bg-transparent hover:bg-slate-100 text-slate-400 hover:text-slate-800 border border-transparent hover:border-slate-200 rounded-lg transition-colors cursor-pointer"
                            title="Edit User Profile"
                          >
                            <FiEdit3 size={13} />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user)}
                            className="p-1.5 bg-transparent hover:bg-red-50 text-slate-400 hover:text-red-650 border border-transparent hover:border-red-100 rounded-lg transition-colors cursor-pointer"
                            title="Delete User Account"
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
        )}

      </main>

      {/* ─── EDIT USER MODAL DIALOG ─────────────────────────────────────────── */}
      {editingUser && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl max-w-lg w-full overflow-hidden text-left flex flex-col">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Edit User Details</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Modify profile fields or update secure account configurations.</p>
              </div>
              <button 
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-50 cursor-pointer"
              >
                <FiX size={15} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleUpdateUser} className="p-6 space-y-4">
              
              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Full Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400"><FiUserCheck className="text-sm" /></span>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-emerald-600 transition-colors text-xs"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400"><FiMail className="text-sm" /></span>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-emerald-600 transition-colors text-xs"
                    required
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">WhatsApp / Phone Number</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400"><FiPhone className="text-sm" /></span>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-emerald-600 transition-colors text-xs"
                    required
                  />
                </div>
              </div>

              {/* Access Role */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Access Role</label>
                <div className="relative">
                  {editingUser.role !== "GUEST" ? (
                    <>
                      <select
                        value={editRole}
                        onChange={(e) => setEditRole(e.target.value as any)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-650 focus:outline-none focus:border-emerald-600 transition-colors text-xs appearance-none"
                      >
                        <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                        <option value="RESORT_MANAGER">RESORT_MANAGER</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-500">
                        ▼
                      </div>
                    </>
                  ) : (
                    <input
                      type="text"
                      value="GUEST"
                      disabled
                      className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-400 text-xs font-semibold"
                    />
                  )}
                </div>
              </div>

              {/* Set New Password (Optional) */}
              <div className="space-y-1 pt-1 border-t border-slate-100">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Set New Password (Leave blank to keep current)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400"><FiLock className="text-sm" /></span>
                  <input
                    type="password"
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    placeholder="New Secure Password"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-emerald-600 transition-colors text-xs"
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-5 py-2.5 rounded-xl bg-[#00966B] hover:bg-[#007c58] text-white font-bold text-xs transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  <span>{isUpdating ? "Saving Details..." : "Save Details"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
