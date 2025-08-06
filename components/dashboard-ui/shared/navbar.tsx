"use client";

import React, { useState, useEffect } from "react";
import { LogoutButton } from "@/components/logout-button";
import { getUser } from "@/lib/supabase/user-actions";
import { Menu, X } from "lucide-react";

import { TiPlaneOutline } from "react-icons/ti";
import { GoCopilot } from "react-icons/go";
import { FaHome, FaUser } from "react-icons/fa";
import { LuGoal, LuUser } from "react-icons/lu";

import Link from "next/link";
import Image from "next/image";
import iflyticsLogo from "@/public/infinilyticslogo.svg";
import iflyticsLogoLight from "@/public/iflyticslight.svg";
import { BsIncognito } from "react-icons/bs";
import { LiaGlobeAmericasSolid } from "react-icons/lia";
import { useTheme } from "next-themes";
import { customUserImages } from "@/lib/data";

import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import { InlineThemeSwitcher } from "@/components/inline-theme-switcher";
import { RiCopilotFill } from "react-icons/ri";

import { getUserSubscription } from "@/lib/subscription/subscription";
import { AccessLevel, Subscription } from "@/lib/subscription/helpers";


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
          <div className="relative block lg:hidden">
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

            <span className="text-[10px] font-semibold text-white bg-amber-500 rounded-full absolute -bottom-4 left-5 px-2 py-0.10 shadow-lg z-100">
              v0.9.2-beta
            </span>
          </div>

          <div className="hidden lg:flex dark:border-gray-300 hover:border-gray-800 dark:hover:border-gray-50 transition-colors duration-200 items-center gap-2">
            <LuUser className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            <Link href="/dashboard" className="text-xl font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 tracking-tight border-b-2 border-gray-700">
              {user?.user_metadata?.ifcUsername ? <span>Hello <b>{user?.user_metadata?.ifcUsername}</b>!</span> : "Loading..."}
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
          
          <Popover>
            <PopoverTrigger>
              {userObj ? (
                <div className="p-0.5 bg-gray-700 hover:bg-gray-400 transition-colors duration-200 rounded-full cursor-pointer">
                  <img src={userObj?.image} alt={userObj?.username} className="w-10 h-10 rounded-full" />
                </div>
              ) : (
                <div className="p-1 bg-gray-700 hover:bg-gray-400 transition-colors duration-200 rounded-full cursor-pointer">
                  <RiCopilotFill size={24} className="text-light" />
                </div>
              )}
            </PopoverTrigger>
            <PopoverContent>
              <section className="flex flex-col gap-4">

                <div className="flex gap-2 items-center">

                  {userObj ? (
                    <div className="p-0.5 bg-gray-700 hover:bg-gray-400 transition-colors duration-200 rounded-full cursor-pointer">
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

                <Link href="/dashboard/profile" className="flex px-4 py-2 rounded-md gap-2 items-center bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors duration-200 cursor-pointer text-sm">
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
                href="/dashboard/flights?timeframe=day-30"
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
                href="/map/dark"
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
