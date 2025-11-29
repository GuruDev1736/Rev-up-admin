"use client";

import React from "react";
import { X, Bell, AlertCircle, Info, Clock, Tag } from "lucide-react";

const NotificationDetailsDialog = ({ isOpen, onClose, notification }) => {
  if (!isOpen || !notification) return null;

  const formatDate = (dateValue) => {
    if (!dateValue) return "";
    try {
      let date;
      if (Array.isArray(dateValue) && dateValue.length >= 3) {
        date = new Date(dateValue[0], dateValue[1] - 1, dateValue[2]);
      } else {
        date = new Date(dateValue);
      }
      
      return date.toLocaleDateString('en-US', { 
        year: 'numeric',
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return Array.isArray(dateValue) ? dateValue.join('-') : dateValue;
    }
  };

  const getPriorityColor = () => {
    const priorityValue = notification.priority?.toLowerCase() || "low";
    switch (priorityValue) {
      case "high":
      case "critical":
        return "text-red-600 bg-red-100";
      case "medium":
        return "text-amber-600 bg-amber-100";
      case "low":
      default:
        return "text-blue-600 bg-blue-100";
    }
  };

  const getTypeLabel = () => {
    if (!notification.notificationType) return "";
    return notification.notificationType.replace(/_/g, " ");
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-fadeIn"
        onClick={onClose}
      ></div>

      {/* Dialog */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slideUp"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Bell size={24} className="text-gray-700" />
              Notification Details
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-600" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Title */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {notification.notificationTitle || "Notification"}
              </h3>
              
              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                {notification.createdAt && (
                  <div className="flex items-center gap-1.5">
                    <Clock size={16} />
                    <span>{formatDate(notification.createdAt)}</span>
                  </div>
                )}
                {notification.priority && (
                  <div className="flex items-center gap-1.5">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor()}`}>
                      {notification.priority.toUpperCase()}
                    </span>
                  </div>
                )}
                {notification.notificationType && (
                  <div className="flex items-center gap-1.5">
                    <Tag size={16} />
                    <span className="capitalize">{getTypeLabel()}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200"></div>

            {/* Description */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wider">
                Description
              </h4>
              <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                {notification.notificationDescription || "No description available"}
              </p>
            </div>

            {/* Additional Info if available */}
            {notification.bookingId && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wider">
                  Related Booking
                </h4>
                <p className="text-gray-800">
                  Booking ID: <span className="font-mono font-semibold">#{notification.bookingId}</span>
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 rounded-b-2xl">
            <button
              onClick={onClose}
              className="w-full bg-gradient-to-r from-[#f02521] to-[#f85d5d] text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotificationDetailsDialog;
