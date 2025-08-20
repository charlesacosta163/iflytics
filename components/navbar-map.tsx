"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { FaBook, FaSearch, FaSignInAlt } from "react-icons/fa";
import { LiaGlobeAmericasSolid } from "react-icons/lia";
import Pathname from "./dashboard-ui/shared/pathname";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import MobileNav from "./mobile-nav";
import { LuMessageCircleQuestion } from "react-icons/lu";
import { GrMoney } from "react-icons/gr";

const NavbarMap = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Check initial session
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
      setIsLoading(false);
    };

    checkSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setIsLoggedIn(!!session);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const handleAuthClick = () => {
    if (isLoggedIn) {
      router.push("/dashboard");
    } else {
      router.push("/auth/login");
    }
  };

  // Add a white background with a blur effect
  return (
    <header className="p-2 w-full flex justify-center gap-2 bg-transparent absolute top-0 left-0 right-0 !z-[1000]">
      <nav className="flex justify-between items-center w-full max-w-[1000px] rounded-full sm:py-2 py-1 px-3 sm:px-5 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm shadow-lg">
        {/* Logo Section */}
        <Pathname />


         {/* Desktop Navigation */}
         <div className="hidden md:flex items-center space-x-1">
            {/* Map Button */}
            <Link
              href="/map/dark"
              className="relative group flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all duration-200"
            >
              <LiaGlobeAmericasSolid className="w-4 h-4 group-hover:rotate-12 transition-transform duration-200" />
              <span>Map</span>
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            </Link>
            {/* Directory Button */}
            <Link
              href="/directory"
              className="group flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all duration-200"
            >
              <FaBook className="w-4 h-4 group-hover:rotate-12 transition-transform duration-200" />
              <span>Directory</span>
            </Link>
            {/* Search Button */}
            <Link
              href="/"
              className="group flex items-center gap-2 px-3 py-2 text-sm font-medium bg-gray-900 text-white dark:bg-blue-950 dark:hover:bg-black rounded-full transition-all duration-200 shadow-sm"
            >
              <FaSearch className="w-4 h-4 group-hover:rotate-12 transition-transform duration-200" />
              <span>Search</span>
            </Link>
            <Link 
              href={`/#pricing`}
              className="group flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all duration-200"
            >
              <GrMoney className="w-4 h-4 group-hover:rotate-12 transition-transform duration-200" />
              <span>Pricing</span>
            </Link>

            <Link
              href={`/#faq`}
              className="group flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all duration-200"
            >
              <LuMessageCircleQuestion className="w-4 h-4 group-hover:rotate-12 transition-transform duration-200" />
              <span>FAQs</span>
            </Link>
          </div>

          {/* Auth Button */}
          {!isLoading ? (
            <button
              onClick={handleAuthClick}
              className="group hidden md:flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white border-2 border-gray-600 dark:border-gray-300 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-full transition-all duration-200"
            >
              <FaSignInAlt className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
              <span>{isLoggedIn ? "Dashboard" : "Login"}</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-400 border-2 border-gray-200 dark:border-gray-700 rounded-full">
              <FaSignInAlt className="w-4 h-4" />
              <span>Loading...</span>
            </div>
          )}

        {/* Mobile Navigation */}
        <div className="md:hidden flex gap-3 items-center">
          <Link
            href="/map/dark"
            className="relative group flex items-center justify-center w-10 h-10 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all duration-200"
          >
            <LiaGlobeAmericasSolid className="w-5 h-5 group-hover:rotate-12 transition-transform duration-200" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          </Link>
          <MobileNav
            isLoggedIn={isLoggedIn}
            isLoading={isLoading}
            onAuthClick={handleAuthClick}
          />
        </div>
      </nav>
    </header>
  );
};

export default NavbarMap;
