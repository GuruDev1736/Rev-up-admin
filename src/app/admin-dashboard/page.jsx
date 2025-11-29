"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import StatCard from "../components/StatCard";
import { motion } from "framer-motion";
import { DollarSign, ShoppingBag, FileText, MapPin } from "lucide-react";
import { getAllBikes } from "@/services/api/bikesService";
import { getAllBookings, getBookingsByPlace } from "@/services/api/bookingsService";
import { getNotificationsByPlace, markNotificationAsRead } from "@/services/api/notificationsService";
import { MonthlyPaymentChart } from "../components/MonthlyPaymentChart";
import { MostBookedBikesChart } from "../components/MostBookedBikesChart";
import NotificationCard from "../components/NotificationCard";
import NotificationDetailsDialog from "../components/NotificationDetailsDialog";

const AdminDashboardPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBikes: 0,
    totalBookings: 0,
    activeBookings: 0,
  });
  const [placeName, setPlaceName] = useState("");
  const [bookings, setBookings] = useState([]);
  const [bikes, setBikes] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

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

  const handleNotificationClick = async (notification) => {
    setSelectedNotification(notification);
    setShowDetailsDialog(true);
    
    // Only mark as read if it's currently unread
    if (notification.status?.toUpperCase() === "UNREAD") {
      try {
        const response = await markNotificationAsRead(notification.id, true);
        if (response.STS === "200") {
          setNotifications(prev => 
            prev.map(n => n.id === notification.id ? { ...n, status: "READ" } : n)
          );
        }
      } catch (error) {
        console.error("Error marking notification as read:", error);
      }
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const userPlaceId = sessionStorage.getItem("placeId");

      const [bikesResponse, bookingsResponse, notificationsResponse] = await Promise.all([
        getAllBikes(),
        userPlaceId ? getBookingsByPlace(userPlaceId) : getAllBookings(),
        userPlaceId ? getNotificationsByPlace(userPlaceId) : Promise.resolve({ STS: "200", CONTENT: [] }),
      ]);

      let totalBikes = 0;
      let totalBookings = 0;
      let activeBookings = 0;

      // Filter bikes by placeId
      if (bikesResponse.success && bikesResponse.bikes) {
        const filteredBikes = bikesResponse.bikes.filter(bike => {
          const bikePlaceId = bike.place?.id || bike.placeId || bike.place_id;
          return bikePlaceId?.toString() === userPlaceId;
        });
        setBikes(filteredBikes);
        totalBikes = filteredBikes.length;
      }

      // Bookings are already filtered by API for place-specific call
      if (bookingsResponse.STS === "200" && bookingsResponse.CONTENT) {
        const bookingsData = bookingsResponse.CONTENT;
        setBookings(bookingsData);
        totalBookings = bookingsData.length;
        activeBookings = bookingsData.filter(
          booking => booking.bookingStatus === "CONFIRMED" || booking.bookingStatus === "ACTIVE"
        ).length;
      }

      // Set notifications
      if (notificationsResponse.STS === "200" && notificationsResponse.CONTENT) {
        // Sort notifications by createdAt date (latest first)
        const sortedNotifications = [...notificationsResponse.CONTENT].sort((a, b) => {
          const dateA = Array.isArray(a.createdAt) 
            ? new Date(a.createdAt[0], a.createdAt[1] - 1, a.createdAt[2]).getTime()
            : new Date(a.createdAt).getTime();
          const dateB = Array.isArray(b.createdAt)
            ? new Date(b.createdAt[0], b.createdAt[1] - 1, b.createdAt[2]).getTime()
            : new Date(b.createdAt).getTime();
          return dateB - dateA; // Descending order (latest first)
        });
        setNotifications(sortedNotifications);
      }

      setStats({
        totalBikes,
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
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8 min-w-0"
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

        {/* Notifications Section */}
        {notifications.length > 0 && (
          <motion.div
            className="mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
          >
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Recent Notifications
              </h2>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {notifications.slice(0, 5).map((notification) => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                    onClick={handleNotificationClick}
                  />
                ))}
              </div>
              {notifications.length > 5 && (
                <div className="mt-4 text-center">
                  <button 
                    onClick={() => router.push("/notifications")}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    View all {notifications.length} notifications
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Charts Section */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <MonthlyPaymentChart bookings={bookings} />
          <MostBookedBikesChart bookings={bookings} bikes={bikes} />
        </motion.div>
      </main>

      {/* Notification Details Dialog */}
      <NotificationDetailsDialog
        isOpen={showDetailsDialog}
        onClose={() => {
          setShowDetailsDialog(false);
          setSelectedNotification(null);
        }}
        notification={selectedNotification}
      />
    </div>
  );
};

export default AdminDashboardPage;
