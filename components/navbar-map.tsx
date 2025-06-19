"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { FaBook, FaSearch, FaSignInAlt } from "react-icons/fa";
import { LiaGlobeAmericasSolid } from "react-icons/lia";
import Pathname from "./dashboard-ui/shared/pathname";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import MobileNav from "./mobile-nav";

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
      <nav className="flex justify-between items-center w-full max-w-[1000px] rounded-full sm:py-2 py-1 px-3 sm:px-5 bg-white/50 backdrop-blur-sm shadow-lg">
        {/* Logo Section */}
        <Pathname />


        {/* Navigation Buttons */}
        <div className="hidden md:flex gap-3 items-center">
          {/* Search Button */}
          <Link
          href="/map"
          className="flex flex-col group gap-1 items-center bg-transparent text-gray rounded-full font-semibold transition-all duration-200 hover:scale-105 w-fit relative"
        >
          <LiaGlobeAmericasSolid className="group-hover:rotate-12 transition-transform duration-200 text-2xl text-blue-500" />
          <span className="bg-blue-500 text-white rounded-full px-2 py-[0.5] text-[0.6rem] absolute -bottom-2 left-[50%] -translate-x-[50%] font-semibold">
            Map
          </span>
        </Link>
          <Link
            href="/directory"
            className="flex group gap-2 items-center px-3 py-2 bg-transparent text-gray rounded-full font-semibold transition-all duration-200 hover:scale-105"
          >
            <FaBook className="group-hover:rotate-12 transition-transform duration-200" />
            <span>Directory</span>
          </Link>
          <Link
            href="/"
            className="hidden md:flex group gap-2 items-center px-3 py-2 text-sm bg-gray-700 hover:bg-gray-800 text-white rounded-full font-semibold transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg"
          >
            <FaSearch className="group-hover:rotate-12 transition-transform duration-200" />
            <span>Search</span>
          </Link>

          {/* Dynamic Auth Button */}
          {!isLoading ? (
            <button
              onClick={handleAuthClick}
              className="group flex gap-2 items-center px-3 py-2 text-sm text-gray-700 hover:text-gray-900 border-2 border-gray-700 hover:border-gray-900 rounded-full font-bold transition-all duration-200 hover:scale-105 hover:bg-gray-50"
            >
              <FaSignInAlt className="group-hover:translate-x-1 transition-transform duration-200" />
              <span>{isLoggedIn ? "Dashboard" : "Login"}</span>
            </button>
          ) : (
            <div className="flex gap-2 items-center px-3 py-2 text-sm text-gray-700 border-2 border-gray-700 rounded-full font-bold">
              <FaSignInAlt />
              <span>...</span>
            </div>
          )}
        </div>

        <div className="md:hidden flex gap-6 items-center">
        <Link
          href="/map"
          className="flex flex-col group gap-1 items-center bg-transparent text-gray rounded-full font-semibold transition-all duration-200 hover:scale-105 w-fit relative"
        >
          <LiaGlobeAmericasSolid className="group-hover:rotate-12 transition-transform duration-200 text-2xl text-blue-500" />
          <span className="bg-blue-500 text-white rounded-full px-2 py-[0.5] text-[0.6rem] absolute -bottom-2 left-[50%] -translate-x-[50%] font-semibold">
            Map
          </span>
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
