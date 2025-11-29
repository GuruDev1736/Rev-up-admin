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
} from "recharts";

export const MonthlyPaymentChart = ({ bookings = [] }) => {
  // Process bookings to group by month
  const processMonthlyData = () => {
    const monthlyData = {};
    
    bookings.forEach(booking => {
      // Skip cancelled bookings
      if (booking.bookingStatus === "CANCELLED") return;
      
      // Extract date from booking (try multiple date field names)
      const dateStr = booking.bookingDate || booking.createdAt || booking.date || booking.startDate;
      if (!dateStr) return;
      
      // Parse date and get month-year
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return; // Skip invalid dates
      
      const monthYear = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      
      // Get payment amount
      const amount = parseFloat(booking.totalAmount || booking.amount || 0);
      
      // Aggregate by month
      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = {
          month: monthYear,
          payment: 0,
          bookings: 0,
          timestamp: date.getTime(),
        };
      }
      
      monthlyData[monthYear].payment += amount;
      monthlyData[monthYear].bookings += 1;
    });
    
    // Convert to array and sort by timestamp
    return Object.values(monthlyData)
      .sort((a, b) => a.timestamp - b.timestamp)
      .map(({ month, payment, bookings }) => ({
        month,
        payment: parseFloat(payment.toFixed(2)),
        bookings,
      }))
      .slice(-12); // Last 12 months
  };

  const monthlyData = processMonthlyData();

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800/95 border border-gray-700 p-3 rounded-lg shadow-lg">
          <p className="text-gray-200 font-semibold mb-1">{payload[0].payload.month}</p>
          <p className="text-green-400 text-sm">
            Payment: ₹{payload[0].value.toLocaleString()}
          </p>
          <p className="text-blue-400 text-sm">
            Bookings: {payload[0].payload.bookings}
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
      transition={{ delay: 0.3, duration: 0.5 }}
      className="bg-white shadow-lg rounded-xl p-4 md:p-6 border border-gray-200"
    >
      <h2 className="text-base md:text-lg font-semibold mb-4 text-gray-900 text-center md:text-left">
        Monthly Payment Trends
      </h2>
      <div className="h-64 md:h-80">
        {monthlyData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="month"
                stroke="#6b7280"
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis
                stroke="#6b7280"
                tick={{ fontSize: 12 }}
                width={60}
                tickFormatter={(value) => `₹${value}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ fontSize: '12px' }}
                formatter={(value) => value === 'payment' ? 'Payment (₹)' : value}
              />
              <Bar
                dataKey="payment"
                fill="#10b981"
                radius={[8, 8, 0, 0]}
                maxBarSize={60}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            No payment data available
          </div>
        )}
      </div>
    </motion.div>
  );
};
