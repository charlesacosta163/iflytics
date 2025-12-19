import Image from "next/image";
import { TbSearch } from "react-icons/tb";
import { redirect } from "next/navigation";
import iflyticsLogo from '@/public/infinilyticslogo.svg'
import iflyticsLogoLight from '@/public/iflyticslight.svg'
import { IoStatsChartSharp } from "react-icons/io5";
import { LuHistory, LuCalendarClock, LuChartPie } from "react-icons/lu";
import { SearchUserButton } from "@/components/searchuser-btn";
import Link from "next/link";

import { FaCheck, FaStar } from "react-icons/fa6";
import { MdOutlineAccountCircle } from "react-icons/md";
import { BsDatabaseCheck } from "react-icons/bs";
import { TbPlaneInflight, TbUsersGroup, TbLiveView, TbBrandFunimation, TbMapPin } from "react-icons/tb";
import { RiCopilotFill } from "react-icons/ri";
import { LiaGlobeAmericasSolid } from "react-icons/lia";
import { GrTrophy } from "react-icons/gr";
import { PiArrowFatLineUp } from "react-icons/pi";
import { SlBadge } from "react-icons/sl";
import TestimonialCarousel from "@/components/testimonial-carousel";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { faqData } from "@/lib/data";
import { InlineThemeSwitcher } from "@/components/inline-theme-switcher";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  return (
    <div className="min-h-screen w-full">
      {/* Hero Section - Compact & Mobile-Friendly */}
      <section className="h-auto lg:h-[90svh] max-w-[1000px] w-full mx-auto flex justify-center items-center">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-r from-blue-400/8 to-purple-400/8 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-r from-gray-400/8 to-blue-400/8 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/3 right-1/4 w-48 h-48 bg-gradient-to-r from-purple-400/5 to-gray-400/5 rounded-full blur-2xl animate-float"></div>
        </div>

        <div className="container w-full flex flex-col lg:flex-row items-center gap-8 p-4 py-8 lg:p-6 relative z-10">
          <div className="flex-1 flex flex-col gap-4 lg:gap-8">
            <header className="flex flex-col items-center lg:items-start gap-4 lg:gap-6">
              
              {/* Value Proposition First - Large Headline */}
              <div className="text-center lg:text-left animate-fade-in-up">
                <h1 className="text-4xl lg:text-5xl font-black tracking-tighter mb-4 lg:mb-6 relative text-gray-700 dark:text-gray-100 leading-tight text-balance">
                  Transform Your Flight Data Into 
                  <span className="block bg-gradient-to-r from-[#ff6982] to-[#ffd2b3] dark:from-[#0080ff] dark:to-light bg-clip-text text-transparent animate-gradient-x bg-[length:200%_auto] lg:border-b-6  [border-image:linear-gradient(to_right,#ff6982,#ffd2b3)_1] dark:[border-image:linear-gradient(to_right,#0080ff,#00e0ff)_1]">
  Powerful Insights
</span>

                </h1>
                <p className="text-gray-600 dark:text-gray-300 tracking-tight lg:text-2xl font-medium animate-fade-in-up delay-200 mb-4 lg:mb-6">
                  See how you've grown as a pilot with detailed analytics, route maps, and performance tracking for every flight.
                </p>
              </div>

              {/* Logo and Brand - Supporting Role */}
              <div className="hidden lg:flex items-center gap-3 animate-fade-in-up delay-300
  bg-gradient-to-r from-[#ff6982] to-[#ffd2b3] dark:from-[#0080ff] dark:to-[#00e0ff]
  animate-gradient-x bg-[length:200%_auto] p-4 rounded-[30px]">
  <div className="group">
    {/* dark logo */}
    <Image src={iflyticsLogoLight} alt="IFlytics Logo" width={60} height={60}
      className="w-[60px] h-[60px] group-hover:scale-105 transition-transform duration-300 block opacity-75" />
   
  </div>

  <div>
    <h2 className="text-2xl font-black tracking-tight text-light">
      IFlytics
    </h2>
    <p className="text-sm text-light font-medium">
      For Infinite Flight Pilots
    </p>
  </div>
</div>

            </header>

            {/* Enhanced Feature Points - Desktop Only */}
            
          </div>

          {/* Enhanced Form Section */}
          <div className="flex-1 flex flex-col gap-4 lg:gap-6 items-center animate-slide-in-right delay-300 w-full relative">
            <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-[#ff879b] to-[#ffc49c] dark:from-[#1e90ff] dark:to-[#99badd] text-light font-bold tracking-tight">December 15th - Jan 3rd: 50% OFF! &nbsp;CODE: <Badge className="bg-blue-500 dark:bg-pink-600 dark:text-light px-2 py-0.5 rounded-md font-bold">IFHOLIDAY50</Badge></Badge>
            {/* Form with Enhanced Styling */}
            <div className="relative group w-full max-w-[400px]">
              {/* <div className="absolute -inset-1 bg-gradient-to-r from-gray-400 via-blue-400 to-gray-400 rounded-[24px] blur opacity-15 group-hover:opacity-30 transition-all duration-1000 animate-gradient-x bg-[length:200%_auto]"></div> */}

            <form action={async (formData: FormData) => {
              'use server'
              redirect(`/user/${formData.get("name") as string}`)
              }} className="relative px-4 py-6 lg:px-8 lg:py-10 rounded-[30px] bg-[#ffe3d0] dark:bg-dark shadow-xl backdrop-blur-sm border-4 border-gray-100 dark:border-gray-700">
                
                                 {/* Form Header */}
                 <div className="text-center mb-4 lg:mb-6">
                   <h2 className="text-orange-800 dark:text-light text-xl lg:text-2xl tracking-tight font-black mb-2 text-balance">
                     Find your Infinite Flight Stats
                   </h2>
                   <div className="w-12 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full mx-auto"></div>
                 </div>
                 
                 <div className="flex flex-col gap-3 lg:gap-4">
                   {/* Enhanced Input */}
                   <div className="relative group/input">
                     <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-400 to-purple-400 rounded-xl blur opacity-0 group-hover/input:opacity-25 transition-all duration-500"></div>
                     <div className="relative text-gray-900 dark:text-white">
                       <input 
                         type="text" 
                         name="name" 
                         className="relative bg-light dark:bg-gray-900/80 backdrop-blur-sm pl-9 pr-4 py-2.5 font-medium rounded-lg outline-none w-full focus:border-blue-400 transition-all duration-300 text-sm placeholder:text-gray-500 dark:placeholder:text-gray-400 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700" 
                         placeholder="Enter your IFC Username" 
                         required
                       />
                       <TbSearch className="absolute left-3 top-[14px] text-base text-gray-500 dark:text-gray-400 group-hover/input:text-blue-400 transition-colors duration-300"/>
                     </div>
                   </div>
                   
                   {/* Enhanced Button */}
                   <div className="relative group/button">
                     <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg blur opacity-40 group-hover/button:opacity-80 transition-all duration-500"></div>
                     <SearchUserButton className="relative bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 font-bold text-sm lg:text-base py-2.5 rounded-lg shadow-lg hover:shadow-blue-500/20 transition-all duration-300 hover:scale-[1.02]" />
                   </div>
                  
                                     {/* Login Option */}
                   <div className="animate-slide-in-up delay-400 self-center">
                     <div className="text-center">
                       <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">or</span>
                     </div>
                     <div className="mt-3 grid grid-cols-2 gap-3 w-full">
                       <Link href="/auth/login" className=" group/login relative inline-block">
                         <div className="relative bg-[#ff8f45] dark:bg-gray-500 dark:hover:bg-gray-600 backdrop-blur-sm text-light px-3 py-2 rounded-lg transition-all duration-300 font-medium hover:scale-105 text-center flex items-center justify-center gap-1.5 text-sm">
                           <MdOutlineAccountCircle className="text-base"/> Create account
                         </div>
                       </Link>
                       <Link href="/map/dark" className="group/map relative inline-block">
                         <div className="relative bg-[#4599ff] dark:bg-indigo-500 dark:hover:bg-indigo-600 backdrop-blur-sm text-light px-3 py-2 rounded-lg transition-all duration-300 font-medium hover:scale-105 text-center flex items-center justify-center gap-1.5 text-sm">
                          <TbMapPin className="text-base"/> Go to Map
                         </div>
                       </Link>
                     </div>
                   </div>
                  
                  {/* Enhanced Footer Links */}
                  <div className="space-y-2 lg:space-y-3">
                    <span className="text-gray-600 dark:text-gray-300 text-xs lg:text-sm text-center font-medium block hover:text-gray-700 dark:hover:text-gray-200 transition-colors duration-300">
                      No account? Join the <a href="https://community.infiniteflight.com/" className="text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 transition-colors duration-300">Infinite Flight Community</a> today!
                    </span>
                    
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-gray-600 dark:text-gray-300 text-xs lg:text-sm text-center font-medium">Currently on <b className="text-orange-500 dark:text-orange-400">Guest Mode</b></span>
                    </div>
                  </div>
                </div>
              </form>
            </div>
            
            {/* Enhanced Copyright */}
            <p className="text-xs lg:text-sm font-medium text-gray-500 dark:text-gray-400 animate-fade-in-up delay-600 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-300 text-center">
              © 2025 IFlytics | Not affiliated with Infinite Flight
            </p>
          </div>
        </div>
      </section>

      {/* Features Section - Beautified */}
      <section className="w-full bg-transparent py-32 overflow-hidden max-w-[1000px] mx-auto">

        <div className="container mx-auto px-4 max-w-6xl relative z-10">
          {/* Header Section */}
          <div className="text-center mb-20">
            <div className="inline-block mb-6">
              <h2 className="text-4xl lg:text-6xl font-black text-gray-900 dark:text-gray-100 mb-6 animate-fade-in-up relative">
                Powerful Flight Analytics
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-[#FFD6BA] to-orange-300 rounded-full animate-scale-in delay-500"></div>
              </h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-xl font-medium animate-fade-in-up delay-200">
              Everything you need to track and improve your flying
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {/* Feature 1 - Detailed Statistics */}
            <div className="group animate-slide-in-up delay-100">

              <div className="relative bg-[#FFD6BA] dark:bg-gray-700/15 dark:text-light p-10 rounded-2xl hover:scale-105 transition-all duration-500 shadow-lg hover:shadow-2xl ">
                {/* Floating Decoration */}
                <div className="absolute top-4 right-4 w-6 h-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full opacity-20 animate-float"></div>
                
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-8 shadow-lg group-hover:scale-110 transition-transform duration-300 group-hover:shadow-blue-500/25">
                  <IoStatsChartSharp className="text-white text-3xl " />
                </div>
                <h3 className="text-gray-900 dark:text-light text-2xl font-bold mb-6 group-hover:text-blue-700 transition-colors duration-300">
                  Detailed Statistics
                </h3>
                <p className="text-gray-600 dark:text-gray-200 leading-relaxed">
                  Comprehensive flight analytics with total flights, landings, flight time, XP earned, nautical miles, and unique routes across multiple timeframes.
                </p>
              </div>
            </div>

            {/* Feature 2 - Flight History */}
            <div className="group animate-slide-in-up delay-200">
              <div className="relative bg-[#FFD6BA] dark:bg-gray-700/15 dark:text-light p-10 rounded-2xl hover:scale-105 transition-all duration-500 shadow-lg hover:shadow-2xl ">
                {/* Floating Decoration */}
                <div className="absolute top-4 right-4 w-6 h-6 bg-gradient-to-r from-green-500 to-green-600 rounded-full opacity-20 animate-float delay-500"></div>
                
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-8 shadow-lg group-hover:scale-110 transition-transform duration-300 group-hover:shadow-green-500/25">
                  <LuHistory className="text-white text-3xl animate-spin-slow" />
                </div>
                <h3 className="text-gray-900 dark:text-light text-2xl font-bold mb-6 group-hover:text-green-700 transition-colors duration-300">
                  Flight History
                </h3>
                <p className="text-gray-600 dark:text-gray-200 leading-relaxed">
                  Detailed flight logs with departure/arrival airports, aircraft types, flight duration, timestamps, and comprehensive route tracking.
                </p>
              </div>
            </div>

            {/* Feature 3 - Airport Directory */}
            <div className="group animate-slide-in-up delay-300">
              <div className="relative bg-[#FFD6BA] dark:bg-gray-700/15 dark:text-light p-10 rounded-2xl hover:scale-105 transition-all duration-500 shadow-lg hover:shadow-2xl ">
                {/* Floating Decoration */}
                <div className="absolute top-4 right-4 w-6 h-6 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full opacity-20 animate-float delay-1000"></div>
                
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-8 shadow-lg group-hover:scale-110 transition-transform duration-300 group-hover:shadow-purple-500/25">
                  <TbSearch className="text-white text-3xl" />
                </div>
                <h3 className="text-gray-900 dark:text-light text-2xl font-bold mb-6 group-hover:text-purple-700 transition-colors duration-300">
                  Airport Directory
                </h3>
                <p className="text-gray-600 dark:text-gray-200 leading-relaxed">
                  Search airports worldwide with real-time Expert Server status, frequencies, and runway information.
                </p>
              </div>
            </div>

            {/* Feature 4 - Visual Charts */}
            <div className="group animate-slide-in-up delay-400">
              <div className="relative bg-[#FFD6BA] dark:bg-gray-700/15 dark:text-light p-10 rounded-2xl hover:scale-105 transition-all duration-500 shadow-lg hover:shadow-2xl ">
                {/* Floating Decoration */}
                <div className="absolute top-4 right-4 w-6 h-6 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full opacity-20 animate-float delay-300"></div>
                
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mb-8 shadow-lg group-hover:scale-110 transition-transform duration-300 group-hover:shadow-orange-500/25">
                  <LuChartPie className="text-white text-3xl" />
                </div>
                <h3 className="text-gray-900 dark:text-light text-2xl font-bold mb-6 group-hover:text-orange-700 transition-colors duration-300">
                  Visual Charts
                </h3>
                <p className="text-gray-600 dark:text-gray-200 leading-relaxed">
                  Interactive pie charts for aircraft usage, area charts for flight activity trends, route visualization maps, and comprehensive performance analytics.
                </p>
              </div>
            </div>

            {/* Feature 5 - Live Tracking */}
            <div className="group animate-slide-in-up delay-500">
              <div className="relative bg-[#FFD6BA] dark:bg-gray-700/15 dark:text-light p-10 rounded-2xl hover:scale-105 transition-all duration-500 shadow-lg hover:shadow-2xl ">
                {/* Floating Decoration */}
                <div className="absolute top-4 right-4 w-6 h-6 bg-gradient-to-r from-red-500 to-red-600 rounded-full opacity-20 animate-float delay-700"></div>
                
                <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl flex items-center justify-center mb-8 shadow-lg group-hover:scale-110 transition-transform duration-300 group-hover:shadow-red-500/25 relative">
                  <TbLiveView className="text-white text-3xl" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full animate-ping"></div>
                </div>
                <h3 className="text-gray-900 dark:text-light text-2xl font-bold mb-6 group-hover:text-red-700 transition-colors duration-300">
                  Live Tracking
                </h3>
                <p className="text-gray-600 dark:text-gray-200 leading-relaxed">
                  Real-time Infinite Flight map tracking with live aircraft positions, flight routes, pilot information, and active ATC frequencies.
                </p>
              </div>
            </div>

            {/* Feature 6 - Community Features */}
            <div className="group animate-slide-in-up delay-600">
              <div className="relative bg-[#FFD6BA] dark:bg-gray-700/15 dark:text-light p-10 rounded-2xl hover:scale-105 transition-all duration-500 shadow-lg hover:shadow-2xl ">
                {/* Floating Decoration */}
                <div className="absolute top-4 right-4 w-6 h-6 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full opacity-20 animate-float delay-200"></div>
                
                <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-8 shadow-lg group-hover:scale-110 transition-transform duration-300 group-hover:shadow-indigo-500/25">
                  <TbUsersGroup className="text-white text-3xl animate-hover-float" />
                </div>
                <h3 className="text-gray-900 dark:text-light text-2xl font-bold mb-6 group-hover:text-indigo-700 transition-colors duration-300">
                  Community Features
                </h3>
                <p className="text-gray-600 dark:text-gray-200 leading-relaxed">
                  Discover fellow pilots in the community, explore their profiles, compare flight statistics, and connect with other aviation enthusiasts.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Decoration */}
          <div className="mt-20 text-center">
            <div className="inline-flex items-center gap-2 px-8 py-4 bg-[#FFD6BA]/30 dark:bg-gray-700/15 dark:text-light backdrop-blur-sm rounded-full border border-orange-200/50 dark:border-white/10 animate-fade-in-up delay-700">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-ping"></span>
              <span className="text-gray-600 dark:text-gray-200 font-medium">Real-time data updates</span>
              <span className="w-2 h-2 bg-blue-400 rounded-full animate-ping delay-500"></span>
            </div>
          </div>
        </div>
      </section>

      {/* Expert Server Map Section */}
      <section className="relative w-full py-32 overflow-hidden">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: 'url(/themap.png)',
            imageRendering: 'pixelated'
          }}
        >
          <div className="absolute inset-0 bg-black/60"></div>
        </div>

        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-blue-400/10 to-cyan-400/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-green-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="container mx-auto px-4 max-w-6xl relative z-10">
          {/* Header Section */}
          <div className="text-center mb-20">
            <div className="inline-block mb-6">
              <h2 className="text-4xl lg:text-6xl font-black text-white mb-6 animate-fade-in-up relative">
                Infinite Flight Live Map
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full animate-scale-in delay-500"></div>
              </h2>
            </div>
            <p className="text-gray-200 text-xl font-medium animate-fade-in-up delay-200 max-w-3xl mx-auto">
              Track live flights on Infinite Flight's with real-time aircraft positions, routes, and pilot information
            </p>
          </div>
          
          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            
            {/* Feature 1 - Live Flight Tracking */}
            <div className="group animate-slide-in-up delay-100">
              <div className="relative bg-white/10 dark:bg-gray-900/30 backdrop-blur-xl p-8 rounded-2xl hover:scale-105 transition-all duration-500 shadow-lg hover:shadow-2xl border border-white/20">
                {/* Floating Decoration */}
                <div className="absolute top-4 right-4 w-6 h-6 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full opacity-30 animate-float"></div>
                
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300 group-hover:shadow-blue-500/25 relative">
                  <TbLiveView className="text-white text-3xl" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
                </div>
                <h3 className="text-white text-xl font-bold mb-4 group-hover:text-cyan-400 transition-colors duration-300">
                  Live Flight Tracking
                </h3>
                <p className="text-gray-200 leading-relaxed text-sm">
                  Watch pilots fly in real-time across the Infinite Flight map with live aircraft positions and flight paths.
                </p>
              </div>
            </div>

            {/* Feature 2 - Interactive Search */}
            <div className="group animate-slide-in-up delay-200">
              <div className="relative bg-white/10 dark:bg-gray-900/30 backdrop-blur-xl p-8 rounded-2xl hover:scale-105 transition-all duration-500 shadow-lg hover:shadow-2xl border border-white/20">
                {/* Floating Decoration */}
                <div className="absolute top-4 right-4 w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full opacity-30 animate-float delay-500"></div>
                
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300 group-hover:shadow-purple-500/25">
                  <TbSearch className="text-white text-3xl" />
                </div>
                <h3 className="text-white text-xl font-bold mb-4 group-hover:text-pink-400 transition-colors duration-300">
                  Smart Pilot Search
                </h3>
                <p className="text-gray-200 leading-relaxed text-sm">
                  Find specific pilots, aircraft types, or callsigns with intelligent search and filtering options.
                </p>
              </div>
            </div>

            {/* Feature 3 - ATC Information */}
            <div className="group animate-slide-in-up delay-300">
              <div className="relative bg-white/10 dark:bg-gray-900/30 backdrop-blur-xl p-8 rounded-2xl hover:scale-105 transition-all duration-500 shadow-lg hover:shadow-2xl border border-white/20">
                {/* Floating Decoration */}
                <div className="absolute top-4 right-4 w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full opacity-30 animate-float delay-1000"></div>
                
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300 group-hover:shadow-green-500/25">
                  <RiCopilotFill className="text-white text-3xl" />
                </div>
                <h3 className="text-white text-xl font-bold mb-4 group-hover:text-emerald-400 transition-colors duration-300">
                  Active ATC Centers
                </h3>
                <p className="text-gray-200 leading-relaxed text-sm">
                  View all active ATC positions with frequencies and coverage areas across the Infinite Flight map servers.
                </p>
              </div>
            </div>

            {/* Feature 4 - Flight Routes */}
            <div className="group animate-slide-in-up delay-400">
              <div className="relative bg-white/10 dark:bg-gray-900/30 backdrop-blur-xl p-8 rounded-2xl hover:scale-105 transition-all duration-500 shadow-lg hover:shadow-2xl border border-white/20">
                {/* Floating Decoration */}
                <div className="absolute top-4 right-4 w-6 h-6 bg-gradient-to-r from-orange-500 to-red-500 rounded-full opacity-30 animate-float delay-300"></div>
                
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300 group-hover:shadow-orange-500/25">
                  <TbPlaneInflight className="text-white text-3xl" />
                </div>
                <h3 className="text-white text-xl font-bold mb-4 group-hover:text-red-400 transition-colors duration-300">
                  Interactive Routes
                </h3>
                <p className="text-gray-200 leading-relaxed text-sm">
                  Click on any aircraft to see their complete flight path with departure and arrival airports.
                </p>
              </div>
            </div>

            {/* Feature 5 - Multiple Map Themes */}
            <div className="group animate-slide-in-up delay-500">
              <div className="relative bg-white/10 dark:bg-gray-900/30 backdrop-blur-xl p-8 rounded-2xl hover:scale-105 transition-all duration-500 shadow-lg hover:shadow-2xl border border-white/20">
                {/* Floating Decoration */}
                <div className="absolute top-4 right-4 w-6 h-6 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full opacity-30 animate-float delay-700"></div>
                
                <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300 group-hover:shadow-indigo-500/25">
                  <LiaGlobeAmericasSolid className="text-white text-3xl" />
                </div>
                <h3 className="text-white text-xl font-bold mb-4 group-hover:text-purple-400 transition-colors duration-300">
                  Multiple Themes
                </h3>
                <p className="text-gray-200 leading-relaxed text-sm">
                  Choose from various map themes including dark mode or light mode.
                </p>
              </div>
            </div>

            {/* Feature 6 - User Interaction */}
            <div className="group animate-slide-in-up delay-600">
              <div className="relative bg-white/10 dark:bg-gray-900/30 backdrop-blur-xl p-8 rounded-2xl hover:scale-105 transition-all duration-500 shadow-lg hover:shadow-2xl border border-white/20">
                {/* Floating Decoration */}
                <div className="absolute top-4 right-4 w-6 h-6 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-full opacity-30 animate-float delay-200"></div>
                
                <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300 group-hover:shadow-yellow-500/25">
                  <TbUsersGroup className="text-white text-3xl" />
                </div>
                <h3 className="text-white text-xl font-bold mb-4 group-hover:text-amber-400 transition-colors duration-300">
                  Pilot Information
                </h3>
                <p className="text-gray-200 leading-relaxed text-sm">
                  Get detailed pilot stats, flight progress, and aircraft information with interactive popups.
                </p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <div className="relative group inline-block">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur opacity-50 group-hover:opacity-100 transition duration-700"></div>
              <Link href="/map/dark" className="relative bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-blue-500/25 inline-flex items-center gap-3">
                <LiaGlobeAmericasSolid className="text-2xl" />
                <span>Explore Live Map</span>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
              </Link>
            </div>
            
            <p className="text-gray-300 text-sm font-medium mt-4 animate-fade-in-up delay-700">
              Updated every 30 seconds with live Infinite Flight map data
            </p>
          </div>
        </div>
      </section> 

      {/* Stats Section */}
      <section className="relative w-full bg-dark py-20 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-10 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-green-400/5 rounded-full blur-2xl animate-float"></div>
        </div>

        <div className="container mx-auto px-4 max-w-[1000px] relative z-10">
          {/* Header Section */}
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-white mb-6 animate-fade-in-up relative">
              Trusted by Infinite Flight Pilots
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-scale-in delay-300"></div>
            </h2>
            <p className="text-gray-300 text-lg font-medium animate-fade-in-up delay-200">
              Join hundreds of pilots already using IFlytics
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { number: "75K+", label: "Flights Tracked", gradient: "from-blue-400 to-blue-600", icon: <TbPlaneInflight className="text-blue-400"/>, delay: "delay-100" },
              { number: "340+", label: "Active Users", gradient: "from-green-400 to-green-600", icon: <RiCopilotFill className="text-green-400"/>, delay: "delay-200" },
              { number: "24/7", label: "Live Updates", gradient: "from-orange-400 to-orange-600", icon: <LuCalendarClock className="text-orange-400"/>, delay: "delay-400" }
            ].map((stat, index) => (
              <div key={index} className={`group text-center p-8 bg-gradient-to-br from-gray/30 to-gray/50 backdrop-blur-xl rounded-2xl border border-gray-600/30 hover:border-gray-400/50 transition-all duration-500 hover:scale-105 animate-slide-in-up ${stat.delay} relative overflow-hidden flex flex-col items-center justify-center`}>
                {/* Floating Background Element */}
                <div className="absolute top-2 right-2 w-4 h-4 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full animate-float opacity-50"></div>
                
                {/* Icon */}
                <div className="text-4xl mb-4 animate-bounce" style={{animationDelay: `${index * 200}ms`}}>
                  {stat.icon}
                </div>
                
                {/* Number */}
                <div className={`text-4xl font-black bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent mb-3 group-hover:scale-110 transition-transform duration-300`}>
                  {stat.number}
                </div>

                {/* Label */}
                <p className="text-gray-300 font-semibold text-lg group-hover:text-white transition-colors duration-300">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          {/* Bottom Decoration */}
          <div className="mt-16 text-center">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-gray/20 backdrop-blur-sm rounded-full border border-gray-600/30 animate-fade-in-up delay-500">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-ping"></span>
              <span className="text-gray-300 font-medium text-sm">Real-time analytics updated every minute</span>
              <span className="w-2 h-2 bg-blue-400 rounded-full animate-ping delay-500"></span>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="w-full bg-dark py-20 overflow-hidden">
      
        <div className="container mx-auto px-4 max-w-[1200px] w-full">
          
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-white mb-6 animate-fade-in-up relative">
              What Infinite Flight Pilots Are Saying
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-scale-in delay-300"></div>
            </h2>
            <p className="text-gray-300 text-lg font-medium animate-fade-in-up delay-200">
              Real feedback from the Infinite Flight community
            </p>
          </div>

          <section>
            <TestimonialCarousel />
          </section>
        </div>
      </section>

      {/* Subscription Tiers Section */}
      <section id="pricing" className="relative w-full bg-gradient-to-br bg-[#FAF0E6] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-24 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-blue-400/8 to-purple-400/8 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-green-400/8 to-blue-400/8 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="container mx-auto px-4 max-w-[1200px] relative z-10">
          {/* Header Section */}
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-6xl font-black text-gray-900 dark:text-white mb-6 animate-fade-in-up relative">
              Choose Your Plan
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-scale-in delay-500"></div>
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-xl font-medium animate-fade-in-up delay-200">
              Unlock powerful features to enhance your flight tracking experience
            </p>
            <p className="text-purple-600 dark:text-purple-300 text-2xl font-bold tracking-tight animate-fade-in-up delay-200 mt-4 italic underline flex gap-2 items-center justify-center animate-bounce">
              <FaStar className="text-purple-600 dark:text-purple-400" />
              Holiday Discounts Ongoing Until January 3rd!
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Free Tier */}
            <div className="group animate-slide-in-up delay-100">
              <div className="relative bg-[#ffe1ce] dark:bg-gray-800/50 p-8 rounded-2xl border border-gray-200 dark:border-gray-700 hover:scale-105 transition-all duration-500 shadow-lg hover:shadow-2xl h-full flex flex-col">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Free</h3>
                  <div className="text-4xl font-black text-gray-900 dark:text-white mb-2">$0</div>
                  <p className="text-gray-600 dark:text-gray-400">Forever</p>
                </div>
                
                <div className="flex-1 space-y-4 mb-8">
                  <div className="flex items-start gap-3">
                    <FaCheck className="text-green-500 mt-1 flex-shrink-0"/>
                    <span className="text-gray-700 dark:text-gray-300">Basic flight tracking and statistics</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <FaCheck className="text-green-500 mt-1 flex-shrink-0"/>
                    <span className="text-gray-700 dark:text-gray-300">Time-based frames of flight history and analysis (1, 7, 30 days)</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <FaCheck className="text-green-500 mt-1 flex-shrink-0"/>
                    <span className="text-gray-700 dark:text-gray-300">Simple dashboard with core metrics (Flights, Landings, XP, etc...)</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <FaCheck className="text-green-500 mt-1 flex-shrink-0"/>
                    <span className="text-gray-700 dark:text-gray-300">The Infinite Flight Map</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <FaCheck className="text-green-500 mt-1 flex-shrink-0"/>
                    <span className="text-gray-700 dark:text-gray-300">Access to the IFlytics Discord Server</span>
                  </div>
                </div>

                <button className="w-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-3 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-300 italic">
                  Forever Free
                </button>
              </div>
            </div>

            {/* Premium Tier */}
            <div className="group animate-slide-in-up delay-200">
              <div className="relative bg-[#ffe1ce] dark:bg-gray-800/50 p-8 rounded-2xl border-2 border-amber-200 dark:border-amber-700 hover:scale-105 transition-all duration-500 shadow-lg hover:shadow-2xl h-full flex flex-col">
              <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-[#ff879b] to-[#ffc49c] dark:from-[#1e90ff] dark:to-[#99badd] text-light font-bold tracking-tight">December 15th - Jan 3rd: 50% OFF! &nbsp;CODE: <Badge className="bg-blue-500 dark:bg-pink-600 dark:text-light px-2 py-0.5 rounded-md font-bold">IFHOLIDAY50</Badge></Badge> 
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mb-2">Premium</h3>
                  <div className="text-4xl font-black text-yellow-600 dark:text-yellow-400 mb-2">$1.99</div>
                  <p className="text-gray-600 dark:text-gray-400">per month</p>
                </div>
                
                <div className="flex-1 space-y-4 mb-8">
                  <div className="flex items-start gap-3">
                    <FaCheck className="text-green-500 mt-1 flex-shrink-0"/>
                    <div>
                      <span className="text-gray-700 dark:text-gray-300 font-semibold">Route Analysis</span>
                      <span className="text-gray-600 dark:text-gray-400 text-sm block">Interactive maps, distance calculations, route categorization</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <FaCheck className="text-green-500 mt-1 flex-shrink-0"/>
                    <div>
                      <span className="text-gray-700 dark:text-gray-300 font-semibold">Aircraft Analysis</span>
                      <span className="text-gray-600 dark:text-gray-400 text-sm block">Top aircraft usage, fleet statistics, performance tracking</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <FaCheck className="text-green-500 mt-1 flex-shrink-0"/>
                    <div>
                      <span className="text-gray-700 dark:text-gray-300 font-semibold">Flight-Frame Analysis</span>
                      <span className="text-gray-600 dark:text-gray-400 text-sm block">Analyze your last 10, 50, 100, 250, 500 or custom number of flights</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <FaCheck className="text-green-500 mt-1 flex-shrink-0"/>
                    <span className="text-gray-700 dark:text-gray-300 font-semibold">Extended flight history (based on Flight Frames)</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <FaCheck className="text-green-500 mt-1 flex-shrink-0"/>
                    <div>
                      <span className="text-gray-700 dark:text-gray-300 font-semibold">Advanced charts and analytics</span>
                      <span className="text-gray-600 dark:text-gray-400 text-sm block">Aircraft usage charts, flight duration categorization, more route-based charts</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <FaCheck className="text-green-500 mt-1 flex-shrink-0"/>
                    <span className="text-gray-700 dark:text-gray-300 font-semibold">Priority user support</span>
                  </div>
                  
                </div>

                <Link href="/dashboard/profile" className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 px-2 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-blue-500/25 text-center">
                  Please go to the Billing section in your Profile to subscribe
                </Link>
              </div>
            </div>

            {/* Lifetime Plan */}
            <div className="group animate-slide-in-up delay-100">
              <div className="relative bg-[#ffe1ce] dark:bg-gray-800/50 p-8 rounded-2xl border-2 border-purple-200 dark:border-purple-700 hover:scale-105 transition-all duration-500 shadow-lg hover:shadow-2xl h-full flex flex-col">
              <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-[#ff879b] to-[#ffc49c] dark:from-[#1e90ff] dark:to-[#99badd] text-light font-bold tracking-tight">December 15th - Jan 3rd: 50% OFF! &nbsp;CODE: <Badge className="bg-blue-500 dark:bg-pink-600 dark:text-light px-2 py-0.5 rounded-md font-bold">IFHOLIDAY50</Badge></Badge> 
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-2">Lifetime</h3>
                  <div className="text-4xl font-black text-purple-600 dark:text-purple-400 mb-2">$49.99 </div>
                  <p className="text-purple-600 dark:text-purple-400">Forever</p>
                </div>
                
                <div className="flex-1 space-y-4 mb-8">
                  {/* Everything in Premium */}
                  <div className="flex items-center gap-3">
                    <FaCheck className="text-amber-500 mt-1 flex-shrink-0"/>
                    <span className="text-amber-700 dark:text-amber-300 font-semibold text-lg">Everything in Premium</span>
                  </div>
                  
                  {/* Lifetime-specific features */}
                  <div className="flex items-start gap-3 font-bold">
                    <FaCheck className="text-purple-500 mt-1 flex-shrink-0"/>
                    <span className="text-purple-700 dark:text-purple-300">Export flight data as CSV files based on Time or Flight Frames</span>
                  </div>
                  <div className="flex items-start gap-3 font-bold">
                    <FaCheck className="text-purple-500 mt-1 flex-shrink-0"/>
                    <span className="text-blue-700 dark:text-blue-300">FlightRadar24 import compatibility (supports Date, Origin, Destination, Aircraft, Airline, Duration properties)</span>
                  </div>
                  <div className="flex items-start gap-3 font-bold">
                    <FaCheck className="text-purple-500 mt-1 flex-shrink-0"/>
                    <span className="text-purple-700 dark:text-purple-300">One-time payment - no recurring charges</span>
                  </div>
                </div>

                <Link href="/dashboard/profile" className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 px-2 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-blue-500/25 text-center">
                  Please go to the Billing section in your Profile to subscribe
                </Link>
              </div>
            </div>

          </div>

          {/* Bottom Note */}
          <div className="mt-16 text-center">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              All plans include access to your extensive flight history and Infinite Flight live tracking
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="w-full bg-dark py-24 overflow-hidden">
        <div className="container mx-auto px-4 max-w-[1200px] w-full">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
              Frequently Asked <span className="text-blue-400">Questions</span>
            </h2>
          </div>

          {/* FAQ Accordion */}
          <div className="max-w-4xl mx-auto space-y-4">
            <Accordion type="single" collapsible className="space-y-4">
                {faqData.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`} className="bg-gray-800/50 rounded-lg px-6 shadow-none border-none">
                    <AccordionTrigger className="text-white hover:text-blue-400 text-left text-lg font-bold tracking-tight">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-300 pb-4">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
            </Accordion>
          </div>  
        </div>
      </section>

      {/* CTA Section - Beautified & Compact */}
      <section className="relative w-full bg-transparent py-20 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 right-10 w-64 h-64 bg-gradient-to-r from-gray-400/10 to-dark/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 left-10 w-80 h-80 bg-gradient-to-r from-dark/10 to-gray-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="container mx-auto px-4 max-w-[1000px] relative z-10">
          <div className="relative group">
            {/* Glowing Border Animation */}
            <div className="absolute -inset-1 bg-gradient-to-r from-gray-400 via-dark to-gray-400 rounded-[30px] blur opacity-20 group-hover:opacity-40 transition-all duration-1000 animate-gradient-x bg-[length:200%_auto]"></div>
            
            <div className="relative bg-gradient-to-br from-gray via-dark to-gray px-4 sm:px-8 py-16 rounded-[30px] shadow-2xl border border-gray-600/30 backdrop-blur-sm">
              {/* Floating Animation Elements */}
              <div className="absolute top-6 right-6 w-6 h-6 bg-gradient-to-r from-blue-400/30 to-purple-400/30 rounded-full animate-float"></div>
              <div className="absolute bottom-6 left-6 w-4 h-4 bg-gradient-to-r from-gray-400/30 to-blue-400/30 rounded-full animate-float delay-1000"></div>
              
              <div className="text-center max-w-2xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                  <h2 className="text-4xl font-black text-white mb-6 animate-fade-in-up relative">
                    Ready to Visualize?
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-scale-in delay-300"></div>
                  </h2>
                  <p className="text-gray-300 text-xl font-medium mb-8 animate-fade-in-up delay-200">
                    Start visualizing your Infinite Flight journey today
                  </p>
                </div>
                
                {/* Enhanced Search Form */}
                <div className="mb-10 animate-slide-in-up delay-300">
                  <div className="flex flex-col lg:flex-row gap-8 justify-center items-center max-w-4xl mx-auto">
                    
                    {/* Search Form */}
                    <div className="flex-1 max-w-md w-full">
                      <form action={async (formData: FormData) => {
                        'use server'
                        redirect(`/user/${formData.get("name") as string}`)
                      }} className="flex flex-col sm:flex-row gap-4">
                        
                        {/* Enhanced Input */}
                        <div className="relative group/input flex-1 w-full">
                          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-400/50 to-purple-400/50 rounded-xl blur opacity-0 group-hover/input:opacity-50 transition-all duration-500"></div>
                          <input 
                            type="text" 
                            name="name" 
                            className="relative bg-dark/90 backdrop-blur-sm text-white px-6 py-3 rounded-xl outline-none border border-gray-600/50 focus:border-blue-400 transition-all duration-300 w-full placeholder:text-gray-400 font-medium" 
                            placeholder="Your IFC Username" 
                            required
                          />
                        </div>
                        
                        {/* Enhanced Button */}
                        <div className="relative group/button">
                          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl blur opacity-50 group-hover/button:opacity-100 transition-all duration-500 self-start"></div>
                          <button 
                            type="submit"
                            className="relative bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-blue-500/25 whitespace-nowrap w-full flex items-center justify-center"
                          >
                            <span className="sm:block hidden">Go!</span>
                            <span className="sm:hidden block">Get Started</span>
                          </button>
                        </div>
                      </form>
                    </div>
                    
                    {/* Divider */}
                    <div className="flex lg:flex-col items-center gap-4">
                      <div className="hidden lg:block w-px h-16 bg-gradient-to-b from-transparent via-gray-600 to-transparent"></div>
                      <div className="lg:hidden h-px w-16 bg-gradient-to-r from-transparent via-gray-600 to-transparent"></div>
                      <span className="text-gray-400 text-sm font-medium px-4 py-2 bg-gray/20 rounded-full">
                        or
                      </span>
                      <div className="hidden lg:block w-px h-16 bg-gradient-to-b from-transparent via-gray-600 to-transparent"></div>
                      <div className="lg:hidden h-px w-16 bg-gradient-to-r from-transparent via-gray-600 to-transparent"></div>
                    </div>
                    
                    {/* Sign In Section */}
                    <div className="flex flex-col items-center gap-4">
                      <h3 className="text-gray-300 text-lg font-semibold">
                        Don't have an account?
                      </h3>
                      <Link href="/auth/login" className="group/signin relative">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-gray-500/50 to-gray-600/50 rounded-xl blur opacity-0 group-hover/signin:opacity-50 transition-all duration-500"></div>
                        <button className="relative bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white px-8 py-3 rounded-xl font-bold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-gray-500/25">
                          Sign Up
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Feature Points */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8 animate-fade-in-up delay-500">
                  {[
                    { text: "Free to use", icon: <FaCheck className="text-light"/> },
                    { text: "No account required", icon: <MdOutlineAccountCircle className="text-light"/> },
                    { text: "Instant results", icon: <BsDatabaseCheck className="text-light"/> }
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center justify-center gap-2 px-4 py-2 bg-gray/20 backdrop-blur-sm rounded-2xl border border-gray-600/20 hover:border-gray-400/40 transition-all duration-300 hover:scale-105">
                      <span className="text-2xl">{feature.icon}</span>
                      <span className="text-gray-300 font-medium">{feature.text}</span>
                    </div>
                  ))}
                </div>

                {/* Footer Text */}
                <p className="text-gray-400 text-sm font-medium animate-fade-in-up delay-600">
                  Join the growing community of pilots tracking their progress with IFlytics
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
