import React from 'react'
import Link from 'next/link'
import { FaToolbox } from 'react-icons/fa'
import { FaExternalLinkAlt } from 'react-icons/fa'
import { LuGitPullRequestArrow, LuPlaneTakeoff } from 'react-icons/lu'
import { HiOutlineExternalLink } from 'react-icons/hi'

const Banner = () => {
  return (
    <Link target='_blank' href="https://infinitetoolbox.vercel.app" className='bg-[#E2BFB3] px-2 py-4 rounded-[20px] items-center flex flex-col relative overflow-hidden hover:scale-105 transition-all duration-300 hover:bg-[#FFBE98] border-2 border-gray-100 dark:border-gray-700'>
        
        <header className='text-white text-sm font-bold tracking-tighter z-10'>Check Out My Other App:</header>

        <div className="flex items-center gap-3 text-xl font-bold tracking-tighter text-gray-600 z-10">
          <FaToolbox className="text-[#b58170]" />
          <h1><span className="text-[#b58170]">Infinite</span>Toolbox</h1>
        </div>

        <HiOutlineExternalLink className='absolute top-2 right-2 text-gray-600 z-10' />
        <LuPlaneTakeoff className='absolute text-[8rem] -top-2 left-2 text-[#b58170] opacity-25 z-1' />
        <LuGitPullRequestArrow className='absolute text-[6rem] -bottom-6 right-2 text-[#b58170] opacity-25 z-1' />
    </Link>
  )
}

export default Banner