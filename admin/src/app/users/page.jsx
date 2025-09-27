"use client";

import { motion } from "framer-motion";
import { RotateCcw, UserCheck, UserIcon, UserPlus } from "lucide-react";
import React from "react";
import StatCard from "../components/StatCard";
import { UsersTable } from "../components/UsersTable";

const Userspage = () => {
  return (
    <div className="flex-1 overflow-auto relative z-10">
      <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8"
        >
          <StatCard
            name="Total Users"
            icon={UserIcon}
            value="4,357"
            bgcolor="bg-[#d8ebff]"
            color="text-blue-500"
          />
          <StatCard
            name="New Users"
            icon={UserPlus}
            value="18,450"
            bgcolor="bg-[#e8ffd8]"
            color="text-green-500"
          />
          <StatCard
            name="Active Users"
            icon={UserCheck}
            value="12,780"
            bgcolor="bg-[#fff5d8]"
            color="text-orange-500"
          />
          <StatCard
            name="Returning Users"
            icon={RotateCcw}
            value="8"
            bgcolor="bg-[#f4d8ff]"
            color="text-purple-500"
          />
        </motion.div>

        <UsersTable />
      </main>
    </div>
  );
};

export default Userspage;
