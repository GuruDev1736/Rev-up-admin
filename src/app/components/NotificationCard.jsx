"use client";

import React from "react";
import { Bell, AlertCircle, Info, CheckCircle, XCircle } from "lucide-react";

const NotificationCard = ({ notification, onClick }) => {
  const { notificationTitle, notificationDescription, notificationType, priority, createdAt, status } = notification;

  // Determine icon and colors based on priority and type
  const getPriorityStyles = () => {
    const priorityValue = priority?.toLowerCase() || "low";"low";
    
    switch (priorityValue) {
      case "high":
      case "critical":
        return {
          bgColor: "bg-red-50",
          borderColor: "border-red-300",
          iconColor: "text-red-500",
          icon: AlertCircle,
        };
      case "medium":
        return {
          bgColor: "bg-amber-50",
          borderColor: "border-amber-300",
          iconColor: "text-amber-500",
          icon: Bell,
        };
      case "low":
      default:
        return {
          bgColor: "bg-blue-50",
          borderColor: "border-blue-300",
          iconColor: "text-blue-500",
          icon: Info,
        };
    }
  };

  const getTypeLabel = () => {
    if (!notificationType) return "";
    return notificationType.replace(/_/g, " ").toLowerCase();
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return "";
    try {
      let date;
      // Handle array format [year, month, day] from API
      if (Array.isArray(dateValue) && dateValue.length >= 3) {
        // Month is 1-indexed in the array but 0-indexed in Date constructor
        date = new Date(dateValue[0], dateValue[1] - 1, dateValue[2]);
      } else {
        date = new Date(dateValue);
      }
      
      // Return formatted date
      return date.toLocaleDateString('en-US', { 
        year: 'numeric',
        month: 'short', 
        day: 'numeric' 
      });
    } catch (error) {
      return Array.isArray(dateValue) ? dateValue.join('-') : dateValue;
    }
  };

  const styles = getPriorityStyles();
  const IconComponent = styles.icon;
  const isUnread = status?.toLowerCase() === "unread";

  return (
    <div
      className={`relative p-4 rounded-lg border-l-4 ${styles.bgColor} ${styles.borderColor} hover:shadow-md transition-shadow cursor-pointer`}
      onClick={() => onClick && onClick(notification)}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`mt-1 ${styles.iconColor}`}>
          <IconComponent size={20} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className={`font-semibold text-gray-900 text-sm ${isUnread ? "font-bold" : ""}`}>
              {notificationTitle || "Notification"}
            </h4>
            {isUnread && (
              <span className="flex-shrink-0 w-2 h-2 bg-red-500 rounded-full mt-1.5"></span>
            )}
          </div>

          <p className="text-gray-700 text-sm mb-2 line-clamp-2">
            {notificationDescription || "No description available"}
          </p>

          <div className="flex items-center gap-3 text-xs text-gray-500">
            {createdAt && <span>{formatDate(createdAt)}</span>}
            {notificationType && (
              <>
                <span>•</span>
                <span className="capitalize">{getTypeLabel()}</span>
              </>
            )}
            {priority && (
              <>
                <span>•</span>
                <span className="capitalize">{priority}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationCard;
