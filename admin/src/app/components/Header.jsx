import { Bell } from "lucide-react";
import Image from "next/image";
import React from "react";

import admin from "../images/admin.jpg";

const Header = () => {
  return (
    <header className="max-w-7xl mt-2 bg-gradient-to-r from-[#f02521] to-[#f85d5d] p-4 shadow-lg border-[#1f1f1f] mx-auto sm:mx-6 lg:mx-8 rounded-[15px]">
      <div className="mx-auto p-4 sm:px-6 flex items-center justify-between">
        <div className="flex-grid p-2">
          <h1 className="text-lg sm:text-xl lg:text-4xl font-semibold text-gray-100">
            Welcome back, Admin
          </h1>
          <p>Here's what's happening with RevUp Bikes today</p>
        </div>
        <div className="flex items-center space-x-3 sm:space-x-6">
          <div className="relative">
            <Bell className="w-5 sm:w-6 h-5 sm:h-6 text-grey-300 cursor-pointer hover:text-white" />
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3">
            <Image
              src={admin}
              alt="admin"
              width={25}
              height={25}
              className="rounded-full border border-grey-600"
            />
            <span className="hidden sm:block text-grey-100 font-medium">
              Vrushabh Shelke
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
