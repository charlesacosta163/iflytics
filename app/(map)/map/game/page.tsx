"use client";

import React, { useMemo, useState, useEffect } from "react";
import useSWR from "swr";
import {
  getFlightsFromServer,
} from "@/lib/actions";
import { customUserImages, aviationCompliments, alternator } from "@/lib/data";
import { GrAlarm } from "react-icons/gr";
import { FaRegFaceGrinBeam, FaRegFaceGrin, FaRegFaceGrimace, FaRegFaceAngry } from "react-icons/fa6"; // Easy, Medium, Hard Mode Icons
import { FaGlobeAsia } from "react-icons/fa";
import { BiSolidFaceMask } from "react-icons/bi";
import { GiPodiumWinner } from "react-icons/gi";

import FindThePilotGameMap from "@/components/dashboard-ui/flights/maps/find-the-pilot-game-map";
import FindThePilotLeaderboard from "@/components/dashboard-ui/flights/maps/find-the-pilot-leaderboard";
import { createGameEntry } from "@/lib/cache/game-actions";
import { calculatePoints, getPerformanceLevel, difficultySettings, Difficulty } from "@/lib/cache/game-config";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useMapTimeout } from "@/components/dashboard-ui/flights/maps/map-activity-timeout";

const fetcher = () => getFlightsFromServer();

// Helper function for consistent emoji assignment
const getConsistentEmojiForUser = (username: string) => {
  if (!username) {
    return alternator[0];
  }
  
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    const char = username.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return alternator[Math.abs(hash) % alternator.length];
};

