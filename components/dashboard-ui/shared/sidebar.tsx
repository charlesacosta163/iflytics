'use client'

import React, { useState, useEffect } from "react";
import Link from "next/link";
import iflyticsLogo from "@/public/iflyticslight.svg";
import Image from "next/image";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

import { TiPlaneOutline } from "react-icons/ti";
import { FaGlobeAsia, FaUser, FaUsers } from "react-icons/fa";

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

import lightModeFlight from '@/public/lightmapphoto.jpg'
import cloudySunsetPhoto from '@/public/cloudysunset.jpg'
import { HiOutlineExternalLink } from "react-icons/hi";
import { TbBrandAppleArcade } from "react-icons/tb";
import { SiGamebanana } from "react-icons/si";

const Sidebar = () => {
  const pathname = usePathname();
  const [randomCaption, setRandomCaption] = useState("");

  useEffect(() => {
    setRandomCaption(getRandomCaption());
  }, []);

  return (
    <section className="hidden lg:block max-w-[280px] w-full border-r-2 border-gray-200 dark:border-gray-800 text-gray-900 dark:text-gray-100">
      <div className="flex flex-col h-full">

        <header className="px-6 py-4 relative">
          <span className="text-xs font-medium absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#ff6982] to-[#ffd2b3] dark:from-[#fdc673] dark:to-[#fffdec] dark:text-black text-white px-2 py-0.5 rounded-full">
            {getAppVersion()}
          </span>

          <Link
            href="/dashboard"
            className="text-xl font-bold tracking-tight flex gap-3 items-center group hover:scale-105 transition-transform duration-200"
          >
            <div className="p-2 bg-gradient-to-r from-[#ff6982] to-[#ffd2b3] dark:from-[#ffbd59] dark:to-[#fff8b9] dark:text-black text-white rounded-xl shadow-lg group-hover:shadow-blue-500/25 transition-shadow duration-200">
              <Image
                src={iflyticsLogo}
                alt="Iflytics Logo"
                width={24}
                height={24}
                className=""
              />
            </div>

            <div className="flex flex-col">
              <span className="bg-gradient-to-r from-[#ff6982] to-[#ffd2b3] dark:from-[#fdc673] dark:to-[#fffdec] dark:text-white bg-clip-text text-transparent">IFlytics</span>
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{randomCaption}</span>
            </div>

          </Link>
        </header>


        <section id="menus" className="flex-1 flex flex-col gap-1 p-4 mt-2">

          <div className="grid grid-cols-2 gap-2">
            <Link href="/dashboard" className={cn("flex flex-col gap-1 text-gray-700 dark:text-gray-300 font-medium items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white rounded-[20px] py-3 transition-all duration-200 group", pathname === "/dashboard" && "bg-yellow-50 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 font-semibold border-2 border-yellow-200 dark:border-yellow-400")}>
              <FaHome className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
              <span className="text-xs text-center">Dashboard</span>
            </Link>

            <Link href="/dashboard/flights?timeframe=day-30" className={cn("flex flex-col gap-1 text-gray-700 dark:text-gray-300 font-medium items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white rounded-[20px] py-3 transition-all duration-200 group", pathname === "/dashboard/flights" && "bg-green-50 dark:bg-green-500/20 text-green-600 dark:text-green-400 font-semibold border-2 border-green-200 dark:border-green-400")}>
              <TiPlaneOutline className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
              <span className="text-xs text-center">Flights</span>
            </Link>

            <Link href="/dashboard/profile" className={cn("flex flex-col gap-1 text-gray-700 dark:text-gray-300 font-medium items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white rounded-[20px] py-3 transition-all duration-200 group", pathname === "/dashboard/profile" && "bg-pink-50 dark:bg-pink-500/20 text-pink-600 dark:text-pink-400 font-semibold border-2 border-pink-200 dark:border-pink-400")}>
              <FaUser className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
              <span className="text-xs text-center">Profile</span>
            </Link>

            <Link href="/dashboard/users" className={cn("flex flex-col gap-1 text-gray-700 dark:text-gray-300 font-medium items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white rounded-[20px] py-3 transition-all duration-200 group", pathname === "/dashboard/users" && "bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 font-semibold border-2 border-blue-200 dark:border-blue-400")}>
              <GoCopilot className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
              <span className="text-xs text-center">Community</span>
            </Link>

            <Link href="/dashboard/leaderboard" className={cn("relative col-span-2 flex gap-2 text-gray-700 dark:text-gray-300 font-medium items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white rounded-[20px] py-3 transition-all duration-200 group", pathname === "/dashboard/leaderboard" && "bg-purple-50 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 font-semibold border-2 border-purple-200 dark:border-purple-400")}>
              <MdOutlineLeaderboard className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
              <span className="text-sm text-center">IFlytics Leaderboard</span>
              <MdOutlineLeaderboard className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
            </Link>
            <Link style={{ backgroundImage: `url(/starfall-gif.gif)` }} href="/dashboard/games" className={cn("relative col-span-2 border-2 border-orange-200 dark:border-yellow-400 flex gap-2 text-gray-300 font-black tracking-tight items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-100/20 hover:text-gray-100 dark:hover:text-white rounded-[20px] py-3 transition-all duration-200 group", pathname === "/dashboard/games" && "bg-pink-50 dark:bg-blue-900/20 text-orange-200 dark:text-yellow-400 font-semibold")}>
              <SiGamebanana className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
              <span className="text-sm text-center">The Arcade</span>
              <TbBrandAppleArcade className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />

              <Badge className="absolute -top-3 -left-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-white text-xs font-bold">NEW</Badge>
            </Link>
          </div>


          <Banner />


          <Link
            href="/map/earth"
            className='px-4 pb-4 pt-8 rounded-[20px] flex justify-center items-end hover:scale-105 transition-all duration-300 border-2 border-gray-100 dark:border-gray-700 mt-2 bg-cover bg-center relative overflow-hidden'
            style={{ backgroundImage: `url(${lightModeFlight.src})`, backgroundPosition: '100% 70%' }}
          >


            <section className="flex items-center gap-1 text-xl font-bold tracking-tighter text-blue-600">
              <FaGlobeAsia /> Flight Tracker
            </section>
            <HiOutlineExternalLink className='absolute top-2 right-2 text-gray-600 z-10' />

          </Link>

          <Link
            href="/"
            className='px-4 pb-4 pt-8 rounded-[20px] flex justify-center items-end hover:scale-105 transition-all duration-300 border-2 border-gray-100 dark:border-gray-700 mt-2 bg-cover bg-center relative overflow-hidden'
            style={{ backgroundImage: `url(${cloudySunsetPhoto.src})`, backgroundPosition: '100% 50%' }}
          >


            <section className="flex items-center gap-1 text-xl font-bold tracking-tighter bg-white/10 text-orange-500 backdrop-blur-sm rounded-full px-4 py-1">
              <BsIncognito /> Guest Mode
            </section>
            <HiOutlineExternalLink className='absolute top-2 right-2 text-gray-600 z-10' />

          </Link>

        </section>

        <div className="mt-auto p-4">
          <LogoutButton className="w-full font-medium hover:text-red-600 dark:hover:text-red-400 cursor-pointer transition-all duration-200 rounded-full px-3 py-2.5" />
        </div>

      </div>
    </section>
  );
};

export default Sidebar;
