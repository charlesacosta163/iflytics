import React from 'react'
import { IconType } from 'react-icons'
import { Card } from '@/components/ui/card'

interface InfoCardProps {
    value: string | number;
    label: string;
    icon: IconType;
    caption?: string;
    className?: string;
}

const InfoCard = ({ value, label, icon: Icon, caption, className = '' }: InfoCardProps) => {
    return (
        <Card className={`flex flex-col justify-between gap-2 h-[150px] p-4 rounded-lg border border-black relative tracking-tighter text-light bg-dark ${className}`}>
            <div className='flex flex-col'>
                <span id='value' className='font-black text-2xl sm:text-3xl'>{value}</span>
                {caption && <span className='text-xl font-semibold text-center self-start'>{caption}</span>}
            </div>
            <span id="label" className='self-end font-semibold flex gap-2 items-center text-xl sm:text-2xl'>
                <Icon /> {label}
            </span>

            <Icon className='absolute top-4 right-[-2rem] text-white text-[12rem] opacity-10' />
        </Card>
    )
}

export default InfoCard