'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    useSidebar
  } from "@/components/ui/sidebar"
import { cn } from '@/lib/utils'
import { FaHome, FaUser, FaGlobeAsia, FaToolbox, FaInstagram } from 'react-icons/fa'
import { TiPlaneOutline } from 'react-icons/ti'
import { GoCopilot } from 'react-icons/go'
import { MdOutlineLeaderboard } from 'react-icons/md'
import { SiGamebanana } from 'react-icons/si'
import { TbBrandAppleArcade } from 'react-icons/tb'
import { BsIncognito } from 'react-icons/bs'
import { HiOutlineExternalLink } from 'react-icons/hi'
import { Badge } from '@/components/ui/badge'
import { LogoutButton } from '@/components/logout-button'
import { PremiumUpsellSidebar } from '@/components/dashboard-ui/premium-upsell-sidebar'
import iflyticsLogo from '@/public/iflyticslight.svg'
import { getAppVersion, getRandomCaption } from '@/lib/foo.js'

const AppSidebar = () => {
  const pathname = usePathname()
  const [randomCaption, setRandomCaption] = useState("")
  const { open, isMobile } = useSidebar()

  useEffect(() => {
    setRandomCaption(getRandomCaption())
  }, [])

  // Main navigation items
  const navItems = [
    { 
      href: '/dashboard', 
      icon: FaHome, 
      label: 'Dashboard',
      activeColors: 'bg-yellow-50 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-400'
    },
    { 
      href: '/dashboard/flights?timeframe=day-30', 
      icon: TiPlaneOutline, 
      label: 'Flights',
      activeColors: 'bg-green-50 dark:bg-green-500/20 text-green-600 dark:text-green-400'
    },
    { 
      href: '/dashboard/profile', 
      icon: FaUser, 
      label: 'Profile',
      activeColors: 'bg-pink-50 dark:bg-pink-500/20 text-pink-600 dark:text-pink-400'
    },
    { 
      href: '/dashboard/users', 
      icon: GoCopilot, 
      label: 'Community',
      activeColors: 'bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400'
    },
    { 
      href: '/dashboard/leaderboard', 
      icon: MdOutlineLeaderboard, 
      label: 'Leaderboard',
      activeColors: 'bg-purple-50 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400'
    },
    { 
      href: '/dashboard/games', 
      icon: SiGamebanana, 
      label: 'Arcade',
      activeColors: 'bg-orange-50 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400',
      badge: 'NEW'
    },
  ]

  const externalLinks = [
    {
      href: 'https://infinitetoolbox.vercel.app/',
      icon: FaToolbox,
      label: 'InfiniteToolbox',
      textColorLight: 'text-[#f0c474]',
      textColorDark: 'dark:text-[#ffd6ba]'
    },
    {
      href: '/map/earth',
      icon: FaGlobeAsia,
      label: 'Flight Tracker',
      textColorLight: 'text-blue-700',
      textColorDark: 'dark:text-blue-400'
    },
    {
      href: '/',
      icon: BsIncognito,
      label: 'Guest Mode',
      textColorLight: 'text-orange-700',
      textColorDark: 'dark:text-orange-400'
    }, 
    {
      href: 'https://www.instagram.com/iflyticsapp',
      icon: FaInstagram,
      label: 'Instagram',
      textColorLight: 'text-white bg-pink-500',
      textColorDark: 'dark:text-pink-400'
    }
  ]

  return (
    <Sidebar collapsible="icon" className='border-none shadow-r-lg'>
      {/* Header */}
      <SidebarHeader className={cn(
        "px-4 py-4 transition-all",
        open ? "px-6" : "px-2"
      )}>
        {open ? (
          <div className="relative">
            <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#ff6982] to-[#ffd2b3] dark:from-[#fdc673] dark:to-[#fffdec] dark:text-black text-white text-[10px]">
              {getAppVersion()}
            </Badge>
            
            <Link
              href="/dashboard"
              className="text-xl font-bold tracking-tight flex gap-3 items-center group hover:scale-105 transition-transform duration-200 mt-4"
            >
              <div className="p-2 bg-gradient-to-r from-[#ff6982] to-[#ffd2b3] dark:from-[#ffbd59] dark:to-[#fff8b9] dark:text-black text-white rounded-xl shadow-lg">
                <Image src={iflyticsLogo} alt="Iflytics Logo" width={24} height={24} />
              </div>
              <div className="flex flex-col">
                <span className="bg-gradient-to-r from-[#ff6982] to-[#ffd2b3] dark:from-[#fdc673] dark:to-[#fffdec] bg-clip-text text-transparent">
                  IFlytics
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                  {randomCaption}
                </span>
              </div>
            </Link>
          </div>
        ) : (
          <Link href="/dashboard" className="flex items-center justify-center">
            <div className="p-2 bg-gradient-to-r from-[#ff6982] to-[#ffd2b3] dark:from-[#ffbd59] dark:to-[#fff8b9] rounded-xl">
              <Image src={iflyticsLogo} alt="Iflytics Logo" width={20} height={20} />
            </div>
          </Link>
        )}
      </SidebarHeader>

      {/* Main Content */}
      <SidebarContent className={cn("px-2 bg-[#FFEFD5] rounded-t-[25px] dark:bg-gray-900", open && "px-4")}>
        {/* Primary Navigation */}
        <SidebarGroup>
          <SidebarGroupContent className={cn(
            "flex flex-col gap-2",
            !open && "items-center"
          )}>
            {navItems.map((item) => {
              const Icon = item.icon
              // Dashboard should only match exactly, other pages can use startsWith
              const isActive = item.href === '/dashboard' 
                ? pathname === '/dashboard'
                : pathname === item.href || pathname.startsWith(item.href.split('?')[0])
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative flex items-center gap-3 rounded-full px-3 py-2.5 transition-all duration-200",
                    "text-gray-700 dark:text-gray-300 font-medium text-sm",
                    "hover:bg-gray-100 dark:hover:bg-gray-800",
                    isActive && `${item.activeColors} font-semibold shadow-sm`,
                    !open && "justify-center w-10 h-10 p-0"
                  )}
                  title={!open ? item.label : undefined}
                >
                  <Icon className={cn("w-5 h-5 shrink-0", !open && "w-5 h-5")} />
                  {open && <span>{item.label}</span>}
                  {open && item.badge && (
                    <Badge className="ml-auto bg-gradient-to-r from-orange-500 to-yellow-500 text-white text-[10px] px-1.5">
                      {item.badge}
                    </Badge>
                  )}
                  {!open && item.badge && (
                    <Badge className="absolute -top-1 -right-1 bg-gradient-to-r from-orange-500 to-yellow-500 text-white text-[8px] px-1 py-0">
                      !
                    </Badge>
                  )}
                </Link>
              )
            })}
          </SidebarGroupContent>
        </SidebarGroup>

        {/* External Links - Only show when expanded */}
        {open && (
          <SidebarGroup className="mt-auto">
            <SidebarGroupContent className="space-y-2">
              {externalLinks.map((link) => {
                const Icon = link.icon
                return (
                    <Link
                      href={link.href}
                      className={cn(
                        "flex items-center gap-3 rounded-full px-4 py-3 transition-all duration-200",
                        "bg-white dark:bg-gray-800 font-semibold text-sm",
                        "hover:scale-[1.02] hover:shadow-md",
                        link.textColorLight,
                        link.textColorDark
                      )}
                    >
                      <Icon className="w-5 h-5 shrink-0" />
                      <span>{link.label}</span>
                      <HiOutlineExternalLink className="ml-auto w-4 h-4" />
                    </Link>
                )
              })}
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Collapsed external links - icon only */}
        {!open && (
          <SidebarGroup className="mt-auto">
            <SidebarGroupContent className="flex flex-col gap-2 items-center">
              {externalLinks.map((link) => {
                const Icon = link.icon
                return (
                    <Link
                      href={link.href}
                      className={cn(
                        "flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 hover:scale-110",
                        "",
                        link.textColorLight,
                        link.textColorDark
                      )}
                      title={link.label}
                    >
                      <Icon className="w-5 h-5" />
                    </Link>
                )
              })}
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className={cn("p-2 bg-[#FFEFD5] dark:bg-gray-900 flex flex-col gap-2", open && "p-4")}>
        <PremiumUpsellSidebar expanded={open} />
        {open ? (
          <LogoutButton className="w-full font-medium hover:text-red-600 dark:hover:text-red-400 cursor-pointer transition-all duration-200 rounded-full px-3 py-2.5 text-sm" />
        ) : (
          <button 
            className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-all"
            title="Logout"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        )}
      </SidebarFooter>
    </Sidebar>
  )
}

export default AppSidebar