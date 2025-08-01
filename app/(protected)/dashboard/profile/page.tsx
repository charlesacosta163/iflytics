import React from 'react'
import ProfileWrapper from '@/components/dashboard-ui/profile-wrapper'

import { getUserProfile } from '@/lib/supabase/user-actions';
import { getUserSubscription } from '@/lib/stripe/stripe-actions';

const ProfilePage = async () => {
  const profile = await getUserProfile();
  const subscription = await getUserSubscription(profile.ifc_user_id);

  // console.log(subscription);
  return (
    <ProfileWrapper userProfile={profile} subscription={subscription} />
  )
}

export default ProfilePage