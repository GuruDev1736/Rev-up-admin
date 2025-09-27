"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

const COLORS = ["#FF6B6B", "#4D96FF", "#FFD166", "#06D6A0"];

export const CategoryDistributionChart = () => {
  const [orderStatusData, setorderStatusData] = useState([]);
  const [isSmallMediumScreen, setIsSmallMediumScreen] = useState(false);

  useEffect(() => {
    fetch("/data/data.json")
      .then((res) => res.json())
      .then((data) => setorderStatusData(data.orderstatus || []))
      .catch((err) => console.error("Error loading categories:", err));
  }, []);

  useEffect(() => {
    const updateScreenSize = () => {
      setIsSmallMediumScreen(window.innerWidth <= 768);
    };

    updateScreenSize();
    window.addEventListener("resize", updateScreenSize);
    return () => window.removeEventListener("resize", updateScreenSize);
  });

  const outerRadius = isSmallMediumScreen ? 60 : 80;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5 }}
      className="bg-[#1e1e1e] backdrop-blur-m d shadow-lg rounded-xl p-4 md:p-6 border border-[#1f1f1f] mx-2 md:mx-0"
    >
      <h2 className="text-base md:text-lg font-medium mb-4 text-gray-100 text-center md:text-left">
        Order Status Distribution
      </h2>
      <div className="w-full h-64 md:h-80">
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={orderStatusData}
              cx="50%"
              cy="50%"
              labelLine={{ stroke: "#9ca3af" }}
              dataKey="value"
              outerRadius={outerRadius}
              label={({ name, percent }) =>
                `${name} ${(percent * 100).toFixed(0)}%`
              }
            >
              {orderStatusData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(31, 41 , 55, 0.8)",
                borderColor: "#4b5563",
                borderRadius: "8px",
                padding: "8px",
                fontSize: "12px",
              }}
              itemStyle={{ color: "#e5e7eb" }}
              cursor={{ fill: "rgba(255, 255, 255, 0.1)" }}
            />
            <Legend
              iconType="circle"
              layout="horizontal"
              align="center"
              wrapperStyle={{ fontSize: 12 }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};
