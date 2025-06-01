import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getUser, getUserProfile } from '@/lib/supabase/user-actions'
import Image from 'next/image';

import { SiGithubcopilot } from "react-icons/si";
import { Button } from '@/components/ui/button';
import Link from 'next/link';


const ProfilePage = async () => {
    let userProfile = await getUserProfile()

    if (!userProfile) {
        return <div>No user profile found</div>
    }

    // console.log(userProfile)
  return (
    <main>
        <div className='flex sm:flex-row flex-col gap-4 max-w-[500px] w-full px-4 bg-white rounded-lg shadow p-8'>
            <div className='self-center sm:self-start'>
                {userProfile?.avatar_url ? (
                    <img src={userProfile?.avatar_url} alt='User avatar' className='rounded-full w-[100px] h-[100px] object-cover' />
                ) : (
                    <SiGithubcopilot className='text-6xl' />
                )}
            </div>

            <div className='flex-1 flex flex-col gap-4'>
                <header>
                    <h3 className='text-2xl font-bold'>{userProfile?.display_name}</h3>

                <p className='text-xs text-gray-500 font-medium'>@{userProfile?.ifc_username}</p>
                </header>

                <section className="p-4 rounded-lg bg-gray-100">
                    <p className='text-gray-500 font-medium'>{userProfile?.bio}</p>
                </section>

                <div className="flex justify-between gap-2 items-center">
                    <Link className='hidden' href={`/dashboard/profile/edit/${userProfile?.ifc_user_id}`}><Button>Edit Profile</Button></Link>
                    <span className='text-xs text-gray-500 font-medium'>Account created on {new Date(userProfile?.created_at).toLocaleDateString()}</span>

                </div>
            </div>
        </div>
    </main>
  )
}

export default ProfilePage