import React from 'react'
import { IconType } from 'react-icons'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils';

interface InfoCardProps {
    value: string | number;
    label: string;
    icon: IconType;
    caption?: string;
    className?: string;
}

const InfoCard = ({ value, label, icon: Icon, caption, className = '' }: InfoCardProps) => {
    return (
        <Card className={`
            flex flex-col justify-between gap-2 
            h-[150px] md:h-[160px] 
            p-4 md:p-5 
            rounded-[20px] md:rounded-[25px] 
            duration-200 hover:scale-105 
            relative tracking-tight 
            bg-gray-50 dark:bg-gray-800
            text-gray-800 dark:text-gray-100
            border-2 border-gray-200 dark:border-gray-700
            overflow-hidden
            ${className}
        `}>
            <div className='flex flex-col gap-1'>
                <span id='value' className='font-black text-2xl sm:text-3xl md:text-4xl tracking-tight'>
                    {value}
                </span>
                {caption && (
                    <span className='text-base md:text-lg font-semibold text-gray-700 dark:text-gray-300 self-start'>
                        {caption}
                    </span>
                )}
            </div>
            <span id="label" className={cn('self-end font-semibold flex gap-2 items-center text-lg sm:text-xl md:text-2xl text-gray-700 dark:text-gray-300', label === "Grade" ? "text-light" : "")}>
                <Icon /> {label}
            </span>

            <Icon className='absolute top-4 right-[-2rem] text-gray-300 dark:text-gray-700 text-[10rem] md:text-[12rem] opacity-20' />
        </Card>
    )
}

export default InfoCard