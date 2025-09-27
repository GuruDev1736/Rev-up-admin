"use client";

import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import {
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Line,
  Tooltip,
  LineChart,
} from "recharts";

export const SalesOverviewChart = () => {
  const [salesData, setSalesData] = useState([]);

  useEffect(() => {
    fetch("/data/data.json") // ensure your data.json is inside public/data
      .then((res) => res.json())
      .then((data) => setSalesData(data.sales))
      .catch((err) => console.error("Error fetching sales data:", err));
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5 }}
      className="bg-[#1e1e1e] backdrop-blur-m d shadow-lg rounded-xl p-4 md:p-6 border border-[#1f1f1f] mx-2 md:mx-0"
    >
      <h2 className="text-base md:text-lg font-medium mb-4 text-gray-100 text-center md:text-left">
        Sales Overview
      </h2>
      <div className="h-64 md:h-80">
        <ResponsiveContainer>
          <LineChart data={salesData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
            <XAxis
              dataKey="name"
              stroke="#4b5563"
              tick={{ fontSize: 12 }}
              interval="preserveStartEnd"
            />
            <YAxis stroke="#4b5563" tick={{ fontSize: 12 }} width={40} />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(31, 41 , 55, 0.8)",
                borderColor: "#4b5563",
                fontSize: "12px",
              }}
              itemStyle={{ color: "#e5e7eb" }}
            />
            <Line
              type="monotone"
              dataKey="sales"
              stroke="#9c27b0"
              strokeWidth={3}
              dot={{ fill: "#9c27b0", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};
