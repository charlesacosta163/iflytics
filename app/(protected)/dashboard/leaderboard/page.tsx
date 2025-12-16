import React from "react";
import { FaPlane, FaBolt, FaClock, FaLandmark } from "react-icons/fa";
import { MdFlight, MdRadio } from "react-icons/md";
import { IoWarning } from "react-icons/io5";

import { RiCopilotFill, RiStarFill } from "react-icons/ri";
import { Progress } from "@/components/ui/progress";
import { LuClapperboard } from "react-icons/lu";
import {
  syncUserToIFStatsLeaderboard,
  getLeaderboardData,
} from "@/lib/supabase/user-actions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { customUserImages } from "@/lib/data";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { getRandomCompliment } from "@/lib/foo";

const CustomProgress = ({
  value,
  className,
}: {
  value: number;
  className?: string;
}) => {
  const isComplete = value >= 100;
  const progressColor = isComplete
    ? "bg-gradient-to-r from-green-400 to-green-600"
    : "bg-gradient-to-r from-amber-200 to-amber-500";

  return (
    <div
      className={cn(
        "bg-primary/20 relative h-2 w-full overflow-hidden rounded-full",
        className
      )}
    >
      <div
        className={`${progressColor} h-full w-full flex-1 transition-all duration-500`}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </div>
  );
};

