import React from "react";
import { Card } from "../ui/card";
import SubmitIFCButton from "./submit-ifc-button";
import { updateIFCUsername } from "@/lib/supabase/user-actions";
import { RiCopilotFill } from "react-icons/ri";
import { redirect } from "next/navigation";
const SetIFCUsernameForm = () => {
  return (
      <Card className="max-w-[600px] w-full p-8 bg-gradient-to-br from-gray to-dark text-light rounded-[25px]">
        <form
          action={async (formData) => {
            "use server";

            const ifcUsername = formData.get("ifc-username");
            await updateIFCUsername(ifcUsername as string);
          }}
          className="flex flex-col gap-4"
        >
          <header>
            <h1 className="text-2xl font-bold">Lets Set Up Your IFC Username</h1>
          </header>

          <div className="flex flex-col gap-2">
            <label htmlFor="ifc-username" className="text-sm font-semibold">
              IFC Username
            </label>
            <div className="text-white relative">
              <input
                type="text"
                name="ifc-username"
                className="bg-gray-700 pl-10 pr-4 py-2 font-medium rounded-lg outline-none w-full"
                placeholder="Enter your IFC Username"
                required
              />
              <RiCopilotFill className="absolute left-[10px] top-[12px] font-bold text-lg" />
            </div>
          </div>

          <span className="text-sm font-semibold text-red-400">
            This action will not be reversible.
          </span>

          <SubmitIFCButton />
        </form>
      </Card>
  );
};
export default SetIFCUsernameForm;
