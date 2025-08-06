export type AccessLevel = "free" | "premium" | "lifetime"

export type Subscription = {
    id: string;
    plan: AccessLevel;
    status: string;
    created_at: string;
    ifc_user_id: string;
    role: string;
}

export function getAccessLevel(subscription: Subscription) {
    // Role checks
    if (['admin', 'tester'].includes(subscription.role)) {
       return "lifetime"
    }

    // Check subscription plan
    if (subscription.plan === "lifetime") 
        return "lifetime"

    if (subscription.plan === "premium")
        return "premium"

    return "free"
}

// Helpers
export function hasLifetimeAccess(subscription: Subscription) {
    return getAccessLevel(subscription) === 'lifetime';
}

export function hasPremiumAccess(subscription: Subscription): boolean {
    const level = getAccessLevel(subscription);
    return level === 'premium' || level === 'lifetime';
}