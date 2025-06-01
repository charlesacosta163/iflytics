'use client'

import React, { useState } from 'react'
import Pathname from './pathname'
import { LogoutButton } from '@/components/logout-button'
import { Menu, X } from 'lucide-react'

import { TiPlaneOutline } from "react-icons/ti";
import { FaUser } from "react-icons/fa";
import { FaHome } from "react-icons/fa";
import { TbDeviceGamepad2 } from "react-icons/tb";

import Link from 'next/link'
const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <div className="flex justify-between items-center p-4 sticky top-0 bg-[#FAF0E6] z-50">
      <div className="flex items-center gap-2">
        <button 
          className="lg:hidden p-1 rounded-md hover:bg-gray-700 hover:text-white text-gray-700"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <Pathname />
      </div>
      
      <LogoutButton />
      
      {/* Mobile menu that appears below navbar */}
      {isMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-dark text-white p-4 z-50 shadow-lg rounded-lg">
          <nav className="flex flex-col gap-3 [&>a]:font-semibold">

            <Link href="/dashboard" className="flex items-center gap-2 hover:bg-gray-700 rounded-lg px-4">
              <FaHome className="w-4 h-4"/>
              <span className="flex items-center gap-2 py-2 px-3 hover:bg-gray-700 rounded-lg">Dashboard</span>
            </Link>
            <Link href="/dashboard/flights" className="flex items-center gap-2 hover:bg-gray-700 rounded-lg px-4">
              <TiPlaneOutline className="w-4 h-4"/>
              <span className="flex items-center gap-2 py-2 px-3 hover:bg-gray-700 rounded-lg">Flights</span>
            </Link>
            <Link href="/dashboard/profile" className="flex items-center gap-2 hover:bg-gray-700 rounded-lg px-4">
              <FaUser className="w-4 h-4"/>
              <span className="flex items-center gap-2 py-2 px-3 hover:bg-gray-700 rounded-lg">Profile</span>
            </Link>
            <Link href="/dashboard" className="p-0.5 bg-gradient-to-br from-red-400 to-purple-400 rounded-lg">
                <span className="flex gap-4 text-gray-200 text-lg font-medium items-center hover:bg-gray-700 rounded-md px-3 py-1 bg-dark">
                  <TbDeviceGamepad2 />
                  The Flight Cave
                </span>
            </Link>
          </nav>
        </div>
      )}
    </div>
  )
}

export default Navbar