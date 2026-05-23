"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { FaBook, FaSearch, FaSignInAlt } from "react-icons/fa";
import { LiaGlobeAmericasSolid } from "react-icons/lia";
import { LuMessageCircleQuestion } from "react-icons/lu";
import { GrMoney } from "react-icons/gr";
import { FiChevronDown } from "react-icons/fi";
import { PiNewspaperLight } from "react-icons/pi";
import Pathname from "./dashboard-ui/shared/pathname";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import MobileNav from "./mobile-nav";
import { InlineThemeSwitcher } from "./inline-theme-switcher";
import { FaWpexplorer } from "react-icons/fa6";

const NAV_LINKS = [
  { href: "/",                        label: "Search User", icon: <FaSearch className="w-3.5 h-3.5" /> },
  { href: "/map/dark",                label: "Live Map",    icon: <LiaGlobeAmericasSolid className="w-3.5 h-3.5" />, badge: true },
  { href: "/directory",               label: "Directory",   icon: <FaBook className="w-3.5 h-3.5" /> },
  { href: "/blog",                    label: "Blog",        icon: <PiNewspaperLight className="w-3.5 h-3.5" /> },
  { href: "https://iflytics.app/#pricing", label: "Pricing", icon: <GrMoney className="w-3.5 h-3.5" /> },
  { href: "https://iflytics.app/#faq",     label: "FAQs",    icon: <LuMessageCircleQuestion className="w-3.5 h-3.5" /> },
]

const NavbarMap = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
      setIsLoading(false);
    };
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setIsLoggedIn(!!session);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setIsNavOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleAuthClick = () => {
    router.push(isLoggedIn ? "/dashboard" : "/auth/login");
  };

  return (
    <header className="p-2 w-full flex justify-center gap-2 bg-transparent absolute top-0 left-0 right-0 !z-[1000]">
      <nav className="flex justify-between items-center w-full max-w-[1000px] rounded-full sm:py-2 py-1 px-3 sm:px-5 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm shadow-lg">
        {/* Logo */}
        <Pathname />

        {/* Right side — Explore + Login */}
        <div className="flex items-center gap-3" ref={navRef}>

          {/* Explore dropdown — desktop only */}
          <div className="hidden md:block relative">
            <button
              onClick={() => setIsNavOpen(v => !v)}
              className="flex items-center gap-1.5 px-4 py-2 font-semibold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all duration-200"
            >
              <FaWpexplorer className="w-4 h-4 inline" /> Explore
              <FiChevronDown className={`w-4 h-4 transition-transform duration-200 ${isNavOpen ? "rotate-180" : ""}`} />
            </button>

            {isNavOpen && (
              <div className="absolute top-11 right-0 w-60 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl overflow-hidden z-50">
                {NAV_LINKS.map(({ href, label, icon, badge }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setIsNavOpen(false)}
                    className="relative flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors duration-150"
                  >
                    <span className="text-gray-400">{icon}</span>
                    {label}
                    {badge && <span className="ml-auto w-2 h-2 bg-blue-500 rounded-full animate-pulse" />}
                  </Link>
                ))}
                <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Theme</span>
                  <InlineThemeSwitcher />
                </div>
              </div>
            )}
          </div>

          {/* Desktop Auth Button */}
          <div className="hidden md:block">
            {!isLoading ? (
              <button
                onClick={handleAuthClick}
                className="group flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white border-2 border-gray-600 dark:border-gray-300 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-full transition-all duration-200"
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
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden flex gap-3 items-center">
            <MobileNav
              isLoggedIn={isLoggedIn}
              isLoading={isLoading}
              onAuthClick={handleAuthClick}
            />
          </div>
        </div>
      </nav>
    </header>
  );
};

export default NavbarMap;
