import React from 'react'
import { getAllIFlyticsUsers } from '@/lib/supabase/user-actions'
import { emojiCharacterRandomizer } from '@/lib/data'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { FaUsers, FaCalendarAlt, FaEye } from 'react-icons/fa'

const UsersPage = async () => {
  const users = await getAllIFlyticsUsers() || []
  return (
    <div className='space-y-8'>
      {/* Enhanced Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-600 to-dark bg-clip-text text-transparent tracking-tight">
            IFlytics Community
          </h1>
          <p className="text-gray-600 mt-2 flex items-center gap-2">
            <FaUsers className="text-gray-500" />
            Discover fellow pilots and their flying journeys
          </p>
        </div>
        
        {/* Stats Badge */}
        <div className="bg-dark text-white px-6 py-3 rounded-xl shadow-lg border border-gray-600 flex items-center gap-2 justify-between">
          <span className="text-sm font-medium text-gray-300">Total Pilots</span>
          <span className="text-2xl font-bold">{users.length}</span>
        </div>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user: any) => (
          <UserCard 
            key={user.id} 
            id={user.ifc_user_id} 
            created_at={user.created_at} 
            display_name={user.display_name} 
            bio={user.bio}
            ifc_username={user.ifc_username}
          />
        ))}
      </div>

      {/* Empty State */}
      {users.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-gray-500">
          <div className="text-6xl mb-4">👥</div>
          <h3 className="text-xl font-semibold mb-2">No pilots yet</h3>
          <p className="text-gray-400">Be the first to join the community!</p>
        </div>
      )}
    </div>
  )
}

const UserCard = ({
  id, 
  created_at, 
  display_name, 
  bio, 
  ifc_username
}: {
  id: string, 
  created_at: string, 
  display_name: string, 
  bio: string,
  ifc_username?: string
}) => {
  const randomEmoji = emojiCharacterRandomizer[Math.floor(Math.random() * emojiCharacterRandomizer.length)]
  const joinDate = new Date(created_at)
  const isRecent = (Date.now() - joinDate.getTime()) < (7 * 24 * 60 * 60 * 1000) // Last 7 days

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
          <div className="">
            <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center text-2xl shadow-lg border-2 border-gray-600">
              {randomEmoji}
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className='text-xl font-bold text-white truncate'>{display_name}</h3>
            {ifc_username && (
              <p className='text-sm text-gray-400 font-medium'>@{ifc_username}</p>
            )}
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-6 pt-4">
        <div className="mb-4">
          <p className='text-sm text-gray-300 line-clamp-3 leading-relaxed min-h-[3.75rem]'>
            {bio || "✈️ Ready to take flight! No bio added yet."}
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
          
          <Link 
            href={`/dashboard/users/${id}`} 
            className='group/btn flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white text-sm px-4 py-2 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg border border-gray-600'
          >
            <FaEye className="text-xs group-hover/btn:scale-110 transition-transform" />
            View Profile
          </Link>
        </div>
      </div>
    </Card>
  )
}

export default UsersPage