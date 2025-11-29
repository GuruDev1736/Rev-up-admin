"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Bell, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  Trash2, 
  Check,
  Filter,
  Search,
  Clock
} from "lucide-react";
import StatCard from "../components/StatCard";
import NotificationCard from "../components/NotificationCard";
import NotificationDetailsDialog from "../components/NotificationDetailsDialog";
import { getNotificationsByPlace, markNotificationAsRead } from "@/services/api/notificationsService";

const NotificationsPage = () => {
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    high: 0,
  });

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      sessionStorage.clear();
      router.push("/login");
      return;
    }
    fetchNotifications();
  }, [router]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const userRole = sessionStorage.getItem("userRole");
      const userPlaceId = sessionStorage.getItem("placeId");

      if (userRole === "ROLE_ADMIN" && userPlaceId) {
        const response = await getNotificationsByPlace(userPlaceId);
        if (response.STS === "200" && response.CONTENT) {
          // Sort notifications by createdAt date (latest first)
          const sortedNotifications = [...response.CONTENT].sort((a, b) => {
            const dateA = Array.isArray(a.createdAt) 
              ? new Date(a.createdAt[0], a.createdAt[1] - 1, a.createdAt[2]).getTime()
              : new Date(a.createdAt).getTime();
            const dateB = Array.isArray(b.createdAt)
              ? new Date(b.createdAt[0], b.createdAt[1] - 1, b.createdAt[2]).getTime()
              : new Date(b.createdAt).getTime();
            return dateB - dateA; // Descending order (latest first)
          });
          setNotifications(sortedNotifications);
          
          // Calculate stats
          const total = response.CONTENT.length;
          const unread = response.CONTENT.filter(n => n.status?.toUpperCase() === "UNREAD").length;
          const high = response.CONTENT.filter(n => 
            n.priority?.toUpperCase() === "HIGH" || n.priority?.toUpperCase() === "CRITICAL"
          ).length;
          
          setStats({ total, unread, high });
        }
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter notifications
  const filteredNotifications = notifications.filter((notification) => {
    const matchesStatus = 
      filterStatus === "all" || 
      (filterStatus === "read" && notification.status?.toUpperCase() === "READ") ||
      (filterStatus === "unread" && notification.status?.toUpperCase() === "UNREAD");
    const matchesPriority = 
      filterPriority === "all" || 
      notification.priority?.toLowerCase() === filterPriority.toLowerCase();
    const matchesSearch = 
      notification.notificationTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.notificationDescription?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesPriority && matchesSearch;
  });

  // Mark as read
  const markAsRead = async (id) => {
    try {
      const response = await markNotificationAsRead(id, true);
      if (response.STS === "200") {
        setNotifications(prev => 
          prev.map(n => n.id === id ? { ...n, status: "READ" } : n)
        );
        setStats(prev => ({ ...prev, unread: Math.max(0, prev.unread - 1) }));
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Handle notification click
  const handleNotificationClick = async (notification) => {
    setSelectedNotification(notification);
    setShowDetailsDialog(true);
    
    // Mark as read if it's unread
    if (notification.status?.toUpperCase() === "UNREAD") {
      await markAsRead(notification.id);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => n.status?.toUpperCase() === "UNREAD");
      
      // Call API for each unread notification
      await Promise.all(
        unreadNotifications.map(n => markNotificationAsRead(n.id, true))
      );
      
      setNotifications(prev => prev.map(n => ({ ...n, status: "READ" })));
      setStats(prev => ({ ...prev, unread: 0 }));
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  // Delete notification
  const deleteNotification = (id) => {
    const notification = notifications.find(n => n.id === id);
    setNotifications(prev => prev.filter(n => n.id !== id));
    setStats(prev => ({
      ...prev,
      total: prev.total - 1,
      unread: notification?.status?.toUpperCase() === "UNREAD" ? Math.max(0, prev.unread - 1) : prev.unread,
    }));
  };

  // Get time ago
  const getTimeAgo = (timestamp) => {
    if (!timestamp) return "";
    try {
      const now = new Date();
      const time = new Date(timestamp);
      const diffMs = now - time;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      return `${diffDays}d ago`;
    } catch (error) {
      return timestamp;
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
                Notifications
              </h1>
              <p className="text-gray-600 mt-2">Stay updated with all system notifications</p>
            </div>
            {stats.unread > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#f02521] to-[#f85d5d] text-white rounded-lg hover:opacity-90 transition"
              >
                <Check size={18} />
                Mark All as Read
              </button>
            )}
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <StatCard
            name="Total Notifications"
            value={stats.total}
            icon={Bell}
            bgcolor="bg-[#d8ebff]"
            color="text-blue-500"
          />
          <StatCard
            name="Unread"
            value={stats.unread}
            icon={AlertCircle}
            bgcolor="bg-[#ffd8d8]"
            color="text-red-500"
          />
          <StatCard
            name="High Priority"
            value={stats.high}
            icon={AlertCircle}
            bgcolor="bg-[#fff5d8]"
            color="text-orange-500"
          />
        </div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-xl p-4 md:p-6 shadow-lg mb-6 border border-gray-200"
        >
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            {/* Search */}
            <div className="relative flex-1 w-full">
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f02521] text-gray-900"
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            </div>

            {/* Priority Filter */}
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f02521] text-gray-900 w-full md:w-auto"
            >
              <option value="all">All Priority</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f02521] text-gray-900 w-full md:w-auto"
            >
              <option value="all">All Status</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
            </select>
          </div>
        </motion.div>

        {/* Notifications List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg border border-gray-200 p-6"
        >
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#f02521] border-r-transparent"></div>
              <p className="mt-4 text-gray-600">Loading notifications...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-600">No notifications found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map((notification) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  onClick={handleNotificationClick}
                />
              ))}
            </div>
          )}
        </motion.div>

        {/* Empty State Message */}
        {!loading && filteredNotifications.length === 0 && notifications.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center mt-4"
          >
            <p className="text-gray-500 text-sm">
              Try adjusting your filters to see more notifications
            </p>
          </motion.div>
        )}
      </div>

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

export default NotificationsPage;
