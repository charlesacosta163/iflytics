"use client";

import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { deleteUser } from "@/lib/supabase/user-actions";

import { SiGithubcopilot } from "react-icons/si";
import Link from "next/link";
import { FaUser, FaTrash, FaExclamationTriangle, FaCog, FaCrown, FaCheck } from "react-icons/fa";
import { customUserImages } from "@/lib/data";
import { useEffect } from "react";

// Stripe
import { SubscribeButton } from "@/components/dashboard-ui/stripe/subscribe-button";
import { getUserSubscription } from "@/lib/stripe/stripe-actions";
import { CancelSubscriptionButton } from "./stripe/cancel-subscription-button";
import { ReactivateButton } from "./stripe/reactivate-subscription-button";
import { LifetimeButton } from "./stripe/lifetime-plan-button";
import { LuCreditCard } from "react-icons/lu";
import PromoReminders from "./stripe/promo-reminders";
import ProfileCardPicker from "./profile-card-picker";

interface User {
  id: string;
  ifc_user_id: string;
  created_at: string;
  display_name: string;
  bio: string;
  ifc_username?: string;
}

// export const metadata: Metadata = {
//   title: "Profile - IFlytics | Your Infinite Flight Statistics",
//   description: "View your Infinite Flight statistics with advanced data visualization, real-time flight maps, leaderboards, and interactive games. Join thousands of pilots exploring their aviation data.",
//   keywords: "infinite flight, flight tracking, aviation analytics, pilot statistics, flight data, expert server, flight simulator, aviation dashboard, pilot leaderboards, flight history, iflytics profile",
// }

const ENABLE_SUBSCRIPTIONS = true;

