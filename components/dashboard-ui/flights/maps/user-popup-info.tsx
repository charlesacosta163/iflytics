"use client";

import { X, ChevronUp, ChevronDown, Map } from "lucide-react";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { TbPlaneInflight } from "react-icons/tb";
import { LiaCompass } from "react-icons/lia";
import { PiSpeedometer } from "react-icons/pi";
import { BiMessageRoundedDots } from "react-icons/bi";
import { MdAirplanemodeActive } from "react-icons/md";
import { cn, getMinutesAgo } from "@/lib/utils";
import { RiCopilotFill } from "react-icons/ri";
import { MdOutlineAirlines } from "react-icons/md";
import { LuPlaneTakeoff, LuPlaneLanding, LuMap, LuPlane } from "react-icons/lu";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer";
import Image from "next/image";

import {
  getUserFlightInfo,
  getUserFlightPlan,
  getAircraftAndLivery,
} from "@/lib/actions";
import { matchAircraftNameToImage } from "@/lib/cache/flightinsightsdata";
import { FaExternalLinkAlt, FaEye } from "react-icons/fa";

const UserPopupInfo = ({
  popupInfo,
  setPopupInfo,
  onShowFlightPlan, // New prop to handle showing flight plan on map
}: {
  popupInfo: any;
  setPopupInfo: React.Dispatch<React.SetStateAction<any>>;
  onShowFlightPlan?: (flightId: string, userId: string) => void; // New prop
}) => {
  const [flightInfo, setFlightInfo] = useState<any>(null);
  const [flightPlan, setFlightPlan] = useState<any>(null);
  const [aircraft, setAircraft] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false); // New state for minimized view

  useEffect(() => {
    const fetchAllFlightData = async () => {
      setIsLoading(true);

      try {
        // Add timeout to prevent hanging
        const timeoutPromise = new Promise(
          (_, reject) =>
            setTimeout(() => reject(new Error("Request timeout")), 10000) // 10 second timeout
        );

        // Fetch data with timeout
        const [flightInfo, flightPlan, aircraft] = (await Promise.race([
          Promise.all([
            getUserFlightInfo(popupInfo.userId, popupInfo.flightId),
            getUserFlightPlan(popupInfo.flightId),
            getAircraftAndLivery(popupInfo.aircraftId, popupInfo.liveryId),
          ]),
          timeoutPromise,
        ])) as [any, any, any];

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

    if (popupInfo) {
      fetchAllFlightData();
      setIsMinimized(false); // Reset minimized state when new popup opens
    }
  }, [popupInfo?.flightId, popupInfo?.userId]);

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

  // Get role-based colors
  const getRoleColors = (role: string) => {
    switch (role) {
      case "staff":
        return {
          header: "bg-blue-500",
          text: "text-white",
          accent: "text-blue-500",
          badge: "bg-blue-500",
        };
      case "mod":
        return {
          header: "bg-purple-500",
          text: "text-white",
          accent: "text-purple-500",
          badge: "bg-purple-500",
        };
      case "user":
        return {
          header: "bg-gradient-to-br from-gray-800 to-gray-900",
          text: "text-white",
          accent: "text-gray-700",
          badge: "bg-gray-800",
        };
      default:
        return {
          header: "bg-gray-100",
          text: "text-gray-800",
          accent: "text-gray-600",
          badge: "bg-gray-100",
        };
    }
  };

  const roleColors = getRoleColors(popupInfo?.role);

  // Handle showing flight plan on map
  const handleShowFlightPlan = () => {
    if (onShowFlightPlan && popupInfo) {
      onShowFlightPlan(popupInfo.flightId, popupInfo.userId);
      setIsMinimized(true);
    }
  };

  // Handle closing the drawer
  const handleClose = () => {
    setPopupInfo(null);
    setIsMinimized(false);
  };

  return (
    <Drawer 
      open={!!popupInfo} 
      onOpenChange={(open) => !open && handleClose()}
      direction="bottom"
      modal={false} // Disable modal behavior entirely
    >
      <DrawerContent 
        className={cn(
          "mx-auto overflow-hidden transition-all duration-300 ease-in-out",
          "[&>[data-vaul-drawer-handle]]:hidden", // Hide the default handle
          isMinimized 
            ? "max-w-full w-full h-[120px] lg:h-[140px]" // Minimized state
            : "max-w-md h-[90vh] lg:max-w-[1000px] lg:w-full lg:h-[80vh] lg:mx-4 lg:rounded-lg z-[10001]" // Full state
        )}
        onPointerDownOutside={(e) => {
          // Only prevent closing when minimized
          if (isMinimized) {
            e.preventDefault();
          }
        }}
        onEscapeKeyDown={(e) => {
          // Only prevent escape closing when minimized
          if (isMinimized) {
            e.preventDefault();
          }
        }}
      >
        {/* Remove the custom backdrop entirely */}

        {/* Custom drawer handle with role-based colors */}
        <div className="flex justify-center py-2">
          <div 
            className={cn(
              "w-12 h-1 rounded-full",
              popupInfo?.role === "staff" 
                ? "bg-blue-500" 
                : popupInfo?.role === "mod"
                ? "bg-purple-500"
                : popupInfo?.role === "user"
                ? "bg-gray-700"
                : "bg-gray-400"
            )}
          />
        </div>

        {/* Minimized View */}
        {isMinimized && (
          <div className="h-full bg-[#fff5ee] p-4 z-[10001]">
            <div className="flex items-center justify-between h-full z-[10001]">
              {/* Left side - Pilot info */}
              <div className="flex items-center gap-4">
                <div className="text-4xl lg:text-5xl">
                  {popupInfo?.customImage ? (
                    <img
                      src={popupInfo.customImage}
                      alt="Custom avatar"
                      className="w-12 h-12 lg:w-16 lg:h-16 rounded-full object-cover border-2 border-gray-200"
                    />
                  ) : (
                    popupInfo?.emoji
                  )}
                </div>
                <div>
                  <div className="text-lg lg:text-xl font-bold text-gray-700 tracking-tight">
                    {popupInfo?.callsign}
                  </div>
                  <div className="text-sm text-gray-500 flex items-center gap-1">
                    <span>{originAirportFinal}</span>
                    <span>→</span>
                    <span>{destinationAirportFinal}</span>
                  </div>
                </div>
              </div>

              {/* Center - Flight metrics */}
              <div className="hidden sm:flex items-center gap-4 lg:gap-6">
                <div className="text-center">
                  <div className="text-lg lg:text-xl font-bold text-gray-700">
                    {popupInfo?.altitude ? Math.round(popupInfo.altitude) : "N/A"}
                  </div>
                  <div className="text-xs text-gray-500">ALT (ft)</div>
                </div>
                <div className="text-center">
                  <div className="text-lg lg:text-xl font-bold text-gray-700">
                    {popupInfo?.speed ? Math.round(popupInfo.speed) : "N/A"}
                  </div>
                  <div className="text-xs text-gray-500">SPD (kts)</div>
                </div>
                <div className="text-center">
                  <div className="text-lg lg:text-xl font-bold text-gray-700">
                    {popupInfo?.heading ? Math.round(popupInfo.heading) : "N/A"}°
                  </div>
                  <div className="text-xs text-gray-500">HDG</div>
                </div>
              </div>

              {/* Right side - Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMinimized(false)}
                  className="bg-indigo-400 hover:bg-indigo-500 rounded-full p-2 transition-colors"
                  title="Expand details"
                >
                  <ChevronUp className="w-5 h-5 text-light" />
                </button>
                <button
                  onClick={handleClose}
                  className="bg-red-400 hover:bg-red-500 rounded-full p-2 transition-colors"
                  title="Close"
                >
                  <X className="w-4 h-4 text-light" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Full View */}
        {!isMinimized && (
          <>
            {/* Header */}
            <DrawerHeader
              className={cn(
                "p-6 pb-4 relative overflow-hidden rounded-t-xl lg:rounded-t-lg",
                roleColors.header,
                roleColors.text
              )}
            >
              <MdAirplanemodeActive
                className={cn(
                  "text-[7rem] rotate-90 absolute top-4 right-10 opacity-20 lg:text-[10rem] lg:right-20"
                )}
              />
              
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4 lg:gap-6">
                  <div className="text-6xl lg:text-8xl">
                    {popupInfo?.customImage ? (
                      <img
                        src={popupInfo.customImage}
                        alt="Custom avatar"
                        className="w-16 h-16 lg:w-24 lg:h-24 rounded-full object-cover border-2 border-white/20"
                      />
                    ) : (
                      popupInfo?.emoji
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <DrawerTitle className={cn("text-2xl lg:text-4xl font-bold tracking-tight", roleColors.text)}>
                      {popupInfo?.callsign}
                    </DrawerTitle>
                    {(popupInfo?.role === "staff" ||
                      popupInfo?.role === "user" ||
                      popupInfo?.role === "mod") && (
                      <span className="text-white/80 text-sm lg:text-lg font-medium self-start">
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
                
                <div className="flex items-center gap-2">
                  {/* Show Flight Plan Button */}
                  {flightPlan && onShowFlightPlan && (
                    <button
                      onClick={handleShowFlightPlan}
                      className="bg-pink-500 hover:bg-pink-600 border-none rounded-full w-10 h-10 lg:w-12 lg:h-12 text-white cursor-pointer flex items-center justify-center transition-colors z-[10001]"
                      title="Show flight plan on map"
                    >
                      <Map className="w-5 h-5 lg:w-6 lg:h-6" />
                    </button>
                  )}
                  
                  {/* Minimize Button */}
                  <button
                    onClick={() => setIsMinimized(true)}
                    className="bg-indigo-400 hover:bg-indigo-500 border-none rounded-full w-10 h-10 lg:w-12 lg:h-12 text-white cursor-pointer flex items-center justify-center transition-colors z-[10001]"
                    title="Minimize drawer"
                  >
                    <ChevronDown className="w-5 h-5 lg:w-6 lg:h-6" />
                  </button>

                  {/* Close Button */}
                  <DrawerClose asChild>
                    <button
                      className="bg-red-400 hover:bg-red-500 border-none rounded-full w-8 h-8 lg:w-10 lg:h-10 text-white text-lg cursor-pointer flex items-center justify-center transition-colors z-[10001]"
                      title="Close drawer"
                    >
                      <X className="w-4 h-4 lg:w-5 lg:h-5" />
                    </button>
                  </DrawerClose>
                </div>
              </div>
            </DrawerHeader>

            {/* Flight Details - Same as before but wrapped in conditional */}
            <div className="bg-[#fff5ee] flex-1 overflow-y-auto">
              <div className="p-6 pt-4 lg:p-8">
                {/* Mobile Layout - Tabs */}
                <div className="lg:hidden">
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

                    <div id="pilot" className="flex flex-col gap-2">
                      <div className="text-gray-500 font-medium flex items-center gap-2">
                        <RiCopilotFill className="text-gray-500 text-3xl" />
                        <div
                          className={cn(
                            "text-gray-700 text-lg font-bold tracking-tight",
                            roleColors.accent
                          )}
                        >
                          {popupInfo?.username || "Unknown"}{" "}
                        </div>
                      </div>
                      <div className="text-sm font-medium text-gray-500 flex items-center gap-1">
                        <MdOutlineAirlines className="text-gray-500 text-2xl" />
                        {popupInfo?.virtualOrganization || "Not in a VA"}
                      </div>
                    </div>

                    <TabsContent value="pilot" className="">
                      <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            {
                              label: "Altitude",
                              value: popupInfo?.altitude,
                              icon: <TbPlaneInflight className="text-gray-500" />,
                              unit: "ft",
                            },
                            {
                              label: "Speed",
                              value: popupInfo?.speed,
                              icon: <PiSpeedometer className="text-gray-500" />,
                              unit: "kts",
                            },
                            {
                              label: "Heading",
                              value: popupInfo?.heading,
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
                            popupInfo?.username
                              ? "bg-gradient-to-br from-[#1E3B70] to-[#29539B]"
                              : "bg-gradient-to-br from-yellow-600 to-yellow-800"
                          )}
                        >
                          <BiMessageRoundedDots className="text-light text-2xl absolute top-2 right-2" />
                          <div className="font-semibold font-mono text-light tracking-tight text-lg">
                            {popupInfo?.compliment}
                          </div>
                        </div>

                        {popupInfo?.pilotState > 0 && popupInfo?.pilotState < 4 ? (
                          <div className="bg-blue-300 text-white text-sm font-medium text-center p-2 rounded-md flex items-center gap-2 justify-center">
                            <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div> 
                            Powered by AP+
                          </div>
                        ) : (
                          <div className="bg-gray-200 text-gray-700 text-sm font-medium text-center flex items-center gap-2 justify-center p-2 rounded-md">
                            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div> 
                            Currently Active
                          </div>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="flight" className="">
                      {/* Mobile flight content - same as before */}
                      <div className="space-y-4">
                        <section className="flex items-center justify-between gap-4">
                          <div className="flex flex-col items-center">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-2">
                              <LuPlaneTakeoff className="text-green-600 text-xl" />
                            </div>
                            <span className="text-gray-700 font-bold text-lg">{originAirportFinal}</span>
                            <span className="text-gray-500 text-sm">Origin</span>
                          </div>

                          <div className="flex-1 flex items-center justify-center">
                            <div className="w-full border-t-2 border-dotted border-gray-300 relative">
                              <div className="absolute right-0 top-0 transform -translate-y-1/2">
                                <div className="w-0 h-0 border-l-4 border-l-gray-300 border-t-2 border-t-transparent border-b-2 border-b-transparent"></div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-center">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-2">
                              <LuPlaneLanding className="text-red-600 text-xl" />
                            </div>
                            <span className="text-gray-700 font-bold text-lg">{destinationAirportFinal}</span>
                            <span className="text-gray-500 text-sm">Destination</span>
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

                    <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-1">
                        <span className="text-gray-500 text-sm font-medium">
                          Last Seen:
                        </span>
                        <span className="text-gray-500 text-sm font-medium">
                          {getMinutesAgo(popupInfo?.lastReport)}
                        </span>
                      </div>

                      {popupInfo?.username && (
                        <div className="flex items-center gap-3">
                          <Link
                            target="_blank"
                            href={`/user/${popupInfo.username}`}
                            className="text-light text-xs px-3 py-1 rounded-full bg-gray-500 hover:bg-gray-600 transition-colors cursor-pointer font-semibold flex items-center gap-1"
                          >
                            <FaEye className="w-3 h-3" />
                            Stats
                          </Link>
                          <Link
                            target="_blank"
                            href={`https://community.infiniteflight.com/u/${popupInfo.username}/summary`}
                            className="text-xs rounded-full text-blue-500 hover:text-blue-600 transition-colors cursor-pointer font-semibold flex items-center gap-1"
                          >
                            <FaExternalLinkAlt className="w-3 h-3" />
                            IFC
                          </Link>
                        </div>
                      )}
                    </div>
                  </Tabs>
                </div>

                {/* Desktop Layout - Grid */}
                <div className="hidden lg:block">
                  <div className="grid grid-cols-12 gap-8 h-full">
                    {/* Left Column - Pilot Info - Increased from col-span-4 to col-span-5 */}
                    <div className="col-span-5 space-y-6">
                      {/* Pilot Header */}
                      <div className="bg-white rounded-xl p-6 shadow-lg">
                        <div className="flex items-center gap-4 mb-4">
                          <RiCopilotFill className="text-gray-500 text-4xl" />
                          <div>
                            <div
                              className={cn(
                                "text-2xl font-bold tracking-tight",
                                roleColors.accent
                              )}
                            >
                              {popupInfo?.username || "Unknown"}
                            </div>
                            <div className="text-gray-500 font-medium flex items-center gap-2 mt-1">
                              <MdOutlineAirlines className="text-gray-500 text-xl" />
                              {popupInfo?.virtualOrganization || "Not in a VA"}
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        {popupInfo?.username && (
                          <div className="flex gap-3 mt-4">
                            <Link
                              target="_blank"
                              href={`/user/${popupInfo.username}`}
                              className="flex-1 text-center text-white text-sm px-4 py-2 rounded-lg bg-gray-500 hover:bg-gray-600 transition-colors cursor-pointer font-semibold flex items-center justify-center gap-2"
                            >
                              <FaEye className="w-4 h-4" />
                              View Stats
                            </Link>
                            <Link
                              target="_blank"
                              href={`https://community.infiniteflight.com/u/${popupInfo.username}/summary`}
                              className="flex-1 text-center text-sm px-4 py-2 rounded-lg text-blue-500 border border-blue-500 hover:bg-blue-50 transition-colors cursor-pointer font-semibold flex items-center justify-center gap-2"
                            >
                              <FaExternalLinkAlt className="w-4 h-4" />
                              IFC Profile
                            </Link>
                          </div>
                        )}
                      </div>

                      {/* Flight Metrics */}
                      <div className="bg-white rounded-xl p-6 shadow-lg">
                        <h3 className="text-lg font-bold text-gray-700 mb-4">Flight Metrics</h3>
                        <div className="grid grid-cols-1 gap-4">
                          {[
                            {
                              label: "Altitude",
                              value: popupInfo?.altitude,
                              icon: <TbPlaneInflight className="text-gray-500" />,
                              unit: "ft",
                            },
                            {
                              label: "Speed",
                              value: popupInfo?.speed,
                              icon: <PiSpeedometer className="text-gray-500" />,
                              unit: "kts",
                            },
                            {
                              label: "Heading",
                              value: popupInfo?.heading,
                              icon: <LiaCompass className="text-gray-500" />,
                              unit: "°",
                            },
                          ].map((item: any) => (
                            <div
                              className="bg-gradient-to-r from-[#FFE7D5] to-[#ffca9c] p-4 rounded-lg flex items-center gap-4 shadow-sm"
                              key={item.label}
                            >
                              <div className="text-2xl">{item.icon}</div>
                              <div>
                                <div className="text-2xl font-extrabold text-gray-700">
                                  {item.value ? Math.round(item.value) : "N/A"} 
                                  <span className="text-lg text-gray-500 ml-1">{item.unit}</span>
                                </div>
                                <div className="text-gray-500 text-sm font-semibold">
                                  {item.label}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Status */}
                      <div className="bg-white rounded-xl p-6 shadow-lg">
                        <h3 className="text-lg font-bold text-gray-700 mb-4">Status</h3>
                        {popupInfo?.pilotState > 0 && popupInfo?.pilotState < 4 ? (
                          <div className="bg-blue-100 text-blue-800 text-sm font-medium p-3 rounded-lg flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-blue-400 animate-pulse"></div> 
                            <span>Powered by Autopilot+</span>
                          </div>
                        ) : (
                          <div className="bg-green-100 text-green-800 text-sm font-medium p-3 rounded-lg flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></div> 
                            <span>Currently Active</span>
                          </div>
                        )}

                        <div className="mt-4 text-sm text-gray-500 flex justify-between">
                          <span>Last Seen:</span>
                          <span className="font-medium">{getMinutesAgo(popupInfo?.lastReport)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right Column - Flight Details - Decreased from col-span-8 to col-span-7 */}
                    <div className="col-span-7 space-y-6">
                      {/* Route Info */}
                      <div className="bg-white rounded-xl p-6 shadow-lg">
                        <h3 className="text-xl font-bold text-gray-700 mb-6 flex items-center gap-2">
                          <TbPlaneInflight className="text-gray-500" />
                          Flight Route
                        </h3>
                        
                        <section className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <LuPlaneTakeoff className="text-green-600 text-xl" />
                              <div>
                                <div className="text-gray-700 font-bold">{originAirportFinal}</div>
                                <div className="text-gray-500 text-xs">Origin</div>
                              </div>
                            </div>
                            
                            <div className="flex-1 flex items-center gap-2">
                              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full"></div>
                              </div>
                              <span className="text-gray-400 text-sm">→</span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <div className="text-right">
                                <div className="text-gray-700 font-bold">{destinationAirportFinal}</div>
                                <div className="text-gray-500 text-xs">Destination</div>
                              </div>
                              <LuPlaneLanding className="text-red-600 text-xl" />
                            </div>
                          </div>
                        </section>
                      </div>

                      {/* Flight Plan */}
                      <div className="bg-white rounded-xl p-6 shadow-lg">
                        <div className="flex items-center gap-2 mb-4">
                          <LuMap className="text-gray-500 text-xl" />
                          <h3 className="text-xl font-bold text-gray-700">Flight Plan</h3>
                        </div>

                        <div className="p-4 rounded-lg bg-gray-800 text-white font-mono text-sm font-medium break-all min-h-[120px] overflow-y-auto">
                          {isLoading ? (
                            <div className="flex flex-col gap-3">
                              <div className="w-full h-4 bg-gray-600 rounded animate-pulse"></div>
                              <div className="w-3/4 h-4 bg-gray-600 rounded animate-pulse"></div>
                              <div className="w-1/2 h-4 bg-gray-600 rounded animate-pulse"></div>
                              <div className="w-2/3 h-4 bg-gray-600 rounded animate-pulse"></div>
                            </div>
                          ) : flightPlan && flightPlan.flightPlanItems.length > 0 ? (
                            flightPlan?.flightPlanItems
                              ?.map((item: any) => item.name)
                              .join(" ")
                          ) : (
                            "No flight plan found"
                          )}
                        </div>
                      </div>

                      {/* Aircraft Info */}
                      <div className="bg-white rounded-xl p-6 shadow-lg">
                        <div className="flex items-center gap-2 mb-4">
                          <LuPlane className="text-gray-500 text-xl" />
                          <h3 className="text-xl font-bold text-gray-700">Aircraft</h3>
                        </div>
                        
                        <div className="flex items-center gap-6 p-4 rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 text-white">
                          <div className="flex-1">
                            {isLoading ? (
                              <>
                                <div className="w-48 h-6 bg-gray-600 rounded animate-pulse mb-2"></div>
                                <div className="w-32 h-4 bg-gray-600 rounded animate-pulse"></div>
                              </>
                            ) : (
                              <>
                                <p className="text-2xl font-bold tracking-tight mb-1">
                                  {aircraft?.aircraftName || "Unknown Aircraft"}
                                </p>
                                <span className="text-gray-300 font-medium">
                                  {aircraft?.liveryName || "Unknown Livery"}
                                </span>
                              </>
                            )}
                          </div>
                          
                          {isLoading ? (
                            <div className="w-32 h-32 bg-gray-600 rounded animate-pulse"></div>
                          ) : (
                            <Image
                              src={`/images/aircraft/${matchAircraftNameToImage(
                                aircraft?.aircraftName || ""
                              )}`}
                              alt="Aircraft"
                              width={128}
                              height={128}
                              className="rounded-lg"
                            />
                          )}
                        </div>
                      </div>

                      {/* Compliment */}
                      <div className="bg-white rounded-xl p-6 shadow-lg">
                        <div
                          className={cn(
                            "relative p-6 rounded-lg shadow-md",
                            popupInfo?.username
                              ? "bg-gradient-to-br from-[#1E3B70] to-[#29539B]"
                              : "bg-gradient-to-br from-yellow-600 to-yellow-800"
                          )}
                        >
                          <BiMessageRoundedDots className="text-white text-3xl absolute top-4 right-4 opacity-80" />
                          <div className="font-semibold font-mono text-white tracking-tight text-xl pr-12">
                            {popupInfo?.compliment}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
};

export default UserPopupInfo;
