"use client"

import React, { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import { customUserImages } from '@/lib/data'
import { VscSnake } from 'react-icons/vsc'

const CELL_SIZE = 40
const COLS = 16
const ROWS = 16
const CANVAS_W = COLS * CELL_SIZE
const CANVAS_H = ROWS * CELL_SIZE
const INITIAL_SPEED = 150

const ROLE_POINTS: Record<string, number> = {
  user: 10,
  mod: 25,
  staff: 50,
  dev: 100,
}

const ROLE_RING: Record<string, string> = {
  user: 'rgba(99,179,237,0.9)',
  mod: 'rgba(167,139,250,0.9)',
  staff: 'rgba(251,191,36,0.9)',
  dev: 'rgba(52,211,153,0.9)',
}

type Point = { x: number; y: number }
type Dir = { x: number; y: number }
type UserEntry = { img: HTMLImageElement; username: string; role: string }

const DIRS: Record<string, Dir> = {
  ArrowUp:    { x: 0,  y: -1 },
  ArrowDown:  { x: 0,  y:  1 },
  ArrowLeft:  { x: -1, y:  0 },
  ArrowRight: { x: 1,  y:  0 },
  w: { x: 0,  y: -1 },
  s: { x: 0,  y:  1 },
  a: { x: -1, y:  0 },
  d: { x: 1,  y:  0 },
}

function randomCell(exclude: Point[]): Point {
  let p: Point
  do {
    p = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) }
  } while (exclude.some(e => e.x === p.x && e.y === p.y))
  return p
}