const GameMapPage = () => {
  const { isTimedOut } = useMapTimeout();
  const [frozenFlights, setFrozenFlights] = useState<any[]>([]);
  
  const {
    data: flights = [],
    error,
    isLoading,
  } = useSWR("flights", fetcher, {
    refreshInterval: isTimedOut ? 0 : 30000, // Stop fetching if timed out
    revalidateOnFocus: !isTimedOut, // Don't revalidate on focus if timed out
    revalidateOnReconnect: !isTimedOut, // Don't revalidate on reconnect if timed out
    isPaused: () => isTimedOut, // Pause SWR completely when timed out
  });

  const [gameActive, setGameActive] = useState(false);
  const [targetPilot, setTargetPilot] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameStatus, setGameStatus] = useState<'idle' | 'playing' | 'won' | 'lost'>('idle');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('medium');
  const [gameStartTime, setGameStartTime] = useState<number>(0);
  const [shouldZoomToTarget, setShouldZoomToTarget] = useState(false);
  const [showDefeatPopup, setShowDefeatPopup] = useState(false);
  const [isGamePanelHidden, setIsGamePanelHidden] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState<boolean | null>(null); // null = checking, true/false = result
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  // Get current difficulty config
  const currentConfig = difficultySettings[selectedDifficulty];

  // Check if user is logged in on component mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setIsUserLoggedIn(user !== null);
    };
    checkAuthStatus();
  }, []);

  // Memoize quirkyFlights - use frozen data during game
  const quirkyFlights = useMemo(() => {
    // Use frozen flights during active game, otherwise use live data
    const sourceFlights = gameActive ? frozenFlights : flights;
    
    const flightsWithUsernames = sourceFlights.filter((flight: any) => 
      flight.username && flight.username.trim() !== '' && 
      flight.callsign && flight.callsign.trim() !== '' && 
      !customUserImages.find((image) => image.username === flight.username)
    );
    
    const limitedFlights = flightsWithUsernames.slice(0, currentConfig.pilots);
    
    return limitedFlights.map((flight: any) => ({
      ...flight,
      emoji: getConsistentEmojiForUser(flight.username),
      compliment: aviationCompliments[Math.abs(flight.username.split('').reduce((a: any, b: any) => a + b.charCodeAt(0), 0)) % aviationCompliments.length],
      customImage: customUserImages.find((image) => image.username === flight.username)?.image
    }));
  }, [flights, frozenFlights, gameActive, selectedDifficulty]);

  // Timer effect
  useEffect(() => {
    if (gameActive && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && gameActive) {
      // Time's up - trigger zoom to target then game lost
      setGameActive(false);
      setGameStatus('lost');
      setShouldZoomToTarget(true);
      console.log("⏰ Time's up! Zooming to target pilot...");
    }
  }, [gameActive, timeLeft]);

  // Handle zoom completion
  const handleZoomComplete = () => {
    // Show defeat popup after zoom animation completes
    setShowDefeatPopup(true);
    setShouldZoomToTarget(false);
  };

  // Start game function - freeze current flight data
  const startGame = () => {
    if (flights.length === 0) return;
    
    // Freeze current flight data
    setFrozenFlights([...flights]);
    
    // Create quirky flights from current data
    const currentQuirkyFlights = flights
      .filter((flight: any) => 
        flight.username && flight.username.trim() !== '' && 
        flight.callsign && flight.callsign.trim() !== '' && 
        !customUserImages.find((image) => image.username === flight.username)
      )
      .slice(0, currentConfig.pilots)
      .map((flight: any) => ({
        ...flight,
        emoji: getConsistentEmojiForUser(flight.username),
        compliment: aviationCompliments[Math.abs(flight.username.split('').reduce((a: any, b: any) => a + b.charCodeAt(0), 0)) % aviationCompliments.length],
        customImage: customUserImages.find((image) => image.username === flight.username)?.image
      }));
    
    if (currentQuirkyFlights.length === 0) return;
    
    // Select random pilot from frozen data
    const randomPilot = currentQuirkyFlights[Math.floor(Math.random() * currentQuirkyFlights.length)];
    setTargetPilot(randomPilot);
    setTimeLeft(currentConfig.timeLimit);
    setGameStartTime(Date.now());
    setGameStatus('playing');
    setGameActive(true);
    
    console.log("🎮 Game started!", selectedDifficulty, "mode - Find:", randomPilot.username);
  };

  // Handle pilot click (just for logging now)
  const handlePilotClick = (clickedPilot: any) => {
    if (!gameActive || !targetPilot) return;
    
    console.log("🎯 Clicked:", clickedPilot.username, "-", clickedPilot.callsign);
    console.log("🎯 Target:", targetPilot.username, "-", targetPilot.callsign);
    
    if (clickedPilot.username === targetPilot.username && clickedPilot.callsign === targetPilot.callsign) {
      console.log("🎯 Target pilot clicked! Look for the Find button in the popup!");
    } else {
      console.log("❌ Wrong pilot, keep looking!");
    }
  };

  // Handle target found (called from Find button)
  const handleTargetFound = () => {
    setGameStatus('won');
    setGameActive(false);
    console.log("🎉 You won! Target found via Find button!");
  };

  // Reset game - clear frozen data
  const resetGame = () => {
    setGameActive(false);
    setTargetPilot(null);
    setTimeLeft(currentConfig.timeLimit);
    setGameStatus('idle');
    setShouldZoomToTarget(false);
    setShowDefeatPopup(false);
    setIsGamePanelHidden(false);
    setFrozenFlights([]); // Clear frozen data
  };

  // Calculate completion time and points for won games
  const completionTime = currentConfig.timeLimit - timeLeft;
  const earnedPoints = gameStatus === 'won' ? calculatePoints(completionTime, selectedDifficulty) : 0;
  const performanceLevel = gameStatus === 'won' ? getPerformanceLevel(completionTime, selectedDifficulty) : '';

  // Handle finish game - save data if logged in
  const handleFinishGame = async () => {
    if (isUserLoggedIn && (gameStatus === 'won' || gameStatus === 'lost')) {
      setIsSaving(true);
      
      const gameData = {
        difficulty: selectedDifficulty,
        points: earnedPoints,
        completionTime: completionTime
      };
      
      try {
        const result = await createGameEntry(gameData);
        
        if (result?.success) {
          console.log("✅ Game result saved to leaderboard!");
        } else {
          console.error("❌ Failed to save game result:", result?.message);
        }
      } catch (error) {
        console.error("❌ Error saving game result:", error);
      } finally {
        setIsSaving(false);
      }
    }
    
    // Always reset the game regardless
    resetGame();
  };

  if (isTimedOut) {
    return (
      <div className="relative w-full h-screen">
        {/* Show last known flight data but with a paused indicator */}
        <FindThePilotGameMap 
          flights={quirkyFlights} 
          onPilotClick={handlePilotClick}
          targetPilot={targetPilot}
          onTargetFound={handleTargetFound}
          gameActive={gameActive}
          shouldZoomToTarget={shouldZoomToTarget}
          onZoomComplete={handleZoomComplete}
        />
        
        {/* Paused Indicator */}
        <div className="absolute top-24 sm:top-20 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-orange-100 border-2 border-orange-400 text-orange-700 px-4 py-2 rounded-full text-sm font-bold shadow-lg flex items-center gap-2">
            <GrAlarm className="text-orange-700" /> Live Data Paused - 15min Inactive
          </div>
        </div>
        
        {/* Game Status Panel */}
        <div className="absolute bottom-4 right-4 z-50">
          {gameStatus === 'idle' && (
            <div className="p-6 bg-[#FFF8ED] rounded-lg shadow-xl flex flex-col items-center gap-4 w-80">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2"><BiSolidFaceMask /> Find the Pilot!</h2>
                <p className="text-sm text-gray-600">
                  Select difficulty and find the target pilot
                </p>
              </div>

              {/* Difficulty Selection */}
              <div className="w-full space-y-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty:</label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(difficultySettings) as Difficulty[]).map((difficulty) => {
                    const config = difficultySettings[difficulty];
                    const isSelected = selectedDifficulty === difficulty;
                    
                    return (
                      <button
                        key={difficulty}
                        onClick={() => setSelectedDifficulty(difficulty)}
                        className={`p-3 rounded-lg border-2 text-left transition-colors ${
                          isSelected 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <div className="flex flex-col gap-1">
                          <div className={`font-bold capitalize flex items-center gap-1 text-sm ${
                            difficulty === 'easy' ? 'text-green-600' :
                            difficulty === 'medium' ? 'text-yellow-600' :
                            difficulty === 'hard' ? 'text-red-600' :
                            difficulty === 'extreme' ? 'text-black' : 'text-gray-600'
                          }`}>
                            {difficulty === 'easy' ? <FaRegFaceGrinBeam /> : difficulty === 'medium' ? <FaRegFaceGrin /> : difficulty === 'hard' ? <FaRegFaceGrimace /> : <FaRegFaceAngry />} {difficulty.toUpperCase()}
                          </div>
                          <div className="text-xs text-gray-600">{config.description}</div>
                          <div className="text-xs font-bold text-gray-800">Max: {config.maxPoints} pts</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
              
              <button
                onClick={startGame}
                disabled={flights.length === 0}
                className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                {flights.length === 0 ? 'Loading...' : `Start ${selectedDifficulty.toUpperCase()} Game`}
              </button>

              <button
                onClick={() => setShowLeaderboard(true)}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <GiPodiumWinner className="text-lg" />
                View Leaderboard
              </button>

              <p className="text-xs text-gray-500 text-center">
                {flights.length} pilots available • Expert Server
              </p>
            </div>
          )}

          {gameStatus === 'playing' && targetPilot && (
            <>
              {/* Main Game Panel */}
              {!isGamePanelHidden && (
                <div className="p-6 bg-[#FFF8ED] rounded-lg shadow-xl flex flex-col items-center gap-4 w-56 relative">
                  {/* Hide Button */}
                  <button
                    onClick={() => setIsGamePanelHidden(true)}
                    className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Hide panel"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>

                  <div className="text-center">
                    <div className={`text-xs font-bold mb-2 flex items-center gap-2 ${
                      selectedDifficulty === 'easy' ? 'text-green-600' :
                      selectedDifficulty === 'medium' ? 'text-yellow-600' :
                      selectedDifficulty === 'hard' ? 'text-red-600' :
                      selectedDifficulty === 'extreme' ? 'text-black' : 'text-gray-600'
                    }`}>
                      {selectedDifficulty === 'easy' ? <FaRegFaceGrinBeam /> : selectedDifficulty === 'medium' ? <FaRegFaceGrin /> : selectedDifficulty === 'hard' ? <FaRegFaceGrimace /> : <FaRegFaceAngry />} {selectedDifficulty.toUpperCase()} MODE
                    </div>
                  </div>

                  <header className="text-center">
                    <h2 className="text-xl font-bold text-gray-800">{targetPilot.emoji} {targetPilot.username}</h2>
                    <p className="text-sm text-gray-600 font-medium">{targetPilot.callsign}</p>
                  </header>

                  <div className={`text-2xl font-black ${timeLeft <= 10 ? 'text-red-500' : 'text-green-500'}`}>
                    {timeLeft}s
                  </div>

                  <p className="text-xs text-white bg-gray-700 rounded-full font-medium px-3 py-1">
                    Find the pilot
                  </p>

                  <button
                    onClick={resetGame}
                    className="text-xs text-gray-500 hover:text-gray-700 underline"
                  >
                    Give up
                  </button>
                </div>
              )}

              {/* Collapsed Show Button */}
              {isGamePanelHidden && (
                <div className="flex flex-col gap-2">
                  {/* Compact Info Bar */}
                  <div className="bg-[#FFF8ED]/90 backdrop-blur-sm rounded-lg shadow-lg p-2 flex items-center gap-2 text-xs border border-orange-200">
                    <div className="text-lg">
                      {targetPilot.emoji}
                    </div>
                    <div className={`font-bold ${timeLeft <= 10 ? 'text-red-500' : 'text-green-500'}`}>
                      {timeLeft}s
                    </div>
                    <div className="text-gray-400">|</div>
                    <div className="text-gray-700 font-medium truncate max-w-20">
                      {targetPilot.username}
                    </div>
                  </div>

                  {/* Show Panel Button */}
                  <button
                    onClick={() => setIsGamePanelHidden(false)}
                    className="bg-orange-100 hover:bg-orange-200 text-orange-700 border-2 border-orange-300 rounded-lg shadow-lg p-2 transition-colors self-end"
                    title="Show game panel"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Game Info */}
        <div className="absolute top-4 left-4 bg-[#FFF8ED]/70 backdrop-blur-sm rounded-lg shadow-lg p-3 z-[1000]">
          <h1 className="text-lg font-bold text-gray-800 flex items-center gap-2"><BiSolidFaceMask /> Find the Pilot</h1>
          <p className="text-sm text-gray-600">
            {flights.length} pilots • Expert Server
          </p>
          
          {/* Auth Status Badge */}
          {isUserLoggedIn !== null && (
            <div className={`mt-2 px-2 py-1 rounded-full text-xs font-medium ${
              isUserLoggedIn 
                ? 'bg-green-100 text-green-700 border border-green-300' 
                : 'bg-orange-100 text-orange-700 border border-orange-300'
            }`}>
              {isUserLoggedIn 
                ? '🏆 Scores count for leaderboard' 
                : '🔐 Not logged in - scores won\'t be saved'
              }
            </div>
          )}
        </div>

        {/* Victory/Defeat Popup */}
        {(gameStatus === 'won' || (gameStatus === 'lost' && showDefeatPopup)) && (
          <>
            {/* Semi-transparent backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-[1001]" />

            {/* Centered popup */}
            <div className="absolute inset-0 flex items-center justify-center z-[1002]">
              {gameStatus === 'won' && (
                <div className="bg-[#FFF8ED] rounded-2xl shadow-2xl p-8 w-96 mx-4 border-4 border-green-500 animate-in zoom-in duration-300">
                  <div className="text-center">
                    {/* Victory animation */}
                    <div className="text-6xl mb-4 animate-bounce flex items-center justify-center"><GiPodiumWinner className="text-green-500" /></div>
                    
                    <h1 className="text-3xl font-bold text-green-500 mb-4">Victory!</h1>
                    
                    <div className="bg-[#FFEFD5] shadow-lg rounded-lg p-4 mb-6 flex flex-col items-center justify-center">
                      <div className={`text-xs font-bold mb-2 flex items-center gap-2 ${
                        selectedDifficulty === 'easy' ? 'text-green-600' :
                        selectedDifficulty === 'medium' ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {selectedDifficulty === 'easy' ? <FaRegFaceGrinBeam /> : selectedDifficulty === 'medium' ? <FaRegFaceGrin /> : selectedDifficulty === 'hard' ? <FaRegFaceGrimace /> : <FaRegFaceAngry />} {selectedDifficulty.toUpperCase()} MODE
                      </div>
                      
                      <p className="text-lg text-green-800 font-semibold mb-2">
                        Found {targetPilot?.emoji} {targetPilot?.username}
                      </p>
                      <p className="text-sm text-green-600">
                        Callsign: {targetPilot?.callsign}
                      </p>
                      <p className="text-sm text-green-600">
                        Time: {completionTime} seconds
                      </p>
                      
                      {/* Points Display */}
                      <div className="mt-3 p-3 bg-transparent rounded-lg border-2 border-green-300">
                        <div className="text-2xl font-black text-green-700">
                          {earnedPoints} points
                        </div>
                        <div className="text-sm text-green-600 font-medium">
                          {performanceLevel}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={handleFinishGame}
                        disabled={isSaving}
                        className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                      >
                        {isSaving ? 'Saving...' : 'Finish Game'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {gameStatus === 'lost' && showDefeatPopup && (
                <div className="bg-[#FFF8ED] rounded-2xl shadow-2xl p-8 w-96 mx-4 border-4 border-red-300 animate-in zoom-in duration-300">
                  <div className="text-center">
                    {/* Defeat animation */}
                    <div className="text-6xl mb-4 flex items-center justify-center">
                      <GrAlarm className="text-red-400" />
                    </div>
                    
                    <h1 className="text-3xl font-bold text-red-400 mb-4">Time's Up!</h1>
                    
                    <div className="bg-[#FFEFD5] shadow-lg rounded-lg p-4 mb-6 flex flex-col items-center justify-center">
                      <div className={`text-xs font-bold mb-2 flex items-center gap-2 ${
                        selectedDifficulty === 'easy' ? 'text-green-600' :
                        selectedDifficulty === 'medium' ? 'text-yellow-600' :
                        selectedDifficulty === 'hard' ? 'text-red-600' :
                        selectedDifficulty === 'extreme' ? 'text-black' : 'text-gray-600'
                      }`}>
                        {selectedDifficulty === 'easy' ? <FaRegFaceGrinBeam /> : selectedDifficulty === 'medium' ? <FaRegFaceGrin /> : selectedDifficulty === 'hard' ? <FaRegFaceGrimace /> : <FaRegFaceAngry />} {selectedDifficulty.toUpperCase()} MODE
                      </div>
                      
                      <p className="text-lg text-red-800 font-semibold mb-2">
                        Couldn't find {targetPilot?.emoji} {targetPilot?.username}
                      </p>
                      <p className="text-sm text-red-600">
                        Callsign: {targetPilot?.callsign}
                      </p>
                      {/* Zero Points Display */}
                      <div className="flex flex-col items-center justify-center mt-3 p-3 bg-transparent rounded-lg border-2 border-red-300">
                        <div className="text-2xl font-black text-red-500">
                          0 points
                        </div>
                        <div className="text-sm text-red-400 font-medium flex items-center gap-2">
                          <GrAlarm className="text-red-400" />
                           Time's Up!
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={handleFinishGame}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                      >
                        {isSaving ? 'Saving...' : 'Finish Game'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Game</h1>
          <p className="text-gray-600">Failed to load flight data. Please try again later.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Loading Game...</h1>
          <p className="text-gray-600">Fetching live flight data from Expert Server</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen">
      {/* Test Mode Badge */}
      <Link href="/map" className="absolute bottom-4 text-sm font-bold left-4 z-50 bg-blue-500 hover:bg-blue-600 text-light px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
        <FaGlobeAsia className="text-light" /> <span className="hidden sm:block">Map</span>
      </Link>

      {/* Game Map */}
      <FindThePilotGameMap 
        flights={quirkyFlights} 
        onPilotClick={handlePilotClick}
        targetPilot={targetPilot}
        onTargetFound={handleTargetFound}
        gameActive={gameActive}
        shouldZoomToTarget={shouldZoomToTarget}
        onZoomComplete={handleZoomComplete}
      />

      {/* Game Status Panel */}
      <div className="absolute bottom-4 right-4 z-50">
        {gameStatus === 'idle' && (
          <div className="p-6 bg-[#FFF8ED] rounded-lg shadow-xl flex flex-col items-center gap-4 w-80">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2"><BiSolidFaceMask /> Find the Pilot!</h2>
              <p className="text-sm text-gray-600">
                Select difficulty and find the target pilot
              </p>
            </div>

            {/* Difficulty Selection */}
            <div className="w-full space-y-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty:</label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(difficultySettings) as Difficulty[]).map((difficulty) => {
                  const config = difficultySettings[difficulty];
                  const isSelected = selectedDifficulty === difficulty;
                  
                  return (
                    <button
                      key={difficulty}
                      onClick={() => setSelectedDifficulty(difficulty)}
                      className={`p-3 rounded-lg border-2 text-left transition-colors ${
                        isSelected 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="flex flex-col gap-1">
                        <div className={`font-bold capitalize flex items-center gap-1 text-sm ${
                          difficulty === 'easy' ? 'text-green-600' :
                          difficulty === 'medium' ? 'text-yellow-600' :
                          difficulty === 'hard' ? 'text-red-600' :
                          difficulty === 'extreme' ? 'text-black' : 'text-gray-600'
                        }`}>
                          {difficulty === 'easy' ? <FaRegFaceGrinBeam /> : difficulty === 'medium' ? <FaRegFaceGrin /> : difficulty === 'hard' ? <FaRegFaceGrimace /> : <FaRegFaceAngry />} {difficulty.toUpperCase()}
                        </div>
                        <div className="text-xs text-gray-600">{config.description}</div>
                        <div className="text-xs font-bold text-gray-800">Max: {config.maxPoints} pts</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
            
            <button
              onClick={startGame}
              disabled={flights.length === 0}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              {flights.length === 0 ? 'Loading...' : `Start ${selectedDifficulty.toUpperCase()} Game`}
            </button>

            <button
              onClick={() => setShowLeaderboard(true)}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <GiPodiumWinner className="text-lg" />
              View Leaderboard
            </button>

            <p className="text-xs text-gray-500 text-center">
              {flights.length} pilots available • Expert Server
            </p>
          </div>
        )}

        {gameStatus === 'playing' && targetPilot && (
          <>
            {/* Main Game Panel */}
            {!isGamePanelHidden && (
              <div className="p-6 bg-[#FFF8ED] rounded-lg shadow-xl flex flex-col items-center gap-4 w-56 relative">
                {/* Hide Button */}
                <button
                  onClick={() => setIsGamePanelHidden(true)}
                  className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Hide panel"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                <div className="text-center">
                  <div className={`text-xs font-bold mb-2 flex items-center gap-2 ${
                    selectedDifficulty === 'easy' ? 'text-green-600' :
                    selectedDifficulty === 'medium' ? 'text-yellow-600' :
                    selectedDifficulty === 'hard' ? 'text-red-600' :
                    selectedDifficulty === 'extreme' ? 'text-black' : 'text-gray-600'
                  }`}>
                    {selectedDifficulty === 'easy' ? <FaRegFaceGrinBeam /> : selectedDifficulty === 'medium' ? <FaRegFaceGrin /> : selectedDifficulty === 'hard' ? <FaRegFaceGrimace /> : <FaRegFaceAngry />} {selectedDifficulty.toUpperCase()} MODE
                  </div>
                </div>

                <header className="text-center">
                  <h2 className="text-xl font-bold text-gray-800">{targetPilot.emoji} {targetPilot.username}</h2>
                  <p className="text-sm text-gray-600 font-medium">{targetPilot.callsign}</p>
                </header>

                <div className={`text-2xl font-black ${timeLeft <= 10 ? 'text-red-500' : 'text-green-500'}`}>
                  {timeLeft}s
                </div>

                <p className="text-xs text-white bg-gray-700 rounded-full font-medium px-3 py-1">
                  Find the pilot
                </p>

                <button
                  onClick={resetGame}
                  className="text-xs text-gray-500 hover:text-gray-700 underline"
                >
                  Give up
                </button>
        </div>
      )}

            {/* Collapsed Show Button */}
            {isGamePanelHidden && (
              <div className="flex flex-col gap-2">
                {/* Compact Info Bar */}
                <div className="bg-[#FFF8ED]/90 backdrop-blur-sm rounded-lg shadow-lg p-2 flex items-center gap-2 text-xs border border-orange-200">
                  <div className="text-lg">
                    {targetPilot.emoji}
                  </div>
                  <div className={`font-bold ${timeLeft <= 10 ? 'text-red-500' : 'text-green-500'}`}>
                    {timeLeft}s
                  </div>
                  <div className="text-gray-400">|</div>
                  <div className="text-gray-700 font-medium truncate max-w-20 flex flex-col">
                    <span className="text-gray-700 font-bold flex flex-col gap-1">{targetPilot.username}</span>
                    <span className="text-gray-500 text-[0.5rem]">{targetPilot.callsign}</span>
                  </div>
                </div>

                {/* Show Panel Button */}
                <button
                  onClick={() => setIsGamePanelHidden(false)}
                  className="bg-orange-100 hover:bg-orange-200 text-orange-700 border-2 border-orange-300 rounded-lg shadow-lg p-2 transition-colors self-end"
                  title="Show game panel"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
        </div>
            )}
          </>
        )}
      </div>

    
        
        {/* Auth Status Badge */}
        <div className="absolute left-1/2 -translate-x-1/2 w-[275px] top-18 sm:top-16">
            {isUserLoggedIn !== null && (
            <div className={`mt-2 px-2 py-1 rounded-full text-xs font-medium text-center ${
                isUserLoggedIn 
                ? 'bg-green-100 text-green-700 border border-green-300' 
                : 'bg-orange-100 text-orange-700 border border-orange-300'
            }`}>
                {isUserLoggedIn 
                ? '🏆 Scores count for leaderboard'
                : '🔐 Not logged in - scores won\'t be saved'
                }
            </div>
            )}
        </div>

      {/* Victory/Defeat Popup */}
      {(gameStatus === 'won' || (gameStatus === 'lost' && showDefeatPopup)) && (
        <>
          {/* Semi-transparent backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-[1001]" />

          {/* Centered popup */}
          <div className="absolute inset-0 flex items-center justify-center z-[1002]">
            {gameStatus === 'won' && (
              <div className="bg-[#FFF8ED] rounded-2xl shadow-2xl p-8 w-96 mx-4 border-4 border-green-500 animate-in zoom-in duration-300">
                <div className="text-center">
                  {/* Victory animation */}
                  <div className="text-6xl mb-4 animate-bounce flex items-center justify-center"><GiPodiumWinner className="text-green-500" /></div>
                  
                  <h1 className="text-3xl font-bold text-green-500 mb-4">Victory!</h1>
                  
                  <div className="bg-[#FFEFD5] shadow-lg rounded-lg p-4 mb-6 flex flex-col items-center justify-center">
                    <div className={`text-xs font-bold mb-2 flex items-center gap-2 ${
                      selectedDifficulty === 'easy' ? 'text-green-600' :
                      selectedDifficulty === 'medium' ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {selectedDifficulty === 'easy' ? <FaRegFaceGrinBeam /> : selectedDifficulty === 'medium' ? <FaRegFaceGrin /> : selectedDifficulty === 'hard' ? <FaRegFaceGrimace /> : <FaRegFaceAngry />} {selectedDifficulty.toUpperCase()} MODE
                    </div>
                    
                    <p className="text-lg text-green-800 font-semibold mb-2">
                      Found {targetPilot?.emoji} {targetPilot?.username}
                    </p>
                    <p className="text-sm text-green-600">
                      Callsign: {targetPilot?.callsign}
                    </p>
                    <p className="text-sm text-green-600">
                      Time: {completionTime} seconds
                    </p>
                    
                    {/* Points Display */}
                    <div className="mt-3 p-3 bg-transparent rounded-lg border-2 border-green-300">
                      <div className="text-2xl font-black text-green-700">
                        {earnedPoints} points
                      </div>
                      <div className="text-sm text-green-600 font-medium">
                        {performanceLevel}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleFinishGame}
                      disabled={isSaving}
                      className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                    >
                      {isSaving ? 'Saving...' : 'Finish Game'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {gameStatus === 'lost' && showDefeatPopup && (
              <div className="bg-[#FFF8ED] rounded-2xl shadow-2xl p-8 w-96 mx-4 border-4 border-red-300 animate-in zoom-in duration-300">
                <div className="text-center">
                  {/* Defeat animation */}
                  <div className="text-6xl mb-4 flex items-center justify-center">
                    <GrAlarm className="text-red-400" />
                  </div>
                  
                  <h1 className="text-3xl font-bold text-red-400 mb-4">Time's Up!</h1>
                  
                  <div className="bg-[#FFEFD5] shadow-lg rounded-lg p-4 mb-6 flex flex-col items-center justify-center">
                    <div className={`text-xs font-bold mb-2 flex items-center gap-2 ${
                      selectedDifficulty === 'easy' ? 'text-green-600' :
                      selectedDifficulty === 'medium' ? 'text-yellow-600' :
                      selectedDifficulty === 'hard' ? 'text-red-600' :
                      selectedDifficulty === 'extreme' ? 'text-black' : 'text-gray-600'
                    }`}>
                      {selectedDifficulty === 'easy' ? <FaRegFaceGrinBeam /> : selectedDifficulty === 'medium' ? <FaRegFaceGrin /> : selectedDifficulty === 'hard' ? <FaRegFaceGrimace /> : <FaRegFaceAngry />} {selectedDifficulty.toUpperCase()} MODE
      </div>

                    <p className="text-lg text-red-800 font-semibold mb-2">
                      Couldn't find {targetPilot?.emoji} {targetPilot?.username}
                    </p>
                    <p className="text-sm text-red-600">
                      Callsign: {targetPilot?.callsign}
                    </p>
                    {/* Zero Points Display */}
                    <div className="flex flex-col items-center justify-center mt-3 p-3 bg-transparent rounded-lg border-2 border-red-300">
                      <div className="text-2xl font-black text-red-500">
                        0 points
                      </div>
                      <div className="text-sm text-red-400 font-medium flex items-center gap-2">
                        <GrAlarm className="text-red-400" />
                         Time's Up!
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleFinishGame}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                    >
                      Finish Game
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Leaderboard Dialog */}
      <FindThePilotLeaderboard 
        isOpen={showLeaderboard}
        onClose={() => setShowLeaderboard(false)}
      />
    </div>
  );
};

export default GameMapPage;
