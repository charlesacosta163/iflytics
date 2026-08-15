import { Badge } from '@/components/ui/badge'
import React from 'react'

const PromoReminders = () => {
  return (
    <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 px-2 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-blue-500/25 text-center">
        1 Year Anniversary Sale - Use code <Badge className="font-bold bg-white/20 px-2 py-0.5 rounded-md">IFLYTICSLIFE60</Badge> to get 60% off on your lifetime plan!. <br /> Use code <Badge className="font-bold bg-white/20 px-2 py-0.5 rounded-md">IFLYTICSPREM75</Badge> to get 75% off on your premium plan! Offer expires Oct 1st, 2026.
    </div>
  );
};

export default PromoReminders;