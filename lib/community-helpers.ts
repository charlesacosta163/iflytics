import { getUsersSubscribedToPlans } from '@/lib/supabase/user-actions'

export function separateCommunityUsersByMonth(users: any[]) {
    /* Format will be

    {
    month: "January 2026",
    users: [
        {
            id: string,
            ifc_user_id: string,
            created_at: string,
            display_name: string,
            bio: string,
            ifc_username?: string
        }
    ]
    }, etc...

    */

    const map = new Map<string, { label: string; date: Date; users: any[] }>();

    for (const user of users) {
      const date = new Date(user.created_at);
      // Normalize to the first of the month so grouping is stable
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      const label = date.toLocaleString("default", { month: "long", year: "numeric" });
  
      if (!map.has(key)) {
        map.set(key, { label, date: new Date(date.getFullYear(), date.getMonth(), 1), users: [] });
      }
  
      map.get(key)!.users.push(user);
    }
  
    // Sort descending (most recent first)
    return Array.from(map.values())
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .map(({ label, users }) => ({ month: label, users }));
  }

export async function separateUsersByPlan(users: any[]) {
    /* Format will be

    {
    plan: "Premium",
    users: [
        {
            id: string,
            ifc_user_id: string,
            created_at: string,
            display_name: string,
            bio: string,
            ifc_username?: string
        }
    ]
    }, etc...

    */

    // Algorithm:
    
    // Get all users subscribed to plans
    // Match users ifc_user_id to users in the users array
    // Add users to the plan array
    // Return the array

    const usersSubscribedToPlans = await getUsersSubscribedToPlans()

    if (usersSubscribedToPlans.error) {
        console.error("Error getting users subscribed to plans:", usersSubscribedToPlans.error)
        return { error: "Error getting users subscribed to plans", data: null }
    }

    const map = new Map<string, any[]>()

    for (const subscription of usersSubscribedToPlans.data ?? []) {
        const userProfile = users.find((u: any) => u.ifc_user_id === subscription.ifc_user_id)
        if (!userProfile) continue

        const plan = subscription.plan as string
        if (plan === 'free') continue
        if (!map.has(plan)) {
            map.set(plan, [])
        }
        map.get(plan)!.push(userProfile)
    }

    return Array.from(map.entries()).map(([plan, users]) => ({ plan, users }))

}