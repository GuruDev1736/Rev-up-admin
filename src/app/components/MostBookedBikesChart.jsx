"use client";

import { motion } from "framer-motion";
import React from "react";
import {
  BarChart,
  Bar,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Cell,
} from "recharts";

export const MostBookedBikesChart = ({ bookings = [], bikes = [] }) => {
  // Process bookings to count most booked bikes
  const processBikeBookings = () => {
    const bikeBookingCount = {};
    
    bookings.forEach(booking => {
      // Skip cancelled bookings
      if (booking.bookingStatus === "CANCELLED") return;
      
      const bikeId = booking.bike?.id || booking.bikeId || booking.bike_id;
      if (!bikeId) return;
      
      if (!bikeBookingCount[bikeId]) {
        bikeBookingCount[bikeId] = {
          bikeId,
          count: 0,
          bikeName: booking.bike?.name || booking.bikeName || `Bike ${bikeId}`,
          bikeModel: booking.bike?.model || booking.bikeModel || "",
        };
      }
      
      bikeBookingCount[bikeId].count += 1;
    });
    
    // Convert to array and sort by booking count
    return Object.values(bikeBookingCount)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10) // Top 10 bikes
      .map(item => ({
        name: item.bikeModel 
          ? `${item.bikeName} (${item.bikeModel})`.substring(0, 25)
          : item.bikeName.substring(0, 25),
        bookings: item.count,
      }));
  };

  const bikeData = processBikeBookings();

  // Generate colors for bars
  const COLORS = [
    "#ef4444", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6",
    "#ec4899", "#14b8a6", "#f97316", "#06b6d4", "#6366f1"
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800/95 border border-gray-700 p-3 rounded-lg shadow-lg">
          <p className="text-gray-200 font-semibold mb-1">{payload[0].payload.name}</p>
          <p className="text-blue-400 text-sm">
            Total Bookings: {payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
      className="bg-white shadow-lg rounded-xl p-4 md:p-6 border border-gray-200"
    >
      <h2 className="text-base md:text-lg font-semibold mb-4 text-gray-900 text-center md:text-left">
        Most Booked Bikes
      </h2>
      <div className="h-64 md:h-80">
        {bikeData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={bikeData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                type="number"
                stroke="#6b7280"
                tick={{ fontSize: 12 }}
              />
              <YAxis
                type="category"
                dataKey="name"
                stroke="#6b7280"
                tick={{ fontSize: 11 }}
                width={95}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ fontSize: '12px' }}
                formatter={() => 'Number of Bookings'}
              />
              <Bar
                dataKey="bookings"
                radius={[0, 8, 8, 0]}
              >
                {bikeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            No booking data available
          </div>
        )}
      </div>
    </motion.div>
  );
};
