'use client'

import React from 'react'
import { usePathname } from 'next/navigation';
const Pathname = () => {
  let pathname = usePathname();

  if (pathname === '/dashboard') {
    pathname = 'Dashboard'
  }
  else {
    pathname = pathname.slice(11)
    pathname = pathname.charAt(0).toUpperCase() + pathname.slice(1)
  }

  return (
    <div className="text-2xl font-bold tracking-tighter text-dark">{pathname}</div>
  )
}

export default Pathname