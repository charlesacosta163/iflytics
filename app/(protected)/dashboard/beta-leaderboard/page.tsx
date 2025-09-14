import React from "react";
import { FaPlane, FaBolt, FaClock, FaLandmark } from "react-icons/fa";
import { MdFlight } from "react-icons/md";
import { IoWarning } from "react-icons/io5";
import { TbStars } from "react-icons/tb";
import { LuPlaneLanding } from "react-icons/lu";
import { PiIslandFill } from "react-icons/pi";
import { RiCopilotFill } from "react-icons/ri";

import { syncUserToIFStatsLeaderboard, getLeaderboardData } from "@/lib/supabase/user-actions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { customUserImages } from "@/lib/data";
import Link from "next/link";

const IFStatsLeaderboardPage = async () => {
  // Sync current user data
  await syncUserToIFStatsLeaderboard();
  
  const leaderboardData = await getLeaderboardData();

  // console.log(leaderboardData);

  // Calculate stats for the bottom cards
  const totalPilots = leaderboardData.length;
  const totalFlights = leaderboardData.reduce((sum, user) => sum + (user.online_flights || 0), 0);
  const totalFlightTime = leaderboardData.reduce((sum, user) => sum + (user.flight_time || 0), 0);
  const avgGrade = totalPilots > 0 ? (leaderboardData.reduce((sum, user) => sum + (user.grade || 0), 0) / totalPilots).toFixed(1) : "0";
  const totalLandings = leaderboardData.reduce((sum, user) => sum + (user.landing_count || 0), 0);
  const totalXp = leaderboardData.reduce((sum, user) => sum + (user.xp || 0), 0);
  const totalAtcOperations = leaderboardData.reduce((sum, user) => sum + (user.atc_operations || 0), 0);
  const totalViolations = leaderboardData.reduce((sum, user) => sum + (user.violations || 0), 0);

  // Format flight time to hours and minutes
  const formatFlightTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  // Format total flight time
  const formatTotalFlightTime = (totalMinutes: number) => {
    const hours = Math.floor(totalMinutes / 60);
    return `${hours.toLocaleString()}h ${(totalMinutes % 60)}m`;
  };

  // Get rank emoji
  const getRankEmoji = (rank: number) => {
    switch (rank) {
      case 1: return "🥇";
      case 2: return "🥈";
      case 3: return "🥉";
      default: return `#${rank}`;
    }
  };

  // Get grade badge with color coding
  const getGradeBadge = (grade: number) => {
    return (
      <Badge variant="secondary" className={`${getGradeColor(grade)} text-white`}>
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
  const getUserAvatar = (username: string | null) => {
    if (!username) return <RiCopilotFill className="w-4 h-4" />;
    
    const userImage = customUserImages.find(
      customUser => customUser.username.toLowerCase() === username.toLowerCase()
    );
    
    return userImage ? (
      <img 
        src={userImage.image} 
        alt={username} 
        width={20} 
        height={20} 
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
        <Link href={`/dashboard/users/${user.ifc_user_id}`} className="font-medium hover:underline">
          {user.ifc_username || 'Unknown Pilot'}
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
      <header>
        <h1 className="text-4xl font-bold dark:text-light bg-gradient-to-r from-gray-600 to-gray-800 bg-clip-text text-transparent tracking-tight">
          IFlytics Leaderboard
        </h1>
        <p className="text-gray-400 mt-2">
          Compete with pilots worldwide and track your progress
        </p>
      </header>

      <div className="bg-transparent border-t border-b border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-2xl text-center font-bold tracking-tight">The Community Leaderboard</h2>
        <p className="text-gray-500 text-sm mb-6 text-center">Top pilots ranked by experience points and flight statistics</p>

        <Tabs defaultValue="flights" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="xp" className="flex items-center gap-2">
              <FaBolt className="w-4 h-4" />
              XP
            </TabsTrigger>
            <TabsTrigger value="flights" className="flex items-center gap-2">
              <MdFlight className="w-4 h-4" />
              Flights
            </TabsTrigger>
            <TabsTrigger value="time" className="flex items-center gap-2">
              <FaClock className="w-4 h-4" />
              Time
            </TabsTrigger>
            <TabsTrigger value="landings" className="flex items-center gap-2">
              <FaLandmark className="w-4 h-4" />
              Landings
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
                  .sort((a, b) => (b.online_flights || 0) - (a.online_flights || 0))
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
                  .sort((a, b) => (b.landing_count || 0) - (a.landing_count || 0))
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

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg border p-4">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <MdFlight className="w-4 h-4" />
            <span className="text-sm">Total Pilots</span>
          </div>
          <div className="text-2xl font-bold">{totalPilots}</div>
          <div className="text-xs text-gray-500">Active on leaderboard</div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border p-4">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <FaPlane className="w-4 h-4" />
            <span className="text-sm">Total Flights</span>
          </div>
          <div className="text-2xl font-bold">{totalFlights.toLocaleString()}</div>
          <div className="text-xs text-gray-500">Combined flights</div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border p-4">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <FaClock className="w-4 h-4" />
            <span className="text-sm">Total Flight Time</span>
          </div>
          <div className="text-2xl font-bold">{formatTotalFlightTime(totalFlightTime)}</div>
          <div className="text-xs text-gray-500">Combined hours</div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border p-4">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <FaBolt className="w-4 h-4" />
            <span className="text-sm">Avg Grade</span>
          </div>
          <div className="text-2xl font-bold">{avgGrade}</div>
          <div className="text-xs text-gray-500">Community average</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border p-4">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <FaBolt className="w-4 h-4" />
            <span className="text-sm">Total Landings</span>
          </div>
          <div className="text-2xl font-bold">{totalLandings.toLocaleString()}</div>
          <div className="text-xs text-gray-500">Combined landings</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border p-4">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <FaBolt className="w-4 h-4" />
            <span className="text-sm">Total Violations</span>
          </div>
          <div className="text-2xl font-bold">{totalViolations.toLocaleString()}</div>
          <div className="text-xs text-gray-500">Combined violations</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border p-4">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <FaBolt className="w-4 h-4" />
            <span className="text-sm">Total ATC Operations</span>
          </div>
          <div className="text-2xl font-bold">{totalAtcOperations.toLocaleString()}</div>
          <div className="text-xs text-gray-500">Combined ATC operations</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border p-4">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <FaBolt className="w-4 h-4" />
            <span className="text-sm">Total XP</span>
          </div>
          <div className="text-2xl font-bold">{totalXp.toLocaleString()}</div>
          <div className="text-xs text-gray-500">Combined XP</div>
        </div>
      </div>
    </div>
  );
};

export default IFStatsLeaderboardPage;
