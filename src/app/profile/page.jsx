"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Camera, Mail, Phone, User, Shield, Save, X, Edit2, CheckCircle } from "lucide-react";
import Image from "next/image";
import admin from "../images/admin.jpg";
import { updateUserProfile } from "@/services/api";

export default function ProfilePage() {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // Profile data state
  const [profileData, setProfileData] = useState({
    fullName: "",
    email: "",
    userId: "",
    userRole: "",
    profilePic: "",
  });

  // Edit form state
  const [editData, setEditData] = useState({
    fullName: "",
    email: "",
  });

  // Load profile data from sessionStorage
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    const userRole = sessionStorage.getItem("userRole");

    if (!token || (userRole !== "ROLE_MASTER_ADMIN" && userRole !== "ROLE_ADMIN")) {
      sessionStorage.clear();
      router.push("/login");
      return;
    }

    // Load user data
    const fullName = sessionStorage.getItem("fullName") || "Admin";
    const email = sessionStorage.getItem("userName") || "";
    const userId = sessionStorage.getItem("userId") || "";
    const role = sessionStorage.getItem("userRole") || "";
    const profilePic = sessionStorage.getItem("userProfilePic") || "";

    const userData = {
      fullName,
      email,
      userId,
      userRole: role,
      profilePic,
    };

    setProfileData(userData);
    setEditData({
      fullName,
      email,
    });
  }, [router]);

  const handleEdit = () => {
    setIsEditing(true);
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({
      fullName: profileData.fullName,
      email: profileData.email,
    });
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleSave = async () => {
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      // Update sessionStorage with new data
      sessionStorage.setItem("fullName", editData.fullName);
      sessionStorage.setItem("userName", editData.email);

      // Update profile data state
      setProfileData({
        ...profileData,
        fullName: editData.fullName,
        email: editData.email,
      });

      setSuccessMsg("Profile updated successfully!");
      setIsEditing(false);

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMsg(null);
      }, 3000);
    } catch (error) {
      setErrorMsg("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-auto relative z-10">
      <main className="max-w-3xl mx-auto p-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600 text-sm mt-1">Manage your account information</p>
        </div>

        {/* Success/Error Messages */}
        {successMsg && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2">
            <CheckCircle size={18} className="text-green-600" />
            <p className="text-green-700 text-sm font-medium">{successMsg}</p>
          </div>
        )}

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
            <X size={18} className="text-red-600" />
            <p className="text-red-700 text-sm font-medium">{errorMsg}</p>
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          {/* Profile Picture and Name */}
          <div className="flex items-center space-x-4 pb-6 border-b border-gray-200">
            <div className="relative w-20 h-20 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200">
              <Image
                src={admin}
                alt="Profile"
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900">
                {profileData.fullName}
              </h2>
              <p className="text-sm text-gray-600 flex items-center mt-1">
                <Shield size={14} className="mr-1" />
                {profileData.userRole === "ROLE_MASTER_ADMIN" ? "Master Admin" : "Admin"}
              </p>
            </div>
            {!isEditing && (
              <button
                onClick={handleEdit}
                className="px-4 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition flex items-center space-x-2"
              >
                <Edit2 size={16} />
                <span>Edit</span>
              </button>
            )}
          </div>

          {/* Profile Information */}
          <div className="mt-6 space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Full Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={editData.fullName}
                  onChange={(e) =>
                    setEditData({ ...editData, fullName: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-1 focus:ring-gray-900 focus:border-gray-900 outline-none text-gray-900"
                  placeholder="Enter your full name"
                />
              ) : (
                <div className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 bg-gray-50 text-gray-900">
                  {profileData.fullName}
                </div>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Email Address
              </label>
              {isEditing ? (
                <input
                  type="email"
                  value={editData.email}
                  onChange={(e) =>
                    setEditData({ ...editData, email: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-1 focus:ring-gray-900 focus:border-gray-900 outline-none text-gray-900"
                  placeholder="Enter your email"
                />
              ) : (
                <div className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 bg-gray-50 text-gray-900">
                  {profileData.email}
                </div>
              )}
            </div>

            {/* User ID */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                User ID
              </label>
              <div className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 bg-gray-50 text-gray-600 font-mono">
                #{profileData.userId}
              </div>
            </div>

            {/* Role */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Role
              </label>
              <div className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 bg-gray-50">
                <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-medium bg-gray-900 text-white">
                  <Shield size={12} className="mr-1" />
                  {profileData.userRole === "ROLE_MASTER_ADMIN" ? "Master Admin" : "Admin"}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex space-x-3 mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={handleCancel}
                disabled={loading}
                className="flex-1 px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex-1 px-4 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
