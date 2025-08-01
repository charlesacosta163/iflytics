'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { FaBook, FaSearch, FaSignInAlt } from 'react-icons/fa'
import { Menu, X } from "lucide-react";

interface MobileNavProps {
  isLoggedIn: boolean;
  isLoading: boolean;
  onAuthClick: () => void;
}

const MobileNav = ({ isLoggedIn, isLoading, onAuthClick }: MobileNavProps) => {
  const [isOpen, setIsOpen] = useState(false)

  const toggleMenu = () => setIsOpen(!isOpen)

  const closeMenu = () => setIsOpen(false)

  return (
    <div className="relative">
      {/* Hamburger Button */}
      <button
        onClick={toggleMenu}
        className="md:hidden p-2 rounded-lg dark:text-light text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-105 active:scale-95 !z-[10000]"
        aria-label="Toggle menu"
      >
        <div className="relative w-6 h-6">
          <Menu
            className={`absolute inset-0 transition-all duration-300 ${
              isOpen ? 'opacity-0 rotate-180 scale-50' : 'opacity-100 rotate-0 scale-100'
            }`}
          />
          <X
            className={`absolute inset-0 transition-all duration-300 ${
              isOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-180 scale-50'
            }`}
          />
        </div>
      </button>

      {/* Mobile Dropdown Menu */}
      <div
        className={`md:hidden absolute top-12 right-0 w-64 dark:bg-gray bg-[#FAF0E6] rounded-lg shadow-2xl transition-all duration-300 ease-out transform origin-top-right !z-[9999] ${
          isOpen
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
        }`}
      >
        {/* Dropdown Arrow */}
        <div className="absolute -top-2 right-4 w-4 h-4 transform rotate-45"></div>
        
        {/* Navigation Header */}
        <div className="p-4">
          <h3 className="font-bold tracking-tight dark:text-gray-200 text-gray-600 text-lg">
            Where we going?
          </h3>
        </div>

        {/* Menu Content */}
        <div className="px-4 pb-4">

          {/* Navigation Links */}
          <nav className="space-y-2">
            <Link
              href="/directory"
              className="group flex items-center gap-3 p-3 rounded-lg hover:bg-light transition-all duration-200 hover:translate-x-1"
              onClick={closeMenu}
            >
              <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-gray-200 transition-colors duration-200">
                <FaBook className="w-4 h-4 text-gray-600" />
              </div>
              <span className="font-medium dark:text-gray-200 text-gray-700 group-hover:text-gray-700 dark:group-hover:text-gray-700">Directory</span>
            </Link>

            <Link
              href="/"
              className="group flex items-center gap-3 p-3 rounded-lg hover:bg-light transition-all duration-200 hover:translate-x-1"
              onClick={closeMenu}
            >
              <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-gray-200 transition-colors duration-200">
                <FaSearch className="w-4 h-4 text-gray-600" />
              </div>
              <span className="font-medium dark:text-gray-200 text-gray-700 group-hover:text-gray-700 dark:group-hover:text-gray-700">Search</span>
            </Link>

            {/* Divider */}
            <div className="my-3 border-t border-gray-300"></div>

            {/* Auth Button */}
            {!isLoading ? (
              <button
                onClick={() => {
                  onAuthClick()
                  closeMenu()
                }}
                className="group w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-100 dark:hover:bg-light transition-all duration-200 hover:translate-x-1 border-2 border-gray-600 dark:border-gray-200 rounded-full"
              >
                <div className="p-2 bg-gray-100 rounded-lg transition-colors duration-200">
                  <FaSignInAlt className="w-4 h-4 text-gray" />
                </div>
                <span className="font-semibold dark:text-gray-200 text-gray">
                  {isLoggedIn ? 'Dashboard' : 'Login'}
                </span>
              </button>
            ) : (
              <div className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 opacity-75">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <FaSignInAlt className="w-4 h-4 text-gray-400" />
                </div>
                <span className="font-medium text-gray-400">Loading...</span>
              </div>
            )}
          </nav>
        </div>
      </div>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-opacity-25 z-[9998]"
          onClick={closeMenu}
        />
      )}
    </div>
  )
}

export default MobileNav