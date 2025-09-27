"use client";

import { motion } from "framer-motion";
import { Edit, Search, Trash2 } from "lucide-react";
import orders from "../../../public/data/data.json";
import { useEffect, useState } from "react";

export const OrderTable = () => {
  const [searchTerm, setSearchTearm] = useState("");
  const [filterOrders, setFilterOrders] = useState([]);

  useEffect(() => {
    const fetchdata = async () => {
      try {
        const res = await fetch("/data/data.json");
        const data = await res.json();
        setFilterOrders(data.orderData);
      } catch (err) {
        console.log("Error Fetching Boundries", err);
      }
    };
    fetchdata();
  }, []);

  const handelSearch = (e) => {
    const term = e.target.value.toLowercase();
    setSearchTearm(term);
    setFilterOrders(
      orders.orderData.filter(
        (order) =>
          order.id.toLowercase().includes(term) ||
          order.client.toLowercase().includes(term) ||
          order.email.toLowercase().includes(term)
      )
    );
  };

  const handelDelete = (id) => {
    setFilterOrders((prev) => prev.filter((order) => order.id !== id));
  };

  return (
    <motion.div
      className="bg-[#1f1f1f] backdrop-blur-md shadow-lg rounded-xl p-4 sm:p-6 border border-[#1f1f1f] mx-2 sm:mx-0"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1 }}
    >
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 sm:gap-0">
        <h2 className="text-base md:text-lg font-medium mb-4 text-gray-100 text-center md:text-left">
          Order List
        </h2>
        <div className="relative w-full sm:w-auto">
          <input
            type="text"
            placeholder=" Search users..."
            value={searchTerm}
            onChange={handelSearch}
            className=" bg-[#2f2f2f] text-white placeholder-gray-400 rounded-lg pl-10 py-2 w-full sm:w-64 focus:ring-2 focus:ring-gray-500 transition dduration-200 text-sm"
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead>
            <tr>
              {[
                "Order ID",
                "Client",
                "Total",
                "Status",
                "Date",
                "Location",
                "Actions",
              ].map((header) => (
                <th
                  key={header}
                  className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider hidden sm:table-cell"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-700">
            {filterOrders.map((order, index) => (
              <motion.tr
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
                className="flex flex-col sm:table-row mb-4 sm:mb-0 border-b sm:border-b-0 border-gray-700 sm:border-none p-2 sm:p-0"
              >
                {/* Mobile View */}
                <td className="sm:hidden px-3 py-2">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <div className="text-sm font-medium text-gray-100">
                        {order.id}
                      </div>

                      <div className="text-sm text-gray-100">
                        {order.client} <br />
                        <span className="text-xs text-gray-100">
                          {order.email}
                        </span>
                      </div>

                      <div className="text-sm text-gray-400">{order.email}</div>
                    </div>

                    <div className="flex space-x-1 -mt-5 -mr-4">
                      <button className="text-indigo-500 hover:text-indigo-300">
                        <Edit size={16} />
                      </button>
                      <button
                        className="text-red-500 hover:text-red-300"
                        onClick={()=>handelDelete(order.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="mt-2 text-xs text-gray-300">
                    <div>Total : ${order.total.toFixed(2)}</div>
                    <div className="flex items-center gap-1">
                      Status:
                      <span
                        className={`px-2 inline-flex  text-xs font-semibold rounded-full ${
                          order.status === "Delivered"
                            ? "bg-green-400 text-gray-800"
                            : order.status === "Pending"
                            ? "bg-amber-400 text-yellow-800"
                            : "bg-red-400 text-red-800"
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <div>Date : {order.date}</div>
                    <div>Location : {order.location}</div>
                  </div>
                </td>

                {/* Desktop View */}
                <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-sm font-medium  text-gray-100">
                  {order.id}
                </td>

                <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-100">
                  {order.client} <br />
                  <span className="text-xs text-gray-100">{order.email}</span>
                </td>
                <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-100">
                  ₹{order.total.toFixed(2)}
                </td>
                <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-100">
                  <span
                    className={`px-2 inline-flex  text-xs font-semibold rounded-full ${
                      order.status === "Delivered"
                        ? "bg-green-400 text-gray-800"
                        : order.status === "Pending"
                        ? "bg-amber-400 text-yellow-800"
                        : "bg-red-400 text-red-800"
                    }`}
                  >
                    {order.status}
                  </span>
                </td>

                <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {order.date}
                </td>
                <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {order.location}
                </td>
                <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  <div className="flex space-x-1 -ml-2">
                    <button className="text-indigo-500 hover:text-indigo-300 mr-1 cursor-pointer">
                      <Edit size={18} />
                    </button>
                    <button
                      className="text-red-500 hover:text-indigo-300 cursor-pointer"
                      onClick={()=>handelDelete(order.id)}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};