const IFStatsLeaderboardPage = async () => {
  // Sync current user data
  await syncUserToIFStatsLeaderboard();

  const leaderboardData = await getLeaderboardData();

  // console.log(leaderboardData);

  // Calculate stats for the bottom cards
  const totalPilots = leaderboardData.length;
  const totalFlights = leaderboardData.reduce(
    (sum, user) => sum + (user.online_flights || 0),
    0
  );
  const totalFlightTime = leaderboardData.reduce(
    (sum, user) => sum + (user.flight_time || 0),
    0
  );
  const avgGrade =
    totalPilots > 0
      ? (
          leaderboardData.reduce((sum, user) => sum + (user.grade || 0), 0) /
          totalPilots
        ).toFixed(1)
      : "0";
  const totalLandings = leaderboardData.reduce(
    (sum, user) => sum + (user.landing_count || 0),
    0
  );
  const totalXp = leaderboardData.reduce(
    (sum, user) => sum + (user.xp || 0),
    0
  );
  const totalAtcOperations = leaderboardData.reduce(
    (sum, user) => sum + (user.atc_operations || 0),
    0
  );
  const totalViolations = leaderboardData.reduce(
    (sum, user) => sum + (user.violations || 0),
    0
  );

  // Goal-based progress calculations
  const PILOT_GOAL = 250; // Target: 250 pilots
  const FLIGHT_GOAL = 250000; // Target: 250K flights
  const TIME_GOAL = 60000000; // Target: 1 million hours (60000000 minutes)
  const GRADE_GOAL = 4; // Target: Average Grade 4.5
  const LANDING_GOAL = 100000; // Target: 150K landings
  const VIOLATION_GOAL = 2500; // Target: Keep under 2500 violations
  const ATC_GOAL = 2500000; // Target: 2.5M ATC operations
  const XP_GOAL = 500000000; // Target: 500M XP

  const pilotProgress = Math.min((totalPilots / PILOT_GOAL) * 100, 100);
  const flightProgress = Math.min((totalFlights / FLIGHT_GOAL) * 100, 100);
  const timeProgress = Math.min((totalFlightTime / TIME_GOAL) * 100, 100);
  const gradeProgress = Math.min(
    (parseFloat(avgGrade) / GRADE_GOAL) * 100,
    100
  );
  const landingProgress = Math.min((totalLandings / LANDING_GOAL) * 100, 100);
  const violationProgress = Math.min(
    (totalViolations / VIOLATION_GOAL) * 100,
    100
  );
  const atcProgress = Math.min((totalAtcOperations / ATC_GOAL) * 100, 100);
  const xpProgress = Math.min((totalXp / XP_GOAL) * 100, 100);

  const userMostXp = leaderboardData.sort((a, b) => b.xp - a.xp)[0];
  const userMostFlights = leaderboardData.sort(
    (a, b) => b.online_flights - a.online_flights
  )[0];
  const userMostFlightTime = leaderboardData.sort(
    (a, b) => b.flight_time - a.flight_time
  )[0];
  const userMostLandings = leaderboardData.sort(
    (a, b) => b.landing_count - a.landing_count
  )[0];
  const userMostViolations = leaderboardData.sort(
    (a, b) => b.violations - a.violations
  )[0];
  const userMostAtcOperations = leaderboardData.sort(
    (a, b) => b.atc_operations - a.atc_operations
  )[0];
  // Format flight time to hours and minutes
  const formatFlightTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  // Format total flight time
  const formatTotalFlightTime = (totalMinutes: number) => {
    const hours = Math.floor(totalMinutes / 60);
    return `${hours.toLocaleString()}h ${totalMinutes % 60}m`;
  };

  // Get rank emoji
  const getRankEmoji = (rank: number) => {
    switch (rank) {
      case 1:
        return "🥇";
      case 2:
        return "🥈";
      case 3:
        return "🥉";
      default:
        return `#${rank}`;
    }
  };

  // Get grade badge with color coding
  const getGradeBadge = (grade: number) => {
    return (
      <Badge
        variant="secondary"
        className={`${getGradeColor(grade)} text-white`}
      >
        Grade {grade}
      </Badge>
    );
  };

  // Get grade color based on grade level
  const getGradeColor = (grade: number) => {
    if (grade === 1) return "bg-gray-500";
    if (grade === 2) return "bg-blue-500";
    if (grade === 3) return "bg-purple-500";
    if (grade === 4) return "bg-green-500";
    return "bg-amber-500";
  };

  // Get violations badge
  const getViolationsBadge = (violations: number) => {
    if (violations === 0) return null;
    return (
      <Badge variant="destructive" className="flex items-center gap-1">
        <IoWarning className="w-3 h-3" />
        {violations}
      </Badge>
    );
  };

  // Get user avatar (fixed variable naming conflict)
  const getUserAvatar = (
    username: string | null,
    height: number = 20,
    width: number = 20
  ) => {
    if (!username) return <RiCopilotFill className="w-4 h-4" />;

    const userImage = customUserImages.find(
      (customUser) =>
        customUser.username.toLowerCase() === username.toLowerCase()
    );

    return userImage ? (
      <img
        src={userImage.image}
        alt={username}
        width={width}
        height={height}
        className="rounded-full"
      />
    ) : (
      <RiCopilotFill className="w-4 h-4" />
    );
  };

  // Render pilot cell with avatar and name
  const renderPilotCell = (user: any) => (
    <TableCell>
      <div className="flex items-center gap-2">
        {getUserAvatar(user.ifc_username)}
        <Link
          href={`/dashboard/users/${user.ifc_user_id}`}
          className="font-medium hover:underline"
        >
          {user.ifc_username || "Unknown Pilot"}
        </Link>
      </div>
    </TableCell>
  );

  // Render ATC operations cell
  const renderATCCell = (atcOps: number) => (
    <TableCell>
      <div className="flex flex-col gap-1">
        {atcOps && (
          <span className="text-xs text-gray-500 flex items-center gap-1">
            {atcOps} <span>ops</span>
          </span>
        )}
      </div>
    </TableCell>
  );

  return (
    <div className="flex flex-col gap-6">
      <header className="bg-gray-50 dark:bg-gray-800 rounded-[15px] border-2 border-gray-200 dark:border-gray-700 p-4">
        <h1 className="text-4xl font-bold dark:text-light flex items-center gap-2 bg-gradient-to-r from-gray-600 to-gray-800 bg-clip-text text-transparent tracking-tight">
          <LuClapperboard className="w-6 h-6 text-blue-500" /> IFlytics Leaderboard
        </h1>
        <p className="text-gray-400 mt-2">
          A community-based effort to track the progress of the IFlytics
          platform
        </p>
      </header>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-[15px] border-2 border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-2 text-gray-500 dark:text-light mb-2">
            <MdFlight className="w-4 h-4" />
            <span className="text-sm">Total Pilots</span>
          </div>
          <div className="text-2xl font-bold">{totalPilots}</div>
          <CustomProgress value={pilotProgress} className="mt-2 h-2" />
          <div className="text-xs text-gray-500 mt-1">
            {pilotProgress.toFixed(0)}% to {PILOT_GOAL} pilot goal
            {pilotProgress >= 100 && (
              <span className="text-green-600 ml-2">🎉 Goal Achieved!</span>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-[15px] border-2 border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-2 text-gray-500 dark:text-light mb-2">
            <FaPlane className="w-4 h-4" />
            <span className="text-sm">Total Flights</span>
          </div>
          <div className="text-2xl font-bold">
            {totalFlights.toLocaleString()}
          </div>
          <CustomProgress value={flightProgress} className="mt-2 h-2" />
          <div className="text-xs text-gray-500 mt-1">
            {flightProgress.toFixed(0)}% to {FLIGHT_GOAL.toLocaleString()}{" "}
            flight goal
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-[15px] border-2 border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-2 text-gray-500 dark:text-light mb-2">
            <FaClock className="w-4 h-4" />
            <span className="text-sm">Total Flight Time</span>
          </div>
          <div className="text-2xl font-bold">
            {formatTotalFlightTime(totalFlightTime)}
          </div>
          <CustomProgress value={timeProgress} className="mt-2 h-2" />
          <div className="text-xs text-gray-500 mt-1">
            {timeProgress.toFixed(0)}% to{" "}
            {Math.floor(TIME_GOAL / 60).toLocaleString()}h goal
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-[15px] border-2 border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-2 text-gray-500 dark:text-light mb-2">
            <FaBolt className="w-4 h-4" />
            <span className="text-sm">Avg Grade</span>
          </div>
          <div className="text-2xl font-bold">{avgGrade}</div>
          <CustomProgress value={gradeProgress} className="mt-2 h-2" />
          <div className="text-xs text-gray-500 mt-1">
            {gradeProgress.toFixed(0)}% to Grade {GRADE_GOAL} goal
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-[15px] border-2 border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-2 text-gray-500 dark:text-light mb-2">
            <FaLandmark className="w-4 h-4" />
            <span className="text-sm">Total Landings</span>
          </div>
          <div className="text-2xl font-bold">
            {totalLandings.toLocaleString()}
          </div>
          <CustomProgress value={landingProgress} className="mt-2 h-2" />
          <div className="text-xs text-gray-500 mt-1">
            {landingProgress.toFixed(0)}% to {LANDING_GOAL.toLocaleString()}{" "}
            landing goal
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-[15px] border-2 border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-2 text-gray-500 dark:text-light mb-2">
            <IoWarning className="w-4 h-4 text-red-500" />
            <span className="text-sm">Total Violations</span>
          </div>
          <div className="text-2xl font-bold">
            {totalViolations.toLocaleString()}
          </div>
          <CustomProgress
            value={violationProgress}
            className="mt-2 h-2"
            // You might want to use a different color for violations (red)
          />
          <div className="text-xs text-gray-500 mt-1">
            {violationProgress.toFixed(0)}% of {VIOLATION_GOAL.toLocaleString()}{" "}
            violation limit
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-[15px] border-2 border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-2 text-gray-500 dark:text-light mb-2">
            <MdRadio className="w-4 h-4" />
            <span className="text-sm">Total ATC Operations</span>
          </div>
          <div className="text-2xl font-bold">
            {totalAtcOperations.toLocaleString()}
          </div>
          <CustomProgress value={atcProgress} className="mt-2 h-2" />
          <div className="text-xs text-gray-500 mt-1">
            {atcProgress.toFixed(0)}% to {ATC_GOAL.toLocaleString()} ATC goal
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-[15px] border-2 border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-2 text-gray-500 dark:text-light mb-2">
            <RiStarFill className="w-4 h-4" />
            <span className="text-sm">Total XP</span>
          </div>
          <div className="text-2xl font-bold">{totalXp.toLocaleString()}</div>
          <CustomProgress value={xpProgress} className="mt-2 h-2" />
          <div className="text-xs text-gray-500 mt-1">
            {xpProgress.toFixed(0)}% to {XP_GOAL.toLocaleString()} XP goal
          </div>
        </div>
      </div>

      {/* Top Performers Cards */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-center">Top Performers</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Most XP Card */}
          <div className="flex flex-col gap-2 bg-white dark:bg-gray-800 rounded-[15px] border-2 border-gray-200 dark:border-gray-700 p-4">
            <div className="flex justify-between items-center gap-2">
              <section>
                <div className="flex items-center gap-2 text-gray-500 mb-2">
                  <FaBolt className="w-4 h-4 text-amber-500" />
                  <span className="text-sm dark:text-light">Most XP</span>
                </div>
                <div className="text-2xl font-bold">
                  {userMostXp?.xp?.toLocaleString() || "N/A"}
                </div>
              </section>
              <div className="text-sm font-semibold text-gray-500 dark:text-light flex flex-col items-center gap-2">
                {getUserAvatar(userMostXp?.ifc_username, 40, 40)}
                <span>{userMostXp?.ifc_username || "Unknown Pilot"}</span>
              </div>
            </div>
            <div className="bg-amber-500 rounded-lg font-mono font-bold tracking-tight p-2">
              <span className="text-sm text-white text-center block">
                {getRandomCompliment("xp")}
              </span>
            </div>
          </div>

          {/* Most Flights Card */}
          <div className="flex flex-col gap-2 bg-white dark:bg-gray-800 rounded-[15px] border-2 border-gray-200 dark:border-gray-700 p-4">
            <div className="flex justify-between items-center gap-2">
              <section>
                <div className="flex items-center gap-2 text-gray-500 mb-2">
                  <MdFlight className="w-4 h-4 text-blue-500" />
                  <span className="text-sm dark:text-light">Most Flights</span>
                </div>
                <div className="text-2xl font-bold">
                  {userMostFlights?.online_flights?.toLocaleString() || "N/A"}
                </div>
              </section>
              <div className="text-sm font-semibold text-gray-500 dark:text-light flex flex-col items-center gap-2">
                {getUserAvatar(userMostFlights?.ifc_username, 40, 40)}
                <span>{userMostFlights?.ifc_username || "Unknown Pilot"}</span>
              </div>
            </div>
            <div className="bg-blue-500 rounded-lg font-mono font-bold tracking-tight p-2">
              <span className="text-sm text-white text-center block">
                {getRandomCompliment("flights")}
              </span>
            </div>
          </div>

          {/* Most Flight Time Card */}
          <div className="flex flex-col gap-2 bg-white dark:bg-gray-800 rounded-[15px] border-2 border-gray-200 dark:border-gray-700 p-4">
            <div className="flex justify-between items-center gap-2">
              <section>
                <div className="flex items-center gap-2 text-gray-500 mb-2">
                  <FaClock className="w-4 h-4 text-green-500" />
                  <span className="text-sm dark:text-light">Total Flight Time</span>
                </div>
                <div className="text-2xl font-bold">
                  {formatFlightTime(userMostFlightTime?.flight_time || 0)}
                </div>
              </section>
              <div className="text-sm font-semibold text-gray-500 dark:text-light flex flex-col items-center gap-2">
                {getUserAvatar(userMostFlightTime?.ifc_username, 40, 40)}
                <span>{userMostFlightTime?.ifc_username || "Unknown Pilot"}</span>
              </div>
            </div>
            <div className="bg-green-500 rounded-lg font-mono font-bold tracking-tight p-2">
              <span className="text-sm text-white text-center block">
                {getRandomCompliment("flightTime")}
              </span>
            </div>
          </div>

          {/* Most Landings Card */}
          <div className="flex flex-col gap-2 bg-white dark:bg-gray-800 rounded-[15px] border-2 border-gray-200 dark:border-gray-700 p-4">
            <div className="flex justify-between items-center gap-2">
              <section>
                <div className="flex items-center gap-2 text-gray-500 mb-2">
                  <FaLandmark className="w-4 h-4 text-purple-500" />
                  <span className="text-sm dark:text-light">Most Landings</span>
                </div>
                <div className="text-2xl font-bold">
                  {userMostLandings?.landing_count?.toLocaleString() || "N/A"}
                </div>
              </section>
              <div className="text-sm font-semibold text-gray-500 dark:text-light flex flex-col items-center gap-2">
                {getUserAvatar(userMostLandings?.ifc_username, 40, 40)}
                <span>{userMostLandings?.ifc_username || "Unknown Pilot"}</span>
              </div>
            </div>
            <div className="bg-purple-500 rounded-lg font-mono font-bold tracking-tight p-2">
              <span className="text-sm text-white text-center block">
                {getRandomCompliment("landings")}
              </span>
            </div>
          </div>

          {/* Most ATC Operations Card */}
          <div className="flex flex-col gap-2 bg-white dark:bg-gray-800 rounded-[15px] border-2 border-gray-200 dark:border-gray-700 p-4">
            <div className="flex justify-between items-center gap-2">
              <section>
                <div className="flex items-center gap-2 text-gray-500 mb-2">
                  <MdRadio className="w-4 h-4 text-indigo-500" />
                  <span className="text-sm dark:text-light">Most ATC Operations</span>
                </div>
                <div className="text-2xl font-bold">
                  {userMostAtcOperations?.atc_operations?.toLocaleString() || "N/A"}
                </div>
              </section>
              <div className="text-sm font-semibold text-gray-500 dark:text-light flex flex-col items-center gap-2">
                {getUserAvatar(userMostAtcOperations?.ifc_username, 40, 40)}
                <span>{userMostAtcOperations?.ifc_username || "Unknown Pilot"}</span>
              </div>
            </div>
            <div className="bg-indigo-500 rounded-lg font-mono font-bold tracking-tight p-2">
              <span className="text-sm text-white text-center block">
                {getRandomCompliment("atc")}
              </span>
            </div>
          </div>

          {/* Most Violations Card */}
              <div className="flex flex-col gap-2 bg-white dark:bg-gray-800 rounded-[15px] border-2 border-gray-200 dark:border-gray-700 p-4">
            <div className="flex justify-between items-center gap-2">
              <section>
                <div className="flex items-center gap-2 text-gray-500 mb-2">
                  <IoWarning className="w-4 h-4 text-red-500 " />
                  <span className="text-sm dark:text-light">Most Violations</span>
                </div>
                <div className="text-2xl font-bold">
                  {userMostViolations?.violations?.toLocaleString() || "N/A"}
                </div>
              </section>
              <div className="text-sm font-semibold text-gray-500 dark:text-light flex flex-col items-center gap-2">
                {getUserAvatar(userMostViolations?.ifc_username, 40, 40)}
                <span>{userMostViolations?.ifc_username || "Unknown Pilot"}</span>
              </div>
            </div>
            <div className="bg-red-500 rounded-lg font-mono font-bold tracking-tight p-2">
              <span className="text-sm text-white text-center block">
                {getRandomCompliment("violations")}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-transparent border-t border-b border-gray-200 dark:border-gray-700 px-2 py-4 md:p-6">
        <h2 className="text-2xl text-center font-bold tracking-tight">
          The Community Leaderboard
        </h2>
        <p className="text-gray-500 text-sm mb-6 text-center">
          Top pilots ranked by experience points and flight statistics
        </p>

        <Tabs defaultValue="flights" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="xp" className="flex items-center gap-2">
              <FaBolt className="w-4 h-4" />
              <span className="hidden sm:block">XP</span>
            </TabsTrigger>
            <TabsTrigger value="flights" className="flex items-center gap-2">
              <MdFlight className="w-4 h-4" />
              <span className="hidden sm:block">Flights</span>
            </TabsTrigger>
            <TabsTrigger value="time" className="flex items-center gap-2">
              <FaClock className="w-4 h-4" />
              <span className="hidden sm:block">Time</span>
            </TabsTrigger>
            <TabsTrigger value="landings" className="flex items-center gap-2">
              <FaLandmark className="w-4 h-4" />
              <span className="hidden sm:block">Landings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="xp" className="mt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Rank</TableHead>
                  <TableHead>Pilot</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>XP</TableHead>
                  <TableHead>Flights</TableHead>
                  <TableHead>Flight Time</TableHead>
                  <TableHead>Landings</TableHead>
                  <TableHead>ATC</TableHead>
                  <TableHead>Violations</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaderboardData
                  .sort((a, b) => (b.xp || 0) - (a.xp || 0))
                  .map((user, index) => (
                    <TableRow key={user.ifc_user_id}>
                      <TableCell className="font-medium">
                        {getRankEmoji(index + 1)}
                      </TableCell>
                      {renderPilotCell(user)}
                      <TableCell>{getGradeBadge(user.grade || 0)}</TableCell>
                      <TableCell className="font-mono">
                        {(user.xp || 0).toLocaleString()}
                      </TableCell>
                      <TableCell className="font-mono">
                        {(user.online_flights || 0).toLocaleString()}
                      </TableCell>
                      <TableCell className="font-mono">
                        {formatFlightTime(user.flight_time || 0)}
                      </TableCell>
                      <TableCell className="font-mono">
                        {(user.landing_count || 0).toLocaleString()}
                      </TableCell>
                      {renderATCCell(user.atc_operations || 0)}
                      <TableCell>
                        {getViolationsBadge(user.violations || 0)}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="flights" className="mt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Rank</TableHead>
                  <TableHead>Pilot</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Flights</TableHead>
                  <TableHead>XP</TableHead>
                  <TableHead>Flight Time</TableHead>
                  <TableHead>Landings</TableHead>
                  <TableHead>ATC</TableHead>
                  <TableHead>Violations</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaderboardData
                  .sort(
                    (a, b) => (b.online_flights || 0) - (a.online_flights || 0)
                  )
                  .map((user, index) => (
                    <TableRow key={user.ifc_user_id}>
                      <TableCell className="font-medium">
                        {getRankEmoji(index + 1)}
                      </TableCell>
                      {renderPilotCell(user)}
                      <TableCell>{getGradeBadge(user.grade || 0)}</TableCell>
                      <TableCell className="font-mono font-semibold">
                        {(user.online_flights || 0).toLocaleString()}
                      </TableCell>
                      <TableCell className="font-mono">
                        {(user.xp || 0).toLocaleString()}
                      </TableCell>
                      <TableCell className="font-mono">
                        {formatFlightTime(user.flight_time || 0)}
                      </TableCell>
                      <TableCell className="font-mono">
                        {(user.landing_count || 0).toLocaleString()}
                      </TableCell>
                      {renderATCCell(user.atc_operations || 0)}
                      <TableCell>
                        {getViolationsBadge(user.violations || 0)}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="time" className="mt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Rank</TableHead>
                  <TableHead>Pilot</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Flight Time</TableHead>
                  <TableHead>Flights</TableHead>
                  <TableHead>XP</TableHead>
                  <TableHead>Landings</TableHead>
                  <TableHead>ATC</TableHead>
                  <TableHead>Violations</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaderboardData
                  .sort((a, b) => (b.flight_time || 0) - (a.flight_time || 0))
                  .map((user, index) => (
                    <TableRow key={user.ifc_user_id}>
                      <TableCell className="font-medium">
                        {getRankEmoji(index + 1)}
                      </TableCell>
                      {renderPilotCell(user)}
                      <TableCell>{getGradeBadge(user.grade || 0)}</TableCell>
                      <TableCell className="font-mono font-semibold">
                        {formatFlightTime(user.flight_time || 0)}
                      </TableCell>
                      <TableCell className="font-mono">
                        {(user.online_flights || 0).toLocaleString()}
                      </TableCell>
                      <TableCell className="font-mono">
                        {(user.xp || 0).toLocaleString()}
                      </TableCell>
                      <TableCell className="font-mono">
                        {(user.landing_count || 0).toLocaleString()}
                      </TableCell>
                      {renderATCCell(user.atc_operations || 0)}
                      <TableCell>
                        {getViolationsBadge(user.violations || 0)}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="landings" className="mt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Rank</TableHead>
                  <TableHead>Pilot</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Landings</TableHead>
                  <TableHead>Flights</TableHead>
                  <TableHead>XP</TableHead>
                  <TableHead>Flight Time</TableHead>
                  <TableHead>ATC</TableHead>
                  <TableHead>Violations</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaderboardData
                  .sort(
                    (a, b) => (b.landing_count || 0) - (a.landing_count || 0)
                  )
                  .map((user, index) => (
                    <TableRow key={user.ifc_user_id}>
                      <TableCell className="font-medium">
                        {getRankEmoji(index + 1)}
                      </TableCell>
                      {renderPilotCell(user)}
                      <TableCell>{getGradeBadge(user.grade || 0)}</TableCell>
                      <TableCell className="font-mono font-semibold">
                        {(user.landing_count || 0).toLocaleString()}
                      </TableCell>
                      <TableCell className="font-mono">
                        {(user.online_flights || 0).toLocaleString()}
                      </TableCell>
                      <TableCell className="font-mono">
                        {(user.xp || 0).toLocaleString()}
                      </TableCell>
                      <TableCell className="font-mono">
                        {formatFlightTime(user.flight_time || 0)}
                      </TableCell>
                      {renderATCCell(user.atc_operations || 0)}
                      <TableCell>
                        {getViolationsBadge(user.violations || 0)}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default IFStatsLeaderboardPage;
