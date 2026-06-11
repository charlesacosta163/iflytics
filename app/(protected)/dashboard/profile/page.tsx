import React from 'react'
import { Suspense } from 'react';
import ProfileWrapper from '@/components/dashboard-ui/profile-wrapper'

import { getUserProfile } from '@/lib/supabase/user-actions';
import { getUserSubscription } from '@/lib/stripe/stripe-actions';
import PurchaseTracker from '@/components/dashboard-ui/misc/ga4/purchase-tracker';

const ProfilePage = async () => {
  const profile = await getUserProfile();
  const subscription = await getUserSubscription(profile.ifc_user_id);

  // console.log(subscription);
  return (
    <>
    <Suspense fallback={null}>
      <PurchaseTracker />
    </Suspense>
    <ProfileWrapper userProfile={profile} subscription={subscription} />
    </>
  )
}

export default ProfilePage