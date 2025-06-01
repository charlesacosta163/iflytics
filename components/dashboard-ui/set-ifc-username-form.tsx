import React from "react";
import { Card } from "../ui/card";
import SubmitIFCButton from "./submit-ifc-button";
import { updateIFCUsernameAndCreateProfile } from "@/lib/supabase/user-actions";
import { RiCopilotFill } from "react-icons/ri";
import { LuPencil } from "react-icons/lu";
import { FiUser } from "react-icons/fi";

import { redirect } from "next/navigation";



const SetIFCUsernameForm = () => {
  return (
      <Card className="max-w-[600px] w-full p-8 bg-gradient-to-br from-gray to-dark text-light rounded-[25px]">
        <form
          action={async (formData) => {
            "use server";

            const ifcUsername = formData.get("ifc-username");
            const displayName = formData.get("display-name");
            const bio = formData.get("bio");

           await updateIFCUsernameAndCreateProfile(ifcUsername as string, displayName as string, bio as string);
          }}
          className="flex flex-col gap-4"
        >
          <header>
            <h1 className="text-2xl font-bold">Lets Set Up Your User Profile</h1>
          </header>

          <div className="flex flex-col gap-2">
            <label htmlFor="ifc-username" className="text-sm font-semibold">
              IFC Username
            </label>
            <div className="text-white relative">
              <input
                type="text"
                name="ifc-username"
                className="bg-gray-700 pl-10 pr-4 py-2 font-medium rounded-lg outline-none w-full ring-2 ring-red-400"
                placeholder="Enter your IFC Username"
                required
              />
              <RiCopilotFill className="absolute left-[10px] top-[12px] font-bold text-lg" />
            </div>
          </div>

          <span className="text-sm font-semibold text-red-400">
            This action will be irreversible.
          </span>

          <div className="flex flex-col gap-2">
            <label htmlFor="ifc-username" className="text-sm font-semibold">
              Your Display Name
            </label>
            <div className="text-white relative">
              <input
                type="text"
                name="display-name"
                className="bg-gray-700 pl-10 pr-4 py-2 font-medium rounded-lg outline-none w-full"
                placeholder="Enter your Display Name (e.g. Bacon Pancake)"
                required
              />
              <FiUser className="absolute left-[10px] top-[12px] font-bold text-lg" />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="ifc-username" className="text-sm font-semibold">
              Bio (Optional)
            </label>
            <div className="text-white relative">
              <textarea
                name="bio"
                className="bg-gray-700 pl-10 pr-4 py-2 font-medium rounded-lg outline-none w-full resize-none h-[100px]"
                placeholder="A short bio about yourself (e.g. I'm a french bulldog who loves to eat bacon and pancakes)"
              />
              <LuPencil className="absolute left-[10px] top-[12px] font-bold text-lg" />
            </div>
          </div>

          <SubmitIFCButton />
        </form>
      </Card>
  );
};
export default SetIFCUsernameForm;
