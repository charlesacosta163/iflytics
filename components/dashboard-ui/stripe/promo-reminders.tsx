import { Badge } from '@/components/ui/badge'
import React from 'react'

const PromoReminders = () => {
  return (
    <div className="text-sm bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 px-2 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-blue-500/25 text-center">
        Use code <Badge className="font-bold bg-yellow-500 text-dark">PREMIUM50</Badge> to get 50% off your first month of <Badge className="font-bold bg-yellow-500 text-dark">Premium</Badge>! OR use code <Badge className="font-bold bg-green-600 text-light">STATS4LIFE40</Badge> to get 40% off for <Badge className="font-bold bg-green-600 text-light">Lifetime</Badge> Plans! <br/> <br/><u>Deal ends on <span className="font-bold">Sept. 25th</span></u>
    </div>


  )
}

export default PromoReminders