"use client";

import React, { useState, useEffect } from "react";
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

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    bookings: 0,
    system: 0,
  });

  // Mock data - Replace with actual API call
  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        // Simulated API call - Replace with actual API
        const mockData = [
          {
            id: 1,
            type: "booking",
            title: "New Booking Created",
            message: "John Doe has created a new booking for Royal Enfield Classic 350",
            timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
            isRead: false,
            priority: "high",
          },
          {
            id: 2,
            type: "payment",
            title: "Payment Received",
            message: "Payment of ₹2,100 received for booking #12345",
            timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
            isRead: false,
            priority: "medium",
          },
          {
            id: 3,
            type: "system",
            title: "System Update",
            message: "System maintenance scheduled for tonight at 2:00 AM",
            timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
            isRead: true,
            priority: "low",
          },
          {
            id: 4,
            type: "booking",
            title: "Booking Cancelled",
            message: "Booking #12344 has been cancelled by the user",
            timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
            isRead: true,
            priority: "medium",
          },
          {
            id: 5,
            type: "user",
            title: "New User Registration",
            message: "A new user has registered: jane.smith@example.com",
            timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
            isRead: false,
            priority: "low",
          },
          {
            id: 6,
            type: "booking",
            title: "Booking Completed",
            message: "Booking #12340 has been marked as completed",
            timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
            isRead: true,
            priority: "low",
          },
          {
            id: 7,
            type: "alert",
            title: "Low Stock Alert",
            message: "Honda Activa stock is running low at Mumbai location",
            timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
            isRead: false,
            priority: "high",
          },
          {
            id: 8,
            type: "payment",
            title: "Payment Failed",
            message: "Payment failed for booking #12346. User notified.",
            timestamp: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
            isRead: true,
            priority: "high",
          },
        ];

        setNotifications(mockData);
        
        // Calculate stats
        const total = mockData.length;
        const unread = mockData.filter(n => !n.isRead).length;
        const bookings = mockData.filter(n => n.type === "booking").length;
        const system = mockData.filter(n => n.type === "system").length;
        
        setStats({ total, unread, bookings, system });
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  // Filter notifications
  const filteredNotifications = notifications.filter((notification) => {
    const matchesType = filterType === "all" || notification.type === filterType;
    const matchesStatus = 
      filterStatus === "all" || 
      (filterStatus === "read" && notification.isRead) ||
      (filterStatus === "unread" && !notification.isRead);
    const matchesSearch = 
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesType && matchesStatus && matchesSearch;
  });

  // Mark as read
  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
    setStats(prev => ({ ...prev, unread: prev.unread - 1 }));
  };

  // Mark all as read
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setStats(prev => ({ ...prev, unread: 0 }));
  };

  // Delete notification
  const deleteNotification = (id) => {
    const notification = notifications.find(n => n.id === id);
    setNotifications(prev => prev.filter(n => n.id !== id));
    setStats(prev => ({
      ...prev,
      total: prev.total - 1,
      unread: notification.isRead ? prev.unread : prev.unread - 1,
    }));
  };

  // Get time ago
  const getTimeAgo = (timestamp) => {
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
  };

  // Get notification icon
  const getNotificationIcon = (type, priority) => {
    switch (type) {
      case "booking":
        return <Bell className={priority === "high" ? "text-red-500" : "text-blue-500"} size={20} />;
      case "payment":
        return <CheckCircle className="text-green-500" size={20} />;
      case "alert":
        return <AlertCircle className="text-orange-500" size={20} />;
      case "system":
        return <Info className="text-gray-500" size={20} />;
      case "user":
        return <Bell className="text-purple-500" size={20} />;
      default:
        return <Bell className="text-gray-500" size={20} />;
    }
  };

  // Get priority badge
  const getPriorityBadge = (priority) => {
    const colors = {
      high: "bg-red-100 text-red-700",
      medium: "bg-yellow-100 text-yellow-700",
      low: "bg-gray-100 text-gray-700",
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[priority]}`}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </span>
    );
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
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
            name="Booking Related"
            value={stats.bookings}
            icon={CheckCircle}
            bgcolor="bg-[#e8ffd8]"
            color="text-green-500"
          />
          <StatCard
            name="System Updates"
            value={stats.system}
            icon={Info}
            bgcolor="bg-[#f4d8ff]"
            color="text-purple-500"
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

            {/* Type Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f02521] text-gray-900 w-full md:w-auto"
            >
              <option value="all">All Types</option>
              <option value="booking">Bookings</option>
              <option value="payment">Payments</option>
              <option value="user">Users</option>
              <option value="system">System</option>
              <option value="alert">Alerts</option>
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
          className="bg-white rounded-xl shadow-lg border border-gray-200"
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
            <div className="divide-y divide-gray-200">
              {filteredNotifications.map((notification, index) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={`p-4 md:p-6 hover:bg-gray-50 transition cursor-pointer ${
                    !notification.isRead ? "bg-blue-50/50" : ""
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type, notification.priority)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className={`text-sm md:text-base font-semibold ${
                              !notification.isRead ? "text-gray-900" : "text-gray-600"
                            }`}>
                              {notification.title}
                            </h3>
                            {!notification.isRead && (
                              <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-3 flex-wrap">
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Clock size={14} />
                              {getTimeAgo(notification.timestamp)}
                            </div>
                            {getPriorityBadge(notification.priority)}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {!notification.isRead && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="p-2 text-gray-400 hover:text-green-500 hover:bg-green-50 rounded-lg transition"
                              title="Mark as read"
                            >
                              <Check size={18} />
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
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
    </div>
  );
};

export default NotificationsPage;
