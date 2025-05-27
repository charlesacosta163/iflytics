import React from "react";
import { GoCopilot } from "react-icons/go";
import Skeleton from "react-loading-skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
const Loading = () => {
  return (
    <div className="p-4 flex flex-col gap-4">

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
