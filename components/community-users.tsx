"use client"

import React, { useState, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { FaUsers, FaCalendarAlt, FaEye, FaSearch, FaExternalLinkAlt } from 'react-icons/fa'
import { Minimize2, Maximize2, LayoutGrid, List, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { customUserImages } from '@/lib/data'

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

const CommunityUsers = ({ users }: CommunityUsersProps) => {
  const [globalViewMode, setGlobalViewMode] = useState<'expanded' | 'mini'>('expanded')
  const [searchQuery, setSearchQuery] = useState('')

  const toggleGlobalViewMode = () => {
    setGlobalViewMode(prev => prev === 'expanded' ? 'mini' : 'expanded')
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
    <div className='space-y-8'>
      {/* Enhanced Header */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold dark:text-light bg-gradient-to-r from-gray-600 to-dark bg-clip-text text-transparent tracking-tight">
              IFlytics Community
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2 flex items-center gap-2">
              <FaUsers className="text-gray-500" />
              Discover fellow pilots and their flying journeys
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* View Mode Toggle */}
            <Button
              onClick={toggleGlobalViewMode}
              variant="outline"
              className="bg-dark border-gray-600 text-white hover:bg-gray-700 flex items-center gap-2"
            >
              {globalViewMode === 'expanded' ? (
                <>
                  <List className="w-4 h-4" />
                  Mini View
                </>
              ) : (
                <>
                  <LayoutGrid className="w-4 h-4" />
                  Expanded View
                </>
              )}
            </Button>

            {/* Stats Badge */}
            <div className="bg-dark text-white px-6 py-3 rounded-xl shadow-lg border border-gray-600 flex items-center gap-2 justify-between">
              <span className="text-sm font-medium text-gray-300">Total Pilots</span>
              <span className="text-2xl font-bold">{users.length}</span>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="text"
              placeholder="Search pilots by name or username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2 font-medium bg-gray-600 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 text-sm focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          
          {/* Search Results Counter */}
          {searchQuery && (
            <div className="mt-2 text-sm text-gray-400">
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
      <div className={`grid gap-4 ${
        globalViewMode === 'expanded' 
          ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3' 
          : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6'
      }`}>
        {filteredUsers.map((user: User) => (
          <UserCard 
            key={user.id} 
            user={user}
            viewMode={globalViewMode}
            searchQuery={searchQuery}
          />
        ))}
      </div>

      {/* Empty State - No Users */}
      {users.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-gray-500">
          <div className="text-6xl mb-4">👥</div>
          <h3 className="text-xl font-semibold mb-2">No pilots yet</h3>
          <p className="text-gray-400">Be the first to join the community!</p>
        </div>
      )}

      {/* Empty State - No Search Results */}
      {users.length > 0 && filteredUsers.length === 0 && searchQuery && (
        <div className="flex flex-col items-center justify-center py-16 text-gray-500">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold mb-2">No pilots found</h3>
          <p className="text-gray-400 mb-4">No pilots match your search for "{searchQuery}"</p>
          <Button
            onClick={clearSearch}
            variant="outline"
            className="bg-dark border-gray-600 text-white hover:bg-gray-700"
          >
            Clear Search
          </Button>
        </div>
      )}
    </div>
  )
}

const UserCard = ({ 
  user, 
  viewMode,
  searchQuery 
}: { 
  user: User; 
  viewMode: 'expanded' | 'mini';
  searchQuery?: string;
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
        <span key={index} className="bg-yellow-400 bg-opacity-30 text-yellow-200 px-1 rounded">
          {part}
        </span>
      ) : part
    )
  }

  if (viewMode === 'mini') {
    // Mini Mode
    return (
      <Card className='group bg-dark rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-600 overflow-hidden p-4'>
        <div className="flex flex-col items-center gap-3 text-center">
          {/* Profile Image */}
          <div 
            className={`w-16 h-16 rounded-full border-2 border-gray-500 flex-shrink-0 ${
              userImage 
                ? 'bg-cover bg-center bg-no-repeat' 
                : 'bg-gradient-to-br from-gray-600 to-gray-700'
            }`}
            style={userImage ? { backgroundImage: `url(${userImage})` } : {}}
          >
            {!userImage && (
              <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center text-2xl">
                🤨
              </div>
            )}
          </div>

          {/* User Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-white text-sm truncate">
              {searchQuery ? highlightText(user.display_name, searchQuery) : user.display_name}
            </h3>
            {user.ifc_username && (
              <p className="text-gray-400 text-xs truncate">
                @{searchQuery ? highlightText(user.ifc_username, searchQuery) : user.ifc_username}
              </p>
            )}
          </div>

          {/* View Profile Button */}
          <div className="flex items-center gap-2 w-full"> 
            <Link 
              href={`/dashboard/users/${user.ifc_user_id}`} 
              className='flex items-center gap-1 bg-gray-700 hover:bg-gray-600 text-white text-xs px-3 py-2 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg border border-gray-600 w-full justify-center flex-1'
            >
              <FaEye className="text-xs" />
            </Link>

            <Link 
              target="_blank"
              href={`https://community.infiniteflight.com/u/${user.ifc_username}/summary`} 
              className='flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-2 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg w-full justify-center flex-1'
            >
              <FaExternalLinkAlt className="text-xs" />
            </Link>
          </div>
        </div>
      </Card>
    )
  }

  // Expanded Mode (Original Design)
  return (
    <Card className='group bg-dark rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-600 overflow-hidden'>
      {/* Card Header with Avatar */}
      <div className="relative bg-gray-800 p-6 pb-4 border-b border-gray-600">
        {isRecent && (
          <div className="absolute top-3 right-3 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
            New
          </div>
        )}
        
        <div className="flex items-center gap-4">
          <div 
            className={`w-16 h-16 rounded-full text-2xl shadow-lg border-2 border-gray-600 ${
              userImage 
                ? 'bg-cover bg-center bg-no-repeat' 
                : 'bg-gray-700 flex items-center justify-center'
            }`}
            style={userImage ? { backgroundImage: `url(${userImage})` } : {}}
          >
            {!userImage && (
              <div className="text-4xl">🤨</div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className='text-xl font-bold text-white truncate'>
              {searchQuery ? highlightText(user.display_name, searchQuery) : user.display_name}
            </h3>
            {user.ifc_username && (
              <p className='text-sm text-gray-400 font-medium'>
                @{searchQuery ? highlightText(user.ifc_username, searchQuery) : user.ifc_username}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-6 pt-4">
        <div className="mb-4">
          <p className='text-sm text-gray-300 line-clamp-3 leading-relaxed min-h-[3.75rem]'>
            {user.bio || "✈️ Ready to take flight! No bio added yet."}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-600">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <FaCalendarAlt className="text-gray-500" />
            <span className="font-medium">
              Joined {joinDate.toLocaleDateString('en-US', { 
                month: 'short', 
                year: 'numeric' 
              })}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
          <Link 
            href={`/dashboard/users/${user.ifc_user_id}`} 
            className='group/btn flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white text-sm px-4 py-2 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg border border-gray-600'
          >
            <FaEye className="text-xs group-hover/btn:scale-110 transition-transform" />
              View
          </Link>
          <Link 
            href={`https://community.infiniteflight.com/u/${user.ifc_username}/summary`} 
            className='group/btn flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white text-sm px-4 py-2 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105'
          >
            <FaExternalLinkAlt className="text-xs group-hover/btn:scale-110 transition-transform" />
            IFC
          </Link>
          </div>
        </div>
      </div>
    </Card>
  )
}

export default CommunityUsers