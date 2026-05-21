'use client'

import React, { useEffect, useState, useCallback, useRef } from 'react'
import Link from 'next/link'
import { customUserImages } from '@/lib/data'
import { RiRestartLine } from 'react-icons/ri'

const GRID_COLS = 4
const PAIR_COUNT = 8 // 8 pairs = 16 cards

type Card = {
  id: number
  userIdx: number
  flipped: boolean
  matched: boolean
}

function buildDeck(): Card[] {
  // Shuffle real indices from the full array so any pilot can be selected
  const allIndices = customUserImages.map((_, i) => i)
  for (let i = allIndices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allIndices[i], allIndices[j]] = [allIndices[j], allIndices[i]]
  }
  const picked = allIndices.slice(0, PAIR_COUNT)

  const pairs: Card[] = []
  picked.forEach(userIdx => {
    pairs.push({ id: pairs.length, userIdx, flipped: false, matched: false })
    pairs.push({ id: pairs.length, userIdx, flipped: false, matched: false })
  })

  // Fisher-Yates shuffle the deck
  for (let i = pairs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pairs[i], pairs[j]] = [pairs[j], pairs[i]]
  }

  // Re-assign sequential IDs after shuffle
  return pairs.map((c, i) => ({ ...c, id: i }))
}

function formatTime(s: number) {
  const m = Math.floor(s / 60)
  return `${m}:${(s % 60).toString().padStart(2, '0')}`
}

