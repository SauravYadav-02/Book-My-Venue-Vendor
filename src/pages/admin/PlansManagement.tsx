import React, { useState, useEffect, useCallback } from "react";
import { getAllPlansAdmin, createPlan, updatePlan, deletePlan, type Plan } from "../../services/subscriptionService";
import toast from "react-hot-toast";
import { Plus, Edit2, Trash2, XCircle } from "lucide-react";
import { currencyFormatter } from "../../utils/currency";
import { motion, AnimatePresence } from "framer-motion";

export default function PlansManagement() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 5, totalRecords: 0, totalPages: 0 });
  const [searchTerm, setSearchTerm] = useState("");

  // Form State
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Plan>>({ name: "", duration_days: 30, price: 0, is_active: true, features: [] });
  const [featureInput, setFeatureInput] = useState("");

  const adminId = localStorage.getItem("adminId") || "admin-mock-id";

  const fetchPlans = useCallback(async (page = pagination.page, search = searchTerm) => {
    setLoading(true);
    try {
      const response = await getAllPlansAdmin(adminId, page, pagination.limit, search);
      setPlans(response.data);
      setPagination({
        page: response.page,
        limit: response.limit,
        totalRecords: response.totalRecords,
        totalPages: response.totalPages
      });
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error("Failed to load plans " + (err?.message || String(error)));
    } finally {
      setLoading(false);
    }
  }, [adminId, pagination.limit]);

  useEffect(() => {
    fetchPlans(1, searchTerm);
  }, [searchTerm, fetchPlans]);

  useEffect(() => {
    fetchPlans(pagination.page, searchTerm);
  }, [pagination.page, fetchPlans]);

  const handleAddFeature = () => {
    if (!featureInput.trim()) return;
    setFormData((prev) => ({ ...prev, features: [...(prev.features || []), featureInput.trim()] }));
    setFeatureInput("");
  };

  const handleRemoveFeature = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features?.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await updatePlan(adminId, isEditing, formData);
        toast.success("Plan updated successfully");
      } else {
        await createPlan(adminId, formData);
        toast.success("Plan created successfully");
      }
      setFormData({ name: "", duration_days: 30, price: 0, is_active: true, features: [] });
      setIsEditing(null);
      fetchPlans();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || "Failed to save plan");
    }
  };

  const handleEditClick = (plan: Plan) => {
    setIsEditing(plan._id);
    setFormData({
      name: plan.name,
      duration_days: plan.duration_days,
      price: plan.price,
      is_active: plan.is_active,
      features: plan.features || [],
    });
  };

  const handleDelete = async (planId: string) => {
    if (!window.confirm("Are you sure you want to delete this plan?")) return;
    try {
      await deletePlan(adminId, planId);
      toast.success("Plan deleted successfully");
      fetchPlans();
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error("Failed to delete plan " + (err?.message || String(error)));
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Manage Subscription Plans</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* --- Form Section --- */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white p-6 rounded-xl border shadow-sm h-fit"
        >
          <h2 className="text-xl font-semibold mb-4">{isEditing ? "Edit Plan" : "Create New Plan"}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Plan Name</label>
              <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="mt-1 w-full p-2 border rounded-md" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Duration (Days)</label>
                <input type="number" min="1" required value={formData.duration_days} onChange={(e) => setFormData({ ...formData, duration_days: Number(e.target.value) })} className="mt-1 w-full p-2 border rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Price ({currencyFormatter.resolvedOptions().currency})</label>
                <input type="number" min="0" required value={formData.price} onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })} className="mt-1 w-full p-2 border rounded-md" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Features</label>
              <div className="flex gap-2 mb-2">
                <input type="text" value={featureInput} onChange={(e) => setFeatureInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddFeature())} className="flex-1 p-2 border rounded-md text-sm" placeholder="Add a feature..." />
                <button type="button" onClick={handleAddFeature} className="bg-gray-100 px-3 rounded-md hover:bg-gray-200"><Plus size={18} /></button>
              </div>
              <ul className="space-y-1">
                {formData.features?.map((f, i) => (
                  <li key={i} className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded-md">
                    <span>{f}</span>
                    <button type="button" onClick={() => handleRemoveFeature(i)} className="text-red-500 hover:text-red-700"><XCircle size={16} /></button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-center gap-2 mt-4">
              <input type="checkbox" id="isActive" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} className="w-4 h-4 text-indigo-600 rounded" />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Active / Visible to Vendors</label>
            </div>

            <div className="flex gap-2 pt-4">
              <button type="submit" className="flex-1 bg-indigo-600 text-white py-2 rounded-md font-semibold hover:bg-indigo-700">
                {isEditing ? "Save Changes" : "Create Plan"}
              </button>
              {isEditing && (
                <button type="button" onClick={() => { setIsEditing(null); setFormData({ name: "", duration_days: 30, price: 0, is_active: true, features: [] }); }} className="bg-gray-200 text-gray-800 py-2 px-4 rounded-md font-semibold hover:bg-gray-300">
                  Cancel
                </button>
              )}
            </div>
          </form>
        </motion.div>

        {/* --- Plans List Section --- */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search Bar */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search plans..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 border rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {loading ? (
            <p className="text-gray-500">Loading plans...</p>
          ) : plans.length === 0 ? (
            <p className="text-gray-500">No plans created yet.</p>
          ) : (
            <>
              <AnimatePresence>
                {plans.map((plan, index) => (
                  <motion.div 
                    key={plan._id} 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className={`p-5 rounded-xl border flex flex-col sm:flex-row justify-between gap-4 mb-4 ${plan.is_active ? 'bg-white shadow-sm' : 'bg-gray-50 opacity-75'}`}
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                        {plan.is_active ?
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-medium">Active</span> :
                          <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full font-medium">Inactive</span>
                        }
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{plan.duration_days} Days • {currencyFormatter.format(plan.price)}</p>
                      <div className="flex flex-wrap gap-2">
                        {plan.features?.map((f, i) => (
                          <span key={i} className="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded-md">{f}</span>
                        ))}
                      </div>
                    </div>
    
                    <div className="flex sm:flex-col justify-end gap-2 shrink-0">
                      <button onClick={() => handleEditClick(plan)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="Edit Plan">
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => handleDelete(plan._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Delete Plan">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Pagination Controls */}
              {pagination.totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-6">
                  <button
                    disabled={pagination.page <= 1}
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    className="px-4 py-2 bg-white border rounded-md disabled:opacity-50 hover:bg-gray-50 transition-colors shadow-sm"
                  >
                    Previous
                  </button>
                  <span className="text-sm font-medium text-gray-600">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <button
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    className="px-4 py-2 bg-white border rounded-md disabled:opacity-50 hover:bg-gray-50 transition-colors shadow-sm"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
