import React from "react";
import { GoCopilot } from "react-icons/go";

const ProfileHeader = ({
  name,
  grade,
  organization,
}: {
  name: string;
  grade: number;
  organization: string;
}) => {
  const gradeColor: string =
    grade === 5
      ? "bg-yellow-500"
      : grade === 4
      ? "bg-green-500"
      : grade === 3
      ? "bg-purple-500"
      : grade === 2
      ? "bg-blue-500"
      : "bg-dark";
  return (
    <div className="flex gap-4 self-start sm:gap-8 items-center justify-center">
      <GoCopilot className="text-[4rem]" />
      <div className="flex flex-col text-left">
        <div className={`font-semibold text-xs ${gradeColor} px-2 py-0.5 rounded-full self-start text-white`}>Grade {grade}</div>
        <b className="text-2xl tracking-tight">{name}</b>
        <div className="font-medium text-sm">
          Organization: {organization ? organization : "Not Joined"}
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
