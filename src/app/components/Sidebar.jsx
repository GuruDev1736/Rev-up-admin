"use client";

import {
  Bell,
  CreditCard,
  House,
  Wrench,
  Menu,
  Settings,
  Users,
  FileText,
  Bike,
  Plus,
  ChartColumnBig,
  BadgeQuestionMark,
  X,
  MapPin,
  Image,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

  const ICONS = {
    House,
    CreditCard,
    Settings,
    Wrench,
    Bell,
    Users,
    FileText,
    Bike,
    Plus,
    ChartColumnBig,
    BadgeQuestionMark,
    MapPin,
    Image,
  };const Sidebar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarItems, setSidebarItems] = useState([]);
  const [userRole, setUserRole] = useState("");
  const pathname = usePathname();

  useEffect(() => {
    // Get user role from sessionStorage
    const role = sessionStorage.getItem("userRole");
    setUserRole(role);

    fetch("/data/data.json")
      .then((res) => res.json())
      .then((data) => {
        let items = data.sidebarItems;
        
        // Filter items based on user role
        if (role === "ROLE_ADMIN") {
          // For regular admins, show Dashboard, Bookings, Manage Bikes, and Notifications
          items = data.sidebarItems.filter(item => 
            item.name === "Dashboard" || item.name === "Bookings" || item.name === "Manage Bikes" || item.name === "Notifications"
          );
          // Update Dashboard href for ROLE_ADMIN
          items = items.map(item => {
            if (item.name === "Dashboard") {
              return { ...item, href: "/admin-dashboard" };
            }
            return item;
          });
        } else if (role === "ROLE_MASTER_ADMIN") {
          // For master admins, show all items
          items = data.sidebarItems;
        }
        
        setSidebarItems(items);
      })
      .catch((error) => console.error("Error loading sidebar data:", error));
  }, []);

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsSidebarOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 p-3 rounded-xl bg-gradient-to-r from-[#f02521] to-[#f85d5d] text-white shadow-lg hover:shadow-xl transition-all"
      >
        <Menu size={24} />
      </button>

      {/* Sidebar */}
      <div
        className={`fixed md:static top-0 left-0 h-full bg-white border-r border-gray-200 shadow-lg transition-all duration-300 ease-in-out z-40
        ${
          isSidebarOpen
            ? "translate-x-0 w-64"
            : "-translate-x-full md:translate-x-0 md:w-64"
        }
        flex-shrink-0`}
      >
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <img 
                src="/logo.jpg" 
                alt="RevUp Logo" 
                className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
              />
              <div
                className={`${
                  isSidebarOpen ? "block" : "hidden"
                } transition-all`}
              >
                <h2 className="text-lg font-bold text-gray-900">RevUp</h2>
                <p className="text-xs text-gray-500">Admin Panel</p>
              </div>
            </div>

            {/* Close button for mobile */}
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors md:hidden"
            >
              <X size={20} />
            </button>
          </div>

          {/* Sidebar Nav */}
          <nav className="flex-1 overflow-y-auto py-6 px-3">
            <div className="space-y-1">
              {sidebarItems.map((item) => {
                const IconComponent = ICONS[item.icon];
                const isActive = pathname === item.href;
                
                return (
                  <Link key={item.name} href={item.href}>
                    <div
                      className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all group relative
                        ${
                          isActive
                            ? "bg-gradient-to-r from-[#f02521] to-[#f85d5d] text-white shadow-md"
                            : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                        }
                      `}
                    >
                      <IconComponent
                        size={20}
                        className={`flex-shrink-0 ${
                          isActive ? "text-white" : "text-gray-500 group-hover:text-[#f02521]"
                        } transition-colors`}
                      />
                      
                      {/* Text - always shown */}
                      <span className="ml-4 whitespace-nowrap">
                        {item.name}
                      </span>

                      {/* Active Indicator */}
                      {isActive && (
                        <div className="absolute right-2 w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Collapse button removed since we always show names */}
        </div>
      </div>

      {/* Overlay (mobile) */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden animate-fadeIn"
        ></div>
      )}
    </>
  );
};

export default Sidebar;
