"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import StatCard from "../components/StatCard";
import { motion } from "framer-motion";

import { DollarSign, ShoppingBag, SquareActivity, User } from "lucide-react";
import { SalesOverviewChart } from "../components/SalesOverviewChart";
import { CategoryDistribution } from "../components/CategoryDistribution";
import { CategoryDistributionChart } from "../components/CategoryDistributionChart";
import { ProductPerformanceChart } from "../components/ProductPerformanceChart";
import AlertCard from "../components/AlertCard";

const OverviewPage = () => {
  const router = useRouter();

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    const userRole = sessionStorage.getItem("userRole");
    
    if (!token || userRole !== "ROLE_MASTER_ADMIN") {
      // Clear session and redirect to login
      sessionStorage.clear();
      router.push("/login");
    }
  }, [router]);

  return (
    <div className="flex-1 overflow-hidden relative z-10">
      <main className="max-w-full mx-auto p-4 sm:px-6 lg:px-8">
        <motion.div
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8 min-w-0"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <StatCard name="Total Sales" icon={DollarSign} value=" ₹182,425" bgcolor="bg-[#d8ebff]" color="text-blue-500" />
          <StatCard name="Total Clients" icon={User} value=" ₹1,425" bgcolor="bg-[#e8ffd8]" color="text-green-500" />
          <StatCard name="Total Products" icon={ShoppingBag} value="₹672" bgcolor="bg-[#fff5d8]" color="text-orange-500" />
          <StatCard name="Stock" icon={SquareActivity} value="₹12,825" bgcolor="bg-[#f4d8ff]" color="text-purple-500" />
        </motion.div>

        <motion.div
          className="flex-grid max-w-7xl grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8 min-w-0 shadow-lg rounded-xl bg-white"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <div className="mt-8 p-6 ">
            <div className="max-w-7xl mx-auto flex items-center justify-between pb-4 mb-6">
              <h2 className="text-xl sm:text-3xl lg:text-3xl font-semibold text-gray-800">
                Alerts
              </h2>
            </div>

            <div className="flex flex-col gap-4 p-4 sm:px-6">
              <AlertCard
                title="Overdue Rental Alert"
                message="Mountain Bike Lorem ipsum dolor sit amet consectetur adipisicing elit. Minima, hic?"
                time="1h ago"
                bgcolor="bg-red-500"
                border="bg-red-50"
                borderc="border-red-300"
              />

              <AlertCard
                title="Maintainance Required"
                message="Mountain Bike Lorem ipsum dolor sit amet consectetur adipisicing elit. Minima, hic?"
                time="1h ago"
                bgcolor="bg-amber-500"
                border="bg-amber-50"
                borderc="border-amber-300"
              />

              <AlertCard
                title="Low Bike Available"
                message="Mountain Bike Lorem ipsum dolor sit amet consectetur adipisicing elit. Minima, hic?"
                time="1h ago"
                bgcolor="bg-red-500"
                border="bg-red-50"
                borderc="border-red-300"
              />
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <SalesOverviewChart />
          <CategoryDistribution />
          <CategoryDistributionChart />
          <ProductPerformanceChart />
        </div>
      </main>
    </div>
  );
};

export default OverviewPage;
