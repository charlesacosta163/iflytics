'use server'

import { redirect } from "next/navigation"
import { createClient } from "./server"

// Infinite Flight Info Actions
import { getUserId } from "../actions"

export async function getUser() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()
  
  if (error || !data?.user) {
    redirect('/auth/login')
  }

  return data.user
}

export async function getUserProfile() {
   const user = await getUser()

   if (!user) {
    redirect('/auth/login')
   }

   const supabase = await createClient()
   const { data, error } = await supabase.from('user_profiles').select('*').eq('ifc_user_id', user.id).single()
   
   return {
    ...data,
    ifc_username: user.user_metadata.ifcUsername
   }
   
}

export async function userHasIFCUsername() {
    const user = await getUser()

    if (!user) {
        return { error: 'User not found' }
    }

    if (user.user_metadata.ifcUsername) {
        return {success: true, error: null}
    }

    return {success: false, error: 'User does not have an IFC username'}
}

export async function updateIFCUsernameAndCreateProfile(ifcUsername: string, displayName: string, bio: string) {
    const user = await getUser()

    if (!user) {
        redirect('/auth/login')
    }

    // Get the user's ID from IFC
    const response = await getUserId(ifcUsername)
    let userId: string

    if (response.success) {
        userId = response.userId
    } else {
        redirect('/setup/error')
    }

    // Create client inside the function
    const supabase = await createClient()
    
    // This is the correct way to update user metadata
    const { data, error } = await supabase.auth.updateUser({
        data: {
            ifcUsername: ifcUsername,
            ifcUserId: userId
        }
    })

    if (error) {
        // You could log the error here
        console.error("Error updating IFC username:", error)
        redirect('/setup/error')
    }

    // Create the user profile
    const { data: profileData, error: profileError } = await supabase.from('user_profiles').insert({
        display_name: displayName,
        bio: bio,
        ifc_user_id: user.id,
    })

    if (profileError) {
        console.error("Error creating user profile:", profileError)
        redirect('/setup/error')
    }
    
    // If we get here, the update was successful
    redirect('/setup/success')
}