export default function MemoryPage() {
  const [deck, setDeck] = useState<Card[]>(() => buildDeck())
  const [selected, setSelected] = useState<number[]>([]) // card IDs
  const [moves, setMoves] = useState(0)
  const [matches, setMatches] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [started, setStarted] = useState(false)
  const [won, setWon] = useState(false)
  const [bestMoves, setBestMoves] = useState<number | null>(null)
  const [bestTime, setBestTime] = useState<number | null>(null)
  const [locked, setLocked] = useState(false)

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Load records
  useEffect(() => {
    const bm = parseInt(localStorage.getItem('memory-best-moves') ?? '', 10)
    const bt = parseInt(localStorage.getItem('memory-best-time') ?? '', 10)
    if (!isNaN(bm)) setBestMoves(bm)
    if (!isNaN(bt)) setBestTime(bt)
  }, [])

  // Timer
  useEffect(() => {
    if (started && !won) {
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [started, won])

  const reset = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    setDeck(buildDeck())
    setSelected([])
    setMoves(0)
    setMatches(0)
    setElapsed(0)
    setStarted(false)
    setWon(false)
    setLocked(false)
  }, [])

  const handleFlip = useCallback((cardId: number) => {
    if (locked || won) return
    const card = deck[cardId]
    if (card.flipped || card.matched) return
    if (selected.includes(cardId)) return

    if (!started) setStarted(true)

    const newSelected = [...selected, cardId]
    const newDeck = deck.map(c => c.id === cardId ? { ...c, flipped: true } : c)
    setDeck(newDeck)

    if (newSelected.length === 1) {
      setSelected(newSelected)
      return
    }

    // Two cards selected — check match
    setMoves(m => m + 1)
    setSelected([])

    const [firstId, secondId] = newSelected
    const first = newDeck[firstId]
    const second = newDeck[secondId]

    if (first.userIdx === second.userIdx) {
      // Match!
      const matched = newDeck.map(c =>
        c.id === firstId || c.id === secondId ? { ...c, matched: true } : c
      )
      setDeck(matched)
      const newMatches = matches + 1
      setMatches(newMatches)

      if (newMatches === PAIR_COUNT) {
        setWon(true)
        if (timerRef.current) clearInterval(timerRef.current)
        const finalMoves = moves + 1
        const bm = parseInt(localStorage.getItem('memory-best-moves') ?? '', 10)
        const bt = parseInt(localStorage.getItem('memory-best-time') ?? '', 10)
        if (isNaN(bm) || finalMoves < bm) {
          localStorage.setItem('memory-best-moves', String(finalMoves))
          setBestMoves(finalMoves)
        }
        if (isNaN(bt) || elapsed < bt) {
          localStorage.setItem('memory-best-time', String(elapsed))
          setBestTime(elapsed)
        }
      }
    } else {
      // No match — flip back after delay
      setLocked(true)
      setTimeout(() => {
        setDeck(prev =>
          prev.map(c =>
            c.id === firstId || c.id === secondId ? { ...c, flipped: false } : c
          )
        )
        setLocked(false)
      }, 900)
    }
  }, [deck, selected, locked, won, started, matches, moves, elapsed])

  const user = customUserImages

  return (
    <div className="flex flex-col items-center gap-6 p-4 min-h-[80vh]">
      <Link href="/dashboard/games" className="self-start flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
        ← Arcade
      </Link>
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-black tracking-tight">Memory Match 🃏</h1>
        <p className="text-muted-foreground text-sm mt-1">Match all pilot pairs to win</p>
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-8 text-sm font-bold flex-wrap justify-center">
        <div className="text-center">
          <div className="text-2xl font-black">{moves}</div>
          <div className="text-muted-foreground text-xs">Moves</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-black">{matches}/{PAIR_COUNT}</div>
          <div className="text-muted-foreground text-xs">Pairs</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-black text-blue-400">⏱ {formatTime(elapsed)}</div>
          <div className="text-muted-foreground text-xs">Time</div>
        </div>
        {bestMoves !== null && (
          <div className="text-center">
            <div className="text-2xl font-black text-yellow-500">🏆 {bestMoves}</div>
            <div className="text-muted-foreground text-xs">Best Moves</div>
          </div>
        )}
        {bestTime !== null && (
          <div className="text-center">
            <div className="text-2xl font-black text-emerald-500">⚡ {formatTime(bestTime)}</div>
            <div className="text-muted-foreground text-xs">Best Time</div>
          </div>
        )}
        <button
          onClick={reset}
          className="flex items-center gap-1.5 px-4 py-2 bg-muted hover:bg-muted/80 rounded-xl text-sm font-bold transition-colors"
        >
          <RiRestartLine size={16} /> Restart
        </button>
      </div>

      {/* Win banner */}
      {won && (
        <div className="w-full max-w-md bg-emerald-500/10 border border-emerald-500/30 rounded-2xl px-6 py-4 text-center">
          <div className="text-3xl mb-1">🎉</div>
          <div className="font-black text-xl tracking-tight text-emerald-500">You matched them all!</div>
          <div className="text-sm text-muted-foreground mt-1">
            {moves} moves · {formatTime(elapsed)}
          </div>
          <button
            onClick={reset}
            className="mt-3 px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-colors text-sm"
          >
            Play Again
          </button>
        </div>
      )}

      {/* Card grid */}
      <div
        className="grid gap-3"
        style={{ gridTemplateColumns: `repeat(${GRID_COLS}, minmax(0, 1fr))`, maxWidth: 420 }}
      >
        {deck.map(card => {
          const userData = user[card.userIdx]
          const isVisible = card.flipped || card.matched

          return (
            <div
              key={card.id}
              onClick={() => handleFlip(card.id)}
              className="relative cursor-pointer select-none"
              style={{ perspective: 600, width: 90, height: 90 }}
            >
              <div
                className="relative w-full h-full transition-transform duration-300"
                style={{
                  transformStyle: 'preserve-3d',
                  transform: isVisible ? 'rotateY(180deg)' : 'rotateY(0deg)',
                }}
              >
                {/* Back face */}
                <div
                  className="absolute inset-0 rounded-2xl flex items-center justify-center text-2xl border-2 border-border bg-card shadow-sm"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  ✈️
                </div>

                {/* Front face */}
                <div
                  className={`absolute inset-0 rounded-2xl flex flex-col items-center justify-center gap-1 border-2 shadow-sm overflow-hidden ${
                    card.matched
                      ? 'border-emerald-500 bg-emerald-500/10'
                      : 'border-blue-400 bg-blue-500/10'
                  }`}
                  style={{
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                  }}
                >
                  <img
                    src={userData?.image}
                    alt={userData?.username}
                    className="w-12 h-12 rounded-full object-cover"
                    draggable={false}
                  />
                  <span className="text-[9px] font-bold text-muted-foreground truncate max-w-[80px] text-center px-1">
                    @{userData?.username}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
