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

    if (!token || userRole !== "ROLE_MASTER_ADMIN") {
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
      <main className="max-w-5xl mx-auto p-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600 mt-1">
            Manage your account settings and profile information
          </p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Attractive Cover Banner */}
          <div className="relative h-48 bg-gradient-to-br from-[#f02521] via-[#f85d5d] to-[#ff7b7b] overflow-hidden">
            {/* Animated Background Pattern */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 left-0 w-72 h-72 bg-white rounded-full mix-blend-overlay filter blur-xl animate-blob"></div>
              <div className="absolute top-0 right-0 w-72 h-72 bg-white rounded-full mix-blend-overlay filter blur-xl animate-blob animation-delay-2000"></div>
              <div className="absolute -bottom-8 left-20 w-72 h-72 bg-white rounded-full mix-blend-overlay filter blur-xl animate-blob animation-delay-4000"></div>
            </div>
            
            {/* Decorative Elements */}
            <div className="absolute top-4 right-4">
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-white/30 rounded-full"></div>
                <div className="w-3 h-3 bg-white/40 rounded-full"></div>
                <div className="w-3 h-3 bg-white/50 rounded-full"></div>
              </div>
            </div>

            {/* Grid Pattern */}
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: `linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)`,
              backgroundSize: '50px 50px'
            }}></div>

            {/* Welcome Text - Adjusted position to avoid overlap */}
            <div className="absolute top-6 left-6 text-white">
              <h3 className="text-2xl font-bold drop-shadow-lg">Master Admin Profile</h3>
              <p className="text-white/90 text-sm mt-1 drop-shadow">Manage your account and settings</p>
            </div>
          </div>

          {/* Profile Content */}
          <div className="relative px-6 pb-6">
            {/* Profile Picture */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:space-x-6 pt-4">
              <div className="relative -mt-20 mb-4 sm:mb-0 ml-0 sm:ml-4">
                <div className="relative w-36 h-36 rounded-full border-4 border-white shadow-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 ring-4 ring-[#f02521]/20">
                  <Image
                    src={admin}
                    alt="Profile"
                    fill
                    className="object-cover"
                  />
                  {/* Online Status Indicator */}
                  <div className="absolute bottom-2 right-2 w-5 h-5 bg-green-500 rounded-full border-2 border-white shadow-lg"></div>
                </div>
                <button className="absolute bottom-0 right-0 bg-gradient-to-r from-[#f02521] to-[#f85d5d] text-white p-3 rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all group">
                  <Camera size={18} className="group-hover:rotate-12 transition-transform" />
                </button>
              </div>

              <div className="flex-1 sm:pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {profileData.fullName}
                    </h2>
                    <p className="text-gray-600 flex items-center mt-1">
                      <Shield size={16} className="mr-1" />
                      Master Administrator
                    </p>
                  </div>

                  {!isEditing ? (
                    <button
                      onClick={handleEdit}
                      className="mt-4 sm:mt-0 bg-gradient-to-r from-[#f02521] to-[#f85d5d] text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all flex items-center space-x-2"
                    >
                      <Edit2 size={18} />
                      <span>Edit Profile</span>
                    </button>
                  ) : (
                    <div className="flex space-x-2 mt-4 sm:mt-0">
                      <button
                        onClick={handleCancel}
                        disabled={loading}
                        className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-5 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all disabled:opacity-50 border border-gray-300"
                      >
                        <X size={18} />
                        <span>Cancel</span>
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={loading}
                        className="flex items-center space-x-2 bg-gradient-to-r from-[#f02521] to-[#f85d5d] text-white px-5 py-3 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50"
                      >
                        <Save size={18} />
                        <span>{loading ? "Saving..." : "Save Changes"}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Success/Error Messages */}
            {successMsg && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center space-x-3 animate-fadeIn">
                <CheckCircle size={20} className="text-green-600 flex-shrink-0" />
                <p className="text-green-700 font-medium">{successMsg}</p>
              </div>
            )}

            {errorMsg && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-3 animate-fadeIn">
                <X size={20} className="text-red-600 flex-shrink-0" />
                <p className="text-red-700 font-medium">{errorMsg}</p>
              </div>
            )}

            {/* Profile Information */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User size={16} className="inline mr-2" />
                  Full Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.fullName}
                    onChange={(e) =>
                      setEditData({ ...editData, fullName: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-[#f02521] focus:border-[#f02521] outline-none text-gray-900 transition-all bg-white"
                    placeholder="Enter your full name"
                  />
                ) : (
                  <div className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 text-gray-900 font-medium">
                    {profileData.fullName}
                  </div>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail size={16} className="inline mr-2" />
                  Email Address
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={editData.email}
                    onChange={(e) =>
                      setEditData({ ...editData, email: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-[#f02521] focus:border-[#f02521] outline-none text-gray-900 transition-all bg-white"
                    placeholder="Enter your email"
                  />
                ) : (
                  <div className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 text-gray-900 font-medium">
                    {profileData.email}
                  </div>
                )}
              </div>

              {/* User ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  User ID
                </label>
                <div className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 text-gray-600 font-mono font-semibold">
                  #{profileData.userId}
                </div>
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Shield size={16} className="inline mr-2" />
                  Role
                </label>
                <div className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                  <span className="inline-flex items-center px-4 py-1.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-[#f02521] to-[#f85d5d] text-white shadow-md">
                    <Shield size={14} className="mr-1.5" />
                    Master Administrator
                  </span>
                </div>
              </div>
            </div>

            {/* Account Information Section */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <div className="w-1 h-6 bg-gradient-to-b from-[#f02521] to-[#f85d5d] rounded-full mr-3"></div>
                Account Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start space-x-4 p-5 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200 hover:shadow-md transition-all">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                    <CheckCircle size={22} className="text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-lg">
                      Account Status
                    </h4>
                    <p className="text-sm text-green-700 font-medium mt-1">Active & Verified</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-5 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 hover:shadow-md transition-all">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                    <Mail size={22} className="text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-lg">
                      Email Verified
                    </h4>
                    <p className="text-sm text-blue-700 font-medium mt-1">Confirmed</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
