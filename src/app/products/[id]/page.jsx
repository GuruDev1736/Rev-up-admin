"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Save, Upload } from "lucide-react";
import Image from "next/image";
import { getAllBikes, updateBike, createBike, getAllPlaces, uploadImage } from "../../../services/api";

const BikePage = () => {
  const router = useRouter();
  const params = useParams();
  const bikeId = params.id;
  const isAddMode = bikeId === "add";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [places, setPlaces] = useState([]);
  const [imageOption, setImageOption] = useState("url"); // "url" or "upload"
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [userRole, setUserRole] = useState("");

  const [formData, setFormData] = useState({
    bikeName: "",
    bikeModel: "",
    brand: "",
    bikeImage: "",
    description: "",
    pricePerDay: "",
    pricePerWeek: "",
    pricePerMonth: "",
    quantity: "",
    category: "",
    engineCapacity: "",
    fuelType: "",
    transmission: "",
    registrationNumber: "",
    placeId: "",
  });

  // Fetch bike details and places
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const role = sessionStorage.getItem("userRole");
        const userPlaceId = sessionStorage.getItem("placeId");
        setUserRole(role);
        
        // For add mode, only fetch places
        if (isAddMode) {
          // For ROLE_ADMIN, auto-set their placeId and don't show place selection
          if (role === "ROLE_ADMIN" && userPlaceId) {
            const placesResponse = await getAllPlaces();
            if (placesResponse.STS === "200" && placesResponse.CONTENT) {
              setPlaces(placesResponse.CONTENT);
            }
            // Auto-set the placeId for admin
            setFormData(prev => ({ ...prev, placeId: userPlaceId }));
          } else {
            // For ROLE_MASTER_ADMIN, fetch all places
            const placesResponse = await getAllPlaces();
            if (placesResponse.STS === "200" && placesResponse.CONTENT) {
              setPlaces(placesResponse.CONTENT);
            }
          }
          setLoading(false);
          return;
        }
        
        // For edit mode, fetch both bikes and places in parallel
        const [bikesResponse, placesResponse] = await Promise.all([
          getAllBikes(),
          getAllPlaces(),
        ]);

        // Set places
        if (placesResponse.STS === "200" && placesResponse.CONTENT) {
          setPlaces(placesResponse.CONTENT);
        }

        // Set bike data
        if (bikesResponse.success) {
          const bike = bikesResponse.bikes.find((b) => b.id === parseInt(bikeId));

          if (bike) {
            setFormData({
              bikeName: bike.bikeName || "",
              bikeModel: bike.bikeModel || "",
              brand: bike.brand || "",
              bikeImage: bike.bikeImage || "",
              description: bike.description || "",
              pricePerDay: bike.pricePerDay || "",
              pricePerWeek: bike.pricePerWeek || "",
              pricePerMonth: bike.pricePerMonth || "",
              quantity: bike.quantity || "",
              category: bike.category || "",
              engineCapacity: bike.engineCapacity || "",
              fuelType: bike.fuelType || "",
              transmission: bike.transmission || "",
              registrationNumber: bike.registrationNumber || "",
              placeId: bike.place?.id || "",
            });
            setImagePreview(bike.bikeImage || "");
            setImageOption("url"); // Default to URL since existing bikes have URLs
            setError(null);
          } else {
            setError("Bike not found");
          }
        } else {
          setError(bikesResponse.message);
        }
      } catch (err) {
        setError("Failed to load data");
        console.error("Error loading data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (bikeId) {
      fetchData();
    }
  }, [bikeId, isAddMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    // Update image preview if URL changes
    if (name === "bikeImage" && imageOption === "url") {
      setImagePreview(value);
    }
  };

  const handleImageOptionChange = (option) => {
    setImageOption(option);
    if (option === "url") {
      setUploadedImage(null);
      setImagePreview(formData.bikeImage);
    } else {
      setFormData((prev) => ({ ...prev, bikeImage: "" }));
      if (uploadedImage) {
        setImagePreview(URL.createObjectURL(uploadedImage));
      } else {
        setImagePreview("");
      }
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Please upload a valid image file");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size should be less than 5MB");
        return;
      }

      setUploadedImage(file);
      setImagePreview(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMessage("");

    try {
      let bikeImageUrl = formData.bikeImage;

      // If user uploaded an image, upload it to the server first
      if (imageOption === "upload" && uploadedImage) {
        setUploadingImage(true);
        const uploadResponse = await uploadImage(uploadedImage, uploadedImage.name);
        setUploadingImage(false);
        
        if (uploadResponse.success) {
          bikeImageUrl = uploadResponse.imageUrl;
        } else {
          setError(uploadResponse.message || "Failed to upload image");
          setSaving(false);
          return;
        }
      }

      // Validate that we have an image URL
      if (!bikeImageUrl) {
        setError("Please provide a bike image");
        setSaving(false);
        return;
      }

      const bikeData = {
        bikeName: formData.bikeName,
        bikeModel: formData.bikeModel,
        brand: formData.brand,
        bikeImage: bikeImageUrl,
        description: formData.description,
        pricePerDay: parseFloat(formData.pricePerDay),
        pricePerWeek: parseFloat(formData.pricePerWeek),
        pricePerMonth: parseFloat(formData.pricePerMonth),
        quantity: parseInt(formData.quantity),
        category: formData.category,
        engineCapacity: parseInt(formData.engineCapacity),
        fuelType: formData.fuelType,
        transmission: formData.transmission,
        registrationNumber: formData.registrationNumber,
      };

      // Call create or update API based on mode
      const response = isAddMode
        ? await createBike(formData.placeId, bikeData)
        : await updateBike(bikeId, formData.placeId, bikeData);

      if (response.success) {
        setSuccessMessage(isAddMode ? "Bike created successfully!" : "Bike updated successfully!");
        setTimeout(() => {
          router.push("/products");
        }, 1500);
      } else {
        setError(response.message || (isAddMode ? "Failed to create bike" : "Failed to update bike"));
      }
    } catch (err) {
      setError(isAddMode ? "An error occurred while creating the bike" : "An error occurred while updating the bike");
      console.error("Error saving bike:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading && !isAddMode) {
    return (
      <div className="flex-1 overflow-auto relative z-10">
        <div className="max-w-4xl mx-auto py-6 px-4 lg:px-8">
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#f02521] border-r-transparent"></div>
            <p className="mt-4 text-gray-400">Loading bike details...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto relative z-10">
      <div className="max-w-4xl mx-auto py-6 px-4 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <button
            onClick={() => router.push("/products")}
            className="flex items-center text-gray-400 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Bikes
          </button>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#f02521] to-[#f85d5d] bg-clip-text text-transparent">
            {isAddMode ? "Add New Bike" : "Edit Bike Details"}
          </h1>
          <p className="text-gray-400 mt-2">
            {isAddMode ? "Fill in the bike information below" : "Update the bike information below"}
          </p>
        </motion.div>

        {/* Success Message */}
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-green-500/20 border border-green-500 rounded-lg text-green-500"
          >
            {successMessage}
          </motion.div>
        )}

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-500"
          >
            {error}
          </motion.div>
        )}

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          onSubmit={handleSubmit}
          className="bg-[#1e1e1e] rounded-xl p-6 border border-[#2f2f2f]"
        >
          {/* Image Upload Section */}
          <div className="mb-6 pb-6 border-b border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Bike Image</h3>
            
            {/* Image Option Toggle */}
            <div className="flex gap-4 mb-4">
              <button
                type="button"
                onClick={() => handleImageOptionChange("url")}
                className={`px-4 py-2 rounded-lg transition ${
                  imageOption === "url"
                    ? "bg-gradient-to-r from-[#f02521] to-[#f85d5d] text-white"
                    : "bg-[#2f2f2f] text-gray-400 hover:text-white"
                }`}
              >
                Image URL
              </button>
              <button
                type="button"
                onClick={() => handleImageOptionChange("upload")}
                className={`px-4 py-2 rounded-lg transition ${
                  imageOption === "upload"
                    ? "bg-gradient-to-r from-[#f02521] to-[#f85d5d] text-white"
                    : "bg-[#2f2f2f] text-gray-400 hover:text-white"
                }`}
              >
                Upload Image
              </button>
            </div>

            {/* Image URL Input */}
            {imageOption === "url" && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Image URL
                </label>
                <input
                  type="url"
                  name="bikeImage"
                  value={formData.bikeImage}
                  onChange={handleChange}
                  placeholder="https://example.com/bike-image.jpg"
                  className="w-full px-4 py-2 bg-[#2f2f2f] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#f02521]"
                />
              </div>
            )}

            {/* Image Upload Input */}
            {imageOption === "upload" && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Upload Image (Max 5MB)
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex-1 flex items-center justify-center px-4 py-8 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-[#f02521] transition">
                    <div className="text-center">
                      <Upload className="mx-auto mb-2 text-gray-400" size={32} />
                      <p className="text-sm text-gray-400">
                        {uploadedImage ? uploadedImage.name : "Click to upload or drag and drop"}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">PNG, JPG, JPEG up to 5MB</p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            )}

            {/* Image Preview */}
            {imagePreview && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-300 mb-2">Preview:</p>
                <div className="relative w-full h-48 rounded-lg overflow-hidden bg-[#2f2f2f]">
                  <Image
                    src={imagePreview}
                    alt="Bike preview"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Bike Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="bikeName"
                value={formData.bikeName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-[#2f2f2f] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#f02521]"
                placeholder="e.g., Royal Enfield Classic 350"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Bike Model <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="bikeModel"
                value={formData.bikeModel}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-[#2f2f2f] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#f02521]"
                placeholder="e.g., Classic 350"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Brand <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-[#2f2f2f] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#f02521]"
                placeholder="e.g., Royal Enfield"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Registration Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="registrationNumber"
                value={formData.registrationNumber}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-[#2f2f2f] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#f02521]"
                placeholder="e.g., MH12AB1234"
              />
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 bg-[#2f2f2f] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#f02521]"
              placeholder="Enter bike description..."
            />
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Price Per Day (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="pricePerDay"
                value={formData.pricePerDay}
                onChange={handleChange}
                required
                step="0.01"
                min="0"
                className="w-full px-4 py-2 bg-[#2f2f2f] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#f02521]"
                placeholder="e.g., 350"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Price Per Week (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="pricePerWeek"
                value={formData.pricePerWeek}
                onChange={handleChange}
                required
                step="0.01"
                min="0"
                className="w-full px-4 py-2 bg-[#2f2f2f] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#f02521]"
                placeholder="e.g., 2100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Price Per Month (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="pricePerMonth"
                value={formData.pricePerMonth}
                onChange={handleChange}
                required
                step="0.01"
                min="0"
                className="w-full px-4 py-2 bg-[#2f2f2f] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#f02521]"
                placeholder="e.g., 7000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Quantity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                required
                min="0"
                className="w-full px-4 py-2 bg-[#2f2f2f] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#f02521]"
                placeholder="e.g., 5"
              />
            </div>
          </div>

          {/* Specifications */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-[#2f2f2f] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#f02521]"
              >
                <option value="">Select Category</option>
                <option value="Sport">Sport</option>
                <option value="Cruiser">Cruiser</option>
                <option value="Commuter">Commuter</option>
                <option value="Scooter">Scooter</option>
                <option value="Adventure">Adventure</option>
                <option value="Touring">Touring</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Engine Capacity (CC) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="engineCapacity"
                value={formData.engineCapacity}
                onChange={handleChange}
                required
                min="0"
                className="w-full px-4 py-2 bg-[#2f2f2f] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#f02521]"
                placeholder="e.g., 350"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Fuel Type <span className="text-red-500">*</span>
              </label>
              <select
                name="fuelType"
                value={formData.fuelType}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-[#2f2f2f] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#f02521]"
              >
                <option value="">Select Fuel Type</option>
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel</option>
                <option value="Electric">Electric</option>
                <option value="CNG">CNG</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Transmission <span className="text-red-500">*</span>
              </label>
              <select
                name="transmission"
                value={formData.transmission}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-[#2f2f2f] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#f02521]"
              >
                <option value="">Select Transmission</option>
                <option value="Manual">Manual</option>
                <option value="Automatic">Automatic</option>
              </select>
            </div>
          </div>

          {/* Place Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Location/Place <span className="text-red-500">*</span>
            </label>
            {userRole === "ROLE_ADMIN" ? (
              <div className="w-full px-4 py-2 bg-[#2f2f2f] border border-gray-600 rounded-lg text-gray-400">
                {places.find(p => p.id.toString() === formData.placeId)?.name || 
                 places.find(p => p.id.toString() === formData.placeId)?.placeName || 
                 "Your Location"}
                <p className="text-xs text-gray-500 mt-1">You can only add bikes to your assigned location</p>
              </div>
            ) : (
              <select
                name="placeId"
                value={formData.placeId}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-[#2f2f2f] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#f02521]"
              >
                <option value="">Select Location</option>
                {places.map((place) => (
                  <option key={place.id} value={place.id}>
                    {place.name || place.placeName}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-700">
            <button
              type="button"
              onClick={() => router.push("/products")}
              className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || uploadingImage}
              className="px-6 py-2 bg-gradient-to-r from-[#f02521] to-[#f85d5d] text-white rounded-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {uploadingImage ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></div>
                  Uploading Image...
                </>
              ) : saving ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></div>
                  {isAddMode ? "Creating Bike..." : "Updating Bike..."}
                </>
              ) : (
                <>
                  <Save size={18} />
                  {isAddMode ? "Create Bike" : "Update Bike"}
                </>
              )}
            </button>
          </div>
        </motion.form>
      </div>
    </div>
  );
};

export default BikePage;
