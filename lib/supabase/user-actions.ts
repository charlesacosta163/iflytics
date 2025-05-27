'use server'

import { redirect } from "next/navigation"
import { createClient } from "./server"

// Infinite Flight Info Actions
import { getUserId } from "../actions"

const supabase = await createClient()

export async function getUser() {
  const { data, error } = await supabase.auth.getUser()
  
  if (error || !data?.user) {
    redirect('/auth/login')
  }

  return data.user
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

export async function updateIFCUsername(ifcUsername: string) {
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
    
    // If we get here, the update was successful
    redirect('/setup/success')
}