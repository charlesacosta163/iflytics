'use client'

import React from 'react'
import { SubscribeButton } from './stripe/subscribe-button'
import { LifetimeButton } from './stripe/lifetime-plan-button'
import { FaStar, FaCrown } from 'react-icons/fa'
import { Badge } from '@/components/ui/badge'

const GroupedSubscriptionButtons = () => {
  return (
    <div className="group transition-all duration-200 col-span-1 md:col-span-2 p-6 md:p-8 rounded-[25px]">
      
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="flex items-center gap-2">
          <FaCrown className="text-4xl text-yellow-600 dark:text-yellow-400 animate-pulse" />
          <h2 className="text-3xl md:text-5xl font-bold tracking-tighter bg-gradient-to-r from-yellow-600 via-orange-500 to-red-600 dark:from-yellow-400 dark:via-orange-400 dark:to-red-400 bg-clip-text text-transparent">
            Unlock Premium Features
          </h2>
          <FaCrown className="text-4xl text-yellow-600 dark:text-yellow-400 animate-pulse" />
        </div>

        <p className="text-gray-700 dark:text-gray-300 text-lg font-medium max-w-2xl">
          Get access to all the amazing features showcased above! Choose between flexible monthly billing or lifetime access.
        </p>

        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto mt-4">
          
          {/* Monthly Plan */}
          <div className="flex-1 bg-white dark:bg-gray-900 p-6 rounded-[20px] border-2 border-yellow-200 dark:border-yellow-800 hover:border-yellow-400 dark:hover:border-yellow-600 transition-all hover:shadow-xl">
            <div className="flex items-center gap-2 mb-2">
              <FaStar className="text-yellow-500" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Monthly Plan</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Perfect for trying out premium</p>
            <div className="mb-4">
              <span className="text-4xl font-bold text-gray-900 dark:text-white">$1.99</span>
              <span className="text-gray-600 dark:text-gray-400">/month</span>
            </div>
            <SubscribeButton />
          </div>

          {/* Lifetime Plan */}
          <div className="flex-1 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 p-6 rounded-[20px] border-2 border-green-400 dark:border-green-600 hover:border-green-500 dark:hover:border-green-500 transition-all hover:shadow-xl relative">
            <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-xs px-3 py-1 animate-pulse">
              BEST VALUE
            </Badge>
            <div className="flex items-center gap-2 mb-2">
              <FaCrown className="text-green-600 dark:text-green-400" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Lifetime Access</h3>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">One-time payment, forever</p>
            <div className="mb-4">
              <span className="text-4xl font-bold text-gray-900 dark:text-white">$49.99</span>
              <span className="text-gray-600 dark:text-gray-400"> once</span>
            </div>
            <LifetimeButton />
          </div>

        </div>

        <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
          All plans include access to every premium feature. Cancel anytime for monthly plans.
        </p>
      </div>

    </div>
  )
}

export default GroupedSubscriptionButtons