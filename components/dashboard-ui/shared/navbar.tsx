import React from 'react'
import Pathname from './pathname'
import { LogoutButton } from '@/components/logout-button'

const Navbar = () => {
  return (
    <div className="flex justify-between items-center p-4">
        <Pathname />
        <LogoutButton />
    </div>
  )
}

export default Navbar