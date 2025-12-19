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
import { Badge } from "@/components/ui/badge";

import { LogoutButton } from "@/components/logout-button";
import { GoCopilot } from "react-icons/go";
import { LuGoal } from "react-icons/lu";
import { BsIncognito } from "react-icons/bs";
import { LiaGlobeAmericasSolid } from "react-icons/lia";
import { getAppVersion, getRandomCaption } from "@/lib/foo.js";
import Banner from "../banner";
import { MdOutlineLeaderboard } from "react-icons/md";

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
            <span className="text-xs font-medium absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#ff6982] to-[#ffd2b3] dark:from-[#0080ff] dark:to-[#00e0ff] text-white px-2 py-0.5 rounded-full">
              {getAppVersion()}
            </span>

            <Link
            href="/dashboard"
            className="text-xl font-bold tracking-tight flex gap-3 items-center group hover:scale-105 transition-transform duration-200"
            >
            <div className="p-2 bg-gradient-to-r from-[#ff6982] to-[#ffd2b3] dark:from-[#006ddb] dark:to-[#d5faff] rounded-xl shadow-lg group-hover:shadow-blue-500/25 transition-shadow duration-200">
              <Image
                  src={iflyticsLogo}
                  alt="Iflytics Logo"
                  width={24}
                  height={24}
                  className=""
              />
            </div>

            <div className="flex flex-col">
              <span className="bg-gradient-to-r from-[#ff6982] to-[#ffd2b3] dark:from-[#0080ff] dark:via-light dark:to-[#f1fdff] bg-clip-text text-transparent">IFlytics</span>
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{randomCaption}</span>
            </div>
            
            </Link>
        </header>
        

        <section id="menus" className="flex-1 flex flex-col gap-1 p-4">
            <div className="mb-2">
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-3">Main</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
  <Link href="/dashboard" className={cn("flex flex-col gap-1 text-gray-700 dark:text-gray-300 font-medium items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white rounded-[20px] py-3 transition-all duration-200 group", pathname === "/dashboard" && "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-semibold border-2 border-blue-200 dark:border-blue-400")}>
    <FaHome className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
    <span className="text-xs text-center">Dashboard</span>
  </Link>

  <Link href="/dashboard/flights?timeframe=day-30" className={cn("flex flex-col gap-1 text-gray-700 dark:text-gray-300 font-medium items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white rounded-[20px] py-3 transition-all duration-200 group", pathname === "/dashboard/flights" && "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-semibold border-2 border-blue-200 dark:border-blue-400")}>
    <TiPlaneOutline className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
    <span className="text-xs text-center">Flights</span>
  </Link>

  <Link href="/dashboard/profile" className={cn("flex flex-col gap-1 text-gray-700 dark:text-gray-300 font-medium items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white rounded-[20px] py-3 transition-all duration-200 group", pathname === "/dashboard/profile" && "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-semibold border-2 border-blue-200 dark:border-blue-400")}>
    <FaUser className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
    <span className="text-xs text-center">Profile</span>
  </Link>

  <Link href="/dashboard/users" className={cn("flex flex-col gap-1 text-gray-700 dark:text-gray-300 font-medium items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white rounded-[20px] py-3 transition-all duration-200 group", pathname === "/dashboard/users" && "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-semibold border-2 border-blue-200 dark:border-blue-400")}>
    <GoCopilot className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
    <span className="text-xs text-center">Community</span>
  </Link>

  <Link href="/dashboard/leaderboard" className={cn("relative col-span-2 border-2 border-pink-200 dark:border-blue-400 flex gap-2 text-gray-700 dark:text-gray-300 font-medium items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white rounded-[20px] py-3 transition-all duration-200 group", pathname === "/dashboard/leaderboard" && "bg-pink-50 dark:bg-blue-900/20 text-pink-600 dark:text-blue-400 font-semibold")}>
    <MdOutlineLeaderboard className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
    <span className="text-sm text-center">IFlytics Leaderboard</span>
    <MdOutlineLeaderboard className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />

    <Badge className="absolute -top-3 -left-3 bg-gradient-to-r from-pink-500 to-blue-500 text-white text-xs font-bold">NEW</Badge>
  </Link>
</div>

          
            <Banner />
            
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
