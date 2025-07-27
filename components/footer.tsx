import React from 'react'
import { FaGithub } from "react-icons/fa";
import Link from 'next/link';
import { InlineThemeSwitcher } from './inline-theme-switcher';

const Footer = () => {
  return (
    <footer className='text-xs text-gray-500 dark:text-gray-400 p-4 flex items-center justify-between w-full'>
      <div className="flex items-center gap-2">
        &copy; 2025 - Charles Acosta
        <Link href="https://github.com/charlesacosta163" target="_blank" rel="noopener noreferrer">
          <FaGithub className="text-lg hover:text-gray-700 dark:hover:text-gray-300 transition-colors" />
        </Link>
      </div>
      
      <InlineThemeSwitcher />
    </footer>
  )
}

export default Footer