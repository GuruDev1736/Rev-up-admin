"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Save, Ticket } from "lucide-react";
import { getAllCoupons, createCoupon, updateCoupon } from "@/services/api";

export default function CouponFormPage() {
  const router = useRouter();
  const params = useParams();
  const couponId = params.id;
  const isAddMode = couponId === "add";

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const [formData, setFormData] = useState({
    couponName: "",
    couponCode: "",
    couponDescription: "",
    couponDiscount: "",
    couponType: "DISTRIBUTED",
    isActive: true,
  });

  useEffect(() => {
    if (!isAddMode) {
      fetchCouponData();
    }
  }, [couponId]);

  const fetchCouponData = async () => {
    try {
      setLoading(true);
      const response = await getAllCoupons();

      if (response.STS === "200" && response.CONTENT) {
        const coupon = response.CONTENT.find((c) => c.id === parseInt(couponId));

        if (coupon) {
          setFormData({
            couponName: coupon.couponName || "",
            couponCode: coupon.couponCode || "",
            couponDescription: coupon.couponDescription || "",
            couponDiscount: coupon.couponDiscount || "",
            couponType: coupon.couponType?.trim() || "DISTRIBUTED",
            isActive: coupon.isActive ?? true,
          });
        } else {
          setError("Coupon not found");
        }
      }
    } catch (err) {
      setError("Failed to load coupon data");
      console.error("Error loading coupon:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMessage("");

    try {
      const couponData = {
        couponName: formData.couponName,
        couponCode: formData.couponCode.toUpperCase(),
        couponDescription: formData.couponDescription,
        couponDiscount: parseFloat(formData.couponDiscount),
        couponType: formData.couponType,
      };

      const response = isAddMode
        ? await createCoupon(couponData)
        : await updateCoupon(couponId, couponData);

      if (response.STS === "200") {
        setSuccessMessage(
          isAddMode ? "Coupon created successfully!" : "Coupon updated successfully!"
        );
        setTimeout(() => {
          router.push("/coupons");
        }, 1500);
      } else {
        setError(
          response.MSG ||
            (isAddMode ? "Failed to create coupon" : "Failed to update coupon")
        );
      }
    } catch (err) {
      setError(
        isAddMode
          ? "An error occurred while creating the coupon"
          : "An error occurred while updating the coupon"
      );
      console.error("Error saving coupon:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading && !isAddMode) {
    return (
      <div className="flex-1 overflow-auto relative z-10">
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#f02521]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto relative z-10">
      <div className="max-w-4xl mx-auto py-6 px-4 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.push("/coupons")}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="flex items-center gap-3">
            <Ticket size={32} className="text-[#f02521]" />
            <h1 className="text-2xl font-bold text-black">
              {isAddMode ? "Add New Coupon" : "Edit Coupon"}
            </h1>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600"
          >
            {error}
          </motion.div>
        )}

        {/* Success Message */}
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-600"
          >
            {successMessage}
          </motion.div>
        )}

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          onSubmit={handleSubmit}
          className="bg-[#1f1f1f] rounded-xl shadow-lg p-6 lg:p-8"
        >
          {/* Coupon Name */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Coupon Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="couponName"
              value={formData.couponName}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-[#2f2f2f] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#f02521]"
              placeholder="e.g., Welcome Offer"
            />
          </div>

          {/* Coupon Code */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Coupon Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="couponCode"
              value={formData.couponCode}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-[#2f2f2f] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#f02521] uppercase"
              placeholder="e.g., WELCOME10"
              style={{ textTransform: "uppercase" }}
            />
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="couponDescription"
              value={formData.couponDescription}
              onChange={handleChange}
              required
              rows={3}
              className="w-full px-4 py-2 bg-[#2f2f2f] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#f02521]"
              placeholder="e.g., 10% off for new users"
            />
          </div>

          {/* Discount and Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Discount (%) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="couponDiscount"
                value={formData.couponDiscount}
                onChange={handleChange}
                required
                step="0.01"
                min="0"
                max="100"
                className="w-full px-4 py-2 bg-[#2f2f2f] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#f02521]"
                placeholder="e.g., 10"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Coupon Type <span className="text-red-500">*</span>
              </label>
              <select
                name="couponType"
                value={formData.couponType}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-[#2f2f2f] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#f02521]"
              >
                <option value="DISTRIBUTED">DISTRIBUTED</option>
                <option value="PRIVATE">PRIVATE</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => router.push("/coupons")}
              className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-[#f02521] to-[#f85d5d] text-white rounded-lg hover:shadow-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save size={20} />
                  {isAddMode ? "Create Coupon" : "Update Coupon"}
                </>
              )}
            </button>
          </div>
        </motion.form>
      </div>
    </div>
  );
}
