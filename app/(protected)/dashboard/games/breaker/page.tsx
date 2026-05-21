"use client"

import React, { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import { customUserImages } from '@/lib/data'

// ─── Constants ────────────────────────────────────────────────────────────────
const W = 480
const H = 560

const BRICK_COLS   = 6
const BRICK_ROWS   = 5
const BRICK_PAD_X  = 10
const BRICK_PAD_Y  = 8
const BRICK_START_Y = 68
const BRICK_W = (W - (BRICK_COLS + 1) * BRICK_PAD_X) / BRICK_COLS
const BRICK_H = 50

const PADDLE_W  = 92
const PADDLE_H  = 12
const PADDLE_Y  = H - 44
const BALL_R    = 8
const BALL_SPEED = 4.4

const ROLE_HP: Record<string, number> = { user: 1, mod: 2, staff: 3, dev: 4 }
const ROLE_PTS: Record<string, number> = { user: 10, mod: 25, staff: 50, dev: 100 }
const ROLE_COLOR: Record<string, string> = {
  user:  'rgba(96,165,250,0.25)',
  mod:   'rgba(167,139,250,0.25)',
  staff: 'rgba(251,191,36,0.25)',
  dev:   'rgba(52,211,153,0.25)',
}
const ROLE_BORDER: Record<string, string> = {
  user:  '#60a5fa',
  mod:   '#a78bfa',
  staff: '#fbbf24',
  dev:   '#34d399',
}

type Brick = {
  id: number
  x: number; y: number
  userIdx: number
  role: string
  hp: number; maxHp: number
  flash: number  // countdown frames for hit flash
  alive: boolean
}

type Ball = { x: number; y: number; vx: number; vy: number }

// ─── Build brick grid ─────────────────────────────────────────────────────────
function buildBricks(imgs: string[]): Brick[] {
  const total = BRICK_COLS * BRICK_ROWS
  // pick users randomly (with repeats if needed)
  const shuffled = [...customUserImages].sort(() => Math.random() - 0.5)
  const bricks: Brick[] = []

  for (let row = 0; row < BRICK_ROWS; row++) {
    for (let col = 0; col < BRICK_COLS; col++) {
      const idx = (row * BRICK_COLS + col) % shuffled.length
      const u = shuffled[idx]
      const role = u.role ?? 'user'
      const hp = ROLE_HP[role] ?? 1
      const x = BRICK_PAD_X + col * (BRICK_W + BRICK_PAD_X)
      const y = BRICK_START_Y + row * (BRICK_H + BRICK_PAD_Y)
      bricks.push({
        id: row * BRICK_COLS + col,
        x, y,
        userIdx: customUserImages.indexOf(u),
        role,
        hp, maxHp: hp,
        flash: 0,
        alive: true,
      })
    }
  }
  return bricks
}

function initBall(): Ball {
  const angle = (-Math.PI / 2) + (Math.random() - 0.5) * 0.6
  return {
    x: W / 2,
    y: PADDLE_Y - BALL_R - 2,
    vx: BALL_SPEED * Math.cos(angle),
    vy: BALL_SPEED * Math.sin(angle),
  }
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function BreakerPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imgsRef   = useRef<HTMLImageElement[]>([])

  const ballRef    = useRef<Ball>(initBall())
  const paddleXRef = useRef(W / 2 - PADDLE_W / 2)
  const bricksRef  = useRef<Brick[]>([])
  const livesRef   = useRef(3)
  const scoreRef   = useRef(0)
  const highRef    = useRef(0)
  const stateRef   = useRef<'idle' | 'playing' | 'dead' | 'won'>('idle')
  const rafRef     = useRef<number | null>(null)
  const keysRef    = useRef<Record<string, boolean>>({})

  const [lives, setLives]         = useState(3)
  const [score, setScore]         = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'dead' | 'won'>('idle')
  const [loaded, setLoaded]       = useState(false)

  // Load images
  useEffect(() => {
    const imgs = customUserImages.map(u => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.src = u.image
      return img
    })
    imgsRef.current = imgs
    let done = 0
    imgs.forEach(img => {
      const cb = () => { done++; if (done >= imgs.length) setLoaded(true) }
      img.onload = cb; img.onerror = cb
      if (img.complete) cb()
    })
    if (imgs.length === 0) setLoaded(true)
  }, [])

  // Load high score
  useEffect(() => {
    const s = parseInt(localStorage.getItem('breaker-high-score') ?? '', 10)
    if (!isNaN(s) && s > 0) { highRef.current = s; setHighScore(s) }
  }, [])

  const resetGame = useCallback(() => {
    ballRef.current    = initBall()
    paddleXRef.current = W / 2 - PADDLE_W / 2
    bricksRef.current  = buildBricks([])
    livesRef.current   = 3
    scoreRef.current   = 0
    stateRef.current   = 'idle'
    setLives(3)
    setScore(0)
    setGameState('idle')
  }, [])

  // ─── Draw ───────────────────────────────────────────────────────────────────
  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const imgs = imgsRef.current
    const state = stateRef.current

    // Background
    const bg = ctx.createLinearGradient(0, 0, 0, H)
    bg.addColorStop(0, '#0f1117')
    bg.addColorStop(1, '#1a1d2e')
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, W, H)

    // Bricks
    bricksRef.current.forEach(b => {
      if (!b.alive) return
      const hpFrac = b.hp / b.maxHp
      const flash = b.flash > 0

      // bg fill
      ctx.fillStyle = flash ? 'rgba(255,255,255,0.35)' : ROLE_COLOR[b.role] ?? ROLE_COLOR.user
      ctx.beginPath()
      ctx.roundRect(b.x, b.y, BRICK_W, BRICK_H, 8)
      ctx.fill()

      // avatar
      const img = imgs[b.userIdx % imgs.length]
      if (img?.complete && img.naturalWidth > 0) {
        ctx.save()
        const pad = 4
        const size = BRICK_H - pad * 2
        ctx.beginPath()
        ctx.arc(b.x + pad + size / 2, b.y + pad + size / 2, size / 2, 0, Math.PI * 2)
        ctx.clip()
        ctx.drawImage(img, b.x + pad, b.y + pad, size, size)
        ctx.restore()
      }

      // HP bar
      if (b.maxHp > 1) {
        const barW = BRICK_W - 12
        ctx.fillStyle = 'rgba(0,0,0,0.4)'
        ctx.fillRect(b.x + 6, b.y + BRICK_H - 8, barW, 4)
        ctx.fillStyle = ROLE_BORDER[b.role] ?? '#60a5fa'
        ctx.fillRect(b.x + 6, b.y + BRICK_H - 8, barW * hpFrac, 4)
      }

      // border
      ctx.strokeStyle = b.flash > 0 ? '#fff' : (ROLE_BORDER[b.role] ?? '#60a5fa')
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.roundRect(b.x, b.y, BRICK_W, BRICK_H, 8)
      ctx.stroke()

      if (b.flash > 0) b.flash--
    })

    // Paddle
    const px = paddleXRef.current
    const pGrad = ctx.createLinearGradient(px, PADDLE_Y, px + PADDLE_W, PADDLE_Y)
    pGrad.addColorStop(0, '#3b82f6')
    pGrad.addColorStop(1, '#6366f1')
    ctx.fillStyle = pGrad
    ctx.beginPath()
    ctx.roundRect(px, PADDLE_Y, PADDLE_W, PADDLE_H, PADDLE_H / 2)
    ctx.fill()

    // Ball
    const ball = ballRef.current
    const ballGrad = ctx.createRadialGradient(ball.x - 2, ball.y - 2, 1, ball.x, ball.y, BALL_R)
    ballGrad.addColorStop(0, '#fff')
    ballGrad.addColorStop(1, '#93c5fd')
    ctx.fillStyle = ballGrad
    ctx.beginPath()
    ctx.arc(ball.x, ball.y, BALL_R, 0, Math.PI * 2)
    ctx.fill()

    // HUD
    ctx.fillStyle = 'rgba(0,0,0,0)'
    for (let i = 0; i < livesRef.current; i++) {
      ctx.fillStyle = '#ef4444'
      ctx.font = '16px serif'
      ctx.fillText('❤️', 10 + i * 24, 24)
    }
    ctx.fillStyle = '#e2e8f0'
    ctx.font = 'bold 15px sans-serif'
    ctx.textAlign = 'right'
    ctx.textBaseline = 'top'
    ctx.fillText(`Score: ${scoreRef.current}`, W - 10, 8)

    // Overlays
    if (state === 'idle') {
      ctx.fillStyle = 'rgba(0,0,0,0.55)'
      ctx.fillRect(0, 0, W, H)
      ctx.fillStyle = '#fff'
      ctx.font = 'bold 26px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('Move mouse to aim', W / 2, H / 2 - 16)
      ctx.font = '15px sans-serif'
      ctx.fillStyle = 'rgba(255,255,255,0.7)'
      ctx.fillText('Click or Space to launch', W / 2, H / 2 + 18)
    }

    if (state === 'dead') {
      ctx.fillStyle = 'rgba(0,0,0,0.65)'
      ctx.fillRect(0, 0, W, H)
      ctx.fillStyle = '#fc8181'
      ctx.font = 'bold 30px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('Game Over!', W / 2, H / 2 - 28)
      ctx.fillStyle = '#fff'
      ctx.font = 'bold 18px sans-serif'
      ctx.fillText(`Score: ${scoreRef.current}`, W / 2, H / 2 + 6)
      ctx.fillStyle = '#fbbf24'
      ctx.fillText(`Best: ${highRef.current}`, W / 2, H / 2 + 32)
      ctx.font = '13px sans-serif'
      ctx.fillStyle = 'rgba(255,255,255,0.6)'
      ctx.fillText('Click or Space to retry', W / 2, H / 2 + 64)
    }

    if (state === 'won') {
      ctx.fillStyle = 'rgba(0,0,0,0.6)'
      ctx.fillRect(0, 0, W, H)
      ctx.fillStyle = '#34d399'
      ctx.font = 'bold 30px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('You cleared them all! 🎉', W / 2, H / 2 - 28)
      ctx.fillStyle = '#fff'
      ctx.font = 'bold 18px sans-serif'
      ctx.fillText(`Score: ${scoreRef.current}`, W / 2, H / 2 + 6)
      ctx.fillStyle = '#fbbf24'
      ctx.fillText(`Best: ${highRef.current}`, W / 2, H / 2 + 32)
      ctx.font = '13px sans-serif'
      ctx.fillStyle = 'rgba(255,255,255,0.6)'
      ctx.fillText('Click or Space to play again', W / 2, H / 2 + 64)
    }
  }, [])

  // ─── Physics tick ───────────────────────────────────────────────────────────
  const tick = useCallback(() => {
    if (stateRef.current !== 'playing') return

    const ball = ballRef.current

    // Keyboard paddle
    if (keysRef.current['ArrowLeft'] || keysRef.current['a']) {
      paddleXRef.current = Math.max(0, paddleXRef.current - 6)
    }
    if (keysRef.current['ArrowRight'] || keysRef.current['d']) {
      paddleXRef.current = Math.min(W - PADDLE_W, paddleXRef.current + 6)
    }

    ball.x += ball.vx
    ball.y += ball.vy

    // Wall bounces
    if (ball.x - BALL_R <= 0)  { ball.x = BALL_R;      ball.vx = Math.abs(ball.vx) }
    if (ball.x + BALL_R >= W)  { ball.x = W - BALL_R;  ball.vx = -Math.abs(ball.vx) }
    if (ball.y - BALL_R <= 0)  { ball.y = BALL_R;      ball.vy = Math.abs(ball.vy) }

    // Paddle collision
    const px = paddleXRef.current
    if (
      ball.vy > 0 &&
      ball.y + BALL_R >= PADDLE_Y &&
      ball.y + BALL_R <= PADDLE_Y + PADDLE_H + 2 &&
      ball.x >= px && ball.x <= px + PADDLE_W
    ) {
      ball.y = PADDLE_Y - BALL_R
      // angle based on hit position relative to paddle center
      const rel = (ball.x - (px + PADDLE_W / 2)) / (PADDLE_W / 2)
      const angle = rel * (Math.PI / 3)
      const speed = Math.hypot(ball.vx, ball.vy)
      ball.vx = speed * Math.sin(angle)
      ball.vy = -Math.abs(speed * Math.cos(angle))
    }

    // Ball lost
    if (ball.y - BALL_R > H) {
      livesRef.current--
      setLives(livesRef.current)
      if (livesRef.current <= 0) {
        stateRef.current = 'dead'
        setGameState('dead')
      } else {
        // reset ball
        ballRef.current = initBall()
        stateRef.current = 'idle'
        setGameState('idle')
      }
      return
    }

    // Brick collisions — one hit per frame max to prevent corner multi-damage
    let bricksLeft = 0
    let hitThisFrame = false

    bricksRef.current = bricksRef.current.map(b => {
      if (!b.alive) return b

      const bx2 = b.x + BRICK_W
      const by2 = b.y + BRICK_H
      const nearX = Math.max(b.x, Math.min(ball.x, bx2))
      const nearY = Math.max(b.y, Math.min(ball.y, by2))
      const dx = ball.x - nearX
      const dy = ball.y - nearY
      const distSq = dx * dx + dy * dy

      if (distSq > BALL_R * BALL_R) { bricksLeft++; return b }

      // Reflect using proper collision normal (handles corners correctly)
      if (!hitThisFrame) {
        hitThisFrame = true
        const dist = Math.sqrt(distSq) || 0.001
        const nx = dx / dist
        const ny = dy / dist
        // v' = v - 2(v·n)n
        const dot = ball.vx * nx + ball.vy * ny
        ball.vx -= 2 * dot * nx
        ball.vy -= 2 * dot * ny
        // Push ball out of brick so it doesn't re-trigger next frame
        const overlap = BALL_R - dist
        ball.x += nx * (overlap + 0.5)
        ball.y += ny * (overlap + 0.5)
      }

      // Damage
      const newHp = b.hp - 1
      const alive = newHp > 0
      if (!alive) {
        const pts = ROLE_PTS[b.role] ?? 10
        scoreRef.current += pts
        setScore(scoreRef.current)
        if (scoreRef.current > highRef.current) {
          highRef.current = scoreRef.current
          setHighScore(scoreRef.current)
          localStorage.setItem('breaker-high-score', String(scoreRef.current))
        }
      } else {
        bricksLeft++
      }

      return { ...b, hp: newHp, alive, flash: alive ? 6 : 0 }
    })

    if (bricksLeft === 0) {
      stateRef.current = 'won'
      setGameState('won')
    }
  }, [])

  // ─── RAF loop ───────────────────────────────────────────────────────────────
  const loop = useCallback(() => {
    tick()
    draw()
    rafRef.current = requestAnimationFrame(loop)
  }, [tick, draw])

  useEffect(() => {
    if (!loaded) return
    bricksRef.current = buildBricks([])
    rafRef.current = requestAnimationFrame(loop)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [loaded, loop])

  // ─── Input ──────────────────────────────────────────────────────────────────
  const launch = useCallback(() => {
    if (stateRef.current === 'idle') {
      stateRef.current = 'playing'
      setGameState('playing')
    } else if (stateRef.current === 'dead' || stateRef.current === 'won') {
      resetGame()
    }
  }, [resetGame])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      keysRef.current[e.key] = true
      if (e.key === ' ') { e.preventDefault(); launch() }
    }
    const onKeyUp = (e: KeyboardEvent) => { keysRef.current[e.key] = false }
    window.addEventListener('keydown', onKey)
    window.addEventListener('keyup', onKeyUp)
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('keyup', onKeyUp) }
  }, [launch])

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect()
    const mx = e.clientX - rect.left
    paddleXRef.current = Math.max(0, Math.min(W - PADDLE_W, mx - PADDLE_W / 2))
  }, [])

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] gap-6 p-4">
      <Link href="/dashboard/games" className="self-start flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
        ← Arcade
      </Link>
      {/* Mobile block */}
      <div className="md:hidden flex flex-col items-center text-center gap-4 py-20 px-6">
        <div className="text-6xl">🖥️</div>
        <h2 className="text-2xl font-black tracking-tight">Desktop Only</h2>
        <p className="text-muted-foreground text-sm max-w-xs">
          IFlytics Breaker requires a mouse. Please open on a desktop.
        </p>
      </div>

      {/* Desktop game */}
      <div className="hidden md:flex flex-col items-center gap-4 w-full">
        <div className="text-center">
          <h1 className="text-3xl font-black tracking-tight">IFlytics Breaker 🧱</h1>
          <p className="text-muted-foreground text-sm mt-1">Move mouse to aim paddle • Click or Space to launch</p>
          <p className="text-muted-foreground text-xs mt-0.5">
            <span className="text-blue-400 font-bold">User ×1hp +10</span>
            {' · '}
            <span className="text-purple-400 font-bold">Mod ×2hp +25</span>
            {' · '}
            <span className="text-yellow-400 font-bold">Staff ×3hp +50</span>
            {' · '}
            <span className="text-emerald-400 font-bold">Dev ×4hp +100</span>
          </p>
        </div>

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
            <div className="flex gap-0.5 justify-center text-lg">
              {Array.from({ length: 3 }).map((_, i) => (
                <span key={i}>{i < lives ? '❤️' : '🖤'}</span>
              ))}
            </div>
            <div className="text-muted-foreground text-xs">Lives</div>
          </div>
        </div>

        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          onMouseMove={onMouseMove}
          onClick={launch}
          className="rounded-2xl border-2 border-border shadow-2xl cursor-none select-none"
        />

        {!loaded && <p className="text-muted-foreground text-xs animate-pulse">Loading pilot avatars...</p>}
      </div>
    </div>
  )
}
