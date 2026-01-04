import { Badge } from '@/components/ui/badge'
import React from 'react'

const PromoReminders = () => {
  return (
    <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 px-2 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-blue-500/25 text-center">
        Use Code <Badge className="bg-pink-600 text-light px-2 py-0.5 rounded-md font-bold">IFHOLIDAY50</Badge> for 50% OFF on Lifetime and Premium Plans! Expires <u className="font-bold">January 15, 2026</u>
    </div>


  )
}

export default PromoReminders