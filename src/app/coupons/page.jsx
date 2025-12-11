"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CouponsTable from "../components/CouponsTable";
import { Plus, Ticket } from "lucide-react";

export default function CouponsPage() {
  const router = useRouter();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    const role = sessionStorage.getItem("userRole");
    setUserRole(role);
  }, []);

  return (
    <div className="flex-1 overflow-auto relative z-10">
      <div className="max-w-7xl mx-auto py-6 lg:px-8">
        {/* Header with Add Button */}
        <div className="flex justify-between items-center mb-6 px-4 lg:px-0">
          <div className="flex items-center gap-3">
            <Ticket size={32} className="text-[#f02521]" />
            <h1 className="text-2xl font-bold text-black">Manage Coupons</h1>
          </div>
          {userRole === "ROLE_MASTER_ADMIN" && (
            <button
              onClick={() => router.push('/coupons/add')}
              className="bg-gradient-to-r from-[#f02521] to-[#f85d5d] text-white px-4 py-2 rounded-lg hover:shadow-lg transform hover:scale-105 transition duration-200 flex items-center gap-2 font-medium"
            >
              <Plus size={20} />
              Add Coupon
            </button>
          )}
        </div>

        {/* Coupons Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <CouponsTable refreshTrigger={refreshTrigger} userRole={userRole} />
        </motion.div>
      </div>
    </div>
  );
}
