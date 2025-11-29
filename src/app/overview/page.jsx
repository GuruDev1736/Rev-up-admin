"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import StatCard from "../components/StatCard";
import { motion } from "framer-motion";

import { DollarSign, ShoppingBag, SquareActivity, User } from "lucide-react";
import { SalesOverviewChart } from "../components/SalesOverviewChart";
import { CategoryDistribution } from "../components/CategoryDistribution";
import { CategoryDistributionChart } from "../components/CategoryDistributionChart";
import { ProductPerformanceChart } from "../components/ProductPerformanceChart";
import { MonthlyPaymentChart } from "../components/MonthlyPaymentChart";
import { MostBookedBikesChart } from "../components/MostBookedBikesChart";
import NotificationCard from "../components/NotificationCard";
import NotificationDetailsDialog from "../components/NotificationDetailsDialog";
import AlertCard from "../components/AlertCard";
import { getAllBookings } from "@/services/api/bookingsService";
import { getAllBikes } from "@/services/api/bikesService";
import { getAllNotifications, markNotificationAsRead } from "@/services/api/notificationsService";

const OverviewPage = () => {
  const router = useRouter();
  const [bookings, setBookings] = useState([]);
  const [bikes, setBikes] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [stats, setStats] = useState({
    totalPayment: 0,
    totalBookings: 0,
    totalBikes: 0,
    availableBikes: 0,
  });

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    const userRole = sessionStorage.getItem("userRole");
    
    if (!token || userRole !== "ROLE_MASTER_ADMIN") {
      // Clear session and redirect to login
      sessionStorage.clear();
      router.push("/login");
    } else {
      fetchDashboardData();
    }
  }, [router]);

  const fetchDashboardData = async () => {
    try {
      const [bookingsResponse, bikesResponse, notificationsResponse] = await Promise.all([
        getAllBookings(),
        getAllBikes(),
        getAllNotifications(),
      ]);

      if (bookingsResponse.STS === "200" && bookingsResponse.CONTENT) {
        setBookings(bookingsResponse.CONTENT);
        
        // Calculate total payment (exclude cancelled)
        const totalPayment = bookingsResponse.CONTENT
          .filter(b => b.bookingStatus !== "CANCELLED")
          .reduce((sum, b) => sum + parseFloat(b.totalAmount || b.amount || 0), 0);
        
        setStats(prev => ({
          ...prev,
          totalPayment,
          totalBookings: bookingsResponse.CONTENT.length,
        }));
      }

      if (bikesResponse.success && bikesResponse.bikes) {
        setBikes(bikesResponse.bikes);
        setStats(prev => ({
          ...prev,
          totalBikes: bikesResponse.bikes.length,
          availableBikes: bikesResponse.bikes.filter(b => b.status === "AVAILABLE").length,
        }));
      }

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
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

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

  return (
    <div className="flex-1 overflow-hidden relative z-10">
      <main className="max-w-full mx-auto p-4 sm:px-6 lg:px-8">
        <motion.div
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8 min-w-0"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <StatCard name="Total Payment" icon={DollarSign} value={`₹${stats.totalPayment.toFixed(2)}`} bgcolor="bg-[#d8ebff]" color="text-blue-500" />
          <StatCard name="Total Bookings" icon={User} value={stats.totalBookings} bgcolor="bg-[#e8ffd8]" color="text-green-500" />
          <StatCard name="Total Bikes" icon={ShoppingBag} value={stats.totalBikes} bgcolor="bg-[#fff5d8]" color="text-orange-500" />
          <StatCard name="Available Bikes" icon={SquareActivity} value={stats.availableBikes} bgcolor="bg-[#f4d8ff]" color="text-purple-500" />
        </motion.div>

        <motion.div
          className="flex-grid max-w-7xl mb-8 min-w-0"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          {/* Notifications Section */}
          {notifications.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Recent Notifications
                </h2>
                {notifications.length > 5 && (
                  <button 
                    onClick={() => router.push("/notifications")}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    View all
                  </button>
                )}
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {notifications.slice(0, 5).map((notification) => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                    onClick={handleNotificationClick}
                  />
                ))}  
              </div>
            </div>
          )}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <MonthlyPaymentChart bookings={bookings} />
          <MostBookedBikesChart bookings={bookings} bikes={bikes} />
        </div>
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

export default OverviewPage;
