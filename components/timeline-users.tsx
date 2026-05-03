import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

import { customUserImages } from '@/lib/data'
import { separateCommunityUsersByMonth, separateUsersByPlan } from '@/lib/community-helpers'

import { GiBulletBill } from 'react-icons/gi'
import { LuUser } from 'react-icons/lu'
import { RiCopilotFill } from 'react-icons/ri'
import { TiStarFullOutline } from "react-icons/ti";


import iflyticsDarkMode from "@/public/iflyticslight.svg"
import iflyticsLightMode from "@/public/infinilyticslogo.svg"

import { HoverCard, HoverCardContent, HoverCardTrigger } from './ui/hover-card'
import { Button } from './ui/button'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion'


interface User {
    id: string
    ifc_user_id: string
    created_at: string
    display_name: string
    bio: string
    ifc_username?: string
}

interface TimelineUsersProps {
    users: User[]
}

const TimelineUsers = async ({ users }: TimelineUsersProps) => {
    const separatedUsers = separateCommunityUsersByMonth(users)
    const usersByPlan = await separateUsersByPlan(users)

    const planGroups = Array.isArray(usersByPlan) ? (
        usersByPlan.map((group: any) => (
            <div key={group.plan} className='flex flex-col gap-2'>
                <span className={`text-xs font-semibold uppercase tracking-widest ${group.plan === 'premium' ? 'text-yellow-500' : group.plan === 'lifetime' ? 'text-green-500' : 'text-blue-500'}`}>
                    {group.plan} · {group.users.length}
                </span>
                <div className='flex flex-col gap-2'>
                    {group.users.map((user: any, index: number) => {
                        const imageLink = customUserImages.find(item => item.username === user.ifc_username)?.image ?? ""
                        return (
                            <Link href={`/dashboard/users/${user.ifc_user_id}`} key={index} className='flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-md transition-all'>
                                {imageLink
                                    ? <img src={imageLink} className={`w-[32px] h-[32px] rounded-full shrink-0 ${group.plan === 'premium' ? 'border-2 border-yellow-500 dark:border-yellow-400' : group.plan === 'lifetime' ? 'border-2 border-green-500 dark:border-green-400' : 'border-2 border-blue-500 dark:border-blue-400'}`} />
                                    : <div className='w-[32px] h-[32px] rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-bold shrink-0'>
                                        {user.ifc_username?.charAt(0).toUpperCase()}
                                      </div>
                                }
                                <div className='flex flex-col leading-tight'>
                                    <span className='text-sm font-medium'>{user.display_name}</span>
                                    <span className='text-xs text-gray-500'>@{user.ifc_username}</span>
                                </div>
                            </Link>
                        )
                    })}
                </div>
            </div>
        ))
    ) : (
        <p className='text-xs text-red-400'>Could not load subscriber data.</p>
    )

    return (
        <main className="flex flex-col-reverse gap-4 md:flex-row">
            <section className="flex-5 flex flex-col gap-4">

                <header>
                    <h1 className="text-2xl font-bold">Community Timeline</h1>
                    <p className="text-sm text-gray-500">See how the community has grown over time (Since June 2025)</p>
                </header>

                <div className="grid grid-cols-1 gap-4">

                    {separatedUsers.map((e: any, i: any) => {
                        return (
                            <section key={e.month} className="flex flex-col gap-4">
                                <header className='flex gap-3 items-center'>
                                    <>
                                        <Image src={iflyticsLightMode} alt='iflytics logo' width={25} height={25} className='block dark:hidden' />
                                        <Image src={iflyticsDarkMode} alt='iflytics logo' width={25} height={25} className='hidden dark:block' />
                                    </>
                                    <span className='font-bold'>{e.month}</span>
                                    <span className='text-xs font-medium'>{e.users.length} pilots</span>
                                </header>

                                <div className="border-l-2 border-gray-300 px-4 pt-2 pb-6 flex flex-wrap gap-2">
                                    {e.users.map((user: any, index: any) => {
                                        const imageLink = customUserImages.find(item => item.username === user.ifc_username)?.image ?? ""
                                        return (
                                            <HoverCard key={index}>
                                                <HoverCardTrigger asChild>
                                                        {imageLink ? <img src={imageLink} className='w-[40px] h-[40px] rounded-full hover:scale-105 transition-all cursor-pointer' /> : <div className='w-[40px] h-[40px] rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center'>{user.ifc_username?.charAt(0).toUpperCase()}</div>}
                                                </HoverCardTrigger>
                                                <HoverCardContent className='p-4 rounded-[20px] border-4 border-orange-100 dark:border-gray-700 flex flex-col bg-orange-50 dark:bg-gray-900'>

                                                    <div className="flex gap-2 items-center">
                                                        {imageLink ? <img src={imageLink} className='w-[40px] h-[40px] rounded-full hover:scale-105 transition-all cursor-pointer' /> : <div className='w-[40px] h-[40px] rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center'>{user.ifc_username?.charAt(0).toUpperCase()}</div>}
                                                        <div className="flex flex-col gap-0.5">
                                                            <span className='font-bold tracking-tight text-xl'>{user.display_name}</span>
                                                            <span className='text-xs text-gray-500'>@{user.ifc_username}</span>
                                                        </div>
                                                    </div>
                                                    <Link href={`/dashboard/users/${user.ifc_user_id}`}><Button className='text-sm bg-blue-400 hover:bg-blue-500 border-2 border-blue-300 mt-4 px-3 py-0.5 rounded-[20px] text-white'><LuUser /> Profile</Button></Link>
                                                </HoverCardContent>
                                            </HoverCard>
                                        )
                                    })}
                                </div>
                            </section>
                        )
                    })}






                </div>

            </section>
            
            <aside className='md:hidden border-2 border-gray-200 dark:border-gray-700 rounded-[16px] px-4'>
                <Accordion type="single" collapsible>
                    <AccordionItem value="subscribers" className="border-none">
                        <AccordionTrigger className="hover:no-underline">
                            <span className='font-bold flex items-center text-xl gap-1.5'>
                                <TiStarFullOutline className='text-yellow-400' /> IFlytics Sub Members
                            </span>
                        </AccordionTrigger>
                        <AccordionContent>
                            <p className='text-xs text-gray-500 mb-3'>Thank you all for your continued support!</p>
                            <div className='flex flex-col gap-4'>{planGroups}</div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </aside>

            <aside className='hidden md:flex flex-2 flex-col gap-4 border-2 border-gray-200 dark:border-gray-700 rounded-[16px] p-4 h-fit'>
                <header className='flex flex-col gap-1'>
                    <span className='font-bold flex items-center text-xl gap-1.5'>
                        <TiStarFullOutline className='text-yellow-400' /> IFlytics Sub Members
                    </span>
                    <p className='text-xs text-gray-500'>Thank you all for your continued support!</p>
                </header>
                {planGroups}
            </aside>
        </main>
    )
}

export default TimelineUsers