import React from 'react'
import { FaDiscord, FaGithub } from "react-icons/fa";
import Link from 'next/link';
import { InlineThemeSwitcher } from './inline-theme-switcher';

const Footer = () => {
  return (
    <footer className='text-xs text-gray-500 dark:text-gray-400 p-4 flex items-center justify-between w-full'>
      <div className="flex items-center gap-2">
        &copy; 2025 - Charles Acosta
        {/* <Link href="" target="_blank" rel="noopener noreferrer">
          <FaGithub className="text-lg hover:text-gray-700 dark:hover:text-gray-300 transition-colors" />
        </Link> */}
        <Link href="https://discord.gg/xyAxzqPv" target="_blank" rel="noopener noreferrer">
          <FaDiscord className="text-lg hover:text-gray-700 dark:hover:text-gray-300 transition-colors" />
        </Link>
        <span>|</span>
        <Link href="/legal/terms" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">Terms <span className="text-xs hidden md:inline">of Service</span></Link>
        <span>|</span>
        <Link href="/legal/privacy" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">Privacy <span className="text-xs hidden md:inline">Policy</span></Link>

      </div>
      
      {/* <InlineThemeSwitcher /> */}
    </footer>
  )
}

export default Footer