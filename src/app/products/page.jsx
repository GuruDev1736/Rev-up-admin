"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import StatCard from "../components/StatCard";
import ProductsTable from "../components/ProductsTable";
import ImportBikesDialog from "../components/ImportBikesDialog";
import { getAllBikes, getAllPlaces } from "../../services/api";

import {
  ChartBarStacked,
  DollarSign,
  ShoppingBag,
  SquareActivity,
  MapPin,
  Plus,
  FileSpreadsheet,
} from "lucide-react";

export const ProductsPage = () => {
  const router = useRouter();
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [stats, setStats] = useState({
    totalBikes: 0,
    available: 0,
    rented: 0,
    categories: 0,
    places: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [bikesResponse, placesResponse] = await Promise.all([
          getAllBikes(),
          getAllPlaces(),
        ]);

        if (bikesResponse.success && bikesResponse.bikes) {
          const bikes = bikesResponse.bikes;
          const categories = new Set(bikes.map((bike) => bike.category)).size;
          const available = bikes.filter((bike) => bike.status === "AVAILABLE").length;
          const rented = bikes.filter((bike) => bike.status === "RENTED").length;

          setStats((prev) => ({
            ...prev,
            totalBikes: bikes.length,
            available,
            rented,
            categories,
          }));
        }

        if (placesResponse.success && placesResponse.places) {
          setStats((prev) => ({
            ...prev,
            places: placesResponse.places.length,
          }));
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="flex-1 overflow-auto relative z-10">
      <div className="max-w-7xl mx-auto py-6 lg:px-8">
        {/* Header with Add and Import Buttons */}
        <div className="flex justify-between items-center mb-6 px-4 lg:px-0">
          <h1 className="text-2xl font-bold text-black">Manage Bikes</h1>
          <div className="flex gap-3">
            <button
              onClick={() => setShowImportDialog(true)}
              className="bg-[#2f2f2f] text-white px-4 py-2 rounded-lg hover:bg-[#3f3f3f] transform hover:scale-105 transition duration-200 flex items-center gap-2 font-medium border border-gray-600"
            >
              <FileSpreadsheet size={20} />
              Import Bikes
            </button>
            <button
              onClick={() => router.push('/products/add')}
              className="bg-gradient-to-r from-[#f02521] to-[#f85d5d] text-white px-4 py-2 rounded-lg hover:shadow-lg transform hover:scale-105 transition duration-200 flex items-center gap-2 font-medium"
            >
              <Plus size={20} />
              Add Bike
            </button>
          </div>
        </div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <StatCard 
            name="Total Bikes" 
            icon={ShoppingBag} 
            value={stats.totalBikes.toString()} 
            bgcolor="bg-[#d8ebff]" 
            color="text-blue-500" 
          />
          <StatCard 
            name="Available" 
            icon={SquareActivity} 
            value={stats.available.toString()} 
            bgcolor="bg-[#e8ffd8]" 
            color="text-green-500"
          />
          <StatCard 
            name="Rented" 
            icon={DollarSign} 
            value={stats.rented.toString()} 
            bgcolor="bg-[#fff5d8]" 
            color="text-orange-500"
          />
          <StatCard 
            name="Categories" 
            icon={ChartBarStacked} 
            value={stats.categories.toString()} 
            bgcolor="bg-[#f4d8ff]" 
            color="text-purple-500" 
          />
          <StatCard 
            name="Places" 
            icon={MapPin} 
            value={stats.places.toString()} 
            bgcolor="bg-[#ffd8e8]" 
            color="text-pink-500" 
          />
        </motion.div>

        <ProductsTable />

        {/* Import Bikes Dialog */}
        <ImportBikesDialog
          isOpen={showImportDialog}
          onClose={() => setShowImportDialog(false)}
        />
      </div>
    </div>
  );
};

export default ProductsPage;
