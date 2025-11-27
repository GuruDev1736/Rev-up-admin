"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import StatCard from "../components/StatCard";
import { motion } from "framer-motion";
import { DollarSign, ShoppingBag, FileText, MapPin } from "lucide-react";
import { getAllBikes } from "@/services/api/bikesService";
import { getAllBookings } from "@/services/api/bookingsService";

const AdminDashboardPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBikes: 0,
    availableBikes: 0,
    totalBookings: 0,
    activeBookings: 0,
  });
  const [placeName, setPlaceName] = useState("");

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    const userRole = sessionStorage.getItem("userRole");
    
    // Only allow ROLE_ADMIN users
    if (!token || userRole !== "ROLE_ADMIN") {
      sessionStorage.clear();
      router.push("/login");
      return;
    }

    // Get place name from session
    const fullName = sessionStorage.getItem("fullName") || "Admin";
    setPlaceName(fullName);

    fetchDashboardData();
  }, [router]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const userPlaceId = sessionStorage.getItem("placeId");

      const [bikesResponse, bookingsResponse] = await Promise.all([
        getAllBikes(),
        getAllBookings(),
      ]);

      let totalBikes = 0;
      let availableBikes = 0;
      let totalBookings = 0;
      let activeBookings = 0;

      // Filter bikes by placeId
      if (bikesResponse.success && bikesResponse.bikes) {
        const bikes = bikesResponse.bikes.filter(
          bike => bike.place?.id?.toString() === userPlaceId
        );
        totalBikes = bikes.length;
        availableBikes = bikes.filter(bike => bike.status === "AVAILABLE").length;
      }

      // Filter bookings by placeId
      if (bookingsResponse.STS === "200" && bookingsResponse.CONTENT) {
        const bookings = bookingsResponse.CONTENT.filter(
          booking => booking.place?.id?.toString() === userPlaceId
        );
        totalBookings = bookings.length;
        activeBookings = bookings.filter(
          booking => booking.bookingStatus === "CONFIRMED" || booking.bookingStatus === "ACTIVE"
        ).length;
      }

      setStats({
        totalBikes,
        availableBikes,
        totalBookings,
        activeBookings,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f02521]"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-hidden relative z-10">
      <main className="max-w-full mx-auto p-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {placeName}! 👋
          </h1>
          <p className="text-gray-600">
            Here's what's happening with your location today.
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8 min-w-0"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <StatCard
            name="Total Bikes"
            icon={ShoppingBag}
            value={stats.totalBikes.toString()}
            bgcolor="bg-[#d8ebff]"
            color="text-blue-500"
          />
          <StatCard
            name="Available Bikes"
            icon={ShoppingBag}
            value={stats.availableBikes.toString()}
            bgcolor="bg-[#e8ffd8]"
            color="text-green-500"
          />
          <StatCard
            name="Total Bookings"
            icon={FileText}
            value={stats.totalBookings.toString()}
            bgcolor="bg-[#fff5d8]"
            color="text-orange-500"
          />
          <StatCard
            name="Active Bookings"
            icon={FileText}
            value={stats.activeBookings.toString()}
            bgcolor="bg-[#f4d8ff]"
            color="text-purple-500"
          />
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Manage Bikes Card */}
          <div
            onClick={() => router.push("/products")}
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer border border-gray-100"
          >
            <div className="flex items-center mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <ShoppingBag className="text-blue-500" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 ml-4">
                Manage Bikes
              </h3>
            </div>
            <p className="text-gray-600">
              View, add, edit, and manage all bikes in your location inventory.
            </p>
          </div>

          {/* Manage Bookings Card */}
          <div
            onClick={() => router.push("/bookings")}
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer border border-gray-100"
          >
            <div className="flex items-center mb-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <FileText className="text-orange-500" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 ml-4">
                Manage Bookings
              </h3>
            </div>
            <p className="text-gray-600">
              View and manage all bookings for your location.
            </p>
          </div>
        </motion.div>

        {/* Info Section */}
        <motion.div
          className="mt-8 bg-gradient-to-r from-[#f02521] to-[#f85d5d] rounded-xl shadow-lg p-6 text-white"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <h3 className="text-xl font-semibold mb-2">Your Location Dashboard</h3>
          <p className="text-white/90">
            This dashboard shows data specific to your location. You can manage bikes and bookings for your assigned place.
          </p>
        </motion.div>
      </main>
    </div>
  );
};

export default AdminDashboardPage;
