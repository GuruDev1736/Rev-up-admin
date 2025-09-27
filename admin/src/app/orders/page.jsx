"use client";

import { motion } from "framer-motion";
import { Ban, CheckCircle, Clock, ShoppingBag } from "lucide-react";
import StatCard from "../components/StatCard";
import { OrderTable } from "../components/OrderTable";

const OrderPage = () => {
  return (
    <div className="flex-1 overflow-auto relative z-10">
      <main className="max-w-7xl mx-auto py-6 lg:px-8">
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <StatCard name="Total Orders" icon={ShoppingBag} value="15,000" bgcolor="bg-[#d8ebff]" color="text-blue-500"/>
          <StatCard name="Completed Orders" icon={CheckCircle} value="13,000" bgcolor="bg-[#e8ffd8]" color="text-green-500"/>
          <StatCard name="Pending Orders" icon={Clock} value="1,200" bgcolor="bg-[#fff5d8]" color="text-orange-500"/>
          <StatCard name="Cancelled Orders" icon={Ban} value="4,357" bgcolor="bg-[#f4d8ff]" color="text-purple-500" />
        </motion.div>

        <OrderTable />
      </main>
    </div>
  );
};

export default OrderPage;
