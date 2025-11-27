"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  X,
  Upload,
  Eye,
  EyeOff,
  Save,
  Key
} from "lucide-react";
import Image from "next/image";
import { getAllPlaces } from "@/services/api/placesService";
import { registerAdmin, getAllAdmins } from "@/services/api/adminService";
import { uploadImage } from "@/services/api/uploadService";
import { updateUser, deleteUser } from "@/services/api/usersService";
import { resetPassword } from "@/services/api/forgotPasswordService";
import StatCard from "../components/StatCard";
import MessageDialog from "../components/MessageDialog";
import ConfirmDialog from "../components/ConfirmDialog";
import { Users, UserCheck } from "lucide-react";

const ManageAdminPage = () => {
  const router = useRouter();
  const [admins, setAdmins] = useState([]);
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showChangePasswordDialog, setShowChangePasswordDialog] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [changingPasswordAdmin, setChangingPasswordAdmin] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profilePreview, setProfilePreview] = useState("");
  const [uploadedProfilePic, setUploadedProfilePic] = useState(null);
  const [saving, setSaving] = useState(false);

  // Message dialog states
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [messageType, setMessageType] = useState("success");
  const [messageTitle, setMessageTitle] = useState("");
  const [messageContent, setMessageContent] = useState("");

  // Confirm dialog states
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [deletingAdminId, setDeletingAdminId] = useState(null);
  const [deletingAdminName, setDeletingAdminName] = useState("");

  const showMessage = (type, title, content) => {
    setMessageType(type);
    setMessageTitle(title);
    setMessageContent(content);
    setShowMessageDialog(true);
  };

  const [errors, setErrors] = useState({
    phoneNumber: "",
    email: "",
  });
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
    password: "",
    profilePicture: "",
    place: "",
  });

  const [stats, setStats] = useState({
    total: 0,
    active: 0,
  });

  // Check if user is master admin, redirect if not
  useEffect(() => {
    const userRole = sessionStorage.getItem("userRole");
    if (userRole !== "ROLE_MASTER_ADMIN") {
      router.push("/overview");
    }
  }, [router]);

  // Fetch places
  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const response = await getAllPlaces();
        if (response.STS === "200" && response.CONTENT) {
          setPlaces(response.CONTENT);
        }
      } catch (error) {
        console.error("Error fetching places:", error);
      }
    };

    fetchPlaces();
  }, []);

  // Fetch admins from API
  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const response = await getAllAdmins();
      
      if (response.STS === "200" && response.CONTENT) {
        setAdmins(response.CONTENT);
        
        // Calculate stats based on actual data
        const total = response.CONTENT.length;
        // Count active admins - assuming admins without a deleted flag or with active status are active
        const active = response.CONTENT.filter(a => 
          !a.isDeleted && (!a.status || a.status === "active" || a.status === "ACTIVE")
        ).length;
        
        setStats({ total, active });
      }
    } catch (error) {
      console.error("Error fetching admins:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  // Filter admins
  const filteredAdmins = admins.filter((admin) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      admin.firstName?.toLowerCase().includes(searchLower) ||
      admin.lastName?.toLowerCase().includes(searchLower) ||
      admin.email?.toLowerCase().includes(searchLower) ||
      admin.phoneNumber?.includes(searchTerm)
    );
  });

  // Handle form change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Validate phone number
  const validatePhoneNumber = (phone) => {
    // Remove spaces and special characters for validation
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, "");
    
    // Check if it's a valid Indian phone number format
    const phoneRegex = /^(\+91)?[6-9]\d{9}$/;
    
    if (!phone) {
      return "Phone number is required";
    }
    
    if (!phoneRegex.test(cleanPhone)) {
      return "Please enter a valid 10-digit Indian phone number";
    }
    
    return "";
  };

  // Validate email
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!email) {
      return "Email is required";
    }
    
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address";
    }
    
    return "";
  };

  // Handle profile pic upload
  const handleProfilePicUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        showMessage("error", "Invalid File", "Please upload a valid image file");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showMessage("error", "File Too Large", "Image size should be less than 5MB");
        return;
      }

      setUploadedProfilePic(file);
      setProfilePreview(URL.createObjectURL(file));
    }
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate phone number and email
    const phoneError = validatePhoneNumber(formData.phoneNumber);
    const emailError = validateEmail(formData.email);
    
    if (phoneError || emailError) {
      setErrors({
        phoneNumber: phoneError,
        email: emailError,
      });
      return;
    }
    
    setSaving(true);

    try {
      let profilePictureUrl = "";

      // Upload profile picture if provided
      if (uploadedProfilePic) {
        const uploadResponse = await uploadImage(uploadedProfilePic, uploadedProfilePic.name);
        
        if (uploadResponse.STS === "200" && uploadResponse.CONTENT) {
          profilePictureUrl = uploadResponse.CONTENT;
        } else {
          showMessage("error", "Upload Failed", uploadResponse.MSG || "Failed to upload profile picture");
          setSaving(false);
          return;
        }
      }

      // Prepare admin data
      const adminData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        password: formData.password,
        profilePicture: profilePictureUrl,
      };

      // Register admin with placeId as request param
      const response = await registerAdmin(parseInt(formData.place), adminData);

      if (response.success) {
        showMessage("success", "Success", response.message || "Admin added successfully!");
        
        // Refresh admin list
        await fetchAdmins();
        
        // Reset form
        setFormData({
          firstName: "",
          lastName: "",
          phoneNumber: "",
          email: "",
          password: "",
          profilePicture: "",
          place: "",
        });
        setProfilePreview("");
        setUploadedProfilePic(null);
        setShowAddDialog(false);
        setErrors({ phoneNumber: "", email: "" });
      } else {
        showMessage("error", "Error", response.message || "Failed to add admin");
      }
    } catch (error) {
      console.error("Error creating admin:", error);
      showMessage("error", "Error", "An error occurred while adding admin");
    } finally {
      setSaving(false);
    }
  };

  // Open delete confirmation
  const handleDeleteClick = (admin) => {
    setDeletingAdminId(admin.id);
    setDeletingAdminName(`${admin.firstName} ${admin.lastName}`);
    setShowConfirmDialog(true);
  };

  // Delete admin after confirmation
  const handleConfirmDelete = async () => {
    setShowConfirmDialog(false);
    
    try {
      const response = await deleteUser(deletingAdminId);
      
      if (response.STS === "200") {
        showMessage("success", "Success", "Admin deleted successfully!");
        await fetchAdmins();
      } else {
        showMessage("error", "Error", response.MSG || "Failed to delete admin");
      }
    } catch (error) {
      console.error("Error deleting admin:", error);
      showMessage("error", "Error", "An error occurred while deleting admin");
    } finally {
      setDeletingAdminId(null);
      setDeletingAdminName("");
    }
  };

  // Open edit dialog
  const handleEdit = (admin) => {
    setEditingAdmin(admin);
    setFormData({
      firstName: admin.firstName || "",
      lastName: admin.lastName || "",
      phoneNumber: admin.phoneNumber || "",
      email: admin.email || "",
      password: "",
      profilePicture: admin.profilePicture || "",
      place: admin.place?.id?.toString() || "",
    });
    setProfilePreview(admin.profilePicture || "");
    setShowEditDialog(true);
  };

  // Handle update admin
  const handleUpdate = async (e) => {
    e.preventDefault();
    
    // Validate phone number and email
    const phoneError = validatePhoneNumber(formData.phoneNumber);
    const emailError = validateEmail(formData.email);
    
    if (phoneError || emailError) {
      setErrors({
        phoneNumber: phoneError,
        email: emailError,
      });
      return;
    }
    
    setSaving(true);

    try {
      let profilePictureUrl = formData.profilePicture;

      // Upload profile picture if a new one is provided
      if (uploadedProfilePic) {
        const uploadResponse = await uploadImage(uploadedProfilePic, uploadedProfilePic.name);
        
        if (uploadResponse.STS === "200" && uploadResponse.CONTENT) {
          profilePictureUrl = uploadResponse.CONTENT;
        } else {
          showMessage("error", "Upload Failed", uploadResponse.MSG || "Failed to upload profile picture");
          setSaving(false);
          return;
        }
      }

      // Prepare admin data (without place as per requirement)
      const adminData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        profilePicture: profilePictureUrl,
      };

      // Update admin using updateUser API
      const response = await updateUser(editingAdmin.id, adminData);

      if (response.STS === "200") {
        showMessage("success", "Success", "Admin updated successfully!");
        
        // Refresh admin list
        await fetchAdmins();
        
        // Reset form
        setFormData({
          firstName: "",
          lastName: "",
          phoneNumber: "",
          email: "",
          password: "",
          profilePicture: "",
          place: "",
        });
        setProfilePreview("");
        setUploadedProfilePic(null);
        setShowEditDialog(false);
        setEditingAdmin(null);
        setErrors({ phoneNumber: "", email: "" });
      } else {
        showMessage("error", "Error", response.MSG || "Failed to update admin");
      }
    } catch (error) {
      console.error("Error updating admin:", error);
      showMessage("error", "Error", "An error occurred while updating admin");
    } finally {
      setSaving(false);
    }
  };

  // Format timestamp to readable date
  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Open change password dialog
  const handleOpenChangePassword = (admin) => {
    setChangingPasswordAdmin(admin);
    setNewPassword("");
    setConfirmPassword("");
    setShowChangePasswordDialog(true);
  };

  // Handle change password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (newPassword.length < 6) {
      showMessage("error", "Validation Error", "Password must be at least 6 characters long");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      showMessage("error", "Validation Error", "Passwords do not match");
      return;
    }
    
    setSaving(true);

    try {
      const response = await resetPassword(changingPasswordAdmin.email, newPassword);
      
      if (response.STS === "200") {
        showMessage("success", "Success", "Password changed successfully!");
        setShowChangePasswordDialog(false);
        setChangingPasswordAdmin(null);
        setNewPassword("");
        setConfirmPassword("");
      } else {
        showMessage("error", "Error", response.MSG || "Failed to change password");
      }
    } catch (error) {
      console.error("Error changing password:", error);
      showMessage("error", "Error", "An error occurred while changing password");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 overflow-auto relative z-10">
      <div className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#f02521] to-[#f85d5d] bg-clip-text text-transparent">
                Manage Admins
              </h1>
              <p className="text-gray-600 mt-2">Manage admin accounts and permissions</p>
            </div>
            <button
              onClick={() => setShowAddDialog(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#f02521] to-[#f85d5d] text-white rounded-lg hover:opacity-90 transition"
            >
              <Plus size={20} />
              Add Admin
            </button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-white rounded-lg p-4 shadow-md border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-1">Total Admins</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="bg-[#d8ebff] p-3 rounded-lg">
                <Users className="text-blue-500" size={24} />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-md border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-1">Active</p>
                <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
              </div>
              <div className="bg-[#e8ffd8] p-3 rounded-lg">
                <UserCheck className="text-green-500" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-xl p-3 shadow-lg mb-4 border border-gray-200"
        >
          <div className="relative">
            <input
              type="text"
              placeholder="Search admins by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f02521] text-gray-900"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>
        </motion.div>

        {/* Admins Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
        >
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#f02521] border-r-transparent"></div>
              <p className="mt-4 text-gray-600">Loading admins...</p>
            </div>
          ) : filteredAdmins.length === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-600">No admins found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Admin
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Place
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created At
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAdmins.map((admin) => (
                    <tr key={admin.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Image
                            src={admin.profilePicture || admin.profilePic || "https://i.pravatar.cc/150?img=1"}
                            alt={`${admin.firstName} ${admin.lastName}`}
                            width={40}
                            height={40}
                            className="rounded-full object-cover"
                          />
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {admin.firstName} {admin.lastName}
                            </div>
                            <div className="text-sm text-gray-500">{admin.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{admin.phoneNumber || admin.phoneNo}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {admin.place?.placeName || admin.place?.name || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(admin.creationDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(admin)}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="Edit"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleOpenChangePassword(admin)}
                            className="text-yellow-600 hover:text-yellow-900"
                            title="Change Password"
                          >
                            <Key size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(admin)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>

      {/* Add Admin Dialog */}
      {showAddDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Dialog Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Add New Admin</h2>
              <button
                onClick={() => setShowAddDialog(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X size={24} />
              </button>
            </div>

            {/* Dialog Body */}
            <form onSubmit={handleSubmit} className="p-6">
              {/* Profile Picture Upload */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profile Picture
                </label>
                <div className="flex items-center gap-4">
                  {profilePreview ? (
                    <Image
                      src={profilePreview}
                      alt="Profile preview"
                      width={80}
                      height={80}
                      className="rounded-full object-cover border-2 border-gray-200"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                      <Users className="text-gray-400" size={32} />
                    </div>
                  )}
                  <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 transition">
                    <Upload size={18} />
                    Choose Image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePicUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-2">Max size: 5MB. Formats: JPG, PNG, JPEG</p>
              </div>

              {/* Name Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f02521] text-gray-900"
                    placeholder="John"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f02521] text-gray-900"
                    placeholder="Doe"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-2 border ${
                    errors.phoneNumber ? "border-red-500" : "border-gray-300"
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f02521] text-gray-900`}
                  placeholder="+91 9876543210"
                />
                {errors.phoneNumber && (
                  <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">Format: +91 XXXXXXXXXX or 10-digit number</p>
              </div>

              {/* Email */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-2 border ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f02521] text-gray-900`}
                  placeholder="admin@revup.com"
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f02521] text-gray-900 pr-10"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
              </div>

              {/* Place Dropdown */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Place <span className="text-red-500">*</span>
                </label>
                <select
                  name="place"
                  value={formData.place}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f02521] text-gray-900"
                >
                  <option value="">Select a place</option>
                  {places.map((place) => (
                    <option key={place.id} value={place.id}>
                      {place.placeName || place.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowAddDialog(false)}
                  className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-[#f02521] to-[#f85d5d] text-white rounded-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Add Admin
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Edit Admin Dialog */}
      {showEditDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Dialog Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Edit Admin</h2>
              <button
                onClick={() => {
                  setShowEditDialog(false);
                  setEditingAdmin(null);
                  setProfilePreview("");
                  setUploadedProfilePic(null);
                  setErrors({ phoneNumber: "", email: "" });
                }}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X size={24} />
              </button>
            </div>

            {/* Dialog Body */}
            <form onSubmit={handleUpdate} className="p-6">
              {/* Profile Picture Upload */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profile Picture
                </label>
                <div className="flex items-center gap-4">
                  {profilePreview ? (
                    <Image
                      src={profilePreview}
                      alt="Profile preview"
                      width={80}
                      height={80}
                      className="rounded-full object-cover border-2 border-gray-200"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                      <Users className="text-gray-400" size={32} />
                    </div>
                  )}
                  <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 transition">
                    <Upload size={18} />
                    Choose Image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePicUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-2">Max size: 5MB. Formats: JPG, PNG, JPEG</p>
              </div>

              {/* Name Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f02521] text-gray-900"
                    placeholder="John"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f02521] text-gray-900"
                    placeholder="Doe"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-2 border ${
                    errors.phoneNumber ? "border-red-500" : "border-gray-300"
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f02521] text-gray-900`}
                  placeholder="+91 9876543210"
                />
                {errors.phoneNumber && (
                  <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">Format: +91 XXXXXXXXXX or 10-digit number</p>
              </div>

              {/* Email */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-2 border ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f02521] text-gray-900`}
                  placeholder="admin@revup.com"
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              {/* Place (Display only, not editable) */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Place
                </label>
                <input
                  type="text"
                  value={editingAdmin?.place?.placeName || editingAdmin?.place?.name || "N/A"}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">Place cannot be changed</p>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditDialog(false);
                    setEditingAdmin(null);
                    setProfilePreview("");
                    setUploadedProfilePic(null);
                    setErrors({ phoneNumber: "", email: "" });
                  }}
                  className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-[#f02521] to-[#f85d5d] text-white rounded-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Update Admin
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Change Password Dialog */}
      {showChangePasswordDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-2xl max-w-md w-full"
          >
            {/* Dialog Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center rounded-t-xl">
              <h2 className="text-xl font-bold text-gray-900">Change Password</h2>
              <button
                onClick={() => {
                  setShowChangePasswordDialog(false);
                  setChangingPasswordAdmin(null);
                  setNewPassword("");
                  setConfirmPassword("");
                }}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X size={24} />
              </button>
            </div>

            {/* Dialog Body */}
            <form onSubmit={handleChangePassword} className="p-6">
              {/* Admin Info */}
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Changing password for:</p>
                <p className="text-base font-semibold text-gray-900">
                  {changingPasswordAdmin?.firstName} {changingPasswordAdmin?.lastName}
                </p>
                <p className="text-sm text-gray-600">{changingPasswordAdmin?.email}</p>
              </div>

              {/* New Password */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f02521] text-gray-900 pr-10"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
              </div>

              {/* Confirm Password */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f02521] text-gray-900"
                  placeholder="Confirm new password"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowChangePasswordDialog(false);
                    setChangingPasswordAdmin(null);
                    setNewPassword("");
                    setConfirmPassword("");
                  }}
                  className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-[#f02521] to-[#f85d5d] text-white rounded-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></div>
                      Changing...
                    </>
                  ) : (
                    <>
                      <Key size={18} />
                      Change Password
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={() => {
          setShowConfirmDialog(false);
          setDeletingAdminId(null);
          setDeletingAdminName("");
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Admin"
        message={`Are you sure you want to delete ${deletingAdminName}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
      />

      {/* Message Dialog */}
      <MessageDialog
        isOpen={showMessageDialog}
        onClose={() => setShowMessageDialog(false)}
        type={messageType}
        title={messageTitle}
        message={messageContent}
      />
    </div>
  );
};

export default ManageAdminPage;
