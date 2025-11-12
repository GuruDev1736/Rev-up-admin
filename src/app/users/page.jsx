"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { UserIcon } from "lucide-react";
import StatCard from "../components/StatCard";
import { UsersTable } from "../components/UsersTable";
import { getAllUsers } from "@/services/api/usersService";

const Userspage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getAllUsers();
      
      if (response.STS === "200" && response.CONTENT) {
        setUsers(response.CONTENT);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              Manage Users
            </h1>
            <p className="text-gray-600 mt-2">
              View and manage all registered users
            </p>
          </div>
        </motion.div>

        {/* Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <StatCard
            title="Total Users"
            value={users.length}
            icon={UserIcon}
            color="from-blue-500 to-blue-600"
          />
        </motion.div>

        {/* Users Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <UsersTable 
            initialUsers={users} 
            loading={loading}
            onUsersUpdate={fetchUsers}
          />
        </motion.div>
      </div>
    </div>
  );
};

export default Userspage;
