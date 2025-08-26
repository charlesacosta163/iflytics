'use client'

import React from 'react'
import { SubscribeButton } from './stripe/subscribe-button'
import { LifetimeButton } from './stripe/lifetime-plan-button'

const GroupedSubscriptionButtons = () => {
  return (
    <div className='flex gap-4 mt-4'>
        <SubscribeButton />
        <LifetimeButton />
    </div>
  )
}

export default GroupedSubscriptionButtons