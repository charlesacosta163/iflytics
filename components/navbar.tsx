"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { FaWpexplorer } from "react-icons/fa6";
import { FaBook, FaSearch, FaSignInAlt } from "react-icons/fa";
import { LuMessageCircleQuestion } from "react-icons/lu";
import { LiaGlobeAmericasSolid } from "react-icons/lia";
import { GrMoney } from "react-icons/gr";
import { FiChevronDown } from "react-icons/fi";
import { PiNewspaperLight } from "react-icons/pi";
import Pathname from "./dashboard-ui/shared/pathname";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import MobileNav from "./mobile-nav";
import { InlineThemeSwitcher } from "./inline-theme-switcher";

const NAV_LINKS = [
  { href: "/",          label: "Search User",  icon: <FaSearch className="w-3.5 h-3.5" /> },
  { href: "/map/dark",  label: "Live Map",     icon: <LiaGlobeAmericasSolid className="w-3.5 h-3.5" />, badge: true },
  { href: "/directory", label: "Directory",    icon: <FaBook className="w-3.5 h-3.5" /> },
  { href: "/blog",      label: "Blog",         icon: <PiNewspaperLight className="w-3.5 h-3.5" /> },
  { href: "/#pricing",  label: "Pricing",      icon: <GrMoney className="w-3.5 h-3.5" /> },
  { href: "/#faq",      label: "FAQs",         icon: <LuMessageCircleQuestion className="w-3.5 h-3.5" /> },
]

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
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

  // Close dropdown when clicking outside
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
    if (isLoggedIn) {
      router.push("/dashboard");
    } else {
      router.push("/auth/login");
    }
  };

  return (
    <header className="z-50 w-full rounded-b-[20px] dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-900/60">
      <div className="container mx-auto px-4 max-w-7xl">
        <nav className="flex h-16 items-center justify-between">
          {/* Logo Section */}
          <div className="flex items-center">
            <Pathname />
          </div>
          
          {/* Auth Button, Explore dropdown & Mobile Menu */}
          <div className="flex items-center gap-3" ref={navRef}>

            {/* Explore dropdown — desktop only, sits beside Login */}
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
                <div className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-400 border border-gray-200 dark:border-gray-700 rounded-md">
                  <FaSignInAlt className="w-4 h-4" />
                  <span>Loading...</span>
                </div>
              )}
            </div>

            {/* Mobile Navigation */}
            <div className="md:hidden flex items-center gap-3">
              {/* Mobile Map Button */}
              <Link
                href="/map/dark"
                className="relative group flex items-center justify-center w-10 h-10 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-all duration-200"
              >
                <LiaGlobeAmericasSolid className="w-5 h-5 group-hover:rotate-12 transition-transform duration-200" />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              </Link>

              {/* Mobile Menu */}
              <MobileNav
                isLoggedIn={isLoggedIn}
                isLoading={isLoading}
                onAuthClick={handleAuthClick}
              />
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
