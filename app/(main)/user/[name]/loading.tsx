import React from "react";
import { GoCopilot } from "react-icons/go";
import Skeleton from "react-loading-skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
const Loading = () => {
  return (
    <div className="p-4 flex flex-col gap-4">
      <div className="flex gap-4 self-start sm:gap-8 items-center justify-center">
        <GoCopilot className="text-[4rem]" />
        <div className="flex flex-col gap-2">
          <Skeleton containerClassName="w-[300px] h-[30px] bg-gray-500 animate-pulse rounded-full" />
          <Skeleton containerClassName="w-[100px] h-[20px]  bg-gray-500 animate-pulse rounded-full" />
          <Skeleton containerClassName="w-[200px] h-[20px] bg-gray-500 animate-pulse rounded-full" />
        </div>
      </div>

      <Tabs className="w-full">
        <TabsList className="grid w-full max-w-xs grid-cols-2 bg-gray-700 rounded-lg p-1">
          <TabsTrigger
            value="general"
            className={cn(
              "text-white data-[state=active]:text-white",
              "rounded-md transition-all",
              "bg-dark",
              "data-[state=active]:bg-gray",
              "data-[state=active]:font-bold",
              "hover:bg-gray-600"
            )}
          >
            General
          </TabsTrigger>
          <TabsTrigger
            value="flights"
            className={cn(
              "text-white data-[state=active]:text-white",
              "rounded-md transition-all",
              "data-[state=active]:bg-gray",
              "data-[state=active]:font-bold",
              "hover:bg-gray-600"
            )}
          >
            Flights
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <h2 className="text-5xl font-black bg-gradient-to-r from-gray-600 to-dark bg-clip-text text-transparent">
        General
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className=" h-[150px] flex-1 bg-gray-400 animate-pulse rounded-lg flex justify-between gap-2 p-4">
            <Skeleton containerClassName="h-[40px] w-[120px] bg-gray-600 animate-pulse rounded-full"/>
            <Skeleton containerClassName="h-[30px] w-[100px] bg-gray-600 animate-pulse rounded-full self-end"/>
        </div>
        <div className=" h-[150px] flex-1 bg-gray-400 animate-pulse rounded-lg flex justify-between gap-2 p-4">
            <Skeleton containerClassName="h-[40px] w-[120px] bg-gray-600 animate-pulse rounded-full"/>
            <Skeleton containerClassName="h-[30px] w-[100px] bg-gray-600 animate-pulse rounded-full self-end"/>
        </div>
        <div className=" h-[150px] flex-1 bg-gray-400 animate-pulse rounded-lg flex justify-between gap-2 p-4">
            <Skeleton containerClassName="h-[40px] w-[120px] bg-gray-600 animate-pulse rounded-full"/>
            <Skeleton containerClassName="h-[30px] w-[100px] bg-gray-600 animate-pulse rounded-full self-end"/>
        </div>
        <div className=" h-[150px] flex-1 bg-gray-400 animate-pulse rounded-lg flex justify-between gap-2 p-4">
            <Skeleton containerClassName="h-[40px] w-[120px] bg-gray-600 animate-pulse rounded-full"/>
            <Skeleton containerClassName="h-[30px] w-[100px] bg-gray-600 animate-pulse rounded-full self-end"/>
        </div>

        <div className="col-span-2 h-[150px] flex-1 bg-gray-400 animate-pulse rounded-lg flex justify-between gap-2 p-4">
            <Skeleton containerClassName="h-[40px] w-[120px] bg-gray-600 animate-pulse rounded-full"/>
            <Skeleton containerClassName="h-[30px] w-[100px] bg-gray-600 animate-pulse rounded-full self-end"/>
        </div>
        <div className="col-span-2 h-[150px] flex-1 bg-gray-400 animate-pulse rounded-lg flex justify-between gap-2 p-4">
            <Skeleton containerClassName="h-[40px] w-[120px] bg-gray-600 animate-pulse rounded-full"/>
            <Skeleton containerClassName="h-[30px] w-[100px] bg-gray-600 animate-pulse rounded-full self-end"/>
        </div>

        <div className=" h-[150px] flex-1 bg-gray-400 animate-pulse rounded-lg flex justify-between gap-2 p-4">
            <Skeleton containerClassName="h-[40px] w-[120px] bg-gray-600 animate-pulse rounded-full"/>
            <Skeleton containerClassName="h-[30px] w-[100px] bg-gray-600 animate-pulse rounded-full self-end"/>
        </div>
        <div className=" h-[150px] flex-1 bg-gray-400 animate-pulse rounded-lg flex justify-between gap-2 p-4">
            <Skeleton containerClassName="h-[40px] w-[120px] bg-gray-600 animate-pulse rounded-full"/>
            <Skeleton containerClassName="h-[30px] w-[100px] bg-gray-600 animate-pulse rounded-full self-end"/>
        </div>
        <div className=" h-[150px] flex-1 bg-gray-400 animate-pulse rounded-lg flex justify-between gap-2 p-4">
            <Skeleton containerClassName="h-[40px] w-[120px] bg-gray-600 animate-pulse rounded-full"/>
            <Skeleton containerClassName="h-[30px] w-[100px] bg-gray-600 animate-pulse rounded-full self-end"/>
        </div>
      </div>
    </div>
  );
};

export default Loading;
