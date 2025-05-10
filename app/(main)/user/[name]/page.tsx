import React from 'react'
import { getUserFlights, getUserStats } from '@/lib/actions'
import { convertMinutesToHours, numberWithCommas } from '@/lib/utils';
import InfoCard from '@/components/info-card';
import ProfileHeader from '@/components/profile-header';
import UserNavigation from '@/components/user-navigation';

import { PiArrowFatLineUpBold } from "react-icons/pi";
import { BiSolidPlaneLand } from "react-icons/bi";
import { FaRegClock, FaStar } from "react-icons/fa";
import { RiTimeZoneLine } from "react-icons/ri";
import { PiSparkleLight } from "react-icons/pi";
import { PiAirTrafficControlBold } from "react-icons/pi";
import { GiCaptainHatProfile } from "react-icons/gi";
import { FaPlaneDeparture } from "react-icons/fa";

import { notFound } from 'next/navigation';
import Link from 'next/link';


const UserPage = async ({params}: {params: Promise<{name: string}>}) => {
    const { name } = await params

    // User Statistics
    let data: any = null;
    let result: any = null;
    
    try {
        if (!name) {
            return notFound();
        }
        
        data = await getUserStats(name);
        
        if (!data || !data.result || !Array.isArray(data.result) || data.result.length === 0) {
            return notFound();
        }

        result = data.result[0];

        if (!result || typeof result !== 'object') {
            return notFound();
        }
    } catch (error) {
        console.error("Error fetching user stats:", error);
        return notFound();
    }

    return (
        <div className='p-4 flex flex-col gap-4'>
            <ProfileHeader name={result.discourseUsername} grade={result.grade} organization={result.virtualOrganization}/>

            {/* User Navigation Tabs */}
            <UserNavigation username={name} />

            <h2 className='text-5xl font-black bg-gradient-to-r from-gray-600 to-dark py-0.5 bg-clip-text text-transparent'>General</h2>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 overflow-hidden">
                <InfoCard 
                    value={numberWithCommas(result.onlineFlights)}
                    label="Flights"
                    icon={FaPlaneDeparture}
                />

                <InfoCard 
                    value={numberWithCommas(result.xp)}
                    label="XP"
                    icon={PiArrowFatLineUpBold}
                />

                <InfoCard 
                    value={numberWithCommas(result.landingCount)}
                    label="Landings"
                    icon={BiSolidPlaneLand}
                />

                <InfoCard 
                    value={convertMinutesToHours(result.flightTime)}
                    label="Flight Time"
                    icon={FaRegClock}
                />
                
                <InfoCard 
                    value={`${(result.flightTime / result.onlineFlights).toFixed(1)}`}
                    label="Average Flight Time"
                    icon={RiTimeZoneLine}
                    caption="Minutes"
                    className="col-span-2 sm:flex-row sm:items-center sm:[&>#label]:self-center sm:[&>#value]:text-5xl"
                />

                <InfoCard 
                    value={`${(result.xp / result.landingCount).toFixed(1)}`}
                    label="Average XP Per Flight"
                    icon={PiSparkleLight}
                    caption="XP"
                    className="col-span-2 sm:flex-row sm:items-center sm:[&>#label]:self-center sm:[&>#value]:text-5xl"
                />

                <InfoCard 
                    value={result.grade}
                    label="Grade"
                    icon={FaStar}
                />

                <InfoCard 
                    value={result.atcRank}
                    label="ATC Rank"
                    icon={GiCaptainHatProfile}
                />

                <InfoCard 
                    value={result.atcOperations}
                    label="ATC Operations"
                    icon={PiAirTrafficControlBold}
                />
            </div>
        </div>
    )
}

export default UserPage