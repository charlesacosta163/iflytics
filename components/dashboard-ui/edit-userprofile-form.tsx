import React from 'react'
import { FiUser } from 'react-icons/fi'
import { LuPencil } from 'react-icons/lu'

import Link from 'next/link'
import { updateUserProfile } from '@/lib/supabase/user-actions'
import SubmitEditProfileBtn from './submit-edit-profile-btn'

const EditUserProfileForm = ({id, display_name, bio, avatar_url}: {id: string, display_name: string, bio: string, avatar_url: string}) => {

  return (
    <div className="flex flex-col gap-4">
      <form 
        className="flex flex-col gap-4 bg-white dark:bg-gray-800 rounded-lg p-4 max-w-[500px] w-full"
        action={async (formData) => {
            'use server'
            const displayName = formData.get('display-name')
            const bio = formData.get('bio')
            const id = formData.get('id')
           
            await updateUserProfile(id as string, displayName as string, bio as string)
        }}
       >
        <div className="flex flex-col gap-2">
          <label htmlFor="ifc-username" className="text-sm font-semibold">
            Your Display Name
          </label>
          <div className="text-white relative">
            <input
              defaultValue={display_name}
              type="text"
              name="display-name"
              className="bg-gray-700 pl-10 pr-4 py-2 font-medium rounded-lg outline-none w-full"
              placeholder="Enter your Display Name (e.g. Bacon Pancake)"
              required
            />
            <FiUser className="absolute left-[10px] top-[12px] font-bold text-lg" />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="ifc-username" className="text-sm font-semibold">
            Bio (Optional)
          </label>
          <div className="text-white relative">
            <textarea
              defaultValue={bio}
              name="bio"
              className="bg-gray-700 pl-10 pr-4 py-2 font-medium rounded-lg outline-none w-full resize-none h-[100px]"
              placeholder="A short bio about yourself (e.g. I'm a french bulldog who loves to eat bacon and pancakes)"
            />
            <LuPencil className="absolute left-[10px] top-[12px] font-bold text-lg" />
          </div>
        </div>

        <input type="hidden" name="id" value={id} />
        
        <div className="flex gap-2 self-start">
            <SubmitEditProfileBtn />
            <Link href="/dashboard/profile" className="bg-gray-200 text-gray-700 hover:bg-gray-300 transition-all duration-300 px-4 py-2 rounded-lg text-sm font-semibold">Cancel</Link>
        </div>

      </form>
    </div>
  )
}

export default EditUserProfileForm