"use client"

import React, { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import { customUserImages } from '@/lib/data'

// ─── Config ───────────────────────────────────────────────────────────────────
const HOLES        = 9
const GAME_SECS    = 30
const SPAWN_RATE   = 900   // ms between spawn attempts

const ROLE_PTS: Record<string, number>     = { user: 10,  mod: 25,   staff: 50,  dev: 100 }
const ROLE_VISIBLE: Record<string, number> = { user: 1400, mod: 1100, staff: 800, dev: 550 }
const ROLE_LABEL: Record<string, string>   = { user: 'User', mod: 'Mod', staff: 'Staff', dev: 'Dev' }
const ROLE_COLOR: Record<string, string>   = {
  user:  'ring-blue-400',
  mod:   'ring-purple-400',
  staff: 'ring-yellow-400',
  dev:   'ring-emerald-400',
}
const ROLE_PTS_COLOR: Record<string, string> = {
  user:  'text-blue-400',
  mod:   'text-purple-400',
  staff: 'text-yellow-400',
  dev:   'text-emerald-400',
}

type MoleState = 'hidden' | 'up' | 'whacked'
type Hole = {
  idx: number
  state: MoleState
  userIdx: number
  role: string
  popKey: number   // increments to re-trigger animation
}

function emptyHoles(): Hole[] {
  return Array.from({ length: HOLES }, (_, i) => ({
    idx: i, state: 'hidden', userIdx: 0, role: 'user', popKey: 0,
  }))
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function WhackPage() {
  const [holes, setHoles]         = useState<Hole[]>(emptyHoles())
  const [score, setScore]         = useState(0)
  const [misses, setMisses]       = useState(0)
  const [timeLeft, setTimeLeft]   = useState(GAME_SECS)
  const [highScore, setHighScore] = useState(0)
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'over'>('idle')
  const [floats, setFloats]       = useState<{ id: number; pts: number; role: string; x: number; y: number }[]>([])

  const holesRef     = useRef<Hole[]>(emptyHoles())
  const scoreRef     = useRef(0)
  const highRef      = useRef(0)
  const gameRef      = useRef<'idle' | 'playing' | 'over'>('idle')
  const moleTimers   = useRef<Record<number, ReturnType<typeof setTimeout>>>({})
  const spawnTimer   = useRef<ReturnType<typeof setInterval> | null>(null)
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const floatId      = useRef(0)

  useEffect(() => {
    const s = parseInt(localStorage.getItem('whack-high-score') ?? '', 10)
    if (!isNaN(s) && s > 0) { highRef.current = s; setHighScore(s) }
  }, [])

  const clearAllMoleTimers = useCallback(() => {
    Object.values(moleTimers.current).forEach(clearTimeout)
    moleTimers.current = {}
  }, [])

  const hideMole = useCallback((holeIdx: number) => {
    holesRef.current = holesRef.current.map(h =>
      h.idx === holeIdx && h.state === 'up' ? { ...h, state: 'hidden' } : h
    )
    setHoles([...holesRef.current])
    delete moleTimers.current[holeIdx]
  }, [])

  const spawnMole = useCallback(() => {
    if (gameRef.current !== 'playing') return

    const available = holesRef.current
      .filter(h => h.state === 'hidden')
      .map(h => h.idx)
    if (available.length === 0) return

    const holeIdx = available[Math.floor(Math.random() * available.length)]
    const entry = customUserImages[Math.floor(Math.random() * customUserImages.length)]
    const role = entry.role ?? 'user'
    const userIdx = customUserImages.indexOf(entry)

    holesRef.current = holesRef.current.map(h =>
      h.idx === holeIdx
        ? { ...h, state: 'up', userIdx, role, popKey: h.popKey + 1 }
        : h
    )
    setHoles([...holesRef.current])

    // Auto-hide after visible duration
    moleTimers.current[holeIdx] = setTimeout(() => hideMole(holeIdx), ROLE_VISIBLE[role] ?? 1400)
  }, [hideMole])

  const endGame = useCallback(() => {
    gameRef.current = 'over'
    setGameState('over')
    clearAllMoleTimers()
    if (spawnTimer.current) clearInterval(spawnTimer.current)
    if (countdownRef.current) clearInterval(countdownRef.current)
    // Hide all moles
    holesRef.current = holesRef.current.map(h => ({ ...h, state: 'hidden' }))
    setHoles([...holesRef.current])
    // Save high score
    if (scoreRef.current > highRef.current) {
      highRef.current = scoreRef.current
      setHighScore(scoreRef.current)
      localStorage.setItem('whack-high-score', String(scoreRef.current))
    }
  }, [clearAllMoleTimers])

  const startGame = useCallback(() => {
    clearAllMoleTimers()
    if (spawnTimer.current) clearInterval(spawnTimer.current)
    if (countdownRef.current) clearInterval(countdownRef.current)

    holesRef.current = emptyHoles()
    scoreRef.current = 0
    gameRef.current  = 'playing'
    setHoles(emptyHoles())
    setScore(0)
    setMisses(0)
    setTimeLeft(GAME_SECS)
    setFloats([])
    setGameState('playing')

    spawnTimer.current = setInterval(spawnMole, SPAWN_RATE)

    let t = GAME_SECS
    countdownRef.current = setInterval(() => {
      t--
      setTimeLeft(t)
      if (t <= 0) endGame()
    }, 1000)
  }, [spawnMole, endGame, clearAllMoleTimers])

  const handleWhack = useCallback((holeIdx: number, e: React.MouseEvent) => {
    if (gameRef.current !== 'playing') return
    const hole = holesRef.current[holeIdx]
    if (hole.state !== 'up') return

    // Clear auto-hide timer
    if (moleTimers.current[holeIdx]) {
      clearTimeout(moleTimers.current[holeIdx])
      delete moleTimers.current[holeIdx]
    }

    const pts = ROLE_PTS[hole.role] ?? 10
    scoreRef.current += pts
    setScore(scoreRef.current)

    // Float +pts label
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const id = floatId.current++
    setFloats(prev => [...prev, { id, pts, role: hole.role, x: rect.left + rect.width / 2, y: rect.top }])
    setTimeout(() => setFloats(prev => prev.filter(f => f.id !== id)), 700)

    holesRef.current = holesRef.current.map(h =>
      h.idx === holeIdx ? { ...h, state: 'whacked' } : h
    )
    setHoles([...holesRef.current])

    // Brief whacked state then hide
    setTimeout(() => {
      holesRef.current = holesRef.current.map(h =>
        h.idx === holeIdx ? { ...h, state: 'hidden' } : h
      )
      setHoles([...holesRef.current])
    }, 280)
  }, [])

  const handleMiss = useCallback(() => {
    if (gameRef.current !== 'playing') return
    setMisses(m => m + 1)
  }, [])

  useEffect(() => () => {
    clearAllMoleTimers()
    if (spawnTimer.current) clearInterval(spawnTimer.current)
    if (countdownRef.current) clearInterval(countdownRef.current)
  }, [clearAllMoleTimers])

  const timerPct = (timeLeft / GAME_SECS) * 100
  const timerColor = timeLeft > 10 ? 'bg-emerald-500' : timeLeft > 5 ? 'bg-yellow-500' : 'bg-red-500'

  return (
    <div className="flex flex-col items-center gap-6 p-4 min-h-[80vh]">
      <Link href="/dashboard/games" className="self-start flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
        ← Arcade
      </Link>
      {/* Floating point labels */}
      {floats.map(f => (
        <div
          key={f.id}
          className={`fixed pointer-events-none font-black text-lg z-50 animate-bounce ${ROLE_PTS_COLOR[f.role]}`}
          style={{ left: f.x, top: f.y, transform: 'translate(-50%, -100%)' }}
        >
          +{f.pts}
        </div>
      ))}

      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-black tracking-tight">Whack the Users 🔨</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Click pilots before they hide! Higher role = more points but faster!
        </p>
        <p className="text-muted-foreground text-xs mt-0.5">
          <span className="text-blue-400 font-bold">User +10</span>
          {' · '}
          <span className="text-purple-400 font-bold">Mod +25</span>
          {' · '}
          <span className="text-yellow-400 font-bold">Staff +50</span>
          {' · '}
          <span className="text-emerald-400 font-bold">Dev +100</span>
        </p>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-8 text-sm font-bold flex-wrap justify-center">
        <div className="text-center">
          <div className="text-2xl font-black">{score}</div>
          <div className="text-muted-foreground text-xs">Score</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-black text-yellow-500">🏆 {highScore}</div>
          <div className="text-muted-foreground text-xs">Best</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-black text-red-400">{misses}</div>
          <div className="text-muted-foreground text-xs">Misses</div>
        </div>
        <div className="text-center">
          <div className={`text-2xl font-black ${timeLeft <= 5 ? 'text-red-500 animate-pulse' : ''}`}>
            ⏱ {timeLeft}s
          </div>
          <div className="text-muted-foreground text-xs">Time</div>
        </div>
      </div>

      {/* Timer bar */}
      <div className="w-full max-w-sm h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${timerColor}`}
          style={{ width: `${timerPct}%` }}
        />
      </div>

      {/* Game over banner */}
      {gameState === 'over' && (
        <div className="w-full max-w-sm bg-card border rounded-2xl px-6 py-4 text-center shadow-lg">
          <div className="text-3xl mb-1">🔨</div>
          <div className="font-black text-xl tracking-tight">Time's up!</div>
          <div className="text-2xl font-black mt-1">{score} pts</div>
          {score >= highScore && score > 0 && (
            <div className="text-emerald-500 text-sm font-bold mt-1">🎉 New High Score!</div>
          )}
          <div className="text-muted-foreground text-sm mt-1">{misses} misses</div>
          <button
            onClick={startGame}
            className="mt-3 px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl transition-colors text-sm"
          >
            Play Again
          </button>
        </div>
      )}

      {/* Grid */}
      <div
        className="grid gap-4 select-none"
        style={{ gridTemplateColumns: 'repeat(3, 1fr)', maxWidth: 420 }}
        onClick={gameState === 'playing' ? handleMiss : undefined}
      >
        {holes.map(hole => {
          const entry = customUserImages[hole.userIdx]
          const isUp      = hole.state === 'up'
          const isWhacked = hole.state === 'whacked'
          const isVisible = isUp || isWhacked

          return (
            <div
              key={hole.idx}
              className="relative flex flex-col items-center"
              style={{ width: 120, height: 120 }}
            >
              {/* Hole */}
              <div className="absolute bottom-0 w-24 h-10 bg-[#3b2a1a] rounded-full border-4 border-[#2a1e10] shadow-inner" />

              {/* Mole container — clips below hole line */}
              <div className="absolute bottom-4 w-24 overflow-hidden" style={{ height: 100 }}>
                <div
                  key={hole.popKey}
                  className="absolute bottom-0 left-0 right-0 flex flex-col items-center cursor-pointer"
                  style={{
                    transform: isVisible ? 'translateY(0)' : 'translateY(100%)',
                    transition: 'transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    opacity: isVisible ? 1 : 0,
                  }}
                  onClick={e => { e.stopPropagation(); handleWhack(hole.idx, e) }}
                >
                  <div
                    className={`relative rounded-full overflow-hidden ring-4 shadow-xl transition-all duration-150 ${
                      ROLE_COLOR[hole.role] ?? 'ring-blue-400'
                    } ${isWhacked ? 'scale-75 opacity-50' : 'hover:scale-105'}`}
                    style={{ width: 72, height: 72 }}
                  >
                    {entry && (
                      <img
                        src={entry.image}
                        alt={entry.username}
                        className="w-full h-full object-cover"
                        draggable={false}
                      />
                    )}
                    {isWhacked && (
                      <div className="absolute inset-0 flex items-center justify-center text-2xl bg-black/40">
                        💥
                      </div>
                    )}
                  </div>
                  {/* Role badge */}
                  {isUp && (
                    <div className={`text-[9px] font-black mt-0.5 ${ROLE_PTS_COLOR[hole.role]}`}>
                      {ROLE_LABEL[hole.role] ?? 'User'} +{ROLE_PTS[hole.role] ?? 10}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Start button */}
      {gameState === 'idle' && (
        <button
          onClick={startGame}
          className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white text-lg font-black rounded-2xl transition-colors shadow-lg"
        >
          Start Game
        </button>
      )}
    </div>
  )
}
