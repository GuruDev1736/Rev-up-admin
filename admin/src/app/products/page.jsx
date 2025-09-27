"use client";

import { motion } from "framer-motion";

import StatCard from "../components/StatCard";
import ProductsTable from "../components/ProductsTable";

import {
  ChartBarStacked,
  DollarSign,
  ShoppingBag,
  SquareActivity,
} from "lucide-react";

export const ProductsPage = () => {
  return (
    <div className="flex-1 overflow-auto relative z-10">
      <div className="max-w-7xl mx-auto py-6 lg:px-8">
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <StatCard name="Total Product" icon={ShoppingBag} value="4,357" bgcolor="bg-[#d8ebff]" color="text-blue-500" />
          <StatCard name="Total Stocks" icon={SquareActivity} value="18,450" bgcolor="bg-[#e8ffd8]" color="text-green-500"/>
          <StatCard name="Total Sold" icon={DollarSign} value="12,780" bgcolor="bg-[#fff5d8]" color="text-orange-500"/>
          <StatCard name="Total Categories" icon={ChartBarStacked} value="8" bgcolor="bg-[#f4d8ff]" color="text-purple-500" />
        </motion.div>

        <ProductsTable />
      </div>
    </div>
  );
};

export default ProductsPage;
