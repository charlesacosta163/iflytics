import React from 'react'
import { GoCopilot } from 'react-icons/go'

const ProfileHeader = ({name, grade, organization}: {name: string, grade: number, organization: string}) => {
  return (
    <div className="flex gap-4 self-start sm:gap-8 items-center justify-center">
                <GoCopilot className='text-[4rem]'/>
                <div className="flex flex-col text-left">
                    <b className="text-2xl tracking-tight">{name}</b>
                    <div className='font-medium text-sm'>Grade: {grade}</div>
                    <div className='font-medium text-sm'>Organization: {organization ? organization : "Not Joined"}</div>
                </div>
            </div>
  )
}

export default ProfileHeader