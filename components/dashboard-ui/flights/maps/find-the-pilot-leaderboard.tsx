'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { GiTrophy, GiPodiumWinner } from "react-icons/gi";
import { MdOutlineLeaderboard } from "react-icons/md";
import { LuHistory } from "react-icons/lu";
import { getTodaysLeaderboard, getAllTimeLeaderboard, getUserGameHistory } from "@/lib/cache/game-actions";
import { FaRegFaceGrinBeam, FaRegFaceGrin, FaRegFaceGrimace, FaRegFaceAngry, FaRegCalendarDays } from "react-icons/fa6";
import { getPerformanceLevel } from "@/lib/cache/game-config";
import { createClient } from "@/lib/supabase/client";
import { PiLightning } from 'react-icons/pi';
import { LuCalendarClock } from "react-icons/lu";

import { TbMedal2 } from "react-icons/tb";
import { GiGemNecklace } from "react-icons/gi";
import { LuFlower } from "react-icons/lu";
import { CgSmile } from "react-icons/cg";

interface LeaderboardEntry {
  username: string;
  total_points: number;
  games_played: number;
}

interface GameHistoryEntry {
  username: string;
  difficulty: string;
  points: number;
  completion_time: number;
  created_at: string;
  game_date: string;
}

interface FindThePilotLeaderboardProps {
  isOpen: boolean;
  onClose: () => void;
}

const FindThePilotLeaderboard: React.FC<FindThePilotLeaderboardProps> = ({ isOpen, onClose }) => {
  const [todaysLeaderboard, setTodaysLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [allTimeLeaderboard, setAllTimeLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userHistory, setUserHistory] = useState<GameHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchLeaderboards();
    }
  }, [isOpen]);

  const fetchLeaderboards = async () => {
    setIsLoading(true);
    try {
      // Check if user is logged in
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      const loggedIn = user !== null;
      setIsUserLoggedIn(loggedIn);

      // Fetch leaderboards and conditionally user history
      const promises = [
        getTodaysLeaderboard(),
        getAllTimeLeaderboard()
      ];

      if (loggedIn) {
        promises.push(getUserGameHistory());
      }

      const results = await Promise.all(promises);
      setTodaysLeaderboard(results[0]);
      setAllTimeLeaderboard(results[1]);
      
      if (loggedIn && results[2]) {
        setUserHistory(results[2]);
      }
    } catch (error) {
      console.error('Error fetching leaderboards:', error);
    } finally {
      setIsLoading(false);
    }
  };



  const getRankIcon = (rank: number) => {
    if (rank === 1) return <GiPodiumWinner className="text-yellow-500 text-lg" />;
    if (rank === 2) return <GiTrophy className="text-gray-400 text-lg" />;
    if (rank === 3) return <GiTrophy className="text-amber-600 text-lg" />;
    return <span className="text-gray-500 font-bold text-sm">#{rank}</span>;
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return <FaRegFaceGrinBeam className="text-light " />;
      case 'medium': return <FaRegFaceGrin className="text-light" />;
      case 'hard': return <FaRegFaceGrimace className="text-light" />;
      case 'extreme': return <FaRegFaceAngry className="text-light" />;
      default: return null;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-light bg-green-600';
      case 'medium': return 'text-light bg-yellow-600';
      case 'hard': return 'text-light bg-red-600';
      case 'extreme': return 'text-light bg-black';
      default: return 'text-light bg-gray-600';
    }
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };



  const LeaderboardTable = ({ data, title }: { data: LeaderboardEntry[], title: string }) => (
    <div className="space-y-3">
      <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
        <GiTrophy className="text-yellow-500" /> {title}
      </h3>
      
      {isLoading ? (
        <div className="text-center py-8">
          <div className="text-gray-500">Loading leaderboard...</div>
        </div>
      ) : data.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-500">No games played yet!</div>
        </div>
      ) : (
        <div className="space-y-2">
          {data.map((entry, index) => (
            <div
              key={`${entry.username}-${index}`}
              className={`relative flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors shadow ${index + 1 === 1 ? 'bg-yellow-100 hover:bg-yellow-200' : index + 1 === 2 ? 'bg-gray-200 hover:bg-gray-300' : index + 1 === 3 ? 'bg-amber-200 hover:bg-amber-300' : 'bg-gray-100 hover:bg-gray-200'}`}
            >
              <div className={`flex items-center gap-3 font-medium ${index + 1 === 1 ? 'text-yellow-500' : index + 1 === 2 ? 'text-gray-400' : index + 1 === 3 ? 'text-amber-600' : 'text-gray-500'}`}>
                <span className="text-lg font-black">{index + 1}</span>
                <div>
                  <div className="font-bold text-gray-800">{entry.username}</div>
                  <div className="text-sm text-gray-500">
                    {entry.games_played} game{entry.games_played !== 1 ? 's' : ''} played
                  </div>
                </div>
              </div>
              
              <div className={`text-right ${index + 1 === 1 ? 'text-yellow-500' : index + 1 === 2 ? 'text-gray-400' : index + 1 === 3 ? 'text-amber-600' : 'text-gray-500'}`}>
                <div className="text-lg font-black">{entry.total_points} pts</div>
              </div>

              <div className="absolute top-2 left-[0.6rem]">
                {index + 1 === 1 && <TbMedal2 className="text-yellow-500" />}
                {index + 1 === 2 && <GiGemNecklace className="text-gray-400" />}
                {index + 1 === 3 && <LuFlower className="text-amber-600" />}
                {index + 1 > 3 && <CgSmile className="text-gray-500" />}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const GameHistoryTable = ({ data, title }: { data: GameHistoryEntry[], title: string }) => (
    <div className="space-y-3">
      <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
        <GiTrophy className="text-yellow-500" /> {title}
      </h3>
      
      {isLoading ? (
        <div className="text-center py-8">
          <div className="text-gray-500">Loading your history...</div>
        </div>
      ) : data.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-500">No games played yet! Start playing to build your history.</div>
        </div>
      ) : (
        <div className="space-y-2">
          {data.map((entry, index) => (
            <div
              key={`${entry.created_at}-${index}`}
              className="flex items-center justify-between p-3 rounded-lg bg-orange-100 hover:bg-orange-200 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${getDifficultyColor(entry.difficulty)}`}>
                      {getDifficultyIcon(entry.difficulty)}
                      {entry.difficulty.charAt(0).toUpperCase() + entry.difficulty.slice(1)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 flex items-center gap-1 font-semibold">
                    <LuCalendarClock /> {formatDate(entry.created_at)}
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-lg font-black text-blue-600">{entry.points} pts</div>
                <div className="text-sm text-gray-500">{formatTime(entry.completion_time)}</div>
                <div className="text-xs text-gray-400">
                  {getPerformanceLevel(entry.completion_time, entry.difficulty as any)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl min-h-[80vh] max-h-[80vh] flex flex-col bg-[#FFF8ED]/90">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 text-2xl tracking-tight font-bold text-orange-700">
            <GiPodiumWinner className="text-yellow-500" />
            Find the Pilot Leaderboard
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto">
          <Tabs defaultValue="today" className="w-full h-full flex flex-col">
            <TabsList className={`grid w-full ${isUserLoggedIn ? 'grid-cols-3' : 'grid-cols-2'} bg-[#f9ddbd] flex-shrink-0`}>
              <TabsTrigger value="today" className="flex items-center gap-2 [data-state=active]:bg-[#ffdfbb] text-orange-600">
                <MdOutlineLeaderboard /> Today
              </TabsTrigger>
              <TabsTrigger value="alltime" className="flex items-center gap-2 [data-state=active]:bg-[#ffdfbb] text-orange-600">
                <PiLightning /> All-Time
              </TabsTrigger>
              {isUserLoggedIn && (
                <TabsTrigger value="history" className="flex items-center gap-2 [data-state=active]:bg-[#ffdfbb] text-orange-600">
                  <LuHistory /> History
                </TabsTrigger>
              )}
            </TabsList>
            
            <div className="flex-1 mt-4">
              <TabsContent value="today" className="h-full overflow-y-auto">
                <LeaderboardTable 
                  data={todaysLeaderboard} 
                  title="Today's Top Finders"
                />
              </TabsContent>
              
              <TabsContent value="alltime" className="h-full overflow-y-auto">
                <LeaderboardTable 
                  data={allTimeLeaderboard} 
                  title="All-Time Champions"
                />
              </TabsContent>

              {isUserLoggedIn && (
                <TabsContent value="history" className="h-full overflow-y-auto">
                  <GameHistoryTable 
                    data={userHistory} 
                    title="Your Game History"
                  />
                </TabsContent>
              )}
            </div>
          </Tabs>
        </div>

        <div className="flex justify-end pt-4 border-t flex-shrink-0">
          <Button className="bg-red-400 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-lg transition-colors flex items-center justify-center gap-2" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FindThePilotLeaderboard; 