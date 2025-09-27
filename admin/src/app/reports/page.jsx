"use client";

import React from "react";
import StatCard from "../components/StatCard";
import { motion } from "framer-motion";
import { DollarSign } from "lucide-react";
import { SalesOverviewChart } from "../components/SalesOverviewChart";
import { CategoryDistribution } from "../components/CategoryDistribution";
import { CategoryDistributionChart } from "../components/CategoryDistributionChart";
import { ProductPerformanceChart } from "../components/ProductPerformanceChart";

const ReportsPage = () => {
  return (
    <div className="flex-1 overflow-auto relative z-10 bg-gray-50 py-8">
      {/* Grid Layout */}
      <div className="mt-8 p-6 bg-white rounded-2xl max-w-7xl mx-auto shadow-xl">
        <main className="max-w-7xl mx-auto p-4 sm:px-6 lg:px-8">
          {/* Key Metrics Section */}
          <div className="p-6 bg-white rounded-2xl shadow-sm">
            <div className="max-w-7xl mx-auto flex items-center justify-between border-b pb-4 mb-6">
              <h2 className="text-xl sm:text-3xl lg:text-3xl font-semibold text-gray-800">
                Key Metrics
              </h2>
            </div>

            <motion.div
              className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8 min-w-0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
            >
              <StatCard
                name="Total Revenue"
                icon={DollarSign}
                value="₹48,520"
                bgcolor="bg-[#d8ebff]" color="text-blue-500"
              />
              <StatCard name="Total Bookings" icon={DollarSign} value="1,247" bgcolor="bg-[#e8ffd8]" color="text-green-500"/>
              <StatCard name="Active Users" icon={DollarSign} value="825" bgcolor="bg-[#fff5d8]" color="text-orange-500"/>
              <StatCard
                name="Avg. Trip Duration"
                icon={DollarSign}
                value="2.4 hrs"
                bgcolor="bg-[#f4d8ff]" color="text-purple-500" 
              />
            </motion.div>
          </div>

          {/* Revenue Trends Section */}
          <div className="mt-8 p-6 bg-white rounded-2xl shadow-xl">
            <div className="max-w-7xl mx-auto flex items-center justify-between border-b pb-4 mb-6">
              <h2 className="text-xl sm:text-3xl lg:text-3xl font-semibold text-gray-800">
                Revenue Trends
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="lg:col-span-2">
                <SalesOverviewChart />
              </div>
              <CategoryDistribution />
              <CategoryDistributionChart />
              <div className="lg:col-span-2">

              <ProductPerformanceChart />
              </div>
            </div>
          </div>

          {/* Most Popular Bikes Section */}
          <div className="mt-8 p-6 bg-white rounded-2xl shadow-xl">
            <div className="max-w-7xl mx-auto flex items-center justify-between border-b pb-4 mb-6">
              <h2 className="text-xl sm:text-3xl lg:text-3xl font-semibold text-gray-800">
                Most Popular Bikes
              </h2>
            </div>
            {/* Placeholder for chart or table of most popular bikes */}
            <div className="p-4 bg-gray-100 rounded-lg">
              <p className="text-gray-500">Coming soon...</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ReportsPage;
