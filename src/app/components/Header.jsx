"use client";
import { Bell, LogOut, User, Settings, ChevronDown } from "lucide-react";
import Image from "next/image";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import admin from "../images/admin.jpg";

const Header = () => {
  const router = useRouter();
  const [fullName, setFullName] = useState("Admin");
  const [userEmail, setUserEmail] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const storedName = localStorage.getItem("fullName");
    const storedEmail = localStorage.getItem("userName");
    if (storedName) {
      setFullName(storedName);
    }
    if (storedEmail) {
      setUserEmail(storedEmail);
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };

  const handleProfileClick = () => {
    setIsDropdownOpen(false);
    router.push("/profile");
  };

  const handleSettingsClick = () => {
    setIsDropdownOpen(false);
    router.push("/settings");
  };

  return (
    <header className="max-w-7xl mt-2 bg-gradient-to-r from-[#f02521] to-[#f85d5d] p-4 shadow-lg border-[#1f1f1f] mx-auto sm:mx-6 lg:mx-8 rounded-[15px]">
      <div className="mx-auto p-4 sm:px-6 flex items-center justify-between">
        <div className="flex-grid p-2">
          <h1 className="text-lg sm:text-xl lg:text-4xl font-semibold text-gray-100">
            Welcome back, {fullName}
          </h1>
          <p>Here's what's happening with RevUp Bikes today</p>
        </div>
        <div className="flex items-center space-x-3 sm:space-x-6">
          {/* Notifications */}
          <div className="relative">
            <Bell className="w-5 sm:w-6 h-5 sm:h-6 text-grey-300 cursor-pointer hover:text-white transition-colors" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-white text-[#f02521] text-xs font-bold rounded-full flex items-center justify-center">
              3
            </span>
          </div>

          {/* User Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-2 sm:space-x-3 hover:bg-white/10 px-2 py-1 rounded-lg transition-all"
            >
              <Image
                src={admin}
                alt="admin"
                width={35}
                height={35}
                className="rounded-full border-2 border-white shadow-md"
              />
              <div className="hidden sm:block text-left">
                <p className="text-white font-semibold text-sm leading-tight">
                  {fullName}
                </p>
                <p className="text-white/80 text-xs">Master Admin</p>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-white transition-transform ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-3 w-64 bg-white rounded-xl shadow-2xl overflow-hidden z-50 border border-gray-100 animate-fadeIn">
                {/* User Info Section */}
                <div className="px-4 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <Image
                      src={admin}
                      alt="admin"
                      width={45}
                      height={45}
                      className="rounded-full border-2 border-[#f02521]"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {fullName}
                      </p>
                      <p className="text-xs text-gray-600 truncate">
                        {userEmail}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="py-2">
                  <button
                    onClick={handleProfileClick}
                    className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left group"
                  >
                    <div className="w-9 h-9 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <User size={18} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        My Profile
                      </p>
                      <p className="text-xs text-gray-500">
                        View and edit profile
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={handleSettingsClick}
                    className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left group"
                  >
                    <div className="w-9 h-9 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Settings size={18} className="text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        Settings
                      </p>
                      <p className="text-xs text-gray-500">
                        Preferences & privacy
                      </p>
                    </div>
                  </button>
                </div>

                {/* Logout Section */}
                <div className="border-t border-gray-200 py-2">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-red-50 transition-colors text-left group"
                  >
                    <div className="w-9 h-9 bg-gradient-to-br from-red-100 to-red-200 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <LogOut size={18} className="text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-red-600">
                        Logout
                      </p>
                      <p className="text-xs text-gray-500">
                        Sign out from account
                      </p>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
