"use server"

import { supabaseAdmin } from "@/lib/supabase/webhook-client";
import { Subscription } from "./helpers";

const SUBSCRIPTION_ENABLED = process.env.NEXT_PUBLIC_SUBSCRIPTION_ENABLED === 'true';

export async function getUserSubscription(userId: string) {
    try {
        // Get user profile first
        const { data: userProfile } = await supabaseAdmin
            .from('user_profiles')
            .select('*')
            .eq('ifc_user_id', userId)
            .single();

        const { role } = userProfile;

        // If subscriptions are disabled, return dev subscription with correct role
        if (!SUBSCRIPTION_ENABLED) {
            return {
                id: "dev-subscription",
                plan: (role === "admin" || role === "tester") ? "lifetime" : "premium",
                status: "active",
                created_at: new Date().toISOString(),
                ifc_user_id: userId,
                role: role, // Use the actual role from userProfile
            }
        }

        // Handle admin and tester roles
        if (role === "admin" || role === "tester") {
            return {
                id: `${role}-subscription`,
                plan: "lifetime",
                status: "active",
                created_at: new Date().toISOString(),
                ifc_user_id: userId,
                role: role,
            }
        }

        // Handle regular users
        if (role === "user") {
            const { data: subscription } = await supabaseAdmin
                .from('subscriptions')
                .select('*')
                .eq('ifc_user_id', userId)
                .single();

            if (subscription) {
                // Check if subscription is actually active
                if (subscription.status !== "active") {
                    return {
                        id: subscription.id,
                        plan: "free",  // Downgrade to free if not active
                        status: subscription.status,
                        created_at: subscription.created_at,
                        ifc_user_id: subscription.ifc_user_id,
                        role: role,
                    }
                }
                return {
                    id: subscription.id,
                    plan: subscription.plan,
                    status: subscription.status,
                    created_at: subscription.created_at,
                    ifc_user_id: subscription.ifc_user_id,
                    role: role,
                }
            }

            return {
                id: "free-subscription",
                plan: "free",
                status: "active",
                created_at: new Date().toISOString(),
                ifc_user_id: userId,
                role: role,
            }
        }
    } catch (error) {
        console.error("Failed to fetch user profile:", error);
        return {
            id: "error-subscription",
            plan: "free",
            status: "active",
            created_at: new Date().toISOString(),
            ifc_user_id: userId,
            role: "user",
        }
    }
}