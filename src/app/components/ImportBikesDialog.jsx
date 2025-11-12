"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, FileSpreadsheet, CheckCircle, XCircle } from "lucide-react";
import { getAllPlaces } from "../../services/api";
import { API_BASE_URL } from "@/config/apiConfig";

const ImportBikesDialog = ({ isOpen, onClose }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedPlaceId, setSelectedPlaceId] = useState("");
  const [places, setPlaces] = useState([]);
  const [loadingPlaces, setLoadingPlaces] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const fileInputRef = useRef(null);

  // Fetch places when dialog opens
  useEffect(() => {
    if (isOpen) {
      fetchPlaces();
    }
  }, [isOpen]);

  const fetchPlaces = async () => {
    setLoadingPlaces(true);
    try {
      const response = await getAllPlaces();
      if (response.STS === "200" && response.CONTENT) {
        setPlaces(response.CONTENT);
      }
    } catch (err) {
      console.error("Error fetching places:", err);
    } finally {
      setLoadingPlaces(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = [
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "text/csv"
      ];
      
      if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls|csv)$/i)) {
        setError("Please upload a valid Excel file (.xlsx, .xls, or .csv)");
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError("File size should be less than 10MB");
        return;
      }

      setSelectedFile(file);
      setError(null);
      setSuccess(false);
      setResult(null);
    }
  };

  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        // Remove the data URL prefix (e.g., "data:application/vnd.ms-excel;base64,")
        const base64String = reader.result.split(',')[1];
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImport = async () => {
    if (!selectedFile) {
      setError("Please select a file first");
      return;
    }

    if (!selectedPlaceId) {
      setError("Please select a place/location");
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(false);

    try {
      // Convert file to base64
      const base64File = await convertFileToBase64(selectedFile);

      const token = sessionStorage.getItem("token");
      
      const response = await fetch(`${API_BASE_URL}/bikes/import`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          file: base64File,
          placeId: parseInt(selectedPlaceId),
        }),
      });

      const data = await response.json();

      if (response.ok && data.STS === "200") {
        setSuccess(true);
        setResult(data.CONTENT || data.MSG);
        setSelectedFile(null);
        setSelectedPlaceId("");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        
        // Auto close after 2 seconds on success
        setTimeout(() => {
          handleClose();
          // Reload the page to show new bikes
          window.location.reload();
        }, 2000);
      } else {
        setError(data.MSG || "Failed to import bikes");
      }
    } catch (err) {
      console.error("Error importing bikes:", err);
      setError("An error occurred while importing bikes");
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setSelectedPlaceId("");
    setError(null);
    setSuccess(false);
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onClose();
  };

  if (!isOpen) return null;

  const dialogContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-transparent backdrop-blur-md z-[9998]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          {/* Dialog */}
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div
              className="bg-[#1e1e1e] rounded-xl shadow-2xl border border-[#2f2f2f] max-w-md w-full"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-start justify-between p-6 pb-4 border-b border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-500/10 p-2 rounded-lg">
                    <FileSpreadsheet className="text-blue-500" size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-100">Import Bikes</h3>
                    <p className="text-sm text-gray-400 mt-1">Upload Excel file to import multiple bikes</p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-200 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Success Message */}
                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-4 bg-green-500/20 border border-green-500 rounded-lg flex items-start gap-3"
                  >
                    <CheckCircle className="text-green-500 flex-shrink-0 mt-0.5" size={20} />
                    <div>
                      <p className="text-green-500 font-medium">Import Successful!</p>
                      {result && <p className="text-green-400 text-sm mt-1">{result}</p>}
                    </div>
                  </motion.div>
                )}

                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-4 bg-red-500/20 border border-red-500 rounded-lg flex items-start gap-3"
                  >
                    <XCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
                    <div>
                      <p className="text-red-500 font-medium">Import Failed</p>
                      <p className="text-red-400 text-sm mt-1">{error}</p>
                    </div>
                  </motion.div>
                )}

                {/* Place Selection */}
                {!success && (
                  <>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Select Place/Location <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={selectedPlaceId}
                        onChange={(e) => setSelectedPlaceId(e.target.value)}
                        disabled={loadingPlaces}
                        className="w-full px-4 py-2 bg-[#2f2f2f] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">
                          {loadingPlaces ? "Loading places..." : "Select a place"}
                        </option>
                        {places.map((place) => (
                          <option key={place.id} value={place.id}>
                            {place.name || place.placeName}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        All imported bikes will be assigned to this location
                      </p>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Select Excel File <span className="text-red-500">*</span>
                      </label>
                      <div
                        className="relative border-2 border-dashed border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="mx-auto mb-3 text-gray-400" size={40} />
                        {selectedFile ? (
                          <div>
                            <p className="text-green-500 font-medium mb-1">{selectedFile.name}</p>
                            <p className="text-gray-400 text-sm">
                              {(selectedFile.size / 1024).toFixed(2)} KB
                            </p>
                          </div>
                        ) : (
                          <div>
                            <p className="text-gray-300 mb-1">Click to upload or drag and drop</p>
                            <p className="text-gray-500 text-sm">
                              Excel files only (.xlsx, .xls, .csv) - Max 10MB
                            </p>
                          </div>
                        )}
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".xlsx,.xls,.csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                      </div>
                    </div>

                    {/* Instructions */}
                    <div className="bg-[#2f2f2f] rounded-lg p-4 mb-4">
                      <h4 className="text-sm font-medium text-gray-300 mb-2">File Format Instructions:</h4>
                      <ul className="text-xs text-gray-400 space-y-1">
                        <li>• Excel file should contain bike details</li>
                        <li>• Required columns: Bike Name, Model, Brand, etc.</li>
                        <li>• Make sure all required fields are filled</li>
                        <li>• Maximum file size: 10MB</li>
                      </ul>
                    </div>
                  </>
                )}
              </div>

              {/* Footer */}
              {!success && (
                <div className="flex gap-3 p-6 pt-0 border-t border-gray-700">
                  <button
                    onClick={handleClose}
                    disabled={uploading}
                    className="flex-1 bg-[#2f2f2f] text-gray-200 py-2.5 px-4 rounded-lg hover:bg-[#3f3f3f] transition duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleImport}
                    disabled={!selectedFile || !selectedPlaceId || uploading}
                    className="flex-1 bg-gradient-to-r from-[#f02521] to-[#f85d5d] text-white py-2.5 px-4 rounded-lg hover:shadow-lg transform hover:scale-105 transition duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                  >
                    {uploading ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></div>
                        Importing...
                      </>
                    ) : (
                      <>
                        <Upload size={18} />
                        Import Bikes
                      </>
                    )}
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(dialogContent, document.body);
};

export default ImportBikesDialog;
