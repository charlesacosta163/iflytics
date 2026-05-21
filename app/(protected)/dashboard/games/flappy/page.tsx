"use client"

import React, { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import { customUserImages } from '@/lib/data'
import { createClient } from '@/lib/supabase/client'

// ─── Constants ────────────────────────────────────────────────────────────────
const W = 480
const H = 580
const GROUND_H = 60
const PLAY_H = H - GROUND_H

const GRAVITY = 0.38
const FLAP = -7.5
const PLAYER_R = 16
const PLAYER_X = 100

const PIPE_W = 58
const PIPE_GAP = 155
const PIPE_SPEED = 2.6
const PIPE_INTERVAL = 1700 // ms between pipes

// Cloud definitions (x offset gets randomised at init)
type Cloud = { x: number; y: number; r: number; speed: number; layer: number }
type Pipe  = { x: number; topH: number; passed: boolean; avatarIdx: number; username: string }

// ─── Helpers ──────────────────────────────────────────────────────────────────
function makeClouds(): Cloud[] {
  const clouds: Cloud[] = []
  for (let i = 0; i < 6; i++) {
    clouds.push({
      x: Math.random() * W,
      y: 40 + Math.random() * (PLAY_H * 0.45),
      r: 28 + Math.random() * 28,
      speed: 0.3 + Math.random() * 0.3,
      layer: 0,
    })
  }
  for (let i = 0; i < 4; i++) {
    clouds.push({
      x: Math.random() * W,
      y: 30 + Math.random() * (PLAY_H * 0.4),
      r: 18 + Math.random() * 18,
      speed: 0.7 + Math.random() * 0.4,
      layer: 1,
    })
  }
  return clouds
}

function drawCloud(ctx: CanvasRenderingContext2D, cloud: Cloud, alpha: number) {
  ctx.save()
  ctx.globalAlpha = alpha
  ctx.fillStyle = '#fff'
  ctx.beginPath()
  ctx.ellipse(cloud.x, cloud.y, cloud.r * 1.6, cloud.r * 0.8, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(cloud.x - cloud.r * 0.5, cloud.y, cloud.r * 0.7, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(cloud.x + cloud.r * 0.5, cloud.y, cloud.r * 0.75, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(cloud.x, cloud.y - cloud.r * 0.5, cloud.r * 0.85, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

function drawPipe(
  ctx: CanvasRenderingContext2D,
  pipe: Pipe,
  imgs: HTMLImageElement[],
) {
  const topY = pipe.topH
  const botY = pipe.topH + PIPE_GAP
  const pipeColor = '#4ade80'
  const pipeDark  = '#16a34a'
  const capH = 18

  // top pipe body
  ctx.fillStyle = pipeColor
  ctx.fillRect(pipe.x, 0, PIPE_W, topY - capH)
  ctx.fillStyle = pipeDark
  ctx.fillRect(pipe.x + PIPE_W * 0.7, 0, PIPE_W * 0.1, topY - capH)
  // top pipe cap
  ctx.fillStyle = pipeDark
  ctx.beginPath()
  ctx.roundRect(pipe.x - 4, topY - capH, PIPE_W + 8, capH, [0, 0, 6, 6])
  ctx.fill()

  // bottom pipe body
  ctx.fillStyle = pipeColor
  ctx.fillRect(pipe.x, botY + capH, PIPE_W, PLAY_H - botY - capH)
  ctx.fillStyle = pipeDark
  ctx.fillRect(pipe.x + PIPE_W * 0.7, botY + capH, PIPE_W * 0.1, PLAY_H - botY - capH)
  // bottom pipe cap
  ctx.fillStyle = pipeDark
  ctx.beginPath()
  ctx.roundRect(pipe.x - 4, botY, PIPE_W + 8, capH, [6, 6, 0, 0])
  ctx.fill()

  // avatar faces peeking at the gap edges
  const img = imgs[pipe.avatarIdx % imgs.length]
  if (img?.complete && img.naturalWidth > 0) {
    const faceR = 14
    // top face
    const topFX = pipe.x + PIPE_W / 2
    const topFY = topY - capH / 2
    ctx.save()
    ctx.beginPath()
    ctx.arc(topFX, topFY, faceR, 0, Math.PI * 2)
    ctx.clip()
    ctx.drawImage(img, topFX - faceR, topFY - faceR, faceR * 2, faceR * 2)
    ctx.restore()
    // bottom face
    const botFY = botY + capH / 2
    ctx.save()
    ctx.beginPath()
    ctx.arc(topFX, botFY, faceR, 0, Math.PI * 2)
    ctx.clip()
    ctx.drawImage(img, topFX - faceR, botFY - faceR, faceR * 2, faceR * 2)
    ctx.restore()
  }
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function FlappyPage() {
  const canvasRef    = useRef<HTMLCanvasElement>(null)
  const imgsRef      = useRef<HTMLImageElement[]>([])
  const entriesRef   = useRef<typeof customUserImages>([])

  // game state refs (avoid stale closures in RAF)
  const playerYRef  = useRef(PLAY_H / 2)
  const playerVYRef = useRef(0)
  const playerRotRef= useRef(0)
  const pipesRef    = useRef<Pipe[]>([])
  const cloudsRef   = useRef<Cloud[]>(makeClouds())
  const scoreRef    = useRef(0)
  const highScoreRef= useRef(0)
  const skyHueRef   = useRef(200)
  const frameRef    = useRef(0)
  const lastPipeRef = useRef(0)
  const stateRef    = useRef<'idle' | 'playing' | 'dead'>('idle')
  const killerRef   = useRef<string | null>(null)
  const rafRef      = useRef<number | null>(null)
  const playerImgRef= useRef<HTMLImageElement | null>(null)

  const [score, setScore]         = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'dead'>('idle')
  const [loaded, setLoaded]       = useState(false)

  // Load images — resolve logged-in user's avatar for the player sprite
  useEffect(() => {
    const entries = [...customUserImages]
    for (let i = entries.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [entries[i], entries[j]] = [entries[j], entries[i]]
    }
    const imgs = entries.map(u => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.src = u.image
      return img
    })
    imgsRef.current    = imgs
    entriesRef.current = entries

    // Default player sprite = first shuffled entry
    playerImgRef.current = imgs[0] ?? null

    // Try to match the logged-in user's avatar
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      const ifcUsername = user?.user_metadata?.ifcUsername as string | undefined
      if (ifcUsername) {
        const match = customUserImages.find(
          u => u.username.toLowerCase() === ifcUsername.toLowerCase()
        )
        if (match) {
          const img = new Image()
          img.crossOrigin = 'anonymous'
          img.src = match.image
          img.onload = () => { playerImgRef.current = img }
          img.onerror = () => {}
        }
      }
    })

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
    const s = parseInt(localStorage.getItem('flappy-high-score') ?? '0', 10)
    if (s > 0) { highScoreRef.current = s; setHighScore(s) }
  }, [])

  const resetGame = useCallback(() => {
    playerYRef.current  = PLAY_H / 2
    playerVYRef.current = 0
    playerRotRef.current= 0
    pipesRef.current    = []
    scoreRef.current    = 0
    lastPipeRef.current = 0
    killerRef.current   = null
    setScore(0)
  }, [])

  const flap = useCallback(() => {
    if (stateRef.current === 'dead') return
    if (stateRef.current === 'idle') {
      stateRef.current = 'playing'
      setGameState('playing')
      lastPipeRef.current = performance.now()
    }
    playerVYRef.current = FLAP
  }, [])

  const draw = useCallback((ts: number) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const imgs = imgsRef.current
    const state = stateRef.current

    frameRef.current++

    // ── Sky background (slow hue cycle) ──────────────────────────────────────
    skyHueRef.current = (skyHueRef.current + 0.04) % 360
    const hue = skyHueRef.current
    const grad = ctx.createLinearGradient(0, 0, 0, PLAY_H)
    grad.addColorStop(0,   `hsl(${hue}, 65%, 55%)`)
    grad.addColorStop(1,   `hsl(${(hue + 30) % 360}, 55%, 75%)`)
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, W, PLAY_H)

    // ── Clouds ────────────────────────────────────────────────────────────────
    const clouds = cloudsRef.current
    clouds.forEach(c => {
      if (state === 'playing') {
        c.x -= c.speed
        if (c.x + c.r * 2 < 0) c.x = W + c.r * 2
      }
      drawCloud(ctx, c, c.layer === 0 ? 0.85 : 0.6)
    })

    // ── Ground ────────────────────────────────────────────────────────────────
    ctx.fillStyle = '#92400e'
    ctx.fillRect(0, PLAY_H, W, GROUND_H)
    ctx.fillStyle = '#65a30d'
    ctx.fillRect(0, PLAY_H, W, 14)
    // scrolling grass tufts
    const gOff = (frameRef.current * (state === 'playing' ? PIPE_SPEED : 0)) % 40
    ctx.fillStyle = '#4d7c0f'
    for (let gx = -gOff; gx < W; gx += 40) {
      ctx.beginPath()
      ctx.ellipse(gx + 10, PLAY_H + 6, 8, 5, 0, Math.PI, 0)
      ctx.fill()
    }

    // ── Pipes ─────────────────────────────────────────────────────────────────
    if (state === 'playing') {
      // spawn
      if (ts - lastPipeRef.current > PIPE_INTERVAL) {
        const topH = 60 + Math.random() * (PLAY_H - PIPE_GAP - 100)
        const avatarIdx = Math.floor(Math.random() * imgs.length)
        pipesRef.current.push({
          x: W + 10,
          topH,
          passed: false,
          avatarIdx,
          username: entriesRef.current[avatarIdx]?.username ?? 'Unknown',
        })
        lastPipeRef.current = ts
      }

      // move + score
      pipesRef.current = pipesRef.current.filter(p => p.x + PIPE_W > -20)
      pipesRef.current.forEach(p => {
        p.x -= PIPE_SPEED
        if (!p.passed && p.x + PIPE_W < PLAYER_X - PLAYER_R) {
          p.passed = true
          scoreRef.current++
          setScore(scoreRef.current)
          if (scoreRef.current > highScoreRef.current) {
            highScoreRef.current = scoreRef.current
            setHighScore(scoreRef.current)
            localStorage.setItem('flappy-high-score', String(scoreRef.current))
          }
        }
      })
    }
    pipesRef.current.forEach(p => drawPipe(ctx, p, imgs))

    // ── Physics ───────────────────────────────────────────────────────────────
    if (state === 'playing') {
      playerVYRef.current += GRAVITY
      playerYRef.current  += playerVYRef.current
      playerRotRef.current = Math.max(-30, Math.min(90, playerVYRef.current * 4))

      // collision with ground / ceiling
      if (playerYRef.current + PLAYER_R >= PLAY_H || playerYRef.current - PLAYER_R <= 0) {
        killerRef.current = null
        stateRef.current = 'dead'
        setGameState('dead')
      }

      // collision with pipes
      for (const p of pipesRef.current) {
        const px = PLAYER_X
        const py = playerYRef.current
        const inX = px + PLAYER_R > p.x && px - PLAYER_R < p.x + PIPE_W
        if (inX) {
          if (py - PLAYER_R < p.topH || py + PLAYER_R > p.topH + PIPE_GAP) {
            killerRef.current = p.username
            stateRef.current = 'dead'
            setGameState('dead')
          }
        }
      }
    }

    // ── Player ────────────────────────────────────────────────────────────────
    const px = PLAYER_X
    const py = playerYRef.current
    ctx.save()
    ctx.translate(px, py)
    ctx.rotate((playerRotRef.current * Math.PI) / 180)

    // ring
    ctx.beginPath()
    ctx.arc(0, 0, PLAYER_R + 3, 0, Math.PI * 2)
    ctx.strokeStyle = 'rgba(255,255,255,0.9)'
    ctx.lineWidth = 3
    ctx.stroke()

    // clip + draw avatar
    ctx.beginPath()
    ctx.arc(0, 0, PLAYER_R, 0, Math.PI * 2)
    ctx.clip()
    ctx.fillStyle = '#3b82f6'
    ctx.fillRect(-PLAYER_R, -PLAYER_R, PLAYER_R * 2, PLAYER_R * 2)
    const pImg = playerImgRef.current
    if (pImg?.complete && pImg.naturalWidth > 0) {
      ctx.drawImage(pImg, -PLAYER_R, -PLAYER_R, PLAYER_R * 2, PLAYER_R * 2)
    }
    ctx.restore()

    // ── HUD ───────────────────────────────────────────────────────────────────
    ctx.fillStyle = 'rgba(0,0,0,0.35)'
    ctx.fillRect(W / 2 - 44, 10, 88, 34)
    ctx.fillStyle = '#fff'
    ctx.font = 'bold 22px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(String(scoreRef.current), W / 2, 27)

    // ── Overlays ─────────────────────────────────────────────────────────────
    if (state === 'idle') {
      ctx.fillStyle = 'rgba(0,0,0,0.45)'
      ctx.fillRect(0, 0, W, H)
      ctx.fillStyle = '#fff'
      ctx.font = 'bold 28px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('Tap / Space to fly!', W / 2, H / 2)
      ctx.font = '15px sans-serif'
      ctx.fillStyle = 'rgba(255,255,255,0.75)'
      ctx.fillText('Avoid the pipes', W / 2, H / 2 + 36)
    }

    if (state === 'dead') {
      ctx.fillStyle = 'rgba(0,0,0,0.6)'
      ctx.fillRect(0, 0, W, H)
      ctx.fillStyle = '#fc8181'
      ctx.font = 'bold 30px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      const killer = killerRef.current
      if (killer) {
        ctx.fillText(`@${killer}`, W / 2, H / 2 - 58)
        ctx.font = 'bold 22px sans-serif'
        ctx.fillStyle = '#fca5a5'
        ctx.fillText('finished you! 💀', W / 2, H / 2 - 28)
      } else {
        ctx.fillText('Game Over! 💀', W / 2, H / 2 - 40)
      }

      ctx.fillStyle = '#fff'
      ctx.font = 'bold 20px sans-serif'
      ctx.fillText(`Score: ${scoreRef.current}`, W / 2, H / 2 + 10)
      ctx.fillStyle = '#fbbf24'
      ctx.fillText(`Best: ${highScoreRef.current}`, W / 2, H / 2 + 38)
      ctx.font = '14px sans-serif'
      ctx.fillStyle = 'rgba(255,255,255,0.65)'
      ctx.fillText('Tap / Space to retry', W / 2, H / 2 + 74)
    }

    rafRef.current = requestAnimationFrame(draw)
  }, [])

  // Start RAF loop once images are loaded
  useEffect(() => {
    if (!loaded) return
    rafRef.current = requestAnimationFrame(draw)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [loaded, draw])

  // Input handlers
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== 'Space' && e.key !== 'ArrowUp' && e.key !== 'w') return
      e.preventDefault()
      if (stateRef.current === 'dead') {
        resetGame()
        stateRef.current = 'idle'
        setGameState('idle')
      }
      flap()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [flap, resetGame])

  const handleTap = useCallback(() => {
    if (stateRef.current === 'dead') {
      resetGame()
      stateRef.current = 'idle'
      setGameState('idle')
    }
    flap()
  }, [flap, resetGame])

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
          IFlytics Flappy requires a keyboard or mouse. Please open on a desktop.
        </p>
      </div>

      {/* Desktop game */}
      <div className="hidden md:flex flex-col items-center gap-4 w-full">
        <div className="text-center">
          <h1 className="text-3xl font-black tracking-tight">Flappy User ✈️</h1>
          <p className="text-muted-foreground text-sm mt-1">Space / W / Click to flap</p>
        </div>

        <div className="flex items-center gap-10 text-sm font-bold">
          <div className="text-center">
            <div className="text-2xl font-black">{score}</div>
            <div className="text-muted-foreground text-xs">Score</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-black text-yellow-500">🏆 {highScore}</div>
            <div className="text-muted-foreground text-xs">Best</div>
          </div>
        </div>

        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          onClick={handleTap}
          className="rounded-2xl border-2 border-border shadow-2xl cursor-pointer select-none"
        />

        {gameState === 'dead' && (
          <button
            onClick={() => { resetGame(); stateRef.current = 'idle'; setGameState('idle') }}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl transition-colors"
          >
            Play Again
          </button>
        )}

        {!loaded && <p className="text-muted-foreground text-xs animate-pulse">Loading pilot avatars...</p>}
      </div>
    </div>
  )
}
