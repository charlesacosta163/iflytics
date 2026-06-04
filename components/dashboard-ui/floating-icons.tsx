'use client'

import React from 'react'
import { TiPlaneOutline } from 'react-icons/ti'
import { FaGlobeAsia, FaMapMarkerAlt } from 'react-icons/fa'
import { RiMap2Line } from 'react-icons/ri'
import { HiOutlinePaperAirplane } from 'react-icons/hi'
import { TbWorld, TbRoute } from 'react-icons/tb'
import { MdFlightTakeoff, MdFlightLand } from 'react-icons/md'
import './floating-icons.css'

const FloatingIcons = () => {
  const icons = [
    { Icon: TiPlaneOutline, delay: 0, duration: 15, xPos: 10 },
    { Icon: FaGlobeAsia, delay: 2, duration: 20, xPos: 20 },
    { Icon: RiMap2Line, delay: 4, duration: 18, xPos: 30 },
    { Icon: HiOutlinePaperAirplane, delay: 1, duration: 16, xPos: 15 },
    { Icon: TbWorld, delay: 3, duration: 22, xPos: 25 },
    { Icon: FaMapMarkerAlt, delay: 5, duration: 19, xPos: 40 },
    { Icon: TbRoute, delay: 6, duration: 17, xPos: 35 },
    { Icon: MdFlightTakeoff, delay: 2.5, duration: 21, xPos: 50 },
    { Icon: MdFlightLand, delay: 4.5, duration: 23, xPos: 45 },
    { Icon: TiPlaneOutline, delay: 7, duration: 19, xPos: 60 },
    { Icon: FaGlobeAsia, delay: 8, duration: 24, xPos: 70 },
    { Icon: HiOutlinePaperAirplane, delay: 9, duration: 17, xPos: 80 },
    { Icon: TbRoute, delay: 10, duration: 20, xPos: 55 },
    { Icon: MdFlightTakeoff, delay: 11, duration: 18, xPos: 65 },
    { Icon: RiMap2Line, delay: 12, duration: 21, xPos: 75 },
  ]

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20 dark:opacity-10">
      {icons.map((item, index) => {
        const { Icon, delay, duration, xPos } = item
        return (
          <div
            key={index}
            className="floating-icon absolute text-6xl md:text-7xl text-gray-400 dark:text-gray-600"
            style={{
              animationDuration: `${duration}s`,
              animationDelay: `${delay}s`,
              left: `${xPos}%`,
            }}
          >
            <Icon />
          </div>
        )
      })}
    </div>
  )
}

export default FloatingIcons
