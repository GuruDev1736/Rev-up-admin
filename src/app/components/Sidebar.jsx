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
};

const Sidebar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarItems, setSidebarItems] = useState([]);
  const pathname = usePathname();

  useEffect(() => {
    fetch("/data/data.json")
      .then((res) => res.json())
      .then((data) => setSidebarItems(data.sidebarItems));
  }, []);

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsSidebarOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-[#1e1e1e] text-white hover:bg-[#2f2f2f]"
      >
        <Menu size={24} />
      </button>

      {/* Sidebar */}
      <div
        className={`fixed md:static top-0 left-0 h-full bg-[#fff] border-r border-[#2f2f2f] backdrop-blur-md transition-all duration-300 ease-in-out z-40
        ${
          isSidebarOpen
            ? "translate-x-0 w-64"
            : "-translate-x-full md:translate-x-0 md:w-20"
        }
        flex-shrink-0`}
      >
        <div className="p-4 flex flex-col h-full">
          {/* Close button for mobile */}
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-2 rounded-full hover:bg-[#2f2f2f] text-[#2f2f2f] hover:text-white transition-colors max-w-fit cursor-pointer md:hidden"
          >
            ✕
          </button>

          {/* Collapse button (only desktop) */}
          <button
            onClick={() => setIsSidebarOpen((prev) => !prev)}
            className="p-2 rounded-full hover:bg-[#2f2f2f] text-[#2f2f2f] hover:text-white transition-colors max-w-fit cursor-pointer hidden md:block"
          >
            <Menu size={24} />
          </button>

          {/* Sidebar Nav */}
          <nav className="mt-8 flex-grow">
            {sidebarItems.map((item) => {
              const IconComponent = ICONS[item.icon];
              return (
                <Link key={item.name} href={item.href}>
                  <div
                    className={`flex items-center p-4 text-sm text-[#2f2f2f] rounded-lg font-medium hover:bg-[#2f2f2f] hover:text-white transition-colors mb-2 ${
                      pathname === item.href ? "bg-[#2f2f2f] text-white" : ""
                    }`}
                  >
                    <IconComponent size={20} />
                    {/* Show text only when expanded */}
                    <span
                      className={`ml-4 whitespace-nowrap ${
                        isSidebarOpen ||
                        (typeof window !== "undefined" &&
                          window.innerWidth < 768)
                          ? "block"
                          : "hidden"
                      }`}
                    >
                      {item.name}
                    </span>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Overlay (mobile) */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
        ></div>
      )}
    </>
  );
};

export default Sidebar;
