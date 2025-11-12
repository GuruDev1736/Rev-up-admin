"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
import { Image as ImageIcon, Upload, Link as LinkIcon, ArrowLeft, Save } from "lucide-react";
import { createBanner, updateBanner, getAllBanners } from "@/services/api/bannersService";
import { uploadImage } from "@/services/api/uploadService";
import MessageDialog from "../../components/MessageDialog";

export default function BannerFormPage() {
  const router = useRouter();
  const params = useParams();
  const bannerId = params?.id;
  const isAddMode = bannerId === "add";

  const [formData, setFormData] = useState({
    bannerTitle: "",
    bannerDescription: "",
    bannerImage: "",
    navigationLink: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [imageOption, setImageOption] = useState("url"); // 'url' or 'upload'
  const [loading, setLoading] = useState(false);
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [messageType, setMessageType] = useState("success");
  const [messageText, setMessageText] = useState("");

  useEffect(() => {
    if (!isAddMode) {
      fetchBannerData();
    }
  }, [bannerId, isAddMode]);

  const fetchBannerData = async () => {
    try {
      const response = await getAllBanners();
      if (response.STS === "200" && response.CONTENT) {
        const banner = response.CONTENT.find((b) => b.id === parseInt(bannerId));
        if (banner) {
          setFormData({
            bannerTitle: banner.bannerTitle || "",
            bannerDescription: banner.bannerDescription || "",
            bannerImage: banner.bannerImage || "",
            navigationLink: banner.navigationLink || "",
          });
          setImagePreview(banner.bannerImage || "");
        }
      }
    } catch (error) {
      console.error("Error fetching banner data:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "bannerImage" && imageOption === "url") {
      setImagePreview(value);
    }
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageOptionChange = (option) => {
    setImageOption(option);
    setImageFile(null);
    setFileName("");
    if (option === "url") {
      setImagePreview(formData.bannerImage);
    } else {
      setImagePreview("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = formData.bannerImage;

      // Upload image if file is selected
      if (imageFile && imageOption === "upload" && fileName) {
        const uploadResponse = await uploadImage(imageFile, fileName);
        if (uploadResponse.STS === "200" && uploadResponse.CONTENT) {
          imageUrl = uploadResponse.CONTENT;
        } else {
          setMessageType("error");
          setMessageText(uploadResponse.MSG || "Failed to upload image");
          setShowMessageDialog(true);
          setLoading(false);
          return;
        }
      }

      const bannerData = {
        bannerTitle: formData.bannerTitle,
        bannerDescription: formData.bannerDescription,
        bannerImage: imageUrl,
        navigationLink: formData.navigationLink,
      };

      let response;
      if (isAddMode) {
        response = await createBanner(bannerData);
      } else {
        response = await updateBanner(bannerId, bannerData);
      }

      if (response.STS === "200") {
        setMessageType("success");
        setMessageText(
          response.MSG || `Banner ${isAddMode ? "added" : "updated"} successfully!`
        );
        setShowMessageDialog(true);

        // Redirect after short delay
        setTimeout(() => {
          router.push("/banners");
        }, 1500);
      } else {
        setMessageType("error");
        setMessageText(response.MSG || "Failed to save banner");
        setShowMessageDialog(true);
      }
    } catch (error) {
      console.error("Error saving banner:", error);
      setMessageType("error");
      setMessageText("An error occurred. Please try again.");
      setShowMessageDialog(true);
    } finally {
      setLoading(false);
    }
  };

  const handleMessageClose = () => {
    setShowMessageDialog(false);
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <button
              onClick={() => router.push("/banners")}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft size={20} />
              Back to Banners
            </button>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              {isAddMode ? "Add New Banner" : "Edit Banner"}
            </h1>
            <p className="text-gray-600 mt-2">
              {isAddMode
                ? "Create a new promotional banner"
                : "Update the banner information"}
            </p>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6 md:p-8"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Banner Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Banner Title *
                </label>
                <input
                  type="text"
                  name="bannerTitle"
                  value={formData.bannerTitle}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Summer Sale 2025"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f02521] focus:border-transparent text-gray-900 placeholder:text-gray-400"
                />
              </div>

              {/* Banner Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  name="bannerDescription"
                  value={formData.bannerDescription}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  placeholder="Enter banner description"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f02521] focus:border-transparent text-gray-900 placeholder:text-gray-400"
                />
              </div>

              {/* Navigation Link */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Navigation Link
                </label>
                <input
                  type="text"
                  name="navigationLink"
                  value={formData.navigationLink}
                  onChange={handleInputChange}
                  placeholder="e.g., /products/sale"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f02521] focus:border-transparent text-gray-900 placeholder:text-gray-400"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Optional: Where should users go when they click this banner?
                </p>
              </div>

              {/* Image Options */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Banner Image *
                </label>
                <div className="flex gap-4 mb-4">
                  <button
                    type="button"
                    onClick={() => handleImageOptionChange("url")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                      imageOption === "url"
                        ? "border-[#f02521] bg-red-50 text-[#f02521]"
                        : "border-gray-300 text-gray-600 hover:border-gray-400"
                    }`}
                  >
                    <LinkIcon size={18} />
                    Image URL
                  </button>
                  <button
                    type="button"
                    onClick={() => handleImageOptionChange("upload")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                      imageOption === "upload"
                        ? "border-[#f02521] bg-red-50 text-[#f02521]"
                        : "border-gray-300 text-gray-600 hover:border-gray-400"
                    }`}
                  >
                    <Upload size={18} />
                    Upload Image
                  </button>
                </div>

                {imageOption === "url" ? (
                  <input
                    type="url"
                    name="bannerImage"
                    value={formData.bannerImage}
                    onChange={handleInputChange}
                    required
                    placeholder="https://example.com/banner-image.jpg"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f02521] focus:border-transparent text-gray-900 placeholder:text-gray-400"
                  />
                ) : (
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      required={isAddMode}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f02521] focus:border-transparent text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-[#f02521] hover:file:bg-red-100"
                    />
                    {fileName && (
                      <p className="mt-2 text-sm text-gray-600">
                        Selected file: <span className="font-semibold text-gray-900">{fileName}</span>
                      </p>
                    )}
                  </div>
                )}

                {/* Image Preview */}
                {imagePreview && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-2">Preview:</p>
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/800x200";
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-6">
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#f02521] to-[#f85d5d] text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      {isAddMode ? "Adding..." : "Updating..."}
                    </>
                  ) : (
                    <>
                      <Save size={20} />
                      {isAddMode ? "Add Banner" : "Update Banner"}
                    </>
                  )}
                </motion.button>

                <motion.button
                  type="button"
                  onClick={() => router.push("/banners")}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all"
                >
                  Cancel
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>

      {/* Message Dialog */}
      <MessageDialog
        isOpen={showMessageDialog}
        type={messageType}
        message={messageText}
        onClose={handleMessageClose}
      />
    </>
  );
}
