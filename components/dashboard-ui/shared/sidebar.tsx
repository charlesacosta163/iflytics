'use client'

import React from "react";
import Link from "next/link";
import iflyticsLogo from "@/public/iflyticslight.svg";
import Image from "next/image";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

import { TiPlaneOutline } from "react-icons/ti";


import { FaHome } from "react-icons/fa";
const Sidebar = () => {
  const pathname = usePathname();
  return (
    <section className="max-w-[250px] w-full bg-dark text-light p-4">
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
            <Link href="/dashboard" className={cn("flex gap-4 text-gray-200 text-lg font-medium items-center hover:bg-gray-700 rounded-lg px-3 py-1", pathname === "/dashboard" && "bg-light text-dark font-bold")}>
                <FaHome />
                Dashboard
            </Link>

            <Link href="/dashboard/flights" className={cn("flex gap-4 text-gray-200 text-lg font-medium items-center hover:bg-gray-700 rounded-lg px-3 py-1", pathname === "/dashboard/flights" && "bg-light text-dark font-bold")}>
                <TiPlaneOutline />
                Flights
            </Link>
            
        </section>

        <div className="">
          Logout
        </div>

      </div>
    </section>
  );
};

export default Sidebar;