const ProfileWrapper = ({
  userProfile,
  subscription,
}: {
  userProfile: any;
  subscription: any;
}) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const [isSubscriptionLoading, setIsSubscriptionLoading] = useState(false);
  const [subscriptionError, setSubscriptionError] = useState<string | null>(null);

  const userCustomImage = customUserImages.find(
    (user) => user.username === userProfile?.ifc_username
  )?.image;

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== userProfile.ifc_username) {
      setDeleteError(
        "Username doesn't match. Please type your exact username to confirm."
      );
      return;
    }

    setIsDeleting(true);
    setDeleteError("");

    try {
      const result = await deleteUser();
      if (result?.error) {
        setDeleteError(result.error);
        setIsDeleting(false);
      }
      // If successful, the deleteUser function will redirect to login
    } catch (error) {
      setDeleteError("An unexpected error occurred. Please try again.");
      setIsDeleting(false);
    }
  };

  const resetDeleteDialog = () => {
    setDeleteConfirmText("");
    setDeleteError("");
    setIsDeleting(false);
  };

  const isDeleteButtonEnabled =
    deleteConfirmText === userProfile.ifc_username && !isDeleting;

  return (
    <main className="flex flex-col min-h-full w-full">
      <div className="w-full space-y-6 self-start">
        <div className="flex flex-col gap-2 w-full items-center bg-gray-50 dark:bg-gray-800 rounded-[15px] border-2 border-gray-200 dark:border-gray-700 p-4">
          <span className="text-4xl font-bold dark:text-light bg-gradient-to-r from-gray-600 to-dark bg-clip-text text-transparent tracking-tight">
            Your Profile
          </span>
          <span className="text-gray-600 dark:text-gray-300 flex items-center gap-2">
            <FaUser className="text-gray-500" />
            Your profile, settings and billing
          </span>
        </div>
         
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Tabs defaultValue="profile" className="w-full">
          <TabsList className="w-full rounded-[20px] bg-gray-100 dark:bg-gray-800 border-4 border-gray-200 dark:border-gray-700">
            <TabsTrigger
              value="profile"
              className="rounded-md flex gap-2 items-center justify-center border-none"
            >
              <FaUser className="text-gray-500" />
              Profile
            </TabsTrigger>
            <TabsTrigger
              value="billing"
              className="rounded-md flex gap-2 items-center justify-center border-none"
            >
              <LuCreditCard className="text-gray-500" />
              Billing
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="rounded-md flex gap-2 items-center justify-center border-none"
            >
              <FaCog className="text-gray-500" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <div className="flex sm:flex-row flex-col gap-6 w-full px-6 py-8 bg-white dark:bg-gray-800  shadow-lg dark:text-light rounded-[25px] border-4 border-gray-200 dark:border-gray-700">
              <div className="self-center sm:self-start shrink-0">
                <div
                  className={`w-[120px] h-[120px] rounded-full flex items-center justify-center shadow-md border-4 border-gray-100 ${
                    userCustomImage
                      ? "bg-cover bg-center bg-no-repeat"
                      : "bg-gradient-to-br from-gray to-dark"
                  }`}
                  style={
                    userCustomImage
                      ? { backgroundImage: `url(${userCustomImage})` }
                      : {}
                  }
                >
                  {!userCustomImage && (
                    <SiGithubcopilot className="text-5xl text-white" />
                  )}
                </div>
              </div>

              <div className="flex-1 flex flex-col gap-5">
                <header className="text-center sm:text-left">
                  <h3 className="text-3xl font-bold text-gray-800 dark:text-light">
                    {userProfile?.display_name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-300 font-medium mt-1">
                    @{userProfile?.ifc_username}
                  </p>
                </header>

                <section className="p-5 rounded-xl dark:bg-gray-700 bg-gray-200">
                  <p className="text-gray-700 dark:text-gray-300 font-medium leading-relaxed">
                    {userProfile?.bio ||
                      "No bio added yet. Tell us about yourself! ✈️"}
                  </p>
                </section>

                <div className="flex flex-col sm:flex-row sm:justify-between gap-4 items-center">
                  <Link
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all duration-300 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                    href="/dashboard/profile/edit"
                  >
                    Edit Profile
                  </Link>

                  <div className="text-center sm:text-right">
                    <p className="text-xs text-gray-400 font-medium">
                      Member since
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300 font-semibold">
                      {new Date(userProfile?.created_at).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="billing">
            <div className="flex flex-col gap-6 w-full px-6 py-8 bg-white dark:bg-gray-800 shadow-lg dark:text-light rounded-[25px] border-4 border-gray-200 dark:border-gray-700">
              <div className="flex flex-col gap-4">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-light flex items-center gap-2">
                  <LuCreditCard  />
                  Billing
                </h2>
              </div>
              {(ENABLE_SUBSCRIPTIONS || userProfile.role === 'admin' || userProfile.role === 'tester') && (
                <div className="space-y-4">
                  {/* Subscription Header */}
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-semibold">Subscription</h3>
                    {subscription && (
                      <div className="text-xs text-gray-500">
                        Member since: {new Date(subscription.created_at).toLocaleDateString()}
                      </div>
                    )}
                  </div>

                  {/* Debug Info - REMOVE AFTER TESTING */}
                  {/* <div className="text-xs text-red-500 border border-red-200 p-2 rounded">
                    DEBUG: 
                    ENABLE_SUBSCRIPTIONS: {ENABLE_SUBSCRIPTIONS.toString()}<br/>
                    subscription: {JSON.stringify(subscription)}<br/>
                    isSubscriptionLoading: {isSubscriptionLoading.toString()}<br/>
                    subscriptionError: {subscriptionError || 'null'}
                  </div> */}

                  {/* Loading State */}
                  {isSubscriptionLoading && (
                    <div className="animate-pulse space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  )}

                  {/* Error State */}
                  {subscriptionError && (
                    <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm">
                      {subscriptionError}
                      <Button 
                        variant="link" 
                        className="text-red-700 dark:text-red-300 text-xs ml-2"
                        onClick={() => setSubscriptionError(null)}
                      >
                        Dismiss
                      </Button>
                    </div>
                  )}

                  {/* Subscription Content */}
                  {!isSubscriptionLoading && (
                    <div className="rounded-lg border p-4 space-y-3">
                      {subscription && subscription.plan === "lifetime" ? (
                        // Lifetime Plan
                        <div className="flex flex-col gap-0.5">
                          <span className="text-green-600 dark:text-green-400 font-medium flex items-center gap-2">
                            <FaCrown className="text-yellow-500" />
                            Lifetime Member
                          </span>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            Enjoy unlimited access to all features forever.
                          </p>
                        </div>
                      ) : subscription && subscription.plan === "premium" ? (
                        // Premium Plan
                        <div className="space-y-3">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-blue-600 dark:text-blue-400 font-medium">
                              Premium Member
                            </span>
                            {!subscription.cancel_at ? (
                              <div className="text-sm text-gray-500">
                                Next billing date: {new Date(subscription.current_period_end).toLocaleDateString()}
                              </div>
                            ) : (
                              <div className="text-sm text-orange-600 dark:text-orange-400">
                                Your subscription will end on {new Date(subscription.cancel_at).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                          
                          {/* Subscription Management */}
                          <div className="border-t pt-3 space-y-3">
                            <div className="flex flex-col gap-2">
                              <span className="text-sm font-medium">Subscription Management</span>
                              {!subscription.cancel_at ? (
                                // Active subscription - show cancel button
                                <CancelSubscriptionButton subscriptionId={subscription.stripe_subscription_id} />
                              ) : (
                                // Canceled subscription - show reactivate button and notice
                                <div className="space-y-2">
                                  <div className="p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                                    <p className="text-sm text-orange-700 dark:text-orange-300">
                                      ⚠️ Your subscription is scheduled for cancellation on {new Date(subscription.cancel_at).toLocaleDateString()}. You'll continue to have access until then.
                                    </p>
                                  </div>
                                  <ReactivateButton subscriptionId={subscription.stripe_subscription_id} />
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Upgrade to Lifetime Option - only show if subscription is canceled */}
                          {subscription.cancel_at && (
                            <div className="border-t pt-3">
                              <div className="flex flex-col gap-2">
                                <span className="text-sm font-medium">Want to upgrade to Lifetime?</span>
                                <p className="text-xs text-gray-500">
                                  Get permanent access and never worry about renewals.
                                </p>
                                <LifetimeButton isPremiumUser={true} />
                              </div>
                            </div>
                          )}
                          
                          {/* Message for active premium users */}
                          {!subscription.cancel_at && (
                            <div className="border-t pt-3">
                              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                <p className="text-sm text-blue-700 dark:text-blue-300">
                                  💡 You can upgrade to Lifetime after your current billing period ends or by canceling your current subscription.
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        // Free Plan (when subscription is null OR plan is "free")
                        <div className="space-y-4">
                          <div className="flex flex-col gap-2">
                            <span className="text-blue-600 dark:text-blue-400 font-medium">
                              Free Plan
                            </span>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Unlock premium features to enhance your flight tracking experience
                            </p>
                          </div>

                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            <SubscribeButton />
                            <div className="relative">
                              <LifetimeButton />
                              <span className="absolute -top-2 -right-2 bg-indigo-500 text-white text-xs px-2 py-0.5 rounded-full animate-bounce">
                                Best Value
                              </span>
                            </div>
                          </div>

                          <div className="mt-4 pt-4 border-t">
                            <h4 className="font-medium mb-2">Premium Features:</h4>
                            <ul className="grid grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-300">
                              <li className="flex items-center gap-2">
                                <FaCheck className="text-green-500" />
                                Access to Flight Frames
                              </li>
                              <li className="flex items-center gap-2">
                                <FaCheck className="text-green-500" />
                                Route Analysis
                              </li>
                              <li className="flex items-center gap-2">
                                <FaCheck className="text-green-500" />
                                Aircraft Analysis
                              </li>
                              <li className="flex items-center gap-2">
                                <FaCheck className="text-green-500" />
                                And more!
                              </li>
                              {/* Add more premium features */}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              <PromoReminders />

            </div>
          </TabsContent>
          <TabsContent value="settings">
            {/* Danger Zone */}
            <div className="w-full flex justify-between gap-2 items-center py-4 px-6 bg-red-50 dark:bg-gray-700 rounded-[25px] border-4 border-red-200 dark:border-red-700">
                <div className="flex items-center gap-2">
                  <FaExclamationTriangle className="dark:text-red-300 text-red-500 text-xl" />
                  <h3 className="text-xl font-bold text-red-700 dark:text-red-400">
                    Danger Zone
                  </h3>
                </div>

                <Dialog
                  open={isDeleteDialogOpen}
                  onOpenChange={(open) => {
                    setIsDeleteDialogOpen(open);
                    if (!open) resetDeleteDialog();
                  }}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="destructive"
                      className="bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white px-3 py-1 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center gap-2"
                    >
                      <FaTrash className="text-xs" />
                      Delete Account
                    </Button>
                  </DialogTrigger>

                  <DialogContent className="sm:max-w-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2 text-red-700 dark:text-red-300">
                        <FaExclamationTriangle className="text-red-500 dark:text-red-500" />
                        Delete Account
                      </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                      <div className="bg-red-50 dark:bg-gray-700 border border-red-200 dark:border-red-400 rounded-lg p-4">
                        <p className="text-red-700 dark:text-red-300 text-sm font-medium">
                          ⚠️ This action cannot be undone. This will permanently
                          delete your account and all associated data.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Type your username{" "}
                          <span className="font-mono bg-gray-100 px-1 rounded text-gray-900">
                            {userProfile.ifc_username}
                          </span>{" "}
                          to confirm:
                        </label>
                        <input
                          type="text"
                          value={deleteConfirmText}
                          onChange={(e) => {
                            setDeleteConfirmText(e.target.value);
                            setDeleteError("");
                          }}
                          placeholder={userProfile.ifc_username}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          disabled={isDeleting}
                        />
                      </div>

                      {deleteError && (
                        <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded p-2">
                          {deleteError}
                        </div>
                      )}

                      <div className="flex gap-3 pt-2">
                        <Button
                          variant="outline"
                          onClick={() => setIsDeleteDialogOpen(false)}
                          disabled={isDeleting}
                          className="flex-1 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-light"
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={handleDeleteAccount}
                          disabled={!isDeleteButtonEnabled}
                          className={`flex-1 bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 dark:text-light disabled:bg-gray-300 disabled:cursor-not-allowed ${
                            isDeleting ? "animate-pulse" : ""
                          }`}
                        >
                          {isDeleting ? (
                            <span className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Deleting...
                            </span>
                          ) : (
                            <>
                              <FaTrash className="mr-2" />
                              Delete Account
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
          </TabsContent>
            </Tabs>

            <ProfileCardPicker username={userProfile.ifc_username} />
          
         </div>
      </div>
    </main>
  );
};

export default ProfileWrapper;
