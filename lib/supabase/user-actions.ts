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

export async function getUserProfileById(id: string) {
    const supabase = await createClient()
    const { data, error } = await supabase.from('user_profiles').select('*').eq('ifc_user_id', id).single()

    return data
}

export async function updateUserProfile(id: string, displayName: string, bio: string) {
    const supabase = await createClient()
    const { data, error } = await supabase.from('user_profiles').update({
        display_name: displayName,
        bio: bio
    }).eq('ifc_user_id', id).select().single()

    if (error) {
        console.error("Error updating user profile:", error)
        return { error: 'Error updating user profile' }
    }

    redirect('/dashboard/profile')
}

export async function getAllIFlyticsUsers() {
    const supabase = await createClient()
    const { data, error } = await supabase.from('user_profiles').select('*')

    return data
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
    let ifcGameUserId: string

    if (response.success) {
        ifcGameUserId = response.userId
    } else {
        console.error("Failed to get user ID from IFC:", response.error)
        redirect('/setup/error')
    }

    console.log(ifcGameUserId, ifcUsername, displayName, bio)
    // Create client inside the function
    const supabase = await createClient()
    
    // Update the user metadata
    const { data, error } = await supabase.auth.updateUser({
        data: {
            ifcUsername: ifcUsername,
            ifcUserId: ifcGameUserId
        }
    })

    if (error) {
        console.error("Error updating IFC username:", error)
        redirect('/setup/error')
    }

    // Create the user profile - ADD MORE DETAILED ERROR LOGGING
    const { data: profileData, error: profileError } = await supabase.from('user_profiles').insert({
        display_name: displayName,
        bio: bio,
        ifc_user_id: user.id,
        ifc_username: ifcUsername,
        ifc_game_id: ifcGameUserId
    })

    if (profileError) {
        console.error("Error creating user profile:", profileError)
        console.error("Profile data attempted:", {
            display_name: displayName,
            bio: bio,
            ifc_user_id: user.id,
            ifc_username: ifcUsername,
            ifc_game_id: ifcGameUserId
        })
        // Don't redirect immediately - let's see the error
        throw new Error(`Profile creation failed: ${profileError.message}`)
    }
    
    redirect('/setup/success')
}