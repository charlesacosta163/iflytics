import Image from "next/image";
import { TbSearch } from "react-icons/tb";
import { redirect } from "next/navigation";
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
import TestimonialCarousel from "@/components/testimonial-carousel";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { faqData } from "@/lib/data";
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
      For Infinite Flight
    </p>
  </div>
</div>

            </header>

            {/* Enhanced Feature Points - Desktop Only */}
            
          </div>

          {/* Dual CTA Section */}
          <div className="flex-1 flex flex-col gap-4 items-center animate-slide-in-right delay-300 w-full relative">
            <Badge className="bg-gradient-to-r from-[#ff879b] to-[#ffc49c] dark:from-[#1e90ff] dark:to-[#99badd] text-light font-bold tracking-tight self-center">
              Stay Tuned For Future Discounts!
            </Badge>

            <div className="grid grid-cols-1 gap-4 w-full max-w-[400px]">

              {/* Guest — Look up a pilot */}
              <div className="flex flex-col gap-4 bg-[#ffe3d0] dark:bg-dark rounded-[24px] p-5 border-2 border-gray-200 dark:border-gray-700 shadow-lg">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-orange-500 dark:text-orange-400 mb-0.5">No account needed</p>
                  <h2 className="text-orange-900 dark:text-gray-100 text-lg font-black tracking-tight leading-tight">
                    Look up an Infinite Flight User
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">Search any IFC username to view their stats.</p>
                </div>

                <form action={async (formData: FormData) => {
                  'use server'
                  redirect(`/user/${formData.get("name") as string}`)
                }} className="flex flex-col gap-2">
                  <div className="relative">
                    <input
                      type="text"
                      name="name"
                      className="bg-white dark:bg-gray-900 pl-8 pr-3 py-2 rounded-lg outline-none w-full text-sm placeholder:text-gray-400 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 focus:border-blue-400 transition-colors font-medium"
                      placeholder="IFC Username"
                      required
                    />
                    <TbSearch className="absolute left-2.5 top-[9px] text-sm text-gray-400" />
                  </div>
                  <SearchUserButton className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 font-bold text-sm py-2 rounded-lg transition-all duration-200 hover:scale-[1.02]" />
                </form>

                <Link href="/map/dark" className="flex items-center justify-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-blue-500 transition-colors font-medium">
                  <TbMapPin className="text-sm" /> Explore live map
                </Link>
              </div>

              {/* Member — Create account */}
              <div className="flex flex-col gap-4 bg-gradient-to-br from-blue-600 to-purple-700 rounded-[24px] p-5 shadow-lg text-white">
                <div>
                  <h2 className="text-white text-lg font-black tracking-tight leading-tight">
                    Track Your Flights
                  </h2>
                  <p className="text-white/65 text-xs mt-1">Create an account to unlock your personal dashboard.</p>
                </div>

                <ul className="flex flex-col gap-1.5 text-xs text-white/80">
                  {[
                    "Personal analytics dashboard",
                    "Route & aircraft analysis (Premium Feature)",
                    "Flight history & charts",
                    "IFlytics Arcade 🕹️",
                  ].map(f => (
                    <li key={f} className="flex items-center gap-1.5">
                      <FaStar className="text-yellow-300 text-[9px] flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                <div className="flex flex-col gap-2 mt-auto">
                  <Link
                    href="/auth/login"
                    className="bg-white text-blue-700 hover:bg-blue-50 font-black text-sm py-2 rounded-xl text-center transition-all duration-200 hover:scale-[1.02] flex items-center justify-center gap-1.5"
                  >
                    <MdOutlineAccountCircle className="text-base" /> Create Free Account
                  </Link>
                  <Link href="/auth/login" className="text-white/50 text-xs text-center hover:text-white/80 transition-colors">
                    Already have an account? Sign in →
                  </Link>
                </div>
              </div>

            </div>

            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 text-center">
              No IFC account yet?{' '}
              <a href="https://community.infiniteflight.com/" target="_blank" className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
                Join the Infinite Flight Community
              </a>
            </p>

            <p className="text-xs font-medium text-gray-400 dark:text-gray-500 text-center">
              © 2025 IFlytics · Not affiliated with Infinite Flight
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-24 max-w-[1000px] mx-auto px-4">
        <div className="text-center mb-14">
          <h2 className="text-3xl lg:text-5xl font-black text-gray-900 dark:text-gray-100 mb-3">
            Powerful Flight Analytics
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-base font-medium">
            Everything you need to track and improve your flying
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: <IoStatsChartSharp className="text-blue-500 text-2xl" />, title: "Detailed Statistics", desc: "Total flights, landings, flight time, XP, nautical miles, and unique routes across multiple timeframes." },
            { icon: <LuHistory className="text-green-500 text-2xl" />, title: "Flight History", desc: "Full flight logs with departure/arrival airports, aircraft types, durations, and route tracking." },
            { icon: <TbSearch className="text-purple-500 text-2xl" />, title: "Airport Directory", desc: "Search airports worldwide with real-time Expert Server status, frequencies, and runway info." },
            { icon: <LuChartPie className="text-orange-500 text-2xl" />, title: "Visual Charts", desc: "Interactive pie charts, area charts for flight trends, and comprehensive performance analytics." },
            { icon: <TbLiveView className="text-red-500 text-2xl" />, title: "Live Tracking", desc: "Real-time IF map tracking with live aircraft positions, flight routes, and active ATC frequencies.", live: true },
            { icon: <TbUsersGroup className="text-indigo-500 text-2xl" />, title: "Community", desc: "Discover fellow pilots, explore profiles, compare stats, and connect with aviation enthusiasts." },
          ].map((f, i) => (
            <div key={i} className="group p-6 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/40 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 hover:shadow-md">
              <div className="flex items-center gap-2 mb-3">
                {f.icon}
                {f.live && <span className="w-2 h-2 bg-red-500 rounded-full animate-ping inline-block" />}
              </div>
              <h3 className="text-gray-900 dark:text-gray-100 font-bold text-base mb-2">{f.title}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Live Map Section */}
      <section className="relative w-full py-24 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: 'url(/themap.png)' }}>
          <div className="absolute inset-0 bg-black/65" />
        </div>

        <div className="container mx-auto px-4 max-w-[1000px] relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-5xl font-black text-white mb-3">Infinite Flight Live Map</h2>
            <p className="text-gray-300 text-base font-medium max-w-xl mx-auto">
              Track live flights in real-time with aircraft positions, routes, and pilot information.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
            {[
              { icon: <TbLiveView className="text-cyan-400 text-xl" />, title: "Live Flight Tracking", desc: "Watch pilots fly in real-time with live aircraft positions and flight paths.", live: true },
              { icon: <TbSearch className="text-pink-400 text-xl" />, title: "Smart Pilot Search", desc: "Find specific pilots, aircraft types, or callsigns with search and filtering." },
              { icon: <RiCopilotFill className="text-emerald-400 text-xl" />, title: "Active ATC Centers", desc: "View all active ATC positions with frequencies and coverage areas." },
              { icon: <TbPlaneInflight className="text-orange-400 text-xl" />, title: "Interactive Routes", desc: "Click any aircraft to see their complete flight path with departure and arrival airports." },
              { icon: <LiaGlobeAmericasSolid className="text-purple-400 text-xl" />, title: "Multiple Themes", desc: "Choose from dark or light map themes to suit your preference." },
              { icon: <TbUsersGroup className="text-amber-400 text-xl" />, title: "Pilot Information", desc: "Get detailed pilot stats, flight progress, and aircraft info with interactive popups." },
            ].map((f, i) => (
              <div key={i} className="p-5 rounded-xl bg-white/10 border border-white/15 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2">
                  {f.icon}
                  {f.live && <span className="w-2 h-2 bg-green-400 rounded-full animate-ping inline-block" />}
                </div>
                <h3 className="text-white font-bold text-sm mb-1">{f.title}</h3>
                <p className="text-gray-300 text-xs leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link href="/map/dark" className="inline-flex items-center gap-2 bg-white text-gray-900 hover:bg-gray-100 px-6 py-3 rounded-full font-bold text-sm transition-all duration-200 hover:scale-105">
              <LiaGlobeAmericasSolid className="text-lg" />
              Explore Live Map
              <span className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
            </Link>
            <p className="text-gray-400 text-xs mt-3">Updated every 30 seconds</p>
          </div>
        </div>
      </section>

      {/* IFlytics Arcade Section */}
      <section className="relative w-full py-24 overflow-hidden">
        <div className="absolute inset-0" style={{ backgroundImage: 'url(/starfall-gif.gif)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div className="absolute inset-0 bg-black/60" />

        <div className="container mx-auto px-4 max-w-[1000px] relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="text-white flex-1">
              <div className="flex items-center gap-2 mb-3">
                <Badge className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white border-none font-bold text-xs">NEW in v1.7.0</Badge>
              </div>
              <h2 className="text-3xl lg:text-5xl font-black mb-4 tracking-tight">IFlytics Arcade 🕹️</h2>
              <p className="text-white/70 text-base leading-relaxed max-w-lg mb-6">
                Take a break between flights. A collection of mini-games built around the IFlytics community — real pilots as sprites, role-based scoring, and local high scores.
              </p>
              <div className="grid grid-cols-2 gap-3 text-sm text-white/80 mb-8">
                {["🐍 Snake", "🛫 Flappy User", "🃏 Memory Match", "🧱 Brick Breaker", "🔨 Whack-a-Mole", "🗼 ATC Madness"].map(g => (
                  <span key={g} className="flex items-center gap-1 font-medium">{g}</span>
                ))}
              </div>
              <Link href="/auth/login" className="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-black font-black px-6 py-3 rounded-full text-sm transition-all duration-200 hover:scale-105">
                Sign in to Play →
              </Link>
            </div>

            <div className="flex-shrink-0 grid grid-cols-2 gap-3 w-full max-w-[280px]">
              {[
                { emoji: '🐍', name: 'Snake', img: '/images/games/snakegame.png' },
                { emoji: '🛫', name: 'Flappy', img: '/images/games/flappygame.png' },
                { emoji: '🗼', name: 'ATC', img: '/images/games/atcgame.png' },
                { emoji: '🧱', name: 'Breaker', img: '/images/games/brickgame.png' },
              ].map(g => (
                <div key={g.name} className="relative rounded-xl overflow-hidden aspect-square border border-white/20">
                  <img src={g.img} alt={g.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/30" />
                  <span className="absolute bottom-1.5 left-2 text-white text-[11px] font-bold drop-shadow">{g.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="w-full bg-dark py-20">
        <div className="container mx-auto px-4 max-w-[1000px]">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-black text-white mb-2">Trusted by Infinite Flight Pilots</h2>
            <p className="text-gray-400 text-base font-medium">Join hundreds of pilots already using IFlytics</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { number: "250K+", label: "Flights Tracked", icon: <TbPlaneInflight className="text-blue-400 text-2xl" /> },
              { number: "460+", label: "Registered Users", icon: <RiCopilotFill className="text-green-400 text-2xl" /> },
              { number: "24/7", label: "Live Updates", icon: <LuCalendarClock className="text-orange-400 text-2xl" /> },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center justify-center p-8 rounded-2xl border border-gray-700/50 bg-gray-800/30 text-center gap-2">
                {stat.icon}
                <div className="text-4xl font-black text-white">{stat.number}</div>
                <p className="text-gray-400 font-medium text-sm">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 flex items-center justify-center gap-2 text-gray-400 text-sm">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-ping" />
            Real-time analytics updated every minute
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="w-full bg-dark py-20">
        <div className="container mx-auto px-4 max-w-[1200px]">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-black text-white mb-2">What Pilots Are Saying</h2>
            <p className="text-gray-400 text-base font-medium">Real feedback from the Infinite Flight community</p>
          </div>
          <TestimonialCarousel />
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="w-full bg-[#FAF0E6] dark:bg-gray-900 py-24">
        <div className="container mx-auto px-4 max-w-[1000px]">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-5xl font-black text-gray-900 dark:text-white mb-3">Choose Your Plan</h2>
            <p className="text-gray-500 dark:text-gray-400 text-base font-medium">Unlock powerful features to enhance your flight tracking</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Free */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-7 flex flex-col">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Free</h3>
                <div className="text-4xl font-black text-gray-900 dark:text-white">$0</div>
                <p className="text-gray-500 text-sm mt-1">Forever</p>
              </div>
              <ul className="flex-1 space-y-3 mb-6 text-sm text-gray-600 dark:text-gray-300">
                {["Basic flight tracking & statistics", "Flight history (1, 7, 30 days)", "Core dashboard metrics", "Infinite Flight live map", "IFlytics Discord access", "IFlytics Arcade access"].map(f => (
                  <li key={f} className="flex items-start gap-2"><FaCheck className="text-green-500 mt-0.5 flex-shrink-0 text-xs" />{f}</li>
                ))}
              </ul>
              <button className="w-full py-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold text-sm italic">Forever Free</button>
            </div>

            {/* Premium */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-amber-300 dark:border-amber-600 p-7 flex flex-col relative">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-yellow-600 dark:text-yellow-400 mb-1">Premium</h3>
                <div className="text-4xl font-black text-yellow-600 dark:text-yellow-400">$1.99</div>
                <p className="text-gray-500 text-sm mt-1">per month</p>
              </div>
              <ul className="flex-1 space-y-3 mb-6 text-sm text-gray-600 dark:text-gray-300">
                {[
                  "Route Analysis — maps, distances, categorization",
                  "Aircraft Analysis — fleet stats & usage",
                  "Flight-Frame Analysis — last 10 to 500+ flights",
                  "Extended flight history",
                  "Advanced charts & analytics",
                  "Priority support",
                ].map(f => (
                  <li key={f} className="flex items-start gap-2"><FaCheck className="text-green-500 mt-0.5 flex-shrink-0 text-xs" />{f}</li>
                ))}
              </ul>
              <Link href="/dashboard/profile" className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold text-sm text-center hover:from-blue-600 hover:to-purple-600 transition-all">
                Subscribe via Profile → Billing
              </Link>
            </div>

            {/* Lifetime */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-purple-300 dark:border-purple-600 p-7 flex flex-col">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-purple-600 dark:text-purple-400 mb-1">Lifetime</h3>
                <div className="text-4xl font-black text-purple-600 dark:text-purple-400">$49.99</div>
                <p className="text-gray-500 text-sm mt-1">One-time payment</p>
              </div>
              <ul className="flex-1 space-y-3 mb-6 text-sm text-gray-600 dark:text-gray-300">
                {[
                  "Everything in Premium",
                  "Export flight data as CSV",
                  "FlightRadar24 import compatibility",
                  "No recurring charges",
                ].map(f => (
                  <li key={f} className="flex items-start gap-2"><FaCheck className="text-purple-500 mt-0.5 flex-shrink-0 text-xs" />{f}</li>
                ))}
              </ul>
              <Link href="/dashboard/profile" className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold text-sm text-center hover:from-blue-600 hover:to-purple-600 transition-all">
                Subscribe via Profile → Billing
              </Link>
            </div>
          </div>

          <p className="text-center text-gray-400 dark:text-gray-500 text-xs mt-8">
            All plans include access to your full flight history and the Infinite Flight live map.
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="w-full bg-dark py-20">
        <div className="container mx-auto px-4 max-w-[720px]">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-black text-white mb-2">
              Frequently Asked <span className="text-blue-400">Questions</span>
            </h2>
          </div>
          <Accordion type="single" collapsible className="space-y-3">
            {faqData.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="bg-gray-800/60 rounded-xl px-5 border-none shadow-none">
                <AccordionTrigger className="text-white hover:text-blue-400 text-left text-sm font-bold tracking-tight">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-400 text-sm pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full bg-dark py-20">
        <div className="container mx-auto px-4 max-w-[600px] text-center">
          <h2 className="text-3xl lg:text-4xl font-black text-white mb-3">Ready to Visualize?</h2>
          <p className="text-gray-400 text-base mb-8">Start tracking your Infinite Flight journey today.</p>

          <form action={async (formData: FormData) => {
            'use server'
            redirect(`/user/${formData.get("name") as string}`)
          }} className="flex gap-3 max-w-sm mx-auto mb-6">
            <input
              type="text"
              name="name"
              className="flex-1 bg-gray-800 text-white px-4 py-2.5 rounded-xl outline-none border border-gray-700 focus:border-blue-500 transition-colors text-sm placeholder:text-gray-500 font-medium"
              placeholder="Your IFC Username"
              required
            />
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-colors">
              Go!
            </button>
          </form>

          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="text-gray-500 text-sm">or</span>
          </div>

          <Link href="/auth/login" className="inline-block bg-gray-700 hover:bg-gray-600 text-white px-8 py-2.5 rounded-xl font-bold text-sm transition-colors">
            Create Account
          </Link>

          <div className="mt-8 flex items-center justify-center gap-6 text-gray-500 text-xs flex-wrap">
            <span className="flex items-center gap-1.5"><FaCheck className="text-green-500 text-[10px]" /> Free to use</span>
            <span className="flex items-center gap-1.5"><FaCheck className="text-green-500 text-[10px]" /> No account required</span>
            <span className="flex items-center gap-1.5"><FaCheck className="text-green-500 text-[10px]" /> Instant results</span>
          </div>
        </div>
      </section>
    </div>
  );
}
