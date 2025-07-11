"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getUser, getUserProfile, deleteUser } from "@/lib/supabase/user-actions";
import Image from "next/image";

import { SiGithubcopilot } from "react-icons/si";
import Link from "next/link";
import { FaUser, FaTrash, FaExclamationTriangle } from "react-icons/fa";
import { customUserImages } from "@/lib/data";
import { useEffect } from "react";

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

const ProfilePage = () => {
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    const fetchUserProfile = async () => {
      const profile = await getUserProfile();
      setUserProfile(profile);
    };
    fetchUserProfile();
  }, []);

  if (!userProfile) {
    return <div>Loading...</div>;
  }

  const userCustomImage = customUserImages.find((user) => user.username === userProfile?.ifc_username)?.image;

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== userProfile.ifc_username) {
      setDeleteError("Username doesn't match. Please type your exact username to confirm.");
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

  const isDeleteButtonEnabled = deleteConfirmText === userProfile.ifc_username && !isDeleting;

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
            <div 
              className={`w-[120px] h-[120px] rounded-full flex items-center justify-center shadow-md border-4 border-gray-100 ${
                userCustomImage 
                  ? 'bg-cover bg-center bg-no-repeat' 
                  : 'bg-gradient-to-br from-gray to-dark'
              }`}
              style={userCustomImage ? { backgroundImage: `url(${userCustomImage})` } : {}}
            >
              {!userCustomImage && (
                <SiGithubcopilot className="text-5xl text-white" />
              )}
            </div>
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
            {/* Danger Zone */}
        <div className="w-full py-4 px-6 bg-red-50 rounded-xl ">
          <div className="flex items-center gap-2 mb-2">
            <FaExclamationTriangle className="text-red-500 text-xl" />
            <h3 className="text-xl font-bold text-red-700">Danger Zone</h3>
          </div>
          
          <p className="text-red-600 text-sm mb-4 leading-relaxed">
            This action cannot be undone, it will permanently delete your account and all associated data.
          </p>

          <Dialog open={isDeleteDialogOpen} onOpenChange={(open) => {
            setIsDeleteDialogOpen(open);
            if (!open) resetDeleteDialog();
          }}>
            <DialogTrigger asChild>
              <Button 
                variant="destructive" 
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center gap-2"
              >
                <FaTrash className="text-xs" />
                Delete Account
              </Button>
            </DialogTrigger>
            
            <DialogContent className="sm:max-w-md bg-white border border-gray-200">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-red-700">
                  <FaExclamationTriangle className="text-red-500" />
                  Delete Account
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-700 text-sm font-medium">
                    ⚠️ This action cannot be undone. This will permanently delete your account and all associated data.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Type your username <span className="font-mono bg-gray-100 px-1 rounded text-gray-900">{userProfile.ifc_username}</span> to confirm:
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
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDeleteAccount}
                    disabled={!isDeleteButtonEnabled}
                    className={`flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed ${
                      isDeleting ? 'animate-pulse' : ''
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
          </div>
          
        </div>

      </div>
    </main>
  );
};

export default ProfilePage;
