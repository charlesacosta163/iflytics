import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getUser, getUserProfile } from "@/lib/supabase/user-actions";
import Image from "next/image";

import { SiGithubcopilot } from "react-icons/si";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FaUser } from "react-icons/fa";
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Profile - IFlytics | Your Infinite Flight Statistics",
  description: "View your Infinite Flight statistics with advanced data visualization, real-time flight maps, leaderboards, and interactive games. Join thousands of pilots exploring their aviation data.",
  keywords: "infinite flight, flight tracking, aviation analytics, pilot statistics, flight data, expert server, flight simulator, aviation dashboard, pilot leaderboards, flight history, iflytics profile",
}

const ProfilePage = async () => {
  let userProfile = await getUserProfile();

  if (!userProfile) {
    return <div>No user profile found</div>;
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-full w-full">
      <div className="w-full max-w-2xl space-y-6">

        <div className="flex flex-col gap-2 w-full items-center">
            <span className="text-4xl font-bold bg-gradient-to-r from-gray-600 to-dark bg-clip-text text-transparent tracking-tight">
            Your Profile
            </span>
            <span className="text-gray-600 flex items-center gap-2">
            <FaUser className="text-gray-500" />
            Your profile and settings
            </span>
        </div>

        <div className="flex sm:flex-row flex-col gap-6 w-full px-6 py-8 bg-white rounded-xl shadow-lg border border-gray-100">
          <div className="self-center sm:self-start shrink-0">
            {userProfile?.avatar_url ? (
              <img
                src={userProfile?.avatar_url}
                alt="User avatar"
                className="rounded-full w-[120px] h-[120px] object-cover border-4 border-gray-100 shadow-md"
              />
            ) : (
              <div className="w-[120px] h-[120px] bg-gradient-to-br from-gray to-dark rounded-full flex items-center justify-center shadow-md">
                <SiGithubcopilot className="text-5xl text-white" />
              </div>
            )}
          </div>

          <div className="flex-1 flex flex-col gap-5">
            <header className="text-center sm:text-left">
              <h3 className="text-3xl font-bold text-gray-800">
                {userProfile?.display_name}
              </h3>
              <p className="text-sm text-gray-500 font-medium mt-1">
                @{userProfile?.ifc_username}
              </p>
            </header>

            <section className="p-5 rounded-xl bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200">
              <p className="text-gray-700 font-medium leading-relaxed">
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
                <p className="text-sm text-gray-600 font-semibold">
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
      </div>
    </main>
  );
};

export default ProfilePage;
