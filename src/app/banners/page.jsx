"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import BannersTable from "../components/BannersTable";
import { getAllBanners } from "@/services/api/bannersService";

export default function BannersPage() {
  const router = useRouter();
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const response = await getAllBanners();
      
      if (response.STS === "200" && response.CONTENT) {
        setBanners(response.CONTENT);
      }
    } catch (error) {
      console.error("Error fetching banners:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBanner = () => {
    router.push("/banners/add");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              Manage Banners
            </h1>
            <p className="text-gray-600 mt-2">
              Manage promotional banners and advertisements
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAddBanner}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#f02521] to-[#f85d5d] text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            <Plus size={20} />
            Add Banner
          </motion.button>
        </motion.div>

        {/* Banners Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <BannersTable 
            initialBanners={banners} 
            loading={loading}
            onBannersUpdate={fetchBanners}
          />
        </motion.div>
      </div>
    </div>
  );
}
