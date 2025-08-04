'use client'

import React, { useState, useEffect } from "react";
import Link from "next/link";
import iflyticsLogo from "@/public/iflyticslight.svg";
import Image from "next/image";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

import { TiPlaneOutline } from "react-icons/ti";
import { FaUser, FaUsers } from "react-icons/fa";

import { FaHome } from "react-icons/fa";

import { LogoutButton } from "@/components/logout-button";
import { GoCopilot } from "react-icons/go";
import { LuGoal } from "react-icons/lu";
import { BsIncognito } from "react-icons/bs";
import { LiaGlobeAmericasSolid } from "react-icons/lia";
import { getRandomCaption } from "@/lib/foo.js";

const Sidebar = () => {
  const pathname = usePathname();
  const [randomCaption, setRandomCaption] = useState("");
  
  useEffect(() => {
    setRandomCaption(getRandomCaption());
  }, []);

  return (
    <section className="hidden lg:block max-w-[280px] w-full bg-white dark:bg-gray-900 rounded-r-[40px] text-gray-900 dark:text-gray-100">
      <div className="flex flex-col h-full">

        <header className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 relative">
            <span className="text-xs font-medium absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-amber-500 text-white px-2 py-0.5 rounded-full">
              v0.9.2-beta
            </span>

            <Link
            href="/dashboard"
            className="text-xl font-bold tracking-tight flex gap-3 items-center group hover:scale-105 transition-transform duration-200"
            >
            <div className="p-2 bg-amber-500 rounded-xl shadow-lg group-hover:shadow-blue-500/25 transition-shadow duration-200">
              <Image
                  src={iflyticsLogo}
                  alt="Iflytics Logo"
                  width={24}
                  height={24}
                  className="filter brightness-0 invert"
              />
            </div>

            <div className="flex flex-col">
              <span className="text-gray-900 dark:text-white"><span className="text-amber-500 dark:text-amber-300">IF</span>lytics</span>
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{randomCaption}</span>
            </div>
            
            </Link>
        </header>
        

        <section id="menus" className="flex-1 flex flex-col gap-1 p-4">
            <div className="mb-2">
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-3">Main</h3>
            </div>
            
            <Link href="/dashboard" className={cn("flex gap-3 text-gray-700 dark:text-gray-300 font-medium items-center hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white rounded-lg px-3 py-2.5 transition-all duration-200 group", pathname === "/dashboard" && "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-semibold")}>
                <FaHome className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                Dashboard
            </Link>

            <Link href="/dashboard/flights?timeframe=day-30" className={cn("flex gap-3 text-gray-700 dark:text-gray-300 font-medium items-center hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white rounded-lg px-3 py-2.5 transition-all duration-200 group", pathname === "/dashboard/flights" && "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-semibold")}>
                <TiPlaneOutline className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                Flights
            </Link>

            <Link href="/dashboard/profile" className={cn("flex gap-3 text-gray-700 dark:text-gray-300 font-medium items-center hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white rounded-lg px-3 py-2.5 transition-all duration-200 group", pathname === "/dashboard/profile" && "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-semibold")}>
                <FaUser className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                Profile
            </Link>

            <Link href="/dashboard/users" className={cn("flex gap-3 text-gray-700 dark:text-gray-300 font-medium items-center hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white rounded-lg px-3 py-2.5 transition-all duration-200 group", pathname === "/dashboard/users" && "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-semibold")}>
                <GoCopilot className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                Community
            </Link>

            {/* Special Section - Flight Arena (Coming Soon) */}
            <div className="mt-6 mb-4">
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-3 mb-3">Premium</h3>
              
              <div className="relative overflow-hidden bg-gradient-to-br from-purple-500 via-blue-500 to-indigo-600 rounded-xl p-4 shadow-lg">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="relative z-10">
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                      <LuGoal className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-white text-sm">The Flight Arena</span>
                      <span className="text-xs bg-amber-400 text-amber-900 px-2 py-0.5 font-bold rounded-full w-fit">
                        Premium
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-white/80 text-xs mb-3 leading-relaxed">
                    Gamified Infinite Flight stats, competitions, and leveling system.
                  </p>

                  {/* Coming Soon Badge */}
                  <div className="bg-white/20 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-center text-xs font-semibold border border-white/20">
                    Coming in 2026
                  </div>
                </div>
                
                {/* Decorative gradient overlay */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10"></div>
              </div>
            </div>
            
        </section>

        <div className="mt-auto p-4 border-t border-gray-200 dark:border-gray-800">
          <div className="mb-2">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-3">Quick Actions</h3>
          </div>
          
          <div className="flex gap-2 mb-4">
            <Link href="/map/dark" className="flex gap-2 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 font-medium items-center rounded-lg px-3 py-2 transition-all duration-200 justify-center text-sm w-full group">
              <LiaGlobeAmericasSolid className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
              Map
            </Link>
            <Link href="/" className="flex gap-2 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/30 font-medium items-center rounded-lg px-3 py-2 transition-all duration-200 justify-center text-sm w-full group">
              <BsIncognito className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
              Guest
            </Link>
          </div>
          
          <LogoutButton className="w-full font-medium hover:text-red-600 dark:hover:text-red-400 cursor-pointer transition-all duration-200 rounded-full px-3 py-2.5"/>
        </div>

      </div>
    </section>
  );
};

export default Sidebar;
