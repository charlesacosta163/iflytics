'use server'

import { redirect } from "next/navigation"
import { createClient } from "./server"

// Infinite Flight Info Actions
import { getUserId, getUserStats } from "../actions"
import { supabaseAdmin } from "./webhook-client"

export async function getUser() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()
  
  if (error || !data?.user) {
    redirect('/auth/login')
  }

  return data.user
}

export async function deleteUser() {
    const user = await getUser()

    if (!user) {
        redirect('/auth/login')
    }

    const supabase = await createClient()
    
    // Call the RPC function for self-deletion
    const { error } = await supabase.rpc('delete_own_account')

    if (error) {
        console.error("Error deleting user:", error)
        return { error: "Error deleting user" }
    }

    // Sign out after successful deletion
    await supabase.auth.signOut()
    redirect('/auth/login')
}

export async function isLoggedIn() {
  const user = await getUser()
  return user !== null
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

export async function checkIFCUsernameAvailability(ifcUsername: string) {
    const supabase = await createClient()
    
    // Check if username already exists in database
    const { data: existingUser, error } = await supabase
        .from('user_profiles')
        .select('ifc_username')
        .eq('ifc_username', ifcUsername)
        .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found (which is good)
        console.error("Error checking username availability:", error)
        return { available: false, error: "Database error" }
    }

    if (existingUser) {
        return { available: false, error: "Username already taken by another user" }
    }

    // Check if username exists in Infinite Flight
    const ifcResponse = await getUserId(ifcUsername)
    if (!ifcResponse.success) {
        return { available: false, error: "Username not found in Infinite Flight" }
    }

    return { available: true, ifcGameUserId: ifcResponse.userId }
}

export async function updateIFCUsernameAndCreateProfile(ifcUsername: string, displayName: string, bio: string) {
    const user = await getUser()

    if (!user) {
        redirect('/auth/login')
    }

    // First, check if username is available
    const availabilityCheck = await checkIFCUsernameAvailability(ifcUsername)
    
    if (!availabilityCheck.available) {
        console.error("Username not available:", availabilityCheck.error)
        // Redirect with specific error
        redirect(`/setup/error?reason=${encodeURIComponent(availabilityCheck.error!)}`)
    }

    const ifcGameUserId = availabilityCheck.ifcGameUserId

    console.log(ifcGameUserId, ifcUsername, displayName, bio)
    
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
        redirect('/setup/error?reason=auth_update_failed')
    }

    // Create the user profile
    const { data: profileData, error: profileError } = await supabase.from('user_profiles').insert({
        display_name: displayName,
        bio: bio,
        ifc_user_id: user.id,
        ifc_username: ifcUsername,
        ifc_game_id: ifcGameUserId
    })

    if (profileError) {
        console.error("Error creating user profile:", profileError)
        redirect('/setup/error?reason=profile_creation_failed')
    }
    
    redirect('/setup/success')
}

// Get function of data from the leaderboard
export async function getLeaderboardData() {
  try {    
    // Add some debugging
    // console.log("Fetching leaderboard data...")
    
    const { data, error, count } = await supabaseAdmin
      .from('if-stats-leaderboard')
      .select('*', { count: 'exact' })
      .order('xp', { ascending: false })
    
    // console.log("Query result:", { data, error, count })
    
    if (error) {
      console.error("Error fetching leaderboard data:", error)
      return [] // Return empty array instead of error object
    }
    
    // console.log(`Found ${data?.length || 0} leaderboard entries`)
    return data || []
  } catch (err) {
    console.error("Error fetching leaderboard data:", err)
    return []
  }
}

// Main function to sync flight analytics to here (updating data)
export async function syncUserToIFStatsLeaderboard() {
  try {
    const user = await getUser()

    if (!user) 
        redirect("/auth/login")

    const supabase = await createClient()

    const userStats = await getUserStats(user.user_metadata.ifcUsername, user.user_metadata.ifcUserId)
    const userData = userStats.result[0]

    // If user exists in the leaderboard, update the data, otherwise create a new entry
    const { data, error } = await supabase.from('if-stats-leaderboard').select('*').eq('ifc_user_id', user.id).maybeSingle()

    if (error) {
        console.error("Error syncing user to IFStats leaderboard:", error)
        return { error: "Error syncing user to IFStats leaderboard" }
    }

    if (data) {
        // Update existing entry
        const { data: updateData, error: updateError } = await supabase
            .from('if-stats-leaderboard')
            .update({
                ifc_username: userData.discourseUsername,
                online_flights: userData.onlineFlights,
                violations: userData.violations,
                xp: userData.xp,
                landing_count: userData.landingCount,
                flight_time: userData.flightTime,
                atc_operations: userData.atcOperations,
                atc_rank: userData.atcRank,
                grade: userData.grade,
            })
            .eq('ifc_user_id', user.id)

        if (updateError) {
            console.error("Error updating entry in IFStats leaderboard:", updateError)
            return { error: "Error updating entry in IFStats leaderboard" }
        }

        // console.log("User stats updated in IFStats leaderboard")
        return { success: true, message: "User stats updated in IFStats leaderboard" }
    }

    // Create a new entry (only if user doesn't exist)
    const { data: newData, error: newError } = await supabase.from('if-stats-leaderboard').insert({
        ifc_user_id: user.id,
        ifc_username: userData.discourseUsername,
        online_flights: userData.onlineFlights,
        violations: userData.violations,
        xp: userData.xp,
        landing_count: userData.landingCount,
        flight_time: userData.flightTime,
        atc_operations: userData.atcOperations,
        atc_rank: userData.atcRank,
        grade: userData.grade,
    })

    if (newError) {
        console.error("Error creating new entry in IFStats leaderboard:", newError)
        return { error: "Error creating new entry in IFStats leaderboard" }
    }

    return { success: true, message: "User synced to IFStats leaderboard" }

  } catch (err) {
    console.error("Error syncing user to IFStats leaderboard:", err)
  }
}