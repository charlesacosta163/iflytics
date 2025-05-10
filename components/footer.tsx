import React from 'react'
import { FaGithub } from "react-icons/fa";
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className='text-xs text-gray-500 p-4 flex items-center justify-between sm:justify-start gap-2'>
        &copy; 2025 - Created by Charles Acosta
        <Link href="https://github.com/charlesacosta163" target="_blank" rel="noopener noreferrer">
            <FaGithub className="text-lg" />
        </Link>
    </footer>
  )
}

export default Footer