'use client'

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Progress } from "../ui/progress";
import {
  getInfiniteFlightGrade,
  getUserViolationCount,
  gradeConstraintsData,
} from "@/lib/grade-progression-helpers";
import { convertMinutesToHours } from "@/lib/utils";
import { CircularProgress } from "./charts/extras/circular-progress-bar";
import { Badge } from "../ui/badge";
import { GradeProgressBar } from "./charts/extras/grade-progress-bar";
import { HiOutlineExclamation, HiAcademicCap, HiOutlineCalendar } from "react-icons/hi";

const GradeProgressionCard = ({ userData, flights }: any) => {
  let userGradeStats = getInfiniteFlightGrade(
    userData.xp,
    userData.flightTime,
    userData.landingCount,
    userData.violationCountByLevel,
    flights
  );

  // Fake Data for debugging
  // userGradeStats = {
  //   grade: 5,
  //   xp: 670000,
  //   flightTime: 134719,
  //   landingCount: 1067,
  //   flightTimeNinetyDays: 1000,
  //   landingCountNinetyDays: 300,
  //   lvlOneViolationsDay: 0,
  //   lvlOneViolationsWeek: 0,
  //   lvlOneViolationsPerLandingsRatioYear: 0,
  //   lvlTwoViolationsYear: 0,
  //   lvlThreeViolationsWeek: 0,
  //   lvlThreeViolationsYear: 0,
  //   totalLvlTwoThreeViolationsYear: 0,
  // };

  // Get available grades (only grades above current)
  const availableGrades = gradeConstraintsData.filter(g => g.grade > userGradeStats.grade);
  
  // State for selected grade to view requirements
  // If user is at max grade (5), show current grade; otherwise show next grade
  const [selectedGrade, setSelectedGrade] = useState(
    availableGrades.length > 0 ? userGradeStats.grade + 1 : userGradeStats.grade
  );
  
  // Get the selected grade constraints
  const nextGrade = gradeConstraintsData.find(g => g.grade === selectedGrade) || 
                    gradeConstraintsData.find(g => g.grade === userGradeStats.grade) ||
                    gradeConstraintsData[0]; // Fallback to grade 1 if something goes wrong
  
  // Safety check - should never happen but TypeScript needs it
  if (!nextGrade) {
    return null;
  }

  // Function to count completed objectives for Overall Totals
  const getOverallTotalsCount = () => {
    let completed = 0;
    const total = 3;

    if (userGradeStats.xp >= nextGrade.minXp) completed++;
    if (userGradeStats.flightTime >= nextGrade.minFlightTime) completed++;
    if (userGradeStats.landingCount >= nextGrade.minLandingCount) completed++;

    return { completed, total };
  };

  // Function to count completed objectives for Ninety Day Totals
  const getNinetyDayTotalsCount = () => {
    let completed = 0;
    let total = 0;

    if (nextGrade.minFlightTimeNinetyDays > 0) {
      total += 1;
      if (userGradeStats.flightTimeNinetyDays >= nextGrade.minFlightTimeNinetyDays) completed++;
    }
    if (nextGrade.minLandingCountNinetyDays > 0) {
      total += 1;
      if (userGradeStats.landingCountNinetyDays >= nextGrade.minLandingCountNinetyDays) completed++;
    }

    return { completed, total };
  };

  // Function to count completed objectives for Violation Examination
  const getViolationExaminationCount = () => {
    let completed = 0;
    const total = 7;

    if (userGradeStats.lvlOneViolationsDay <= nextGrade.maxLvlOneViolationsDay) completed++;
    if (userGradeStats.lvlOneViolationsWeek <= nextGrade.maxLvlOneViolationsWeek) completed++;
    if (userGradeStats.lvlOneViolationsPerLandingsRatioYear <= nextGrade.maxLvlOneViolationsPerLandingsRatioYear) completed++;
    if (userGradeStats.lvlTwoViolationsYear <= nextGrade.maxLvlTwoViolationsYear) completed++;
    if (userGradeStats.lvlThreeViolationsWeek <= nextGrade.maxLvlThreeViolationsWeek) completed++;
    if (userGradeStats.lvlThreeViolationsYear <= nextGrade.maxLvlThreeViolationsYear) completed++;
    if (userGradeStats.totalLvlTwoThreeViolationsYear <= nextGrade.maxTotalLvlTwoThreeViolationsYear) completed++;

    return { completed, total };
  };

  // Function to count ALL completed objectives
  const getCompletedObjectivesCount = () => {
    const overallTotals = getOverallTotalsCount();
    const ninetyDayTotals = getNinetyDayTotalsCount();
    const violationExamination = getViolationExaminationCount();

    return {
      completed: overallTotals.completed + ninetyDayTotals.completed + violationExamination.completed,
      total: overallTotals.total + ninetyDayTotals.total + violationExamination.total
    };
  };

  const objectivesCompleted = getCompletedObjectivesCount();
  const overallTotalsProgress = getOverallTotalsCount();
  const ninetyDayTotalsProgress = getNinetyDayTotalsCount();
  const violationExaminationProgress = getViolationExaminationCount();

  return (
    <Card className="md:col-span-2 lg:col-span-4 bg-[#FCF9EA] dark:bg-gray-800 shadow-none border-2 border-amber-100 dark:border-gray-700">
      <CardHeader className="px-4 md:px-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <CardTitle className="text-xl md:text-2xl font-bold tracking-tight dark:text-gray-100">
              Your Grade Progression
            </CardTitle>
            <CardDescription className="text-sm md:text-base dark:text-gray-400">
              {availableGrades.length > 0 
                ? `Current Grade: ${userGradeStats.grade}` 
                : `Current Grade: ${userGradeStats.grade} - Maximum Grade Reached!`
              }
            </CardDescription>
          </div>
          
          {availableGrades.length > 0 ? (
            <div className="flex flex-col gap-2">
              <label className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400">
                Viewing Requirements For:
              </label>
              <Select
                value={selectedGrade.toString()}
                onValueChange={(value) => setSelectedGrade(Number(value))}
              >
                <SelectTrigger className="w-[180px] bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200">
                  <SelectValue placeholder="Select grade" />
                </SelectTrigger>
                <SelectContent>
                  {availableGrades.map((grade) => (
                    <SelectItem key={grade.grade} value={grade.grade.toString()}>
                      Grade {grade.grade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-light text-sm md:text-base font-bold px-4 py-2 shadow-md">
              Maximum Grade Achieved!
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="px-4 md:px-6">
        <Accordion type="multiple" defaultValue={["overall", "ninety-day", "violations"]} className="w-full">
        {/* Overall Totals */}
          <AccordionItem value="overall" className="border-none">
            <AccordionTrigger className="hover:no-underline p-4 md:p-6 bg-amber-100 dark:bg-amber-900/30 rounded-[30px] md:rounded-[40px] mb-3 md:mb-4">
              <div className="flex flex-col items-start gap-1">
                <h1 className="text-xl md:text-2xl font-bold tracking-tight dark:text-gray-100 text-gray-700 flex items-center gap-2">
                  <HiAcademicCap className="w-6 h-6 text-amber-400" />
                  Overall Totals
                </h1>
                <span className={cn(
                  "text-xs md:text-sm font-semibold",
                  overallTotalsProgress.completed === overallTotalsProgress.total 
                    ? "text-green-600 dark:text-green-400" 
                    : "text-gray-600 dark:text-gray-400"
                )}>
                  {overallTotalsProgress.completed} of {overallTotalsProgress.total} completed
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-3 md:pb-4">
              <section className="flex flex-col gap-3 md:gap-4 p-4 md:p-6 bg-amber-100 dark:bg-amber-900/30 rounded-[30px] md:rounded-[40px]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 [&>_div]:bg-gray-50 dark:[&>_div]:bg-gray-700 [&>_div]:rounded-[20px] md:[&>_div]:rounded-[30px]">
            {/* Flight Time */}
            <div className="p-4 md:p-6">
              <header className="font-bold tracking-tight text-lg md:text-xl text-gray-600 dark:text-gray-300">
                Flight Time
              </header>

              <div className="flex flex-col gap-2">
                <span className="font-semibold text-sm md:text-base dark:text-gray-200">
                  <b>{convertMinutesToHours(userGradeStats.flightTime)}</b> /{" "}
                  {convertMinutesToHours(nextGrade.minFlightTime)} hours
                </span>

                <div className="flex items-center justify-between gap-2">
                  <GradeProgressBar
                  value={
                      (userGradeStats.flightTime / nextGrade.minFlightTime) *
                      100
                    }
                    height="h-2 md:h-3"
                    className="flex-1"
                  />
                  <p
                    className={cn(
                      "text-base md:text-lg font-bold min-w-[45px] md:min-w-[50px] text-right",
                      userGradeStats.flightTime >= nextGrade.minFlightTime
                        ? "text-green-600"
                        : "text-gray-700"
                    )}
                  >
                    {Math.min(
                      (userGradeStats.flightTime / nextGrade.minFlightTime) *
                        100,
                      100
                    ).toFixed(0)}
                    %
                  </p>
                </div>

                {userGradeStats.flightTime >= nextGrade.minFlightTime ? (
                  <p className="text-green-600 dark:text-green-400 font-semibold text-xs md:text-sm">
                    ✓ Requirement met!
                  </p>
                ) : (
                  <p className="text-gray-600 dark:text-gray-400 text-xs md:text-sm">
                    {convertMinutesToHours(
                      nextGrade.minFlightTime - userGradeStats.flightTime
                    )}{" "}
                    hours to go
                  </p>
                )}
              </div>
            </div>

            {/* Landings */}
            <div className="p-4 md:p-6">
              <header className="font-bold tracking-tight text-lg md:text-xl text-gray-600 dark:text-gray-300">
                Landings
              </header>

              <div className="flex flex-col gap-2">
                <span className="font-semibold text-sm md:text-base dark:text-gray-200">
                  <b>{userGradeStats.landingCount}</b> /{" "}
                  {nextGrade.minLandingCount} landings
                </span>

                <div className="flex items-center justify-between gap-2">
                  <GradeProgressBar
                  value={
                      (userGradeStats.landingCount /
                        nextGrade.minLandingCount) *
                      100
                    }
                    height="h-2 md:h-3"
                    className="flex-1"
                  />
                  <p
                    className={cn(
                      "text-base md:text-lg font-bold min-w-[45px] md:min-w-[50px] text-right",
                      userGradeStats.landingCount >= nextGrade.minLandingCount
                        ? "text-green-600"
                        : "text-gray-700"
                    )}
                  >
                    {Math.min(
                      (userGradeStats.landingCount /
                        nextGrade.minLandingCount) *
                        100,
                      100
                    ).toFixed(0)}
                    %
                  </p>
                </div>

                {userGradeStats.landingCount >= nextGrade.minLandingCount ? (
                  <p className="text-green-600 dark:text-green-400 font-semibold text-xs md:text-sm">
                    ✓ Requirement met!
                  </p>
                ) : (
                  <p className="text-gray-600 dark:text-gray-400 text-xs md:text-sm">
                    {nextGrade.minLandingCount - userGradeStats.landingCount}{" "}
                    landings to go
                  </p>
                )}
              </div>
            </div>

            {/* XP */}
            <div className="p-4 md:p-6 col-span-1 md:col-span-2">
              <header className="font-bold tracking-tight text-lg md:text-xl text-gray-600 dark:text-gray-300">
                Experience Points (XP)
              </header>

              <div className="flex flex-col gap-2">
                <span className="font-semibold text-sm md:text-base dark:text-gray-200">
                  <b>{userGradeStats.xp.toLocaleString()}</b> /{" "}
                  {nextGrade.minXp.toLocaleString()} XP
                </span>

                <div className="flex items-center justify-between gap-2">
                  <GradeProgressBar
                  value={(userGradeStats.xp / nextGrade.minXp) * 100}
                    height="h-2 md:h-3"
                    className="flex-1"
                  />
                  <p
                    className={cn(
                      "text-base md:text-lg font-bold min-w-[45px] md:min-w-[50px] text-right",
                      userGradeStats.xp >= nextGrade.minXp
                        ? "text-green-600"
                        : "text-gray-700"
                    )}
                  >
                    {Math.min(
                      (userGradeStats.xp / nextGrade.minXp) * 100,
                      100
                    ).toFixed(0)}
                    %
                  </p>
                </div>

                {userGradeStats.xp >= nextGrade.minXp ? (
                  <p className="text-green-600 dark:text-green-400 font-semibold text-xs md:text-sm">
                    ✓ Requirement met!
                  </p>
                ) : (
                  <p className="text-gray-600 dark:text-gray-400 text-xs md:text-sm">
                    {(nextGrade.minXp - userGradeStats.xp).toLocaleString()} XP
                    to go
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>
            </AccordionContent>
          </AccordionItem>

          {/* Ninety Day Totals */}
          {(nextGrade.minFlightTimeNinetyDays > 0 || nextGrade.minLandingCountNinetyDays > 0) && (
            <AccordionItem value="ninety-day" className="border-none">
              <AccordionTrigger className="hover:no-underline p-4 md:p-6 bg-indigo-100 dark:bg-indigo-900/30 rounded-[30px] md:rounded-[40px] mb-3 md:mb-4">
                <div className="flex flex-col items-start gap-1">
                  <h1 className="text-xl md:text-2xl font-bold tracking-tight dark:text-gray-100 text-gray-700 flex items-center gap-2">
                    <HiOutlineCalendar className="w-6 h-6 text-indigo-400" />
                    Ninety Day Totals
                  </h1>
                  <span className={cn(
                    "text-xs md:text-sm font-semibold",
                    ninetyDayTotalsProgress.completed === ninetyDayTotalsProgress.total 
                      ? "text-green-600 dark:text-green-400" 
                      : "text-gray-600 dark:text-gray-400"
                  )}>
                    {ninetyDayTotalsProgress.completed} of {ninetyDayTotalsProgress.total} completed
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-3 md:pb-4">
                <section className="flex flex-col gap-3 md:gap-4 p-4 md:p-6 bg-indigo-100 dark:bg-indigo-900/30 rounded-[30px] md:rounded-[40px]">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 [&>_div]:bg-gray-50 dark:[&>_div]:bg-gray-700 [&>_div]:rounded-[20px] md:[&>_div]:rounded-[30px]">
              {nextGrade.minFlightTimeNinetyDays > 0 && (
                <div className="p-4 md:p-6">
                  <header className="font-bold tracking-tight text-lg md:text-xl text-gray-600 dark:text-gray-300">
                    Flight Time (90 Days)
                  </header>
                  <div className="flex flex-col gap-2">
                    <span className="font-semibold text-sm md:text-base dark:text-gray-200">
                      <b>
                        {convertMinutesToHours(
                          userGradeStats.flightTimeNinetyDays
                        )}
                      </b>{" "}
                      out of{" "}
                      {convertMinutesToHours(nextGrade.minFlightTimeNinetyDays)}{" "}
                      hours
                    </span>

                    <div className="flex gap-2 items-center justify-between">
                      <p
                        className={cn(
                          "text-4xl md:text-5xl font-black tracking-tight",
                          userGradeStats.flightTimeNinetyDays >=
                            nextGrade.minFlightTimeNinetyDays
                            ? "text-green-500"
                            : "text-gray-700 dark:text-gray-300"
                        )}
                      >
                        {Math.min(
                          (userGradeStats.flightTimeNinetyDays /
                            nextGrade.minFlightTimeNinetyDays) *
                            100,
                          100
                        ).toFixed(0)}
                        %
                      </p>
                      <div className="w-[60px] h-[60px] md:w-[80px] md:h-[80px]">
                        <CircularProgress
                          value={Math.min(
                    (userGradeStats.flightTimeNinetyDays /
                      nextGrade.minFlightTimeNinetyDays) *
                              100,
                            100
                          )}
                          size={80}
                          strokeWidth={8}
                          showPercentage={false}
                          className="scale-75 md:scale-100 origin-center"
                        />
                      </div>
                    </div>
                    {userGradeStats.flightTimeNinetyDays >=
                    nextGrade.minFlightTimeNinetyDays ? (
                      <p className="text-green-600 dark:text-green-400 font-semibold text-xs md:text-sm">
                        ✓ Requirement met!
                      </p>
                    ) : (
                      <Badge className="bg-amber-400 dark:bg-amber-600 text-white font-semibold text-xs md:text-sm w-fit">
                        {convertMinutesToHours(
                          nextGrade.minFlightTimeNinetyDays -
                            userGradeStats.flightTimeNinetyDays
                        )}{" "}
                        hours to go
                      </Badge>
                    )}
              </div>
            </div>
              )}

              {nextGrade.minLandingCountNinetyDays > 0 && (
                <div className="p-4 md:p-6">
                  <header className="font-bold tracking-tight text-lg md:text-xl text-gray-600 dark:text-gray-300">
                    Landings (90 Days)
                  </header>
                  <div className="flex flex-col gap-2">
                    <span className="font-semibold text-sm md:text-base dark:text-gray-200">
                      <b>{userGradeStats.landingCountNinetyDays}</b> out of{" "}
                      {nextGrade.minLandingCountNinetyDays} landings
                    </span>

                    <div className="flex gap-2 items-center justify-between">
                      <p
                        className={cn(
                          "text-4xl md:text-5xl font-black tracking-tight",
                          userGradeStats.landingCountNinetyDays >=
                            nextGrade.minLandingCountNinetyDays
                            ? "text-green-500"
                            : "text-gray-700 dark:text-gray-300"
                        )}
                      >
                        {Math.min(
                          (userGradeStats.landingCountNinetyDays /
                            nextGrade.minLandingCountNinetyDays) *
                            100,
                          100
                        ).toFixed(0)}
                        %
                      </p>
                      <div className="w-[60px] h-[60px] md:w-[80px] md:h-[80px]">
                        <CircularProgress
                          value={Math.min(
                    (userGradeStats.landingCountNinetyDays /
                      nextGrade.minLandingCountNinetyDays) *
                              100,
                            100
                          )}
                          size={80}
                          strokeWidth={8}
                          showPercentage={false}
                          className="scale-75 md:scale-100 origin-center"
                        />
                      </div>
                    </div>
                    {userGradeStats.landingCountNinetyDays >=
                    nextGrade.minLandingCountNinetyDays ? (
                      <p className="text-green-600 dark:text-green-400 font-semibold text-xs md:text-sm">
                        ✓ Requirement met!
                      </p>
                    ) : (
                      <Badge className="bg-amber-400 dark:bg-amber-600 text-white font-semibold text-xs md:text-sm w-fit">
                        {nextGrade.minLandingCountNinetyDays -
                          userGradeStats.landingCountNinetyDays}{" "}
                        landings to go
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          </section>
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Violation Totals */}
          <AccordionItem value="violations" className="border-none">
            <AccordionTrigger className="hover:no-underline p-4 md:p-6 bg-red-100 dark:bg-red-900/30 rounded-[30px] md:rounded-[40px] mb-3 md:mb-4">
              <div className="flex flex-col items-start gap-1">
                <h1 className="text-xl md:text-2xl font-bold tracking-tight dark:text-gray-100 text-gray-700 flex items-center gap-2">
                  <HiOutlineExclamation className="w-6 h-6 text-red-400" /> Violation Examination
                </h1>
                <span className={cn(
                  "text-xs md:text-sm font-semibold",
                  violationExaminationProgress.completed === violationExaminationProgress.total 
                    ? "text-green-600 dark:text-green-400" 
                    : "text-gray-600 dark:text-gray-400"
                )}>
                  {violationExaminationProgress.completed} of {violationExaminationProgress.total} completed
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-3 md:pb-4">
              <section className="flex flex-col gap-3 md:gap-4 p-4 md:p-6 bg-red-100 dark:bg-red-900/30 rounded-[30px] md:rounded-[40px]">

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {/* Level 1 Violations - Day */}
            <div className="p-4 md:p-6 bg-gray-50 dark:bg-gray-700 rounded-[20px] md:rounded-[30px] flex flex-col items-center justify-center text-center">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-2">Level 1 (Day)</p>
              <p
                className={cn(
                  "text-3xl md:text-4xl font-bold tracking-tight",
                  userGradeStats.lvlOneViolationsDay <=
                    nextGrade.maxLvlOneViolationsDay
                    ? "text-green-500 dark:text-green-400"
                    : "text-red-400 dark:text-red-300"
                )}
              >
                {userGradeStats.lvlOneViolationsDay}
              </p>
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
                / {nextGrade.maxLvlOneViolationsDay} max
              </p>
              {userGradeStats.lvlOneViolationsDay <=
              nextGrade.maxLvlOneViolationsDay ? (
                <p className="text-[10px] md:text-xs text-green-600 dark:text-green-400 font-semibold mt-2">
                  ✓ Good
                </p>
              ) : (
                <p className="text-[10px] md:text-xs text-red-600 dark:text-red-400 font-semibold mt-2">
                  ✗ Over limit
                </p>
              )}
            </div>

            {/* Level 1 Violations - Week */}
            <div className="p-4 md:p-6 bg-gray-50 dark:bg-gray-700 rounded-[20px] md:rounded-[30px] flex flex-col items-center justify-center text-center">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-2">Level 1 (Week)</p>
              <p
                className={cn(
                  "text-3xl md:text-4xl font-bold tracking-tight",
                  userGradeStats.lvlOneViolationsWeek <=
                    nextGrade.maxLvlOneViolationsWeek
                    ? "text-green-500 dark:text-green-400"
                    : "text-red-400 dark:text-red-300"
                )}
              >
                {userGradeStats.lvlOneViolationsWeek}
              </p>
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
                / {nextGrade.maxLvlOneViolationsWeek} max
              </p>
              {userGradeStats.lvlOneViolationsWeek <=
              nextGrade.maxLvlOneViolationsWeek ? (
                <p className="text-[10px] md:text-xs text-green-600 dark:text-green-400 font-semibold mt-2">
                  ✓ Good
                </p>
              ) : (
                <p className="text-[10px] md:text-xs text-red-600 dark:text-red-400 font-semibold mt-2">
                  ✗ Over limit
                </p>
              )}
            </div>

            {/* Level 1 Violations - Ratio */}
            <div className="p-4 md:p-6 bg-gray-50 dark:bg-gray-700 rounded-[20px] md:rounded-[30px] flex flex-col items-center justify-center text-center">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-2">Level 1 Ratio (Year)</p>
              <p
                className={cn(
                  "text-3xl md:text-4xl font-bold tracking-tight",
                  userGradeStats.lvlOneViolationsPerLandingsRatioYear <=
                    nextGrade.maxLvlOneViolationsPerLandingsRatioYear
                    ? "text-green-500 dark:text-green-400"
                    : "text-red-400 dark:text-red-300"
                )}
              >
                {userGradeStats.lvlOneViolationsPerLandingsRatioYear.toFixed(2)}
              </p>
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
                / {nextGrade.maxLvlOneViolationsPerLandingsRatioYear.toFixed(2)}{" "}
                max
              </p>
              {userGradeStats.lvlOneViolationsPerLandingsRatioYear <=
              nextGrade.maxLvlOneViolationsPerLandingsRatioYear ? (
                <p className="text-[10px] md:text-xs text-green-600 dark:text-green-400 font-semibold mt-2">
                  ✓ Good
                </p>
              ) : (
                <p className="text-[10px] md:text-xs text-red-600 dark:text-red-400 font-semibold mt-2">
                  ✗ Over limit
                </p>
              )}
            </div>

            {/* Level 2 Violations - Year */}
            <div className="p-4 md:p-6 bg-gray-50 dark:bg-gray-700 rounded-[20px] md:rounded-[30px] flex flex-col items-center justify-center text-center">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-2">Level 2 (Year)</p>
              <p
                className={cn(
                  "text-3xl md:text-4xl font-bold tracking-tight",
                  userGradeStats.lvlTwoViolationsYear <=
                    nextGrade.maxLvlTwoViolationsYear
                    ? "text-green-500 dark:text-green-400"
                    : "text-red-400 dark:text-red-300"
                )}
              >
                {userGradeStats.lvlTwoViolationsYear}
              </p>
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
                / {nextGrade.maxLvlTwoViolationsYear} max
              </p>
              {userGradeStats.lvlTwoViolationsYear <=
              nextGrade.maxLvlTwoViolationsYear ? (
                <p className="text-[10px] md:text-xs text-green-600 dark:text-green-400 font-semibold mt-2">
                  ✓ Good
                </p>
              ) : (
                <p className="text-[10px] md:text-xs text-red-600 dark:text-red-400 font-semibold mt-2">
                  ✗ Over limit
                </p>
              )}
            </div>

            {/* Level 3 Violations - Week */}
            <div className="p-4 md:p-6 bg-gray-50 dark:bg-gray-700 rounded-[20px] md:rounded-[30px] flex flex-col items-center justify-center text-center">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-2">Level 3 (Week)</p>
              <p
                className={cn(
                  "text-3xl md:text-4xl font-bold tracking-tight",
                  userGradeStats.lvlThreeViolationsWeek <=
                    nextGrade.maxLvlThreeViolationsWeek
                    ? "text-green-500 dark:text-green-400"
                    : "text-red-400 dark:text-red-300"
                )}
              >
                {userGradeStats.lvlThreeViolationsWeek}
              </p>
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
                / {nextGrade.maxLvlThreeViolationsWeek} max
              </p>
              {userGradeStats.lvlThreeViolationsWeek <=
              nextGrade.maxLvlThreeViolationsWeek ? (
                <p className="text-[10px] md:text-xs text-green-600 dark:text-green-400 font-semibold mt-2">
                  ✓ Good
                </p>
              ) : (
                <p className="text-[10px] md:text-xs text-red-600 dark:text-red-400 font-semibold mt-2">
                  ✗ Over limit
                </p>
              )}
            </div>

            {/* Level 3 Violations - Year */}
            <div className="p-4 md:p-6 bg-gray-50 dark:bg-gray-700 rounded-[20px] md:rounded-[30px] flex flex-col items-center justify-center text-center">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-2">Level 3 (Year)</p>
              <p
                className={cn(
                  "text-3xl md:text-4xl font-bold tracking-tight",
                  userGradeStats.lvlThreeViolationsYear <=
                    nextGrade.maxLvlThreeViolationsYear
                    ? "text-green-500 dark:text-green-400"
                    : "text-red-400 dark:text-red-300"
                )}
              >
                {userGradeStats.lvlThreeViolationsYear}
              </p>
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
                / {nextGrade.maxLvlThreeViolationsYear} max
              </p>
              {userGradeStats.lvlThreeViolationsYear <=
              nextGrade.maxLvlThreeViolationsYear ? (
                <p className="text-[10px] md:text-xs text-green-600 dark:text-green-400 font-semibold mt-2">
                  ✓ Good
                </p>
              ) : (
                <p className="text-[10px] md:text-xs text-red-600 dark:text-red-400 font-semibold mt-2">
                  ✗ Over limit
                </p>
              )}
            </div>

            {/* Total Level 2+3 Violations - Year */}
            <div className="p-4 md:p-6 bg-gray-50 dark:bg-gray-700 rounded-[20px] md:rounded-[30px] flex flex-col items-center justify-center text-center col-span-2">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-2">
                Total Level 2+3 (Year)
              </p>
              <p
                className={cn(
                  "text-3xl md:text-4xl font-bold tracking-tight",
                  userGradeStats.totalLvlTwoThreeViolationsYear <=
                    nextGrade.maxTotalLvlTwoThreeViolationsYear
                    ? "text-green-500 dark:text-green-400"
                    : "text-red-400 dark:text-red-300"
                )}
              >
                {userGradeStats.totalLvlTwoThreeViolationsYear}
              </p>
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
                / {nextGrade.maxTotalLvlTwoThreeViolationsYear} max
              </p>
              {userGradeStats.totalLvlTwoThreeViolationsYear <=
              nextGrade.maxTotalLvlTwoThreeViolationsYear ? (
                <p className="text-[10px] md:text-xs text-green-600 dark:text-green-400 font-semibold mt-2">
                  ✓ Good
                </p>
              ) : (
                <p className="text-[10px] md:text-xs text-red-600 dark:text-red-400 font-semibold mt-2">
                  ✗ Over limit
                </p>
              )}
            </div>
          </div>

        </section>
          
              </AccordionContent>
            </AccordionItem>
        </Accordion>
        <span className="text-xs md:text-sm text-gray-500 dark:text-gray-400 font-semibold">
          {availableGrades.length > 0 
            ? `${objectivesCompleted.completed} / ${objectivesCompleted.total} conditions met until Grade ${selectedGrade}`
            : `All Grade ${userGradeStats.grade} requirements reached: ${objectivesCompleted.completed} / ${objectivesCompleted.total} conditions met`
          }
        </span>
      </CardContent>
    </Card>
  );
};

export default GradeProgressionCard;