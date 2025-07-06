import Image from "next/image";
import { TbSearch } from "react-icons/tb";
import { redirect } from "next/navigation";
import infinilyticsLogo from '@/public/infinilyticslogo.svg'
import { IoStatsChartSharp } from "react-icons/io5";
import { LuHistory, LuCalendarClock, LuChartPie } from "react-icons/lu";
import { SearchUserButton } from "@/components/searchuser-btn";
import Link from "next/link";

import { FaCheck } from "react-icons/fa6";
import { MdOutlineAccountCircle } from "react-icons/md";
import { BsDatabaseCheck } from "react-icons/bs";
import { TbPlaneInflight, TbUsersGroup, TbLiveView, TbBrandFunimation } from "react-icons/tb";
import { RiCopilotFill } from "react-icons/ri";
import { GrTrophy } from "react-icons/gr";
import { PiArrowFatLineUp } from "react-icons/pi";
import { SlBadge } from "react-icons/sl";



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

        <div className="container w-full flex flex-col lg:flex-row items-center gap-8 lg:gap-12 p-4 lg:p-6 relative z-10">
          <div className="flex-1 flex flex-col gap-4 lg:gap-8">
            <header className="flex flex-col items-center lg:items-start gap-4 lg:gap-6">
              {/* Logo with Animation */}
              <div className="relative group animate-fade-in-up">
                <div className="absolute -inset-2 bg-gradient-to-r from-blue-400/15 to-purple-400/15 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                <Image 
                  src={infinilyticsLogo} 
                  alt="Infinilytics Logo" 
                  width={200} 
                  height={200}
                  className="relative w-[150px] h-[150px] lg group-hover:scale-105 transition-transform duration-300 animate-hover-float"
                />
              </div>
              
              {/* Title with Gradient Animation */}
              <div className="text-center lg:text-left animate-fade-in-up delay-200">
                <h1 className="text-5xl lg:text-6xl font-black tracking-tight mb-3 lg:mb-4 relative">
                  <span className="bg-gradient-to-r from-gray-600 via-dark to-gray-600 bg-clip-text text-transparent animate-gradient-x bg-[length:200%_auto]">
                    IFlytics
                  </span>

                </h1>
                <p className="text-gray-500 text-lg sm:text-xl font-semibold animate-fade-in-up delay-300">
                  Your home to your stats of Infinite Flight!
                </p>
              </div>
            </header>

            {/* Enhanced Feature Points - Desktop Only */}
            <section className="hidden lg:flex flex-col gap-4 animate-slide-in-left delay-500">
              {/* Feature 1 */}
              <div className="group flex gap-4 items-center p-3 rounded-xl hover:bg-gray-50/30 transition-all duration-300 hover:scale-105">
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full blur opacity-0 group-hover:opacity-40 transition-all duration-500"></div>
                  <span className="relative flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg group-hover:shadow-blue-500/20 transition-all duration-300">
                    <IoStatsChartSharp className="text-white text-lg animate-pulse"/>
                </span>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-700 text-base mb-1 group-hover:text-blue-600 transition-colors duration-300">
                    Real-time Analytics Dashboard
                  </h3>
                  <p className="text-gray-600 text-sm group-hover:text-gray-700 transition-colors duration-300">
                    Get instant insights into your flight performance
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="group flex gap-4 items-center p-3 rounded-xl hover:bg-gray-50/30 transition-all duration-300 hover:scale-105">
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full blur opacity-0 group-hover:opacity-40 transition-all duration-500"></div>
                  <span className="relative flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 shadow-lg group-hover:shadow-purple-500/20 transition-all duration-300">
                    <LuHistory className="text-white text-lg animate-spin-slow"/>
                </span>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-700 text-base mb-1 group-hover:text-purple-600 transition-colors duration-300">
                    Complete Flight Journey
                  </h3>
                  <p className="text-gray-600 text-sm group-hover:text-gray-700 transition-colors duration-300">
                    Explore detailed history with routes and aircraft
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* Enhanced Form Section */}
          <div className="flex-1 flex flex-col gap-4 lg:gap-6 items-center animate-slide-in-right delay-300 w-full">
            {/* Form with Enhanced Styling */}
            <div className="relative group w-full max-w-[500px]">
              <div className="absolute -inset-1 bg-gradient-to-r from-gray-400 via-blue-400 to-gray-400 rounded-[24px] blur opacity-15 group-hover:opacity-30 transition-all duration-1000 animate-gradient-x bg-[length:200%_auto]"></div>

            <form action={async (formData: FormData) => {
              'use server'
              redirect(`/user/${formData.get("name") as string}`)
              }} className="relative px-4 py-6 lg:px-8 lg:py-10 rounded-[23px] bg-gray shadow-xl border border-gray-600/20 backdrop-blur-sm">
                
                {/* Form Header */}
                <div className="text-center mb-6 lg:mb-8">
                  <h2 className="text-light text-2xl lg:text-3xl tracking-tight font-black mb-2 lg:mb-3 text-balance">
                    Find your Infinite Flight Stats
                  </h2>
                  <div className="w-12 lg:w-16 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full mx-auto"></div>
                </div>
                
                <div className="flex flex-col gap-4 lg:gap-6">
                  {/* Enhanced Input */}
                  <div className="relative group/input">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-400 to-purple-400 rounded-xl blur opacity-0 group-hover/input:opacity-25 transition-all duration-500"></div>
                    <div className="relative text-white">
                      <input 
                        type="text" 
                        name="name" 
                        className="relative bg-gray-700/80 backdrop-blur-sm pl-10 lg:pl-12 pr-4 py-2 lg:py-3 font-medium rounded-xl outline-none w-full border border-gray-600/50 focus:border-blue-400 transition-all duration-300 text-base placeholder:text-gray-400" 
                        placeholder="Enter your IFC Username" 
                        required
                      />
                      <TbSearch className="absolute left-3 lg:left-4 top-[12px] lg:top-[18px] font-bold text-lg lg:text-xl text-gray-400 group-hover/input:text-blue-400 transition-colors duration-300"/>
                    </div>
                  </div>
                  
                  {/* Enhanced Button */}
                  <div className="relative group/button">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl blur opacity-40 group-hover/button:opacity-80 transition-all duration-500"></div>
                    <SearchUserButton className="relative bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 font-bold text-base lg:text-lg py-3 lg:py-4 rounded-xl shadow-lg hover:shadow-blue-500/20 transition-all duration-300 hover:scale-[1.02]" />
                  </div>
                  
                  {/* Login Option */}
                  <div className="animate-slide-in-up delay-400 self-center">
                    <div className="text-center">
                      <span className="text-gray-400 text-lg font-medium">or</span>
                    </div>
                    <div className="mt-4">
                      <Link href="/auth/login" className="group/login relative inline-block">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-gray-500/30 to-gray-600/30 rounded-xl blur opacity-0 group-hover/login:opacity-50 transition-all duration-500"></div>
                        <div className="relative bg-gray/20 backdrop-blur-sm text-white px-8 py-3 rounded-xl border border-gray-600/50 hover:border-gray-400/60 transition-all duration-300 font-semibold hover:scale-105">
                          Create an account now
                        </div>
                      </Link>
                    </div>
                  </div>
                  
                  {/* Enhanced Footer Links */}
                  <div className="space-y-2 lg:space-y-3">
                    <span className="text-gray-300 text-xs lg:text-sm text-center font-medium block hover:text-gray-200 transition-colors duration-300">
                      No account? Join the <a href="https://community.infiniteflight.com/" className="text-blue-400 hover:text-blue-300 transition-colors duration-300">Infinite Flight Community</a> today!
                    </span>
                    
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-gray-300 text-xs lg:text-sm text-center font-medium">Currently on <b className="text-orange-400">Guest Mode</b></span>
                    </div>
                  </div>
                </div>
              </form>
            </div>
            
            {/* Enhanced Copyright */}
            <p className="text-xs lg:text-sm font-medium text-gray-400 animate-fade-in-up delay-600 hover:text-gray-300 transition-colors duration-300 text-center">
              © 2025 IFlytics | Not affiliated with Infinite Flight
            </p>
          </div>
        </div>
      </section>

      {/* Features Section - Beautified */}
      <section className="relative w-full bg-transparent py-32 overflow-hidden max-w-[1000px] mx-auto">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-64 h-64 bg-[#FFD6BA]/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-[#FFD6BA]/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/3 right-1/4 w-48 h-48 bg-[#FFD6BA]/10 rounded-full blur-2xl animate-bounce delay-700"></div>
          <div className="absolute bottom-1/3 left-1/3 w-56 h-56 bg-orange-200/10 rounded-full blur-2xl animate-float"></div>
        </div>

        <div className="container mx-auto px-4 max-w-6xl relative z-10">
          {/* Header Section */}
          <div className="text-center mb-20">
            <div className="inline-block mb-6">
              <h2 className="text-5xl font-black text-gray mb-6 animate-fade-in-up relative">
                Powerful Flight Analytics
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-[#FFD6BA] to-orange-300 rounded-full animate-scale-in delay-500"></div>
              </h2>
            </div>
            <p className="text-gray-500 text-xl font-medium animate-fade-in-up delay-200">
              Everything you need to track and improve your flying
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {/* Feature 1 - Detailed Statistics */}
            <div className="group relative animate-slide-in-up delay-100">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#FFD6BA] to-orange-300 rounded-2xl blur opacity-20 group-hover:opacity-60 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-[#FFD6BA] p-10 rounded-2xl hover:scale-105 transition-all duration-500 shadow-lg hover:shadow-2xl border border-orange-200/50 group-hover:border-orange-300/80">
                {/* Floating Decoration */}
                <div className="absolute top-4 right-4 w-6 h-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full opacity-20 animate-float"></div>
                
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-8 shadow-lg group-hover:scale-110 transition-transform duration-300 group-hover:shadow-blue-500/25">
                  <IoStatsChartSharp className="text-white text-3xl " />
                </div>
                <h3 className="text-gray text-2xl font-bold mb-6 group-hover:text-blue-700 transition-colors duration-300">
                  Detailed Statistics
                </h3>
                <p className="text-gray-500 leading-relaxed">
                  Track your flight time, landings, XP earnings, and performance metrics different all timeframes.
                </p>
              </div>
            </div>

            {/* Feature 2 - Flight History */}
            <div className="group relative animate-slide-in-up delay-200">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#FFD6BA] to-orange-300 rounded-2xl blur opacity-20 group-hover:opacity-60 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-[#FFD6BA] p-10 rounded-2xl hover:scale-105 transition-all duration-500 shadow-lg hover:shadow-2xl border border-orange-200/50 group-hover:border-orange-300/80">
                {/* Floating Decoration */}
                <div className="absolute top-4 right-4 w-6 h-6 bg-gradient-to-r from-green-500 to-green-600 rounded-full opacity-20 animate-float delay-500"></div>
                
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-8 shadow-lg group-hover:scale-110 transition-transform duration-300 group-hover:shadow-green-500/25">
                  <LuHistory className="text-white text-3xl animate-spin-slow" />
                </div>
                <h3 className="text-gray text-2xl font-bold mb-6 group-hover:text-green-700 transition-colors duration-300">
                  Flight History
                </h3>
                <p className="text-gray-500 leading-relaxed">
                  Browse your complete flight history with detailed route information and aircraft usage patterns.
                </p>
              </div>
            </div>

            {/* Feature 3 - Airport Directory */}
            <div className="group relative animate-slide-in-up delay-300">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#FFD6BA] to-orange-300 rounded-2xl blur opacity-20 group-hover:opacity-60 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-[#FFD6BA] p-10 rounded-2xl hover:scale-105 transition-all duration-500 shadow-lg hover:shadow-2xl border border-orange-200/50 group-hover:border-orange-300/80">
                {/* Floating Decoration */}
                <div className="absolute top-4 right-4 w-6 h-6 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full opacity-20 animate-float delay-1000"></div>
                
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-8 shadow-lg group-hover:scale-110 transition-transform duration-300 group-hover:shadow-purple-500/25">
                  <TbSearch className="text-white text-3xl" />
                </div>
                <h3 className="text-gray text-2xl font-bold mb-6 group-hover:text-purple-700 transition-colors duration-300">
                  Airport Directory
                </h3>
                <p className="text-gray-500 leading-relaxed">
                  Search airports worldwide with real-time Expert Server status, frequencies, and runway information.
                </p>
              </div>
            </div>

            {/* Feature 4 - Visual Charts */}
            <div className="group relative animate-slide-in-up delay-400">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#FFD6BA] to-orange-300 rounded-2xl blur opacity-20 group-hover:opacity-60 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-[#FFD6BA] p-10 rounded-2xl hover:scale-105 transition-all duration-500 shadow-lg hover:shadow-2xl border border-orange-200/50 group-hover:border-orange-300/80">
                {/* Floating Decoration */}
                <div className="absolute top-4 right-4 w-6 h-6 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full opacity-20 animate-float delay-300"></div>
                
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mb-8 shadow-lg group-hover:scale-110 transition-transform duration-300 group-hover:shadow-orange-500/25">
                  <LuChartPie className="text-white text-3xl" />
                </div>
                <h3 className="text-gray text-2xl font-bold mb-6 group-hover:text-orange-700 transition-colors duration-300">
                  Visual Charts
                </h3>
                <p className="text-gray-500 leading-relaxed">
                  Beautiful interactive charts showing your flight activity, aircraft usage, and performance trends, as well as route analysis and maps.
                </p>
              </div>
            </div>

            {/* Feature 5 - Live Tracking */}
            <div className="group relative animate-slide-in-up delay-500">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#FFD6BA] to-orange-300 rounded-2xl blur opacity-20 group-hover:opacity-60 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-[#FFD6BA] p-10 rounded-2xl hover:scale-105 transition-all duration-500 shadow-lg hover:shadow-2xl border border-orange-200/50 group-hover:border-orange-300/80">
                {/* Floating Decoration */}
                <div className="absolute top-4 right-4 w-6 h-6 bg-gradient-to-r from-red-500 to-red-600 rounded-full opacity-20 animate-float delay-700"></div>
                
                <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl flex items-center justify-center mb-8 shadow-lg group-hover:scale-110 transition-transform duration-300 group-hover:shadow-red-500/25 relative">
                  <TbLiveView className="text-white text-3xl" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full animate-ping"></div>
                </div>
                <h3 className="text-gray text-2xl font-bold mb-6 group-hover:text-red-700 transition-colors duration-300">
                  Live Tracking
                </h3>
                <p className="text-gray-500 leading-relaxed">
                  Monitor pilots currently flying on Expert Server with real-time position and flight data.
                </p>
              </div>
            </div>

            {/* Feature 6 - Community Features */}
            <div className="group relative animate-slide-in-up delay-600">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#FFD6BA] to-orange-300 rounded-2xl blur opacity-20 group-hover:opacity-60 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-[#FFD6BA] p-10 rounded-2xl hover:scale-105 transition-all duration-500 shadow-lg hover:shadow-2xl border border-orange-200/50 group-hover:border-orange-300/80">
                {/* Floating Decoration */}
                <div className="absolute top-4 right-4 w-6 h-6 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full opacity-20 animate-float delay-200"></div>
                
                <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-8 shadow-lg group-hover:scale-110 transition-transform duration-300 group-hover:shadow-indigo-500/25">
                  <TbUsersGroup className="text-white text-3xl animate-hover-float" />
                </div>
                <h3 className="text-gray text-2xl font-bold mb-6 group-hover:text-indigo-700 transition-colors duration-300">
                  Community Features
                </h3>
                <p className="text-gray-500 leading-relaxed">
                  Connect with other pilots, view their flight stats, and overall have fun!
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Decoration */}
          <div className="mt-20 text-center">
            <div className="inline-flex items-center gap-2 px-8 py-4 bg-[#FFD6BA]/30 backdrop-blur-sm rounded-full border border-orange-200/50 animate-fade-in-up delay-700">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-ping"></span>
              <span className="text-gray-600 font-medium">Real-time data updates</span>
              <span className="w-2 h-2 bg-blue-400 rounded-full animate-ping delay-500"></span>
            </div>
          </div>
        </div>
      </section>

      {/* Flight Arena Section - Compact & Presentable */}
      <section className="relative w-full bg-gradient-to-br from-gray via-dark to-gray py-24 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-10 w-64 h-64 bg-gradient-to-r from-red-400/15 to-purple-400/15 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-gradient-to-r from-purple-400/15 to-red-400/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="container mx-auto px-4 max-w-[1000px] relative z-10">
          {/* Header Section */}
          <div className="text-center mb-16">
            <div className="inline-block mb-6 group">
              <div className="relative p-1 bg-gradient-to-r from-red-400 via-purple-400 to-red-400 rounded-2xl animate-gradient-x">
                <div className="bg-gray px-8 py-3 rounded-xl backdrop-blur-sm">
                  <span className="text-white font-bold text-sm tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-400 rounded-full animate-ping"></span>
                    COMING SOON
                  </span>
                </div>
              </div>
            </div>
            
            <div className="text-5xl font-black text-transparent bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text mb-2 animate-fade-in-up">
              The Flight Arena
            </div>
            <span className="bg-yellow-400 text-gray px-2 py-1 rounded-full text-xs font-bold shadow-lg mb-6">
                Premium
              </span>
            <p className="text-gray-300 text-xl font-medium max-w-2xl mx-auto leading-relaxed animate-fade-in-up delay-200 mt-4">
              Your Infinite Flight Stats Turned Into an <b className="bg-gradient-to-r from-red-400 to-purple-400 bg-clip-text text-transparent">Adventure</b>
            </p>
          </div>

          {/* Features Grid - Compact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 items-stretch">
            
            {/* Card 1 - Monthly Tournaments */}
            <div className="group relative animate-slide-in-up h-full">
              <div className="absolute -inset-1 bg-gradient-to-r from-red-400 to-purple-400 rounded-2xl blur opacity-20 group-hover:opacity-50 transition duration-700"></div>
              <div className="relative bg-dark/90 backdrop-blur-xl p-8 rounded-2xl border border-gray-600/30 group-hover:border-red-400/50 transition-all duration-500 hover:scale-105 h-full flex flex-col">
                <div className="flex items-start gap-4 mb-4 flex-1">
                  <div className="text-4xl"><GrTrophy className="text-orange-400"/></div>
                  <div className="flex-1">
                    <h3 className="text-white text-2xl font-bold mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-red-400 group-hover:to-purple-400 group-hover:bg-clip-text transition-all duration-300">
                      Monthly Tournaments
                    </h3>
                    <p className="text-gray-300 leading-relaxed">
                      Climb up the ranks by earning achievements and badges to earn points! Compete in monthly challenges with leaderboards and exciting prizes.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400 mt-auto">
                  <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></span>
                  Fresh competition every month
                </div>
              </div>
            </div>

            {/* Card 2 - Leaderboards */}
            <div className="group relative animate-slide-in-up h-full">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-2xl blur opacity-20 group-hover:opacity-50 transition duration-700"></div>
              <div className="relative bg-dark/90 backdrop-blur-xl p-8 rounded-2xl border border-gray-600/30 group-hover:border-purple-400/50 transition-all duration-500 hover:scale-105 h-full flex flex-col">
                <div className="flex items-start gap-4 mb-4 flex-1">
                  <div className="text-4xl"><PiArrowFatLineUp className="text-purple-400"/></div>
                  <div className="flex-1">
                    <h3 className="text-white text-2xl font-bold mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-pink-400 group-hover:bg-clip-text transition-all duration-300">
                      User Leveling System
                    </h3>
                    <p className="text-gray-300 leading-relaxed">
                    Level up your profile by achieving more badges and completing challenges! Achieve different profiletitles as you level up!
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400 mt-auto">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  Up to User Level 10
                </div>
              </div>
            </div>

            {/* Card 3 - Achievements */}
            <div className="group relative animate-slide-in-up h-full">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-2xl blur opacity-20 group-hover:opacity-50 transition duration-700"></div>
              <div className="relative bg-dark/90 backdrop-blur-xl p-8 rounded-2xl border border-gray-600/30 group-hover:border-blue-400/50 transition-all duration-500 hover:scale-105 h-full flex flex-col">
                <div className="flex items-start gap-4 mb-4 flex-1">
                  <div className="text-4xl"><SlBadge className="text-blue-400"/></div>
                  <div className="flex-1">
                    <h3 className="text-white text-2xl font-bold mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-cyan-400 group-hover:bg-clip-text transition-all duration-300">
                      Badges Galore
                    </h3>
                    <p className="text-gray-300 leading-relaxed">
                    Different kinds of badges (achievements) you can earn throughout tournaments, ranging from flight time milestones to aircraft usage goals!

                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400 mt-auto">
                  <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
                    100+ unique badges available
                </div>
              </div>
            </div>

            {/* Card 4 - Premium Access */}
            <div className="group relative animate-slide-in-up h-full">
              <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl blur opacity-20 group-hover:opacity-50 transition duration-700"></div>
              <div className="relative bg-dark/90 backdrop-blur-xl p-8 rounded-2xl border border-gray-600/30 group-hover:border-yellow-400/50 transition-all duration-500 hover:scale-105 h-full flex flex-col">
                <div className="flex items-start gap-4 mb-4 flex-1">
                  <div className="text-4xl"><TbBrandFunimation className="text-yellow-400"/></div>
                  <div className="flex-1">
                    <h3 className="text-white text-2xl font-bold mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-yellow-400 group-hover:to-orange-400 group-hover:bg-clip-text transition-all duration-300">
                      Enjoy the Experience
                    </h3>
                    <p className="text-gray-300 leading-relaxed">
                      Enjoy the experience of flying with fellow community members, and see how you stack up against them!
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400 mt-auto">
                  <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
                      Have fun with fellow community members!
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section - Compact */}
          <div className="text-center">
            <div className="relative group inline-block">
              <div className="absolute -inset-1 bg-gradient-to-r from-red-400 to-purple-400 rounded-2xl blur opacity-50 group-hover:opacity-100 transition duration-700"></div>
              <div className="relative bg-gradient-to-r from-red-500 to-purple-500 p-8 rounded-2xl cursor-pointer group-hover:scale-105 transition-transform duration-300">
                <h3 className="text-white text-3xl font-black mb-3">Work In Progress</h3>
                <p className="text-gray-100 font-medium mb-4">Expected to be ready by 2026</p>
                
                {/* Quick Stats
                <div className="flex justify-center gap-8 text-sm">
                  <div className="text-center">
                    <div className="text-xl font-bold text-white">Q2 2025</div>
                    <div className="text-gray-200">Launch</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-white">1000+</div>
                    <div className="text-gray-200">Pilots Ready</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-white">$50K+</div>
                    <div className="text-gray-200">Prize Pool</div>
                  </div>
                </div> */}

                <div className="absolute top-2 right-2 w-3 h-3 bg-white rounded-full animate-ping"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
      

      {/* Stats Section - Beautified & Compact */}
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
              { number: "10K+", label: "Flights Tracked", gradient: "from-blue-400 to-blue-600", icon: <TbPlaneInflight className="text-blue-400"/>, delay: "delay-100" },
              { number: "100+", label: "Active Pilots", gradient: "from-green-400 to-green-600", icon: <RiCopilotFill className="text-green-400"/>, delay: "delay-200" },
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
            <div className="absolute -inset-1 bg-gradient-to-r from-gray-400 via-dark to-gray-400 rounded-3xl blur opacity-20 group-hover:opacity-40 transition-all duration-1000 animate-gradient-x bg-[length:200%_auto]"></div>
            
            <div className="relative bg-gradient-to-br from-gray via-dark to-gray px-4 sm:px-8 py-16 rounded-3xl shadow-2xl border border-gray-600/30 backdrop-blur-sm">
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
