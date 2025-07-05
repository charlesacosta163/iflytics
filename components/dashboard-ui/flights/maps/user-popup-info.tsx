"use client";

import { X, ChevronRight, ChevronLeft } from "lucide-react";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { TbPlaneInflight } from "react-icons/tb";
import { LiaCompass } from "react-icons/lia";
import { PiSpeedometer } from "react-icons/pi";
import { BiMessageRoundedDots } from "react-icons/bi";
import { MdAirplanemodeActive } from "react-icons/md";
import { cn, getMinutesAgo } from "@/lib/utils";
import { RiCopilotFill } from "react-icons/ri";

import { CgArrowLongRightC } from "react-icons/cg";
import { LuPlaneTakeoff, LuPlaneLanding, LuMap, LuPlane } from "react-icons/lu";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";

import {
  getUserFlightInfo,
  getUserFlightPlan,
  getAircraftAndLivery,
} from "@/lib/actions";
import { matchAircraftNameToImage } from "@/lib/cache/flightinsightsdata";

const UserPopupInfo = ({
  popupInfo,
  setPopupInfo,
}: {
  popupInfo: any;
  setPopupInfo: React.Dispatch<React.SetStateAction<any>>;
}) => {
  const [flightInfo, setFlightInfo] = useState<any>(null);
  const [flightPlan, setFlightPlan] = useState<any>(null);
  const [isHidden, setIsHidden] = useState(false);
  const [aircraft, setAircraft] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAllFlightData = async () => {
      setIsLoading(true);
      
      try {
        // Add timeout to prevent hanging
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 10000) // 10 second timeout
        );

        // Fetch data with timeout
        const [flightInfo, flightPlan, aircraft] = await Promise.race([
          Promise.all([
            getUserFlightInfo(popupInfo.userId, popupInfo.flightId),
            getUserFlightPlan(popupInfo.flightId),
            getAircraftAndLivery(popupInfo.aircraftId, popupInfo.liveryId),
          ]),
          timeoutPromise
        ]) as [any, any, any];

        // Set flight info
        setFlightInfo(flightInfo);
        setAircraft(aircraft);

        // Set flight plan (with your existing logic)
        if (flightPlan?.flightPlanItems?.length > 0) {
          setFlightPlan(flightPlan);
        } else {
          setFlightPlan(null);
        }
      } catch (error) {
        console.error("Error fetching flight data:", error);
        setFlightInfo(null);
        setFlightPlan(null);
        setAircraft({
          aircraftName: "Unknown Aircraft",
          liveryName: "Unknown Livery",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllFlightData();
  }, [popupInfo.flightId, popupInfo.userId]);

  // If originAirport exists, use it, else the first flight plan item, if that doesn't exist, "N/A"
  const originAirportFinal =
    flightInfo?.originAirport ||
    flightPlan?.flightPlanItems?.at(0)?.name ||
    "N/A";

  // If destinationAirport exists, use it, else the last flight plan item, if that doesn't exist, "N/A"
  const destinationAirportFinal =
    flightInfo?.destinationAirport ||
    flightPlan?.flightPlanItems?.at(-1)?.name ||
    "N/A";

  return (
    // Mod is purple
    <div
      className={cn(
        "absolute top-16 !rounded-xl font-sans w-[330px] shadow-2xl z-[1001] bg-white transition-transform duration-300",
        isHidden ? "left-[-290px]" : "left-5", // Slide mostly off-screen when hidden
        "animate-in slide-in-from-left duration-300",
        popupInfo.role === "staff"
          ? "bg-blue-500 text-light"
          : popupInfo.role === "mod"
          ? "bg-purple-500 text-light"
          : popupInfo.role === "user"
          ? "bg-gradient-to-br from-gray to-dark !text-light"
          : ""
      )}
    >
      {/* Show Button - Only visible when hidden */}
      {isHidden && (
        <button
          onClick={() => setIsHidden(false)}
          className="absolute -right-6 top-1/2 transform -translate-y-1/2 bg-gray-200/20 hover:bg-gray-300/20 shadow-lg rounded-full p-2 backdrop-blur-sm transition-all duration-200 z-10"
        >
          <ChevronRight className="w-8 h-8 text-gray" />
        </button>
      )}

      {/* Header */}
      <div
        className={cn(
          "p-6 pb-4 relative overflow-hidden rounded-t-xl",
          popupInfo.role === "staff"
            ? "bg-blue-500 text-light"
            : popupInfo.role === "mod"
            ? "bg-purple-500 text-light"
            : popupInfo.role === "user"
            ? "bg-gradient-to-br from-gray to-dark !text-light"
            : "bg-[#fffafa]"
        )}
      >
        <MdAirplanemodeActive
          className={cn(
            "text-gray-500/20 text-[7rem] rotate-90 absolute top-4 right-10",
            popupInfo.role === "staff"
              ? "text-light/20"
              : popupInfo.role === "mod"
              ? "text-gray-100/20"
              : "text-gray-500/20"
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
                  : popupInfo.role === "mod"
                  ? "!text-light"
                  : popupInfo.role === "user"
                  ? "!text-light"
                  : ""
              }`}
            >
              {popupInfo.callsign}
            </div>
            {(popupInfo.role == "staff" ||
              popupInfo.role == "user" ||
              popupInfo.role == "mod") && (
              <span className="text-gray-300 text-sm font-medium">
                {popupInfo.role === "staff"
                  ? "INFINITE FLIGHT STAFF"
                  : popupInfo.role === "user"
                  ? "IFLYTICS USER"
                  : popupInfo.role === "mod"
                  ? "INFINITE FLIGHT MODERATOR"
                  : ""}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Flight Details */}
      <section className="bg-[#fff5ee] p-6 pt-4 rounded-xl shadow-xl">
        <Tabs defaultValue="pilot" className="flex flex-col gap-4">
          <TabsList className="w-full bg-orange-200">
            <TabsTrigger
              value="pilot"
              className="text-orange-500 font-semibold flex items-center gap-2 justify-center"
            >
              <RiCopilotFill className="text-orange-500" />
              <span className="text-orange-500">Pilot</span>
            </TabsTrigger>
            <TabsTrigger
              value="flight"
              className="text-orange-500 font-semibold flex items-center gap-2"
            >
              <TbPlaneInflight className="text-orange-500" />
              <span className="text-orange-500">Flight Info</span>
            </TabsTrigger>
          </TabsList>

          <div id="pilot" className="flex items-center justify-between gap-2">
            <div>
              <div className="text-gray-500 font-medium flex items-center gap-2">
                <RiCopilotFill className="text-gray-500 flex-1 text-3xl" />
                <div
                  className={`text-gray-700 text-lg font-bold tracking-tight ${
                    popupInfo.role === "staff"
                      ? "!text-blue-500"
                      : popupInfo.role === "mod"
                      ? "!text-purple-500"
                      : ""
                  }`}
                >
                  {popupInfo.username || "Unknown"}{" "}
                </div>
              </div>
            </div>
          </div>
          <TabsContent value="pilot" className="">
            <div className="space-y-4">
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

              <div
                className={cn(
                  "relative p-4 pr-6 rounded-lg shadow-md flex flex-col gap-1",
                  popupInfo.username
                    ? "bg-gradient-to-br from-[#1E3B70] to-[#29539B]"
                    : "bg-gradient-to-br from-yellow-600 to-yellow-800"
                )}
              >
                <BiMessageRoundedDots className="text-light text-2xl absolute top-2 right-2" />
                <div className="font-semibold font-mono text-light tracking-tight text-lg">
                  {popupInfo.compliment}
                </div>
              </div>

              <div className="flex gap-2 flex-col">
                {/* <div className="flex items-center gap-2">
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
              </div> */}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="flight" className="">
            <div className="space-y-4">
              <section className="flex justify-between gap-2">
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-2 text-gray">
                    <LuPlaneTakeoff className="text-gray-500" />
                    <span className="text-gray-500 font-black">
                      {originAirportFinal}
                    </span>
                  </div>

                  <span className="text-gray-500 text-sm font-medium">
                    Origin
                  </span>
                </div>

                {/* Stretched arrow */}
                <div className="flex-1 flex justify-center items-center px-2 relative">
                  <TbPlaneInflight className="text-xl text-gray-500 absolute left-1/2 -translate-x-1/2 bottom-5" />
                  <svg
                    className="w-full h-6 text-gray-500"
                    viewBox="0 0 100 24"
                    fill="none"
                    preserveAspectRatio="none"
                  >
                    {/* Hollow circle at start */}
                    <circle
                      cx="12"
                      cy="12"
                      r="6"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                    />

                    {/* Long horizontal line */}
                    <line
                      x1="18"
                      y1="12"
                      x2="80"
                      y2="12"
                      stroke="currentColor"
                      strokeWidth="3"
                    />

                    {/* Solid arrow head */}
                    <path d="M75 6 L88 12 L75 18 Z" fill="currentColor" />
                  </svg>
                </div>

                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-2 text-gray">
                    <LuPlaneLanding className="text-gray-500" />
                    <span className="text-gray-500 font-black">
                      {destinationAirportFinal}
                    </span>
                  </div>

                  <span className="text-gray-500 text-sm font-medium">
                    Destination
                  </span>
                </div>
              </section>

              <section className="flex flex-col gap-1 text-gray">
                <div className="flex items-center gap-1">
                  <LuMap className="text-gray" />
                  <h3 className="text-sm font-semibold">Flight Plan</h3>
                </div>

                <div className="p-2 rounded-lg bg-gray text-light font-mono text-xs font-medium break-all h-[75px] overflow-y-auto">
                  {isLoading ? (
                    <div className="flex flex-col gap-2">
                      <div className="w-full h-3 bg-gray-600 rounded animate-pulse"></div>
                      <div className="w-3/4 h-3 bg-gray-600 rounded animate-pulse"></div>
                      <div className="w-1/2 h-3 bg-gray-600 rounded animate-pulse"></div>
                    </div>
                  ) : flightPlan && flightPlan.flightPlanItems.length > 0 ? (
                    flightPlan?.flightPlanItems
                      ?.map((item: any) => item.name)
                      .join(" ")
                  ) : (
                    "No flight plan found"
                  )}
                </div>
              </section>

              <section className="flex flex-col gap-1 text-gray">
                  <div className="flex items-center gap-1">
                    <LuPlane className="text-gray" />
                    <h3 className="text-sm font-semibold">Aircraft</h3>
                  </div>
                <div className="flex justify-between items-center gap-2 py-3 p-2 rounded-lg bg-gradient-to-br from-gray to-dark text-light">

                  <header className="flex flex-col gap-[0.125rem]">
                    {isLoading ? (
                      <>
                        <div className="w-24 h-4 bg-gray-600 rounded animate-pulse"></div>
                        <div className="w-20 h-3 bg-gray-600 rounded animate-pulse mt-1"></div>
                      </>
                    ) : (
                      <>
                        <p className="text-light font-bold tracking-tight">
                          {aircraft?.aircraftName || "Unknown Aircraft"}
                        </p>
                        <span className="text-gray-300 text-xs font-medium">
                          {aircraft?.liveryName || "Unknown Livery"}
                        </span>
                      </>
                    )}
                  </header>
                  {isLoading ? (
                    <div className="w-[100px] h-[100px] bg-gray-600 rounded animate-pulse"></div>
                  ) : (
                    <Image
                      src={`/images/aircraft/${matchAircraftNameToImage(
                        aircraft?.aircraftName || ""
                      )}`}
                      alt="Aircraft"
                      width={100}
                      height={100}
                    />
                  )}
                </div>

              </section>
            </div>
          </TabsContent>

          <div className="flex justify-between">
            <div className="flex items-center gap-2">
              <span className="text-gray-500 text-sm font-medium">
                Last Seen:
              </span>
              <span className="text-gray-500 text-sm font-medium">
                {getMinutesAgo(popupInfo.lastReport)}
              </span>
            </div>

            {popupInfo.username && (
              <div className="flex items-center gap-2">
                <Link
                  href={`/user/${popupInfo.username}`}
                  className="text-light text-xs px-3 py-0.5 rounded-full bg-blue-500 hover:bg-blue-600 transition-colors cursor-pointer font-semibold"
                >
                  📔 Profile
                </Link>
              </div>
            )}
          </div>
        </Tabs>
      </section>

      {!isHidden && (
        <button
          onClick={() => setIsHidden(true)}
          className="absolute -right-6 top-1/2 transform -translate-y-1/2 bg-gray-200/20 hover:bg-gray-300/20 shadow-lg rounded-full p-2 backdrop-blur-sm transition-all duration-200 z-10"
        >
          <ChevronLeft className="w-8 h-8 text-gray" />
        </button>
      )}
      {/* Close and Hide Buttons */}
      <div className="absolute top-4 right-4 flex gap-2">
        {/* Hide Button */}

        {/* Close Button */}
        <button
          onClick={() => setPopupInfo(null)}
          className="bg-gray-200 hover:bg-gray-300 border-none rounded-full w-8 h-8 text-gray-600 text-lg cursor-pointer flex items-center justify-center transition-colors"
          title="Close popup"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default UserPopupInfo;
