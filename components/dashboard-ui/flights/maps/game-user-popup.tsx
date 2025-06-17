"use client";

import { X } from "lucide-react";
import React from "react";
import Link from "next/link";
import { TbPlaneInflight } from "react-icons/tb";
import { LiaCompass } from "react-icons/lia";
import { PiSpeedometer } from "react-icons/pi";
import { BiMessageRoundedDots } from "react-icons/bi";
import { MdAirplanemodeActive } from "react-icons/md";
import { cn, getMinutesAgo } from "@/lib/utils";
import { RiCopilotFill } from "react-icons/ri";

const GameUserPopup = ({
  popupInfo,
  setPopupInfo,
  targetPilot,
  onTargetFound,
  gameActive,
}: {
  popupInfo: any;
  setPopupInfo: React.Dispatch<React.SetStateAction<any>>;
  targetPilot?: any;
  onTargetFound?: () => void;
  gameActive?: boolean;
}) => {
  // Check if this is the target pilot
  const isTargetPilot = gameActive && targetPilot && 
    popupInfo.username === targetPilot.username && 
    popupInfo.callsign === targetPilot.callsign;
  // For staff, bg blue
  // For Iflytics Users (role = user) = bg-gray
  return (
    <div
      className={cn(
        "absolute top-16 left-5 rounded-xl overflow-hidden font-sans w-[330px] shadow-2xl z-[1001] bg-white",
        popupInfo.role === "staff"
          ? "bg-blue-500 text-light"
          : popupInfo.role === "user"
          ? "bg-gradient-to-br from-gray to-dark !text-light"
          : ""
      )}
    >
      {/* Header */}
      <div
        className={cn(
          "p-6 pb-4 relative overflow-hidden",
          popupInfo.role === "staff"
            ? "bg-blue-500 text-light"
            : popupInfo.role === "user"
            ? "bg-gradient-to-br from-gray to-dark !text-light"
            : "bg-[#fffafa]"
        )}
      >
        <MdAirplanemodeActive
          className={cn(
            "text-gray-500/20 text-[7rem] rotate-90 absolute top-4 right-10",
            popupInfo.role === "staff" ? "text-light/20" : ""
          )}
        />
        <div className="flex justify-between items-start">
          <div>
            <div className="text-gray-500 text-6xl mb-1">
              {popupInfo.customImage ? (
                <img
                  src={new URL(popupInfo.customImage, import.meta.url).href}
                  alt="Custom avatar"
                  className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                />
              ) : (
                popupInfo.emoji
              )}
            </div>
            <div
              className={`text-2xl font-bold text-gray tracking-tight ${
                popupInfo.role === "staff"
                  ? "!text-light"
                  : popupInfo.role === "user"
                  ? "!text-light"
                  : ""
              }`}
            >
              {popupInfo.callsign}
            </div>
            {
                (popupInfo.role == "staff" || popupInfo.role == "user") && (
                    <span className="text-gray-300 text-sm font-medium">{popupInfo.role === "staff" ? "STAFF" : popupInfo.role === "user" ? "IFLYTICS USER" : ""}</span>
                )
            }
          </div>
        </div>
      </div>

      {/* Flight Details */}
      <div className="p-6 bg-[#fff5ee] rounded-t-xl shadow">
        <div className="space-y-4">
          <div id="pilot" className="flex items-center justify-between gap-2">
            <div>
              <div className="text-gray-500 font-medium mb-1 flex items-center gap-1">
                <RiCopilotFill className="text-gray-500" />
                Pilot
              </div>
              <div
                className={`text-gray-700 text-lg font-bold tracking-tight ${
                  popupInfo.role === "staff" ? "!text-blue-500" : ""
                }`}
              >
                {popupInfo.username || "Unknown"}{" "}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              {
                label: "Altitude",
                value: popupInfo.altitude,
                icon: <TbPlaneInflight className="text-gray-500" />,
                unit: "ft",
              },
              {
                label: "Speed",
                value: popupInfo.speed,
                icon: <PiSpeedometer className="text-gray-500" />,
                unit: "kts",
              },
              {
                label: "Heading",
                value: popupInfo.heading,
                icon: <LiaCompass className="text-gray-500" />,
                unit: "°",
              },
            ].map((item: any) => (
              <div
                className="bg-gradient-to-br from-[#FFE7D5] to-[#ffca9c] px-2 py-3 rounded-lg flex flex-col items-center gap-2 shadow-md"
                key={item.label}
              >
                <div className="text-gray-600 font-extrabold tracking-tight">
                  {item.value ? Math.round(item.value) : "N/A"} {item.unit}
                </div>

                <div className="flex flex-col items-center">
                  {item.icon}
                  <div className="text-gray-500 text-xs font-semibold mb-1">
                    {item.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className={cn("relative p-4 pr-6 rounded-lg shadow-md flex flex-col gap-1", popupInfo.username ? "bg-gradient-to-br from-[#1E3B70] to-[#29539B]" : "bg-gradient-to-br from-yellow-600 to-yellow-800")}>
            <BiMessageRoundedDots className="text-light text-2xl absolute top-2 right-2" />
            <div className="font-semibold font-mono text-light tracking-tight text-lg">
              {popupInfo.compliment}
            </div>
          </div>

          <div className="flex gap-2 flex-col">
            <div className="flex items-center gap-2">
              <span className="text-gray-500 text-sm font-medium">Status:</span>
              {popupInfo.isConnected ? (
                <span className="text-green-500 text-sm font-medium flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full inline-block mr-1 animate-pulse"></div>
                  Connected
                </span>
              ) : (
                <span className="text-red-500 text-sm font-medium flex items-center gap-1">
                  <div className="w-2 h-2 bg-red-400 rounded-full inline-block mr-1 animate-pulse"></div>
                  Disconnected
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-gray-500 text-sm font-medium">
                Last Seen:
              </span>
              <span className="text-gray-500 text-sm font-medium">
                {getMinutesAgo(popupInfo.lastReport)}
              </span>
            </div>
          </div>
          
          {/* Find Button for Target Pilot */}
          {isTargetPilot && (
            <div className="mt-4">
              <button
                onClick={() => {
                  onTargetFound?.();
                  setPopupInfo(null);
                }}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg text-lg shadow-lg transition-colors animate-pulse"
              >
                🎯 Found! Click to Win!
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Close Button */}
      <button
        onClick={() => setPopupInfo(null)}
        className="absolute top-4 right-4 bg-gray-200 hover:bg-gray-300 border-none rounded-full w-8 h-8 text-gray-600 text-lg cursor-pointer flex items-center justify-center transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default GameUserPopup;
