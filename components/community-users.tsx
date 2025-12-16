"use client"

import React, { useState, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { FaUsers, FaCalendarAlt, FaEye, FaSearch, FaExternalLinkAlt, FaArrowUp } from 'react-icons/fa'
import { Minimize2, Maximize2, LayoutGrid, List, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { customUserImages } from '@/lib/data'
import { cn } from '@/lib/utils'

interface User {
  id: string
  ifc_user_id: string
  created_at: string
  display_name: string
  bio: string
  ifc_username?: string
}

interface CommunityUsersProps {
  users: User[]
}

// Pastel colors for variety
const pastelColors = [
  { bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-800/30', badge: 'bg-blue-500' },
  { bg: 'bg-purple-50 dark:bg-purple-900/20', border: 'border-purple-200 dark:border-purple-800/30', badge: 'bg-purple-500' },
  { bg: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-200 dark:border-green-800/30', badge: 'bg-green-500' },
  { bg: 'bg-pink-50 dark:bg-pink-900/20', border: 'border-pink-200 dark:border-pink-800/30', badge: 'bg-pink-500' },
  { bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-800/30', badge: 'bg-amber-500' },
  { bg: 'bg-cyan-50 dark:bg-cyan-900/20', border: 'border-cyan-200 dark:border-cyan-800/30', badge: 'bg-cyan-500' },
]

const CommunityUsers = ({ users }: CommunityUsersProps) => {
  const [globalViewMode, setGlobalViewMode] = useState<'expanded' | 'mini'>('expanded')
  const [searchQuery, setSearchQuery] = useState('')

  const toggleGlobalViewMode = () => {
    setGlobalViewMode(prev => prev === 'expanded' ? 'mini' : 'expanded')
  }

  // Get consistent color for a user based on their ID
  const getUserColor = (userId: string) => {
    // Ensure userId is a string and has a value
    const userIdStr = String(userId || '')
    const hash = userIdStr.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return pastelColors[hash % pastelColors.length]
  }

  // Filter users based on search query
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) {
      return users
    }

    const query = searchQuery.toLowerCase().trim()
    return users.filter(user => {
      const displayName = user.display_name?.toLowerCase() || ''
      const username = user.ifc_username?.toLowerCase() || ''
      
      return displayName.includes(query) || username.includes(query)
    })
  }, [users, searchQuery])

  const clearSearch = () => {
    setSearchQuery('')
  }

  return (
    <>
    <div className='space-y-6 md:space-y-8'>
      {/* Enhanced Header */}
      <div id="top-bar" className={cn(
        "flex flex-col gap-4 md:gap-6",
        "p-4 md:p-6",
        "bg-gray-50 dark:bg-gray-800",
        "border-2 border-gray-200 dark:border-gray-700",
        "rounded-[20px] md:rounded-[25px]"
      )}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className={cn(
                "p-2 md:p-3 rounded-[12px]",
                "bg-blue-100 dark:bg-blue-900/30"
              )}>
                <FaUsers className="w-5 h-5 md:w-6 md:h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tight text-gray-800 dark:text-gray-100">
                IFlytics Community
              </h1>
            </div>
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 font-medium ml-12 md:ml-[60px]">
              Discover fellow pilots and their flying journeys
            </p>
          </div>
          
          <div className="flex items-center gap-3 md:gap-4">
            {/* View Mode Toggle */}
            <Button
              onClick={toggleGlobalViewMode}
              variant="outline"
              className={cn(
                "bg-white dark:bg-gray-700",
                "border-2 border-gray-200 dark:border-gray-600",
                "text-gray-800 dark:text-gray-100",
                "hover:bg-gray-100 dark:hover:bg-gray-600",
                "rounded-[12px]",
                "flex items-center gap-2",
                "font-bold text-sm",
                "h-11 px-4"
              )}
            >
              {globalViewMode === 'expanded' ? (
                <>
                  <List className="w-4 h-4" />
                  <span className="hidden sm:inline">Mini View</span>
                </>
              ) : (
                <>
                  <LayoutGrid className="w-4 h-4" />
                  <span className="hidden sm:inline">Expanded</span>
                </>
              )}
            </Button>

            {/* Stats Badge */}
            <div className={cn(
              "px-4 md:px-6 py-2.5 md:py-3",
              "bg-gradient-to-br from-purple-500 to-indigo-600",
              "border-2 border-purple-400 dark:border-purple-700",
              "rounded-[12px] md:rounded-[15px]",
              "flex items-center gap-2 md:gap-3",
              "text-white shadow-md"
            )}>
              <span className="text-xs md:text-sm font-bold">Total Pilots</span>
              <span className="text-xl md:text-2xl font-black">{users.length}</span>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-2xl">
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
            <input
              type="text"
              placeholder="Search pilots by name or username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                "w-full pl-12 pr-12 py-3",
                "font-bold text-sm md:text-base",
                "bg-white dark:bg-gray-700",
                "border-2 border-gray-200 dark:border-gray-600",
                "rounded-[12px] md:rounded-[15px]",
                "text-gray-800 dark:text-gray-100",
                "placeholder-gray-500 dark:placeholder-gray-400",
                "focus:outline-none focus:ring-2 focus:ring-blue-500",
                "focus:border-transparent",
                "transition-all duration-200"
              )}
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className={cn(
                  "absolute right-4 top-1/2 transform -translate-y-1/2",
                  "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200",
                  "transition-colors duration-200"
                )}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          
          {/* Search Results Counter */}
          {searchQuery && (
            <div className="mt-2 text-xs md:text-sm text-gray-600 dark:text-gray-400 font-bold">
              {filteredUsers.length > 0 ? (
                <>Found {filteredUsers.length} pilot{filteredUsers.length !== 1 ? 's' : ''}</>
              ) : (
                <>No pilots found matching "{searchQuery}"</>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Users Grid */}
      <div className={`grid gap-3 md:gap-4 ${
        globalViewMode === 'expanded' 
          ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
          : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6'
      }`}>
        {filteredUsers.map((user: User) => (
          <UserCard 
            key={user.id} 
            user={user}
            viewMode={globalViewMode}
            searchQuery={searchQuery}
            colorScheme={getUserColor(user.id)}
          />
        ))}
      </div>

      {/* Empty State - No Users */}
      {users.length === 0 && (
        <div className={cn(
          "flex flex-col items-center justify-center py-12 md:py-16",
          "bg-gray-50 dark:bg-gray-800",
          "border-2 border-gray-200 dark:border-gray-700",
          "rounded-[20px] md:rounded-[25px]"
        )}>
          <div className="text-5xl md:text-6xl mb-4">👥</div>
          <h3 className="text-lg md:text-xl font-bold mb-2 text-gray-800 dark:text-gray-100">No pilots yet</h3>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 font-medium">Be the first to join the community!</p>
        </div>
      )}

      {/* Empty State - No Search Results */}
      {users.length > 0 && filteredUsers.length === 0 && searchQuery && (
        <div className={cn(
          "flex flex-col items-center justify-center py-12 md:py-16",
          "bg-gray-50 dark:bg-gray-800",
          "border-2 border-gray-200 dark:border-gray-700",
          "rounded-[20px] md:rounded-[25px]"
        )}>
          <div className="text-5xl md:text-6xl mb-4">🔍</div>
          <h3 className="text-lg md:text-xl font-bold mb-2 text-gray-800 dark:text-gray-100">No pilots found</h3>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 font-medium mb-4">No pilots match your search for "{searchQuery}"</p>
          <Button
            onClick={clearSearch}
            variant="outline"
            className={cn(
              "bg-white dark:bg-gray-700",
              "border-2 border-gray-200 dark:border-gray-600",
              "text-gray-800 dark:text-gray-100",
              "hover:bg-gray-100 dark:hover:bg-gray-600",
              "rounded-[12px]",
              "font-bold",
              "h-11 px-6"
            )}
          >
            Clear Search
          </Button>
        </div>
      )}
    </div>
    <div className="flex justify-center mt-6 md:mt-8">
      <a href="#navbar" className="text-center">
        <Button 
          variant="outline" 
          className={cn(
            "bg-white dark:bg-gray-700",
            "border-2 border-gray-200 dark:border-gray-600",
            "text-gray-800 dark:text-gray-100",
            "hover:bg-gray-100 dark:hover:bg-gray-600",
            "rounded-[12px]",
            "flex items-center gap-2",
            "font-bold",
            "h-11 px-6"
          )}
        >
          <FaArrowUp className="w-4 h-4" />
          Back to Top
        </Button>
      </a>
    </div>
  
    </>
  )
}

const UserCard = ({ 
  user, 
  viewMode,
  searchQuery,
  colorScheme
}: { 
  user: User; 
  viewMode: 'expanded' | 'mini';
  searchQuery?: string;
  colorScheme: { bg: string; border: string; badge: string; };
}) => {
  const joinDate = new Date(user.created_at)
  const isRecent = (Date.now() - joinDate.getTime()) < (7 * 24 * 60 * 60 * 1000) // Last 7 days

  const userImage = customUserImages.find(image => image.username === user.ifc_username)?.image

  // Highlight search matches
  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    const parts = text.split(regex)
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <span key={index} className="bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-200 px-1 rounded font-bold">
          {part}
        </span>
      ) : part
    )
  }

  if (viewMode === 'mini') {
    // Mini Mode
    return (
      <Card className={cn(
        'group overflow-hidden',
        'p-3 md:p-4',
        colorScheme.bg,
        'border-2',
        colorScheme.border,
        'rounded-[15px] md:rounded-[20px]',
        'hover:shadow-lg transition-all duration-300',
        'transform hover:-translate-y-1'
      )}>
        <div className="flex flex-col items-center gap-2 md:gap-3 text-center">
          {/* Profile Image */}
          <div 
            className={cn(
              "w-14 h-14 md:w-16 md:h-16 rounded-full flex-shrink-0",
              "border-2",
              colorScheme.border,
              userImage 
                ? 'bg-cover bg-center bg-no-repeat' 
                : 'bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700'
            )}
            style={userImage ? { backgroundImage: `url(${userImage})` } : {}}
          >
            {!userImage && (
              <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 flex items-center justify-center text-xl md:text-2xl">
                🤨
              </div>
            )}
          </div>

          {/* User Info */}
          <div className="flex-1 min-w-0 w-full">
            <h3 className="font-black text-xs md:text-sm truncate text-gray-800 dark:text-gray-100">
              {searchQuery ? highlightText(user.display_name, searchQuery) : user.display_name}
            </h3>
            {user.ifc_username && (
              <p className="text-gray-600 dark:text-gray-400 text-[10px] md:text-xs truncate font-bold">
                @{searchQuery ? highlightText(user.ifc_username, searchQuery) : user.ifc_username}
              </p>
            )}
          </div>

          {/* View Profile Button */}
          <div className="flex items-center gap-1.5 md:gap-2 w-full"> 
            <Link 
              href={`/dashboard/users/${user.ifc_user_id}`} 
              className={cn(
                "flex items-center gap-1 justify-center flex-1",
                "bg-white dark:bg-gray-700",
                "hover:bg-gray-100 dark:hover:bg-gray-600",
                "border-2 border-gray-200 dark:border-gray-600",
                "text-gray-800 dark:text-gray-100",
                "text-[10px] md:text-xs px-2 md:px-3 py-1.5 md:py-2",
                "rounded-[8px] md:rounded-[10px]",
                "font-bold transition-all duration-200",
                "hover:scale-105"
              )}
            >
              <FaEye />
            </Link>

            <Link 
              target="_blank"
              href={`https://community.infiniteflight.com/u/${user.ifc_username}/summary`} 
              className={cn(
                "flex items-center gap-1 justify-center flex-1",
                "bg-blue-600 hover:bg-blue-700",
                "dark:bg-blue-500 dark:hover:bg-blue-600",
                "text-white",
                "text-[10px] md:text-xs px-2 md:px-3 py-1.5 md:py-2",
                "rounded-[8px] md:rounded-[10px]",
                "font-bold transition-all duration-200",
                "hover:scale-105"
              )}
            >
              <FaExternalLinkAlt />
            </Link>
          </div>
        </div>
      </Card>
    )
  }

  // Expanded Mode
  return (
    <Card className={cn(
      'group overflow-hidden shadow-none',
      colorScheme.bg,
      'border-2',
      colorScheme.border,
      'rounded-[20px] md:rounded-[25px]',
      'hover:shadow-xl transition-all duration-300',
      'transform hover:-translate-y-1'
    )}>
      {/* Card Header with Avatar */}
      <div className={cn(
        "relative p-4 md:p-6 pb-3 md:pb-4",
        "border-b-2",
        colorScheme.border
      )}>
        {isRecent && (
          <div className={cn(
            "absolute top-3 right-3",
            "bg-green-500 text-white",
            "text-xs px-2 py-1 rounded-full font-black"
          )}>
            New
          </div>
        )}
        
        <div className="flex items-center gap-3 md:gap-4">
          <div 
            className={cn(
              "w-12 h-12 md:w-16 md:h-16 rounded-full text-xl md:text-2xl",
              "border-2",
              colorScheme.border,
              userImage 
                ? 'bg-cover bg-center bg-no-repeat' 
                : 'bg-gray-200 dark:bg-gray-700 flex items-center justify-center'
            )}
            style={userImage ? { backgroundImage: `url(${userImage})` } : {}}
          >
            {!userImage && (
              <div className="text-2xl md:text-4xl">🤨</div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className='text-base md:text-xl font-black text-gray-800 dark:text-gray-100 truncate tracking-tight'>
              {searchQuery ? highlightText(user.display_name, searchQuery) : user.display_name}
            </h3>
            {user.ifc_username && (
              <p className='text-xs md:text-sm text-gray-600 dark:text-gray-400 font-bold'>
                @{searchQuery ? highlightText(user.ifc_username, searchQuery) : user.ifc_username}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 md:p-6 pt-3 md:pt-4">
        <div className="mb-3 md:mb-4">
          <p className='text-xs md:text-sm text-gray-700 dark:text-gray-300 line-clamp-3 leading-relaxed min-h-[3.75rem] font-medium'>
            {user.bio || "✈️ Ready to take flight! No bio added yet."}
          </p>
        </div>

        {/* Footer */}
        <div className={cn(
          "flex items-center justify-between pt-3 md:pt-4",
          "border-t-2",
          colorScheme.border
        )}>
          <div className="flex items-center gap-1.5 md:gap-2 text-[10px] md:text-xs text-gray-600 dark:text-gray-400">
            <FaCalendarAlt />
            <span className="font-bold">
              Joined {joinDate.toLocaleDateString('en-US', { 
                month: 'short', 
                year: 'numeric' 
              })}
            </span>
          </div>
          
          <div className="flex items-center gap-1.5 md:gap-2">
            <Link 
              href={`/dashboard/users/${user.ifc_user_id}`} 
              className={cn(
                "group/btn flex items-center gap-1.5 md:gap-2",
                "bg-white dark:bg-gray-700",
                "hover:bg-gray-100 dark:hover:bg-gray-600",
                "border-2 border-gray-200 dark:border-gray-600",
                "text-gray-800 dark:text-gray-100",
                "text-xs md:text-sm px-3 md:px-4 py-1.5 md:py-2",
                "rounded-[10px]",
                "font-bold transition-all duration-200",
                "hover:scale-105"
              )}
            >
              <FaEye className="text-xs group-hover/btn:scale-110 transition-transform" />
              <span className="hidden sm:inline">View</span>
            </Link>
            <Link 
              href={`https://community.infiniteflight.com/u/${user.ifc_username}/summary`} 
              className={cn(
                "group/btn flex items-center gap-1.5 md:gap-2",
                "bg-blue-600 hover:bg-blue-700",
                "dark:bg-blue-500 dark:hover:bg-blue-600",
                "text-white",
                "text-xs md:text-sm px-3 md:px-4 py-1.5 md:py-2",
                "rounded-[10px]",
                "font-bold transition-all duration-200",
                "hover:scale-105"
              )}
            >
              <FaExternalLinkAlt className="text-xs group-hover/btn:scale-110 transition-transform" />
              <span className="hidden sm:inline">IFC</span>
            </Link>
          </div>
        </div>
      </div>
    </Card>
  )
}

export default CommunityUsers