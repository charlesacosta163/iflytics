'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card'
import { Badge } from '../ui/badge'
import { cn } from '@/lib/utils'
import { convertMinutesToHours } from '@/lib/utils'
import { TbPlaneInflight, TbTrendingUp, TbTrendingDown, TbEqual } from 'react-icons/tb'
import { LuPlaneLanding } from 'react-icons/lu'
import { PiShootingStarBold } from 'react-icons/pi'
import { FaCalendarAlt } from 'react-icons/fa'
import { months } from '@/lib/data'

interface MonthStats {
  totalFlightTime: number
  totalLandings: number
  totalXP: number
  totalFlights: number
}

interface MonthlyStatsComparisonCardProps {
  previousMonthStats: MonthStats
  thisMonthStats: MonthStats
}

const MonthlyStatsComparisonCard = ({ previousMonthStats, thisMonthStats }: MonthlyStatsComparisonCardProps) => {
  
  // Calculate percentage changes
  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0
    return ((current - previous) / previous) * 100
  }

  const flightsChange = calculateChange(thisMonthStats.totalFlights, previousMonthStats.totalFlights)
  const timeChange = calculateChange(thisMonthStats.totalFlightTime, previousMonthStats.totalFlightTime)
  const landingsChange = calculateChange(thisMonthStats.totalLandings, previousMonthStats.totalLandings)
  const xpChange = calculateChange(thisMonthStats.totalXP, previousMonthStats.totalXP)

  // Determine overall trend
  const averageChange = (flightsChange + timeChange + landingsChange + xpChange) / 4
  
  const getTrendMessage = () => {
    if (averageChange > 20) {
      return {
        message: "Incredible! You're flying way more this month!",
        color: "text-green-600 dark:text-green-400"
      }
    } else if (averageChange > 5) {
      return {
        message: "Great progress! Your activity is trending upward.",
        color: "text-green-600 dark:text-green-400"
      }
    } else if (averageChange > -5) {
      return {
        message: "Steady flying! You're maintaining consistent activity.",
        color: "text-blue-600 dark:text-blue-400"
      }
    } else if (averageChange > -20) {
      return {
        message: "Flying a bit less this month. Get back in the skies!",
        color: "text-amber-600 dark:text-amber-400"
      }
    } else {
      return {
        message: "Much less activity this month. Time to plan some flights!",
        color: "text-red-600 dark:text-red-400"
      }
    }
  }

  const trend = getTrendMessage()

  // Stat comparison component
  const StatComparison = ({ 
    icon: Icon, 
    label, 
    previousValue, 
    currentValue, 
    change,
    formatter = (val: number) => val.toString()
  }: any) => {
    const isPositive = change > 0
    const isNeutral = change === 0
    
    return (
      <div className={cn(
        "bg-purple-50 dark:bg-purple-950/30",
        "rounded-[20px]",
        "p-4 md:p-5",
        "space-y-3"
      )}>
        {/* Header */}
        <div className="flex items-center gap-2">
          <Icon className="text-xl text-gray-600 dark:text-gray-400" />
          <span className="text-sm font-bold text-gray-600 dark:text-gray-400">{label}</span>
        </div>

        {/* Values Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Previous Month */}
          <div className={cn(
            "bg-[#FCD8CD]/50 dark:bg-gray-700/50",
            "rounded-[15px]",
            "p-3",
            "text-center"
          )}>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium">{months.find((month: { index: number }) => month.index === new Date().getMonth())?.name} { new Date().getFullYear()}</p>
            <p className="text-lg md:text-xl font-bold text-gray-700 dark:text-gray-300">
              {formatter(previousValue)}
            </p>
          </div>

          {/* Current Month */}
          <div className={cn(
            "bg-[#FAF9EE] dark:from-blue-900/30 dark:to-indigo-900/30 dark:bg-[#381f17]/50",
            "rounded-[15px]",
            "p-3",
            "text-center",
            "border-2 border-[#CADCAE] dark:border-blue-800"
          )}>
            <p className="text-xs text-green-600 dark:text-blue-400 mb-1 font-bold">This Month</p>
            <p className="text-lg md:text-xl font-bold text-green-700 dark:text-blue-300">
              {formatter(currentValue)}
            </p>
          </div>
        </div>

        {/* Change Badge */}
        <div className="flex justify-center">
          <Badge className={cn(
            "text-xs font-bold px-3 py-1 flex items-center gap-1",
            isNeutral 
              ? "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
              : isPositive 
                ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
          )}>
            {isNeutral ? (
              <TbEqual className="text-sm" />
            ) : isPositive ? (
              <TbTrendingUp className="text-sm" />
            ) : (
              <TbTrendingDown className="text-sm" />
            )}
            {isNeutral ? 'No change' : `${isPositive ? '+' : ''}${change.toFixed(1)}%`}
          </Badge>
        </div>
      </div>
    )
  }

  return (
    <Card className={cn(
      'md:col-span-2 lg:col-span-4',
      'bg-[#FFEAEA] dark:bg-purple-950/30',
      'border-4 border-pink-200 dark:border-purple-900 shadow-none',
      'rounded-[25px]',
    )}>
      <CardHeader className="border-b-2 border-[#F7CFD8] dark:border-purple-700">
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-2 md:p-3 rounded-[12px]",
            "bg-purple-100 dark:bg-purple-900/30"
          )}>
            <FaCalendarAlt className="w-5 h-5 md:w-6 md:h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <CardTitle className="text-xl md:text-2xl font-bold tracking-tight text-gray-800 dark:text-gray-100">
              Your Monthly Performance
            </CardTitle>
            <CardDescription className="text-sm md:text-base text-gray-600 dark:text-gray-400 font-medium">
              Compare your performance for {months.find((month: { index: number }) => month.index === new Date().getMonth() + 1)?.name} { new Date().getFullYear()} vs previous month
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <StatComparison
            icon={TbPlaneInflight}
            label="Total Flights"
            previousValue={previousMonthStats.totalFlights}
            currentValue={thisMonthStats.totalFlights}
            change={flightsChange}
          />
          
          <StatComparison
            icon={TbPlaneInflight}
            label="Flight Time"
            previousValue={previousMonthStats.totalFlightTime}
            currentValue={thisMonthStats.totalFlightTime}
            change={timeChange}
            formatter={(val: number) => convertMinutesToHours(Math.round(val))}
          />
          
          <StatComparison
            icon={LuPlaneLanding}
            label="Landings"
            previousValue={previousMonthStats.totalLandings}
            currentValue={thisMonthStats.totalLandings}
            change={landingsChange}
          />
          
          <StatComparison
            icon={PiShootingStarBold}
            label="XP Earned"
            previousValue={previousMonthStats.totalXP}
            currentValue={thisMonthStats.totalXP}
            change={xpChange}
            formatter={(val: number) => val.toLocaleString()}
          />
        </div>

        {/* Trend Message */}
        <div className={cn(
          "bg-[#FFF2EB] dark:bg-purple-950/30",
          "border-2 border-[#FFD6BA] dark:border-purple-800",
          "rounded-[20px]",
          "p-4 md:p-5",
          "text-center"
        )}>
          <p className={cn(
            "text-base md:text-lg font-bold tracking-tight",
            trend.color
          )}>
            {trend.message}
          </p>
          <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mt-2 font-medium">
            Average change: {averageChange > 0 ? '+' : ''}{averageChange.toFixed(1)}% across all metrics
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export default MonthlyStatsComparisonCard