import EditUserProfileForm from "@/components/dashboard-ui/edit-userprofile-form";
import { getUserProfile, getUser } from "@/lib/supabase/user-actions";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import React from "react";

const EditProfilePage = async () => {
  // Get the current user's profile - no URL parameter needed
  const userProfile = await getUserProfile();

  if (!userProfile) {
    return (
      <main className="flex flex-col items-center justify-center min-h-full w-full">
        <div className="text-center space-y-4">
          <div className="text-6xl">😕</div>
          <h2 className="text-2xl font-bold text-gray-800">Profile Not Found</h2>
          <p className="text-gray-600">We couldn't find your profile information.</p>
          <Link 
            href="/dashboard/profile" 
            className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Profile
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col items-center min-h-full w-full py-6">
      <div className="w-full max-w-2xl space-y-6">
        {/* Header with back button */}
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard/profile" 
            className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Profile
          </Link>
        </div>

        <div className="text-center">
          <h1 className="text-4xl font-bold dark:text-light bg-gradient-to-r from-gray-600 to-dark py-0.5 bg-clip-text text-transparent tracking-tight">
            Edit Your Profile
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Update your personal information and bio</p>
        </div>

        {/* Form container with matching styling */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
          <EditUserProfileForm 
            id={userProfile.ifc_user_id} 
            display_name={userProfile.display_name} 
            bio={userProfile.bio} 
            avatar_url={userProfile.avatar_url} 
          />
        </div>
      </div>
    </main>
  );
};

export default EditProfilePage; 