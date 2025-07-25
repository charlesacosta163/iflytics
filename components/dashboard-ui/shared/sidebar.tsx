'use client'

import React from "react";
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


const Sidebar = () => {
  const pathname = usePathname();
  return (
    <section className="hidden lg:block max-w-[250px] w-full bg-dark text-light p-4">
      <div className="flex flex-col h-full">

        <header className="">
            <Link
            href="/dashboard"
            className="text-2xl font-bold tracking-tighter flex gap-2 items-center"
            >
            <Image
                src={iflyticsLogo}
                alt="Iflytics Logo"
                width={32}
                height={32}
            />

            <div className="flex flex-col">
              IFlytics
              <span className="text-xs text-gray-500 m-0">Infinite Flight Stats Visualizer</span>
            </div>
            
            </Link>
        </header>
        

        <section id="menus" className="flex-1 flex flex-col gap-2 py-4">
            <Link href="/dashboard" className={cn("flex gap-4 text-gray-200 font-medium items-center hover:bg-gray-700 rounded-lg px-3 py-2 transition-colors duration-200", pathname === "/dashboard" && "bg-light text-dark font-bold")}>
                <FaHome />
                Dashboard
            </Link>

            <Link href="/dashboard/flights" className={cn("flex gap-4 text-gray-200 font-medium items-center hover:bg-gray-700 rounded-lg px-3 py-2 transition-colors duration-200", pathname === "/dashboard/flights" && "bg-light text-dark font-bold")}>
                <TiPlaneOutline />
                Flights
            </Link>

            <Link href="/dashboard/profile" className={cn("flex gap-4 text-gray-200  font-medium items-center hover:bg-gray-700 rounded-lg px-3 py-2 transition-colors duration-200", pathname === "/dashboard/profile" && "bg-light text-dark font-bold")}>
                <FaUser />
                Profile
            </Link>

            <Link href="/dashboard/users" className={cn("flex gap-4 text-gray-200 font-medium items-center hover:bg-gray-700 rounded-lg px-3 py-2 transition-colors duration-200", pathname === "/dashboard/users" && "bg-light text-dark font-bold")}>
                <GoCopilot />
                Community
            </Link>

            {/* Horizontal Divider */}
            <div className="my-4 border-t border-gray-600"></div>

            {/* Special Section - Flight Arena (Coming Soon) */}
            <div className="p-0.5 bg-gradient-to-br from-red-400 to-purple-400 rounded-lg">
              <div 
                className="flex flex-col gap-3 text-gray-400 font-medium px-4 py-4 bg-dark rounded-md cursor-not-allowed opacity-75"
                title="Coming Soon!"
              >
                {/* Header */}
                <div className="flex items-center gap-3">
                  <LuGoal className="text-xl" />
                  <div className="flex flex-col gap-1">
                    <span className="font-bold text-white text-lg">The Flight Arena</span>
                    <span className="text-xs bg-amber-500 text-white px-2 py-0.5 font-bold rounded-full w-fit">
                      Premium+
                    </span>
                  </div>
                </div>

                {/* Coming Soon Badge */}
                <div className="mt-auto">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1.5 rounded-lg text-center text-xs font-bold">
                    Coming in 2026
                  </div>
                </div>
              </div>
            </div>
            
        </section>

        <div className="mt-auto flex flex-col gap-4">
          <div className="flex gap-4">
            <Link href="/map" className="flex gap-4 text-blue-400 bg-blue-500/15 hover:bg-blue-500/30 font-medium items-center rounded-lg px-3 py-2 transition-colors duration-200 justify-center text-sm w-full">
              <LiaGlobeAmericasSolid />
              Map
            </Link>
            <Link href="/" className="flex gap-4 text-orange-400 bg-orange-500/15 hover:bg-orange-500/30 font-medium items-center rounded-lg px-3 py-2 transition-colors duration-200 justify-center text-sm w-full">
              <BsIncognito />
              Guest
            </Link>
          </div>
          <LogoutButton className="w-full font-medium hover:bg-gray-800 cursor-pointer transition-colors duration-200"/>
        </div>

      </div>
    </section>
  );
};

export default Sidebar;