function drawAvatar(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement | null,
  x: number, y: number,
  size: number,
  ringColor: string,
  label?: string,
) {
  ctx.save()
  const cx = x + size / 2
  const cy = y + size / 2
  const r = size / 2 - 2

  ctx.beginPath()
  ctx.arc(cx, cy, r + 2, 0, 2 * Math.PI)
  ctx.strokeStyle = ringColor
  ctx.lineWidth = 3
  ctx.stroke()

  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, 2 * Math.PI)
  ctx.clip()

  // Always fill background first (ctx.fill() has no path after clip)
  ctx.fillStyle = '#4a5568'
  ctx.fillRect(x, y, size, size)

  if (img && img.complete && img.naturalWidth > 0) {
    ctx.drawImage(img, x + 2, y + 2, size - 4, size - 4)
  } else {
    ctx.fillStyle = '#fff'
    ctx.font = `bold ${size * 0.4}px sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(label?.[0]?.toUpperCase() ?? '?', cx, cy)
  }

  ctx.restore()
}

export default function SnakePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const shuffledRef = useRef<UserEntry[]>([])

  const snakeRef = useRef<Point[]>([{ x: 8, y: 8 }])
  const dirRef = useRef<Dir>({ x: 1, y: 0 })
  const nextDirRef = useRef<Dir>({ x: 1, y: 0 })
  const foodRef = useRef<Point>(randomCell([{ x: 8, y: 8 }]))
  const scoreRef = useRef(0)
  const highScoreRef = useRef(0)
  const highLengthRef = useRef(0)
  const hueRef = useRef(0)
  const eatenRef = useRef<UserEntry[]>([])
  const startTimeRef = useRef<number | null>(null)
  const elapsedRef = useRef(0)
  const gameOverRef = useRef(false)
  const startedRef = useRef(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const rafRef = useRef<number | null>(null)

  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [highLength, setHighLength] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [started, setStarted] = useState(false)
  const [imagesLoaded, setImagesLoaded] = useState(false)
  const [eatenList, setEatenList] = useState<UserEntry[]>([])

  useEffect(() => {
    const savedScore = parseInt(localStorage.getItem('snake-high-score') ?? '0', 10)
    if (!isNaN(savedScore) && savedScore > 0) { highScoreRef.current = savedScore; setHighScore(savedScore) }
    const savedLen = parseInt(localStorage.getItem('snake-high-length') ?? '0', 10)
    if (!isNaN(savedLen) && savedLen > 0) { highLengthRef.current = savedLen; setHighLength(savedLen) }
  }, [])

  useEffect(() => {
    const entries: UserEntry[] = customUserImages.map((u) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.src = u.image
      return { img, username: u.username, role: u.role }
    })
    // Fisher-Yates shuffle
    for (let i = entries.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [entries[i], entries[j]] = [entries[j], entries[i]]
    }
    shuffledRef.current = entries

    let loaded = 0
    entries.forEach(({ img }) => {
      const onDone = () => { loaded++; if (loaded >= entries.length) setImagesLoaded(true) }
      img.onload = onDone
      img.onerror = onDone
      if (img.complete) onDone()
    })
    if (entries.length === 0) setImagesLoaded(true)
  }, [])

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const entries = shuffledRef.current

    // background grid
    ctx.fillStyle = '#0f1117'
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)
    for (let col = 0; col < COLS; col++) {
      for (let row = 0; row < ROWS; row++) {
        ctx.fillStyle = (col + row) % 2 === 0 ? '#1a1d27' : '#1e2130'
        ctx.fillRect(col * CELL_SIZE, row * CELL_SIZE, CELL_SIZE, CELL_SIZE)
      }
    }

    // food — next entry, rainbow border
    if (entries.length > 0) {
      const food = foodRef.current
      const nextEntry = entries[snakeRef.current.length % entries.length]
      const rainbowColor = `hsl(${hueRef.current}, 100%, 60%)`
      drawAvatar(ctx, nextEntry.img, food.x * CELL_SIZE, food.y * CELL_SIZE, CELL_SIZE, rainbowColor, nextEntry.username)

      // username label above food
      const fx = food.x * CELL_SIZE + CELL_SIZE / 2
      const fy = food.y * CELL_SIZE - 4
      const pts = ROLE_POINTS[nextEntry.role] ?? 10
      const label = `@${nextEntry.username} +${pts}`
      const labelW = ctx.measureText(label).width + 10

      ctx.font = 'bold 10px sans-serif'
      ctx.fillStyle = 'rgba(0,0,0,0.7)'
      ctx.fillRect(fx - labelW / 2, fy - 14, labelW, 14)
      ctx.fillStyle = nextEntry.role === 'dev' ? '#34d399' : nextEntry.role === 'staff' ? '#fbbf24' : nextEntry.role === 'mod' ? '#a78bfa' : '#93c5fd'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'bottom'
      ctx.fillText(label, fx, fy)
    }

    // snake body — ring color based on role of that segment's entry
    const snake = snakeRef.current
    snake.forEach((seg, i) => {
      const entry = entries[i % entries.length]
      const ring = ROLE_RING[entry?.role ?? 'user'] ?? 'rgba(99,179,237,0.9)'
      drawAvatar(ctx, entry?.img ?? null, seg.x * CELL_SIZE, seg.y * CELL_SIZE, CELL_SIZE, ring, entry?.username)
    })

    // score overlay
    ctx.fillStyle = 'rgba(0,0,0,0.5)'
    ctx.fillRect(4, 4, 110, 28)
    ctx.fillStyle = '#e2e8f0'
    ctx.font = 'bold 14px sans-serif'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    ctx.fillText(`Score: ${scoreRef.current}`, 10, 10)

    if (!startedRef.current) {
      ctx.fillStyle = 'rgba(0,0,0,0.6)'
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)
      ctx.fillStyle = '#fff'
      ctx.font = 'bold 22px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('Press any arrow key to start', CANVAS_W / 2, CANVAS_H / 2)
    }

    if (gameOverRef.current) {
      ctx.fillStyle = 'rgba(0,0,0,0.7)'
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)
      ctx.fillStyle = '#fc8181'
      ctx.font = 'bold 28px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('Game Over!', CANVAS_W / 2, CANVAS_H / 2 - 28)
      ctx.fillStyle = '#e2e8f0'
      ctx.font = '18px sans-serif'
      ctx.fillText(`Score: ${scoreRef.current}`, CANVAS_W / 2, CANVAS_H / 2 + 6)
      ctx.font = '13px sans-serif'
      ctx.fillStyle = '#a0aec0'
      ctx.fillText('Press R to restart', CANVAS_W / 2, CANVAS_H / 2 + 32)
    }
  }, [])

  const startRaf = useCallback(() => {
    const loop = () => {
      hueRef.current = (hueRef.current + 2) % 360
      draw()
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)
  }, [draw])

  const stopRaf = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }, [])

  const tick = useCallback(() => {
    if (gameOverRef.current) return

    dirRef.current = nextDirRef.current
    const snake = snakeRef.current
    const head = snake[0]
    const newHead = {
      x: (head.x + dirRef.current.x + COLS) % COLS,
      y: (head.y + dirRef.current.y + ROWS) % ROWS,
    }

    if (snake.some(s => s.x === newHead.x && s.y === newHead.y)) {
      gameOverRef.current = true
      elapsedRef.current = startTimeRef.current ? Math.floor((Date.now() - startTimeRef.current) / 1000) : 0
      setElapsed(elapsedRef.current)
      setGameOver(true)
      setEatenList([...eatenRef.current])
      if (intervalRef.current) clearInterval(intervalRef.current)
      return
    }

    const ateFood = newHead.x === foodRef.current.x && newHead.y === foodRef.current.y
    const newSnake = [newHead, ...snake]
    if (!ateFood) {
      newSnake.pop()
    } else {
      const entries = shuffledRef.current
      const eatenEntry = entries[snake.length % entries.length]
      const pts = ROLE_POINTS[eatenEntry?.role ?? 'user'] ?? 10
      scoreRef.current += pts
      setScore(scoreRef.current)
      eatenRef.current = [...eatenRef.current, eatenEntry]
      if (scoreRef.current > highScoreRef.current) {
        highScoreRef.current = scoreRef.current
        setHighScore(scoreRef.current)
        localStorage.setItem('snake-high-score', String(scoreRef.current))
      }
      const newLen = newSnake.length
      if (newLen > highLengthRef.current) {
        highLengthRef.current = newLen
        setHighLength(newLen)
        localStorage.setItem('snake-high-length', String(newLen))
      }
      foodRef.current = randomCell(newSnake)
    }

    snakeRef.current = newSnake
    // update elapsed every tick for display
    if (startTimeRef.current) {
      elapsedRef.current = Math.floor((Date.now() - startTimeRef.current) / 1000)
      setElapsed(elapsedRef.current)
    }
  }, [])

  const reset = useCallback(() => {
    stopRaf()
    if (intervalRef.current) clearInterval(intervalRef.current)
    snakeRef.current = [{ x: 8, y: 8 }]
    dirRef.current = { x: 1, y: 0 }
    nextDirRef.current = { x: 1, y: 0 }
    foodRef.current = randomCell([{ x: 8, y: 8 }])
    scoreRef.current = 0
    eatenRef.current = []
    startTimeRef.current = null
    elapsedRef.current = 0
    gameOverRef.current = false
    startedRef.current = false
    setScore(0)
    setElapsed(0)
    setGameOver(false)
    setStarted(false)
    setEatenList([])
    startRaf()
  }, [startRaf, stopRaf])

  const startGame = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    startedRef.current = true
    startTimeRef.current = Date.now()
    setStarted(true)
    intervalRef.current = setInterval(tick, INITIAL_SPEED)
  }, [tick])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'r' || e.key === 'R') { reset(); return }
      const newDir = DIRS[e.key]
      if (!newDir) return
      e.preventDefault()
      const cur = dirRef.current
      if (newDir.x === -cur.x && newDir.y === -cur.y) return
      nextDirRef.current = newDir
      if (!startedRef.current && !gameOverRef.current) startGame()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [reset, startGame])

  useEffect(() => {
    if (imagesLoaded) startRaf()
    return () => stopRaf()
  }, [imagesLoaded, startRaf, stopRaf])

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      stopRaf()
    }
  }, [stopRaf])

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  const roleBadgeClass = (role: string) => {
    if (role === 'dev')   return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
    if (role === 'staff') return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40'
    if (role === 'mod')   return 'bg-purple-500/20 text-purple-400 border border-purple-500/40'
    return 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] gap-6 p-4">
      <Link href="/dashboard/games" className="self-start flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
        ← Arcade
      </Link>
      {/* Mobile block */}
      <div className="md:hidden flex flex-col items-center justify-center text-center gap-4 py-20 px-6">
        <div className="text-6xl">🖥️</div>
        <h2 className="text-2xl font-black tracking-tight">Desktop Only</h2>
        <p className="text-muted-foreground text-sm max-w-xs">
          IFlytics Snake requires a keyboard to play. Please open this page on a desktop or laptop.
        </p>
      </div>

      {/* Desktop game */}
      <div className="hidden md:flex flex-col items-center gap-6 w-full">
        <div className="text-center">
          <h1 className="text-3xl font-black tracking-tight">IFlytics Snake <VscSnake className="w-4 h-4 inline-block mr-2" /></h1>
          <p className="text-muted-foreground text-sm mt-1">Use arrow keys or WASD • R to restart</p>
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

        <div className="flex items-center gap-6 text-sm font-bold flex-wrap justify-center">
          <div className="text-center">
            <div className="text-2xl font-black">{score}</div>
            <div className="text-muted-foreground text-xs">Score</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-black text-yellow-500">🏆 {highScore}</div>
            <div className="text-muted-foreground text-xs">Best Score</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-black">{snakeRef.current.length}</div>
            <div className="text-muted-foreground text-xs">Length</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-black text-emerald-500">📏 {highLength}</div>
            <div className="text-muted-foreground text-xs">Best Length</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-black text-blue-400">⏱ {formatTime(elapsed)}</div>
            <div className="text-muted-foreground text-xs">Time</div>
          </div>
        </div>

        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          className="rounded-2xl border-2 border-border shadow-2xl"
          tabIndex={0}
        />

        <div className="flex gap-3">
          {!started && !gameOver && (
            <button onClick={startGame} className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl transition-colors">
              Start Game
            </button>
          )}
          {(gameOver || started) && (
            <button onClick={reset} className="px-6 py-2 bg-gray-600 hover:bg-gray-500 text-white font-bold rounded-xl transition-colors">
              Restart
            </button>
          )}
        </div>

        {/* Game over eaten list */}
        {gameOver && eatenList.length > 0 && (
          <div className="w-full max-w-xl">
            <div className="flex items-center justify-center gap-4 mb-3">
              <h2 className="text-lg font-black tracking-tight">Users you nom nommed 🐍</h2>
              <span className="text-sm text-muted-foreground font-medium">⏱ {formatTime(elapsed)}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {eatenList.map((entry, i) => (
                <div key={i} className="flex items-center gap-2 bg-card border rounded-xl px-3 py-2">
                  <img
                    src={entry.img.src}
                    alt={entry.username}
                    className="w-8 h-8 rounded-full object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-bold truncate">@{entry.username}</div>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${roleBadgeClass(entry.role)}`}>
                      {entry.role.charAt(0).toUpperCase() + entry.role.slice(1)} +{ROLE_POINTS[entry.role] ?? 10}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!imagesLoaded && (
          <p className="text-muted-foreground text-xs animate-pulse">Loading pilot avatars...</p>
        )}
      </div>
    </div>
  )
}
