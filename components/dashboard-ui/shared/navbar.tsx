"use client";

import React, { useState } from "react";
import Pathname from "./pathname";
import { LogoutButton } from "@/components/logout-button";
import { Menu, X } from "lucide-react";

import { TiPlaneOutline } from "react-icons/ti";
import { GoCopilot } from "react-icons/go";
import { FaHome, FaUser } from "react-icons/fa";
import { LuGoal } from "react-icons/lu";

import Link from "next/link";
import Image from "next/image";
import iflyticsLogo from "@/public/infinilyticslogo.svg";
import iflyticsLogoLight from "@/public/iflyticslight.svg";
import { BsIncognito } from "react-icons/bs";
import { LiaGlobeAmericasSolid } from "react-icons/lia";
import { useTheme } from "next-themes";

import { Moon, Sun } from "lucide-react";

const Navbar = () => {
  const { theme, setTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="relative">
      {/* Main Navbar */}
      <div className="flex justify-between items-center px-4 py-2 sticky top-0 bg-[#FAF0E6] dark:bg-gray-900 z-50 shadow-lg rounded-b-lg">
        <div className="flex items-center gap-3">
          {/* Animated Hamburger Button */}
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-700 transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <div className="relative w-6 h-6">
              <Menu
                size={24}
                className={`absolute inset-0 transition-all duration-300 ${
                  isMenuOpen
                    ? "opacity-0 rotate-180 scale-50"
                    : "opacity-100 rotate-0 scale-100"
                }`}
              />
              <X
                size={24}
                className={`absolute inset-0 transition-all duration-300 ${
                  isMenuOpen
                    ? "opacity-100 rotate-0 scale-100"
                    : "opacity-0 -rotate-180 scale-50"
                }`}
              />
            </div>
          </button>
          <div className="relative">
            <Link
              href="/dashboard"
              className="text-2xl font-bold tracking-tighter flex gap-2 items-center"
            >

              <Image
                src={iflyticsLogo}
                className="dark:hidden"
                alt="IFlytics Logo"
                width={32}
                height={32}
              />
              <Image
                src={iflyticsLogoLight}
                className="hidden dark:block"
                alt="IFlytics Logo"
                width={32}
                height={32}
              />
              IFlytics
            </Link>

            <span className="text-[10px] font-semibold text-white bg-red-400 rounded-full absolute -bottom-4 left-5 px-2 py-0.10 shadow-lg z-100">
              Early Alpha
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* {
            theme === "dark" ? (
              <button className="text-sm !px-4 !py-2 font-semibold rounded-full hover:scale-105 transition-transform duration-200" onClick={() => setTheme("light")}>
                <Sun size={16} />
              </button>
            ) : (
              <button className="text-sm !px-4 !py-2 font-semibold rounded-full hover:scale-105 transition-transform duration-200" onClick={() => setTheme("dark")}>
                <Moon size={16} />
              </button>
            )
          } */}
          <LogoutButton className="text-sm !px-4 !py-2 font-semibold rounded-full hover:scale-105 transition-transform duration-200" />
        </div>
      </div>

      {/* Animated Mobile Menu Overlay */}
      <div
        className={`lg:hidden fixed inset-0 z-40 transition-all duration-300 ${
          isMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black transition-opacity duration-300 ${
            isMenuOpen ? "opacity-50" : "opacity-0"
          }`}
          onClick={() => setIsMenuOpen(false)}
        />

        {/* Sliding Menu */}
        <div
          className={`absolute top-[73px] left-0 w-full bg-dark text-white shadow-2xl transition-all duration-300 ease-out ${
            isMenuOpen
              ? "translate-y-0 opacity-100"
              : "-translate-y-4 opacity-0"
          }`}
        >
          <div className="p-6">
            {/* Menu Header */}
            <div className="mb-6 pb-4 border-b border-gray-600">
              <h3 className="text-lg font-bold text-white">
                Where would you like to go?
              </h3>
            </div>

            {/* Navigation Links */}
            <nav className="space-y-2 grid grid-cols-2 gap-2">
              <Link
                href="/dashboard"
                className="group flex items-center gap-4 p-4 rounded-lg hover:bg-gray-700 transition-all duration-200 hover:translate-x-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="p-2 bg-gray-700 rounded-lg group-hover:bg-gray-600 transition-colors duration-200">
                  <FaHome className="w-4 h-4 text-light" />
                </div>
                <span className="font-medium">Dashboard</span>
              </Link>

              <Link
                href="/dashboard/flights"
                className="group flex items-center gap-4 p-4 rounded-lg hover:bg-gray-700 transition-all duration-200 hover:translate-x-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="p-2 bg-gray-700 rounded-lg group-hover:bg-gray-600 transition-colors duration-200">
                  <TiPlaneOutline className="w-4 h-4 text-light" />
                </div>
                <span className="font-medium">Flights</span>
              </Link>

              <Link
                href="/dashboard/profile"
                className="group flex items-center gap-4 p-4 rounded-lg hover:bg-gray-700 transition-all duration-200 hover:translate-x-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="p-2 bg-gray-700 rounded-lg group-hover:bg-gray-600 transition-colors duration-200">
                  <FaUser className="w-4 h-4 text-light" />
                </div>
                <span className="font-medium">Profile</span>
              </Link>

              <Link
                href="/dashboard/users"
                className="group flex items-center gap-4 p-4 rounded-lg hover:bg-gray-700 transition-all duration-200 hover:translate-x-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="p-2 bg-gray-700 rounded-lg group-hover:bg-gray-600 transition-colors duration-200">
                  <GoCopilot className="w-4 h-4 text-light" />
                </div>
                <span className="font-medium">Community</span>
              </Link>

              <Link
                href="/map"
                className="group flex items-center gap-4 p-4 rounded-lg transition-all duration-200 hover:translate-x-2 bg-blue-500/[.2] hover:bg-blue-500/[0.3]"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="p-2 bg-gray-700 rounded-lg group-hover:bg-gray-600 transition-colors duration-200">
                  <LiaGlobeAmericasSolid className="w-4 h-4 text-blue-400" />
                </div>
                <span className="font-medium text-blue-400">Map</span>
              </Link>

              <Link
                href="/"
                className="group flex items-center gap-4 p-4 rounded-lg transition-all duration-200 hover:translate-x-2 bg-orange-500/[.2] hover:bg-orange-500/[0.3]"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="p-2 bg-gray-700 rounded-lg group-hover:bg-gray-600 transition-colors duration-200">
                  <BsIncognito className="w-4 h-4 text-orange-400" />
                </div>
                <span className="font-medium text-orange-400">Guest</span>
              </Link>

              {/* Special Featured Item */}
              <div className="pt-4 mt-4 border-t border-gray-600 col-span-2">
                <div
                  className="flex items-center gap-4 bg-dark rounded-md px-4 py-3 cursor-not-allowed opacity-75"
                  title="Coming Soon!"
                >
                  <div className="p-2 bg-gradient-to-r from-red-400 to-purple-400 rounded-lg">
                    <LuGoal className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <span className="font-medium text-gray-400">
                      The Flight Arena
                    </span>
                    <p className="text-xs text-gray-500">Premium</p>
                  </div>
                </div>
              </div>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
