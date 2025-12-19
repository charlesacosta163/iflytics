"use client";

import React, { useState, useEffect } from "react";
import { LogoutButton } from "@/components/logout-button";
import { getUser } from "@/lib/supabase/user-actions";
import { Menu, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

import { TiPlaneOutline } from "react-icons/ti";
import { GoCopilot } from "react-icons/go";
import { FaHome, FaUser } from "react-icons/fa";
import { LuGoal, LuUser } from "react-icons/lu";

import Link from "next/link";
import Image from "next/image";
import { BsIncognito } from "react-icons/bs";
import { LiaGlobeAmericasSolid } from "react-icons/lia";
import { useTheme } from "next-themes";
import { customUserImages } from "@/lib/data";

import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import { InlineThemeSwitcher } from "@/components/inline-theme-switcher";
import { RiCopilotFill } from "react-icons/ri";
import Pathname from "./pathname";

import { getUserSubscription } from "@/lib/subscription/subscription";
import { AccessLevel, Subscription } from "@/lib/subscription/helpers";
import { MdOutlineLeaderboard } from "react-icons/md";
import { cn } from "@/lib/utils";


const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userObj, setUserObj] = useState<any>(null);
  const [subscription, setSubscription] = useState<Subscription>({
    id: "default",
    plan: "free",
    status: "active",
    created_at: new Date().toISOString(),
    ifc_user_id: "",
    role: "user",
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getUser();
        if (!userData) return;

        setUser(userData);
        
        // Find user image
        const userObjData = customUserImages.find(
          (entry) => entry.username === userData?.user_metadata?.ifcUsername
        ) || null;
        setUserObj(userObjData);

        // Get subscription only if we have a user
        if (userData.id) {
          const subscriptionData = await getUserSubscription(userData.id);
          setSubscription(subscriptionData as Subscription);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUser();
  }, []);


  return (
    <div id="navbar" className="relative">
      {/* Main Navbar */}
      <div className="flex justify-between items-center px-4 py-2 sticky top-0 bg-transparent z-50 border-b-2 border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3">
          {/* Animated Hamburger Button */}
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-700 transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <div className="relative w-6 h-6">
              <Menu
                size={24}
                className={`absolute inset-0 transition-all duration-300 dark:text-light ${
                  isMenuOpen
                    ? "opacity-0 rotate-180 scale-50"
                    : "opacity-100 rotate-0 scale-100"
                }`}
              />
              <X
                size={24}
                className={`absolute inset-0 transition-all duration-300 dark:text-light ${
                  isMenuOpen
                    ? "opacity-100 rotate-0 scale-100"
                    : "opacity-0 -rotate-180 scale-50"
                }`}
              />
            </div>
          </button>
          {/* <div className="relative block lg:hidden">
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
              <span className="text-gray-700 dark:text-gray-100"><span className="text-amber-500 dark:text-amber-300">IF</span>lytics</span>
            </Link>

            <span className="text-[10px] font-semibold text-white bg-purple-500 rounded-full absolute -bottom-4 left-5 px-2 py-0.10 shadow-lg z-100">
              v0.9.3.2-final
            </span>
          </div> */}
          <span className="lg:hidden">
            <Pathname />
          </span>

          <div className="hidden lg:flex items-center gap-2 bg-pink-50 dark:bg-pink-900/20 border-2 border-pink-200 dark:border-blue-800/30 rounded-[15px] px-4 py-2 hover:shadow-md transition-all duration-200">
            <div className="p-1.5 bg-pink-500 dark:bg-blue-600 rounded-full">
              <LuUser className="w-4 h-4 text-white" />
            </div>
            <Link href="/dashboard" className="text-base font-bold text-gray-800 dark:text-gray-100 hover:text-pink-600 dark:hover:text-blue-400 transition-colors duration-200 tracking-tight">
              {user?.user_metadata?.ifcUsername ? (
                <span>Hello <span className="text-pink-600 dark:text-blue-400">{user?.user_metadata?.ifcUsername}</span>!</span>
              ) : (
                <span className="text-gray-500 dark:text-gray-400">Loading...</span>
              )}
            </Link>
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
          <Link href="/dashboard/leaderboard" className="text-sm !px-4 !py-2 font-semibold rounded-full hover:scale-105 transition-transform duration-200 text-pink-300 dark:text-blue-300 block lg:hidden relative"><MdOutlineLeaderboard className="w-6 h-6" />
          
            <Badge className="absolute -top-1 -left-1 bg-gradient-to-r from-pink-500 to-blue-500 text-white text-[0.5rem] font-bold py-0.3 px-1">NEW</Badge>
          </Link>
          <Popover>
            <PopoverTrigger>
              {userObj ? (
                <div className={`p-0.5 bg-${subscription.plan === "lifetime" ? "green-600" : subscription.plan === "premium" ? "yellow-500" : "blue-700"} hover:bg-gray-400 transition-colors duration-200 rounded-full cursor-pointer`}>
                  <img src={userObj?.image} alt={userObj?.username} className="w-10 h-10 rounded-full" />
                </div>
              ) : (
                <div className="p-1 bg-gray-700 hover:bg-gray-400 transition-colors duration-200 rounded-full cursor-pointer">
                  <RiCopilotFill size={24} className="text-light" />
                </div>
              )}
            </PopoverTrigger>
            <PopoverContent className="rounded-[25px] border-4 border-gray-200 dark:border-gray-700">
              <section className="flex flex-col gap-4 ">

                <div className="flex gap-2 items-center">

                  {userObj ? (
                    <div className={`p-0.5 bg-${subscription.plan === "lifetime" ? "green-600" : subscription.plan === "premium" ? "yellow-500" : "blue-700"} hover:bg-gray-400 transition-colors duration-200 rounded-full cursor-pointer`}>
                      <img src={userObj?.image} alt={userObj?.username} className="w-10 h-10 rounded-full" />
                    </div>
                    ) : (
                      <div className="p-1 bg-gray-700 hover:bg-gray-400 transition-colors duration-200 rounded-full cursor-pointer">
                        <RiCopilotFill size={24} className="text-light" />
                      </div>
                  )}

                  <div className="flex flex-col gap-[0.1rem] text-sm font-semibold self-start">
                    {userObj?.username ? userObj?.username : user?.user_metadata?.ifcUsername}
                    {subscription.plan === "free" && (
                      <span className="text-[0.5rem] text-light bg-blue-700 px-2 py-[0.1rem] rounded-full self-start">Free</span>
                    )}
                    {subscription.plan === "premium" && (
                      <span className="text-[0.5rem] text-gray bg-yellow-400 px-2 py-[0.1rem] rounded-full self-start">Premium</span>
                    )}
                    {subscription.plan === "lifetime" && (
                      <span className="text-[0.5rem] text-light bg-green-700 px-2 py-[0.1rem] rounded-full self-start">Lifetime</span>
                    )}
                  </div>
                </div>

                <Link href="/dashboard/profile" className="flex px-4 py-2 gap-2 items-center bg-gray-100 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors duration-200 cursor-pointer text-sm rounded-[15px] border-2 border-gray-200 dark:border-gray-700">
                  <div>
                    <FaUser className="w-4 h-4 text-dark dark:text-light" />
                  </div>
                  <span className="font-medium">Go to Profile</span>
                </Link>

                <div className="flex justify-between gap-2">
                  <InlineThemeSwitcher />
                  <LogoutButton className="text-sm !px-4 !py-2 font-semibold rounded-full hover:scale-105 transition-transform duration-200" />
                </div>

              </section>
            </PopoverContent>
          </Popover>
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
          className={`absolute inset-0 bg-black/50 dark:bg-black/70 transition-opacity duration-300 ${
            isMenuOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setIsMenuOpen(false)}
        />

        {/* Sliding Menu */}
        <div
          className={`absolute top-[73px] left-0 right-0 mx-3 bg-white dark:bg-gray-900 rounded-[25px] border-2 border-gray-200 dark:border-gray-700 shadow-2xl transition-all duration-300 ease-out ${
            isMenuOpen
              ? "translate-y-0 opacity-100"
              : "-translate-y-4 opacity-0"
          }`}
        >
          <div className="p-5">
            {/* Menu Header */}
            <div className="mb-5 pb-4 border-b-2 border-gray-200 dark:border-gray-700">
              <h3 className="text-base font-bold text-gray-800 dark:text-gray-100 tracking-tight">
                Where would you like to go?
              </h3>
            </div>

            {/* Navigation Links */}
            <nav className="grid grid-cols-2 gap-3">
              <Link
                href="/dashboard"
                className={cn(
                  "group flex items-center gap-3 p-4 rounded-[15px]",
                  "bg-gray-50 dark:bg-gray-800/50",
                  "hover:bg-gray-100 dark:hover:bg-gray-800",
                  "border-2 border-gray-200 dark:border-gray-700",
                  "transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="p-2 bg-blue-500 dark:bg-blue-600 rounded-[10px] group-hover:scale-110 transition-transform duration-200">
                  <FaHome className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold text-sm text-gray-800 dark:text-gray-100 tracking-tight">Dashboard</span>
              </Link>

              <Link
                href="/dashboard/flights?timeframe=day-30"
                className={cn(
                  "group flex items-center gap-3 p-4 rounded-[15px]",
                  "bg-gray-50 dark:bg-gray-800/50",
                  "hover:bg-gray-100 dark:hover:bg-gray-800",
                  "border-2 border-gray-200 dark:border-gray-700",
                  "transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="p-2 bg-purple-500 dark:bg-purple-600 rounded-[10px] group-hover:scale-110 transition-transform duration-200">
                  <TiPlaneOutline className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold text-sm text-gray-800 dark:text-gray-100 tracking-tight">Flights</span>
              </Link>

              <Link
                href="/dashboard/profile"
                className={cn(
                  "group flex items-center gap-3 p-4 rounded-[15px]",
                  "bg-gray-50 dark:bg-gray-800/50",
                  "hover:bg-gray-100 dark:hover:bg-gray-800",
                  "border-2 border-gray-200 dark:border-gray-700",
                  "transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="p-2 bg-green-500 dark:bg-green-600 rounded-[10px] group-hover:scale-110 transition-transform duration-200">
                  <FaUser className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold text-sm text-gray-800 dark:text-gray-100 tracking-tight">Profile</span>
              </Link>

              <Link
                href="/dashboard/users"
                className={cn(
                  "group flex items-center gap-3 p-4 rounded-[15px]",
                  "bg-gray-50 dark:bg-gray-800/50",
                  "hover:bg-gray-100 dark:hover:bg-gray-800",
                  "border-2 border-gray-200 dark:border-gray-700",
                  "transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="p-2 bg-pink-500 dark:bg-pink-600 rounded-[10px] group-hover:scale-110 transition-transform duration-200">
                  <GoCopilot className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold text-sm text-gray-800 dark:text-gray-100 tracking-tight">Community</span>
              </Link>

              <Link
                href="/map/dark"
                className={cn(
                  "group flex items-center gap-3 p-4 rounded-[15px]",
                  "bg-blue-50 dark:bg-blue-900/20",
                  "hover:bg-blue-100 dark:hover:bg-blue-900/30",
                  "border-2 border-blue-300 dark:border-blue-700/50",
                  "transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="p-2 bg-blue-500 dark:bg-blue-600 rounded-[10px] group-hover:scale-110 transition-transform duration-200">
                  <LiaGlobeAmericasSolid className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold text-sm text-blue-700 dark:text-blue-400 tracking-tight">Map</span>
              </Link>

              <Link
                href="/"
                className={cn(
                  "group flex items-center gap-3 p-4 rounded-[15px]",
                  "bg-orange-50 dark:bg-orange-900/20",
                  "hover:bg-orange-100 dark:hover:bg-orange-900/30",
                  "border-2 border-orange-300 dark:border-orange-700/50",
                  "transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="p-2 bg-orange-500 dark:bg-orange-600 rounded-[10px] group-hover:scale-110 transition-transform duration-200">
                  <BsIncognito className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold text-sm text-orange-700 dark:text-orange-400 tracking-tight">Guest</span>
              </Link>

            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
