"use client"

import React, { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import { customUserImages } from '@/lib/data'

// ─── Canvas ───────────────────────────────────────────────────────────────────
const CW = 860
const CH = 560

// ─── Layout system ────────────────────────────────────────────────────────────
type RwyRect  = { x: number; y: number; w: number; h: number }
type ThreshSide = 'left' | 'right' | 'top' | 'bottom'
type Threshold  = { num: string; x: number; y: number; w: number; h: number; side: ThreshSide }
type Layout     = { name: string; runways: RwyRect[]; thresholds: Threshold[] }

// Helper: build threshold rect at one end of a runway
function thr(num: string, rwy: RwyRect, side: ThreshSide, len = 55): Threshold {
  if (side === 'left')   return { num, side, x: rwy.x,                    y: rwy.y,                    w: len,    h: rwy.h }
  if (side === 'right')  return { num, side, x: rwy.x + rwy.w - len,      y: rwy.y,                    w: len,    h: rwy.h }
  if (side === 'top')    return { num, side, x: rwy.x,                    y: rwy.y,                    w: rwy.w,  h: len   }
                         return { num, side, x: rwy.x,                    y: rwy.y + rwy.h - len,      w: rwy.w,  h: len   }
}

const LAYOUTS: Layout[] = (() => {
  // Layout A – Classic: H bottom-left + V right
  const a1: RwyRect = { x: 90,  y: 466, w: 310, h: 28 }
  const a2: RwyRect = { x: 748, y: 88,  w: 28,  h: 310 }

  // Layout B – Cross: H center + V center
  const b1: RwyRect = { x: 160, y: 264, w: 310, h: 28 }
  const b2: RwyRect = { x: 420, y: 90,  w: 28,  h: 310 }

  // Layout C – Two parallel horizontals (offset)
  const c1: RwyRect = { x: 80,  y: 200, w: 300, h: 26 }
  const c2: RwyRect = { x: 230, y: 420, w: 300, h: 26 }

  // Layout D – Two verticals (flanking)
  const d1: RwyRect = { x: 180, y: 100, w: 26,  h: 310 }
  const d2: RwyRect = { x: 660, y: 130, w: 26,  h: 310 }

  // Layout E – Triple: H bottom + two verticals
  const e1: RwyRect = { x: 80,  y: 466, w: 270, h: 26 }
  const e2: RwyRect = { x: 740, y: 88,  w: 26,  h: 270 }
  const e3: RwyRect = { x: 390, y: 140, w: 26,  h: 260 }

  return [
    {
      name: 'Classic',
      runways: [a1, a2],
      thresholds: [thr('09', a1, 'left'), thr('27', a1, 'right'), thr('18', a2, 'top'), thr('36', a2, 'bottom')],
    },
    {
      name: 'Cross',
      runways: [b1, b2],
      thresholds: [thr('09', b1, 'left'), thr('27', b1, 'right'), thr('18', b2, 'top'), thr('36', b2, 'bottom')],
    },
    {
      name: 'Parallel',
      runways: [c1, c2],
      thresholds: [thr('09', c1, 'left'), thr('27', c1, 'right'), thr('04', c2, 'left'), thr('22', c2, 'right')],
    },
    {
      name: 'Flanking',
      runways: [d1, d2],
      thresholds: [thr('18', d1, 'top'), thr('36', d1, 'bottom'), thr('17', d2, 'top'), thr('35', d2, 'bottom')],
    },
    {
      name: 'Triple',
      runways: [e1, e2, e3],
      thresholds: [
        thr('09', e1, 'left'), thr('27', e1, 'right'),
        thr('18', e2, 'top'), thr('36', e2, 'bottom'),
        thr('13', e3, 'top'), thr('31', e3, 'bottom'),
      ],
    },
  ]
})()

const ACTIVE_DURATION = 28
const COLLISION_R     = 14   // matches new sprite radius
const SPAWN_BASE      = 5500
const MAX_ACTIVE      = 8

const ROLE_PTS: Record<string, number> = { user: 100, mod: 150, staff: 200, dev: 300 }
const ROLE_CLR: Record<string, string> = { user: '#60a5fa', mod: '#a78bfa', staff: '#fb923c', dev: '#f87171' }
const ROLE_SPD: Record<string, number> = { user: 1.8, mod: 2.3, staff: 2.7, dev: 3.1 }

let uid = 0

// ─── Types ────────────────────────────────────────────────────────────────────
type PlaneStatus = 'flying' | 'landing' | 'done' | 'crashed'

type Plane = {
  id: number
  x: number; y: number
  vx: number; vy: number
  speed: number
  img: HTMLImageElement | null
  username: string; role: string
  path: { x: number; y: number }[]
  status: PlaneStatus
  alpha: number; scale: number
  trail: { x: number; y: number; a: number }[]
  wrongRwyCD: number
}

type FloatLbl = { x: number; y: number; text: string; color: string; alpha: number; vy: number }
type Drawing  = { planeId: number; pts: { x: number; y: number }[] } | null

// ─── Helpers ──────────────────────────────────────────────────────────────────
function inRect(px: number, py: number, r: Threshold) {
  return px > r.x && px < r.x + r.w && py > r.y && py < r.y + r.h
}

function pickNextActive(current: string, thresholds: Threshold[]): string {
  const opts = thresholds.map(t => t.num).filter(n => n !== current)
  return opts[Math.floor(Math.random() * opts.length)]
}

// Runway number painted on asphalt (rotated to match runway direction)
function drawRwyNum(ctx: CanvasRenderingContext2D, t: Threshold, active: boolean) {
  const cx = t.x + t.w / 2, cy = t.y + t.h / 2
  const angleDeg = (t.side === 'top' || t.side === 'bottom') ? 90 : 0
  ctx.save()
  ctx.translate(cx, cy); ctx.rotate((angleDeg * Math.PI) / 180)
  ctx.fillStyle = active ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.3)'
  ctx.font = 'bold 12px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  ctx.fillText(t.num, 0, 0)
  ctx.restore()
}

// Label position outside the runway end
function thrLabelPos(t: Threshold): { x: number; y: number } {
  const cx = t.x + t.w / 2, cy = t.y + t.h / 2
  if (t.side === 'left')   return { x: t.x - 22,        y: cy }
  if (t.side === 'right')  return { x: t.x + t.w + 22,  y: cy }
  if (t.side === 'top')    return { x: cx,               y: t.y - 14 }
                           return { x: cx,               y: t.y + t.h + 14 }
}

// Blinking arrow symbol pointing from outside into the active threshold
const SIDE_ARROW: Record<ThreshSide, string> = { left: '▶', right: '◀', top: '▼', bottom: '▲' }

// ─── Component ────────────────────────────────────────────────────────────────
export default function ATCGamePage() {
  const canvasRef  = useRef<HTMLCanvasElement>(null)
  const planesRef  = useRef<Plane[]>([])
  const drawingRef = useRef<Drawing>(null)
  const labelsRef  = useRef<FloatLbl[]>([])
  const scoreRef   = useRef(0)
  const comboRef   = useRef(0)
  const livesRef   = useRef(3)
  const gsRef      = useRef<'idle' | 'playing' | 'over'>('idle')
  const layoutRef       = useRef<Layout>(LAYOUTS[0])
  const activeRwyRef    = useRef<string>('27')
  const activeTimerRef  = useRef(ACTIVE_DURATION)
  const rafRef     = useRef<number | null>(null)
  const spawnRef   = useRef<ReturnType<typeof setTimeout> | null>(null)
  const cdRef      = useRef<ReturnType<typeof setInterval> | null>(null)
  const imgPool    = useRef<(HTMLImageElement | null)[]>([])
  const hsRef      = useRef(0)

  const [highScore, setHighScore] = useState(0)
  const [loaded,    setLoaded]    = useState(false)
  useEffect(() => { hsRef.current = highScore }, [highScore])

  // ── Preload avatars ─────────────────────────────────────────────────────────
  useEffect(() => {
    let done = 0
    const total = Math.min(customUserImages.length, 30)
    customUserImages.slice(0, total).forEach((u, i) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload  = () => { imgPool.current[i] = img;  if (++done >= total) setLoaded(true) }
      img.onerror = () => { imgPool.current[i] = null; if (++done >= total) setLoaded(true) }
      img.src = u.image
    })
  }, [])

  useEffect(() => {
    const s = parseInt(localStorage.getItem('atc-hs2') ?? '', 10)
    if (!isNaN(s) && s > 0) setHighScore(s)
  }, [])

  // ── 1-second interval: active runway countdown ──────────────────────────────
  useEffect(() => {
    cdRef.current = setInterval(() => {
      if (gsRef.current !== 'playing') return
      activeTimerRef.current -= 1
      if (activeTimerRef.current <= 0) {
        activeRwyRef.current  = pickNextActive(activeRwyRef.current, layoutRef.current.thresholds)
        activeTimerRef.current = ACTIVE_DURATION
      }
    }, 1000)
    return () => { if (cdRef.current) clearInterval(cdRef.current) }
  }, [])

  // ── Draw ────────────────────────────────────────────────────────────────────
  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx    = canvas.getContext('2d')!
    const gs     = gsRef.current
    const active = activeRwyRef.current
    const timer  = activeTimerRef.current

    // Radar background
    ctx.fillStyle = '#06111f'; ctx.fillRect(0, 0, CW, CH)

    // Grid
    ctx.strokeStyle = 'rgba(0,200,100,0.07)'; ctx.lineWidth = 1
    for (let x = 0; x < CW; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, CH); ctx.stroke() }
    for (let y = 0; y < CH; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(CW, y); ctx.stroke() }

    // Range rings
    ctx.strokeStyle = 'rgba(0,200,100,0.09)'; ctx.lineWidth = 1
    ;[90, 180, 270, 360].forEach(r => {
      ctx.beginPath(); ctx.arc(CW / 2 - 40, CH / 2, r, 0, Math.PI * 2); ctx.stroke()
    })

    // ── Runways ───────────────────────────────────────────────────────────────
    const layout = layoutRef.current
    layout.runways.forEach(rwy => {
      ctx.fillStyle = '#1c2837'; ctx.fillRect(rwy.x - 2, rwy.y - 2, rwy.w + 4, rwy.h + 4)
      ctx.fillStyle = '#243447'; ctx.fillRect(rwy.x, rwy.y, rwy.w, rwy.h)
      const horiz = rwy.w > rwy.h
      ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 1.5; ctx.setLineDash([10, 8])
      ctx.beginPath()
      if (horiz) { ctx.moveTo(rwy.x, rwy.y + rwy.h / 2); ctx.lineTo(rwy.x + rwy.w, rwy.y + rwy.h / 2) }
      else        { ctx.moveTo(rwy.x + rwy.w / 2, rwy.y); ctx.lineTo(rwy.x + rwy.w / 2, rwy.y + rwy.h) }
      ctx.stroke(); ctx.setLineDash([]); ctx.restore()
    })

    // ── Thresholds ────────────────────────────────────────────────────────────
    layout.thresholds.forEach(t => {
      const isActive = t.num === active
      const horiz    = t.side === 'left' || t.side === 'right'

      // Threshold stripes
      ctx.fillStyle = isActive ? 'rgba(255,255,255,0.68)' : 'rgba(255,255,255,0.15)'
      if (horiz) { for (let i = 0; i < 4; i++) ctx.fillRect(t.x + 4 + i * 12, t.y + 3, 7, t.h - 6) }
      else       { for (let i = 0; i < 4; i++) ctx.fillRect(t.x + 3, t.y + 4 + i * 12, t.w - 6, 7) }

      // Border & glow
      if (isActive) {
        ctx.save(); ctx.shadowColor = '#4ade80'; ctx.shadowBlur = 16
        ctx.strokeStyle = '#4ade80'; ctx.lineWidth = 2; ctx.strokeRect(t.x, t.y, t.w, t.h)
        ctx.restore()
        // Blinking arrow from outside pointing in
        const blink = Math.floor(Date.now() / 480) % 2 === 0
        if (blink) {
          const lp = thrLabelPos(t)
          ctx.fillStyle = '#4ade80'; ctx.font = 'bold 11px sans-serif'
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
          ctx.fillText(SIDE_ARROW[t.side], lp.x, lp.y)
        }
      } else {
        ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 1
        ctx.strokeRect(t.x, t.y, t.w, t.h)
      }

      // Number on asphalt
      drawRwyNum(ctx, t, isActive)

      // External label
      const lp = thrLabelPos(t)
      ctx.fillStyle = isActive ? '#4ade80' : 'rgba(255,255,255,0.28)'
      ctx.font = (isActive ? 'bold ' : '') + '10px monospace'
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      // Offset label slightly further out so it doesn't overlap the arrow
      const pad = 10
      const lblX = t.side === 'left'   ? lp.x - pad : t.side === 'right' ? lp.x + pad : lp.x
      const lblY = t.side === 'top'    ? lp.y - pad : t.side === 'bottom' ? lp.y + pad : lp.y
      ctx.fillText(`RWY ${t.num}`, lblX, lblY)
    })

    // ── Path preview (while dragging) ─────────────────────────────────────────
    const drw = drawingRef.current
    if (drw && drw.pts.length > 1) {
      // Draw from the plane's CURRENT live position so the preview is accurate
      const dragPlane = planesRef.current.find(p => p.id === drw.planeId)
      const startX = dragPlane?.x ?? drw.pts[0].x
      const startY = dragPlane?.y ?? drw.pts[0].y
      ctx.save()
      ctx.strokeStyle = '#22d3ee'; ctx.lineWidth = 2
      ctx.setLineDash([6, 6]); ctx.globalAlpha = 0.85
      ctx.beginPath(); ctx.moveTo(startX, startY)
      drw.pts.slice(1).forEach(pt => ctx.lineTo(pt.x, pt.y))
      ctx.stroke(); ctx.setLineDash([]); ctx.restore()
    }

    // ── Edge entry indicators for off-screen planes ───────────────────────────
    const pulse = 0.55 + 0.45 * Math.sin(Date.now() / 220)
    planesRef.current.forEach(p => {
      if (p.status !== 'flying') return
      const offscreen = p.x < -5 || p.x > CW + 5 || p.y < -5 || p.y > CH + 5
      if (!offscreen) return

      // Clamp plane position to canvas edge for indicator placement
      const MARGIN = 22
      const ex = Math.max(MARGIN, Math.min(CW - MARGIN, p.x))
      const ey = Math.max(MARGIN, Math.min(CH - MARGIN, p.y))

      // Arrow direction = where the plane is heading (into the canvas)
      const mag = Math.hypot(p.vx, p.vy) || 1
      const arrowAngle = Math.atan2(p.vy / mag, p.vx / mag)
      const clr = ROLE_CLR[p.role] ?? '#60a5fa'

      ctx.save()
      ctx.globalAlpha = pulse
      ctx.translate(ex, ey)

      // Outer pulsing ring
      ctx.strokeStyle = clr; ctx.lineWidth = 1.5
      ctx.beginPath(); ctx.arc(0, 0, 16 + pulse * 3, 0, Math.PI * 2); ctx.stroke()

      // Background fill
      ctx.fillStyle = 'rgba(6,17,31,0.82)'
      ctx.beginPath(); ctx.arc(0, 0, 14, 0, Math.PI * 2); ctx.fill()

      // Role ring
      ctx.strokeStyle = clr; ctx.lineWidth = 2
      ctx.beginPath(); ctx.arc(0, 0, 14, 0, Math.PI * 2); ctx.stroke()

      // Avatar inside
      ctx.save()
      ctx.beginPath(); ctx.arc(0, 0, 12, 0, Math.PI * 2); ctx.clip()
      ctx.fillStyle = clr; ctx.fillRect(-12, -12, 24, 24)
      const pImg = p.img
      if (pImg?.complete && pImg.naturalWidth > 0) ctx.drawImage(pImg, -12, -12, 24, 24)
      ctx.restore()

      // Directional arrow
      ctx.rotate(arrowAngle)
      ctx.fillStyle = clr
      ctx.beginPath()
      ctx.moveTo(21, 0)
      ctx.lineTo(14, -5)
      ctx.lineTo(14, 5)
      ctx.closePath(); ctx.fill()

      ctx.restore()

      // Username label below indicator
      ctx.save()
      ctx.globalAlpha = pulse * 0.9
      ctx.fillStyle = 'rgba(0,0,0,0.75)'
      ctx.beginPath(); ctx.roundRect(ex - 24, ey + 17, 48, 12, 3); ctx.fill()
      ctx.fillStyle = clr; ctx.font = 'bold 7px monospace'
      ctx.textAlign = 'center'; ctx.textBaseline = 'top'
      ctx.fillText(p.username.slice(0, 9), ex, ey + 19)
      ctx.restore()
    })

    // ── Planes ────────────────────────────────────────────────────────────────
    planesRef.current.forEach(p => {
      if (p.status === 'done' || p.status === 'crashed') return
      const isDrawing = drw?.planeId === p.id

      // Assigned path line
      if (p.path.length > 1) {
        ctx.save()
        ctx.strokeStyle = ROLE_CLR[p.role] ?? '#60a5fa'
        ctx.lineWidth = 1.5; ctx.setLineDash([5, 8]); ctx.globalAlpha = 0.4
        ctx.beginPath(); ctx.moveTo(p.x, p.y)
        p.path.forEach(pt => ctx.lineTo(pt.x, pt.y))
        ctx.stroke(); ctx.setLineDash([]); ctx.restore()
      }

      // Comet trail
      p.trail.forEach(t => {
        ctx.save(); ctx.globalAlpha = t.a * 0.35 * p.alpha
        ctx.fillStyle = ROLE_CLR[p.role] ?? '#60a5fa'
        ctx.beginPath(); ctx.arc(t.x, t.y, 4 * t.a, 0, Math.PI * 2); ctx.fill()
        ctx.restore()
      })

      // Avatar (R=12 ring, R=10 image)
      const R = 12
      ctx.save()
      ctx.globalAlpha = p.alpha; ctx.translate(p.x, p.y); ctx.scale(p.scale, p.scale)
      if (isDrawing) { ctx.shadowColor = '#22d3ee'; ctx.shadowBlur = 16 }
      ctx.strokeStyle = ROLE_CLR[p.role] ?? '#60a5fa'; ctx.lineWidth = 2
      ctx.beginPath(); ctx.arc(0, 0, R + 2, 0, Math.PI * 2); ctx.stroke()
      ctx.save()
      ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI * 2); ctx.clip()
      ctx.fillStyle = ROLE_CLR[p.role] ?? '#60a5fa'
      ctx.fillRect(-R, -R, R * 2, R * 2)
      const img = p.img
      if (img?.complete && img.naturalWidth > 0) ctx.drawImage(img, -R, -R, R * 2, R * 2)
      ctx.restore(); ctx.restore()

      // Data tag
      ctx.save(); ctx.globalAlpha = p.alpha
      ctx.fillStyle = 'rgba(0,0,0,0.72)'
      ctx.beginPath(); ctx.roundRect(p.x + 15, p.y - 9, 58, 18, 3); ctx.fill()
      ctx.fillStyle = ROLE_CLR[p.role] ?? '#e2e8f0'; ctx.font = 'bold 8px monospace'
      ctx.textAlign = 'left'; ctx.textBaseline = 'top'
      ctx.fillText(p.username.slice(0, 9), p.x + 18, p.y - 7)
      ctx.fillStyle = '#9ca3af'; ctx.font = '7px monospace'
      ctx.fillText(`${Math.round(p.speed * 60)}kt`, p.x + 18, p.y + 2)
      ctx.restore()
    })

    // Float labels
    labelsRef.current.forEach(l => {
      ctx.save(); ctx.globalAlpha = l.alpha
      ctx.fillStyle = l.color; ctx.font = 'bold 15px sans-serif'
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText(l.text, l.x, l.y); ctx.restore()
    })

    // ── HUD ───────────────────────────────────────────────────────────────────
    // Score + combo + layout name
    ctx.fillStyle = 'rgba(0,0,0,0.65)'
    ctx.beginPath(); ctx.roundRect(8, 8, 210, 52, 8); ctx.fill()
    ctx.fillStyle = '#4ade80'; ctx.font = 'bold 19px monospace'
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle'
    ctx.fillText(`✈  ${scoreRef.current}`, 18, 24)
    if (comboRef.current > 1) {
      ctx.fillStyle = '#fbbf24'; ctx.font = 'bold 11px sans-serif'
      ctx.fillText(`×${comboRef.current} COMBO`, 108, 24)
    }
    ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.font = '10px monospace'
    ctx.textBaseline = 'middle'
    ctx.fillText(`${layoutRef.current.name} Airport`, 18, 44)

    // Lives
    ctx.fillStyle = 'rgba(0,0,0,0.65)'
    ctx.beginPath(); ctx.roundRect(CW - 130, 8, 122, 42, 8); ctx.fill()
    ctx.font = '22px sans-serif'; ctx.textAlign = 'right'; ctx.textBaseline = 'middle'
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = i < livesRef.current ? '#4ade80' : '#1f2937'
      ctx.fillText('♥', CW - 10 - i * 40, 29)
    }

    // Active runway banner
    if (gs === 'playing') {
      const pct  = timer / ACTIVE_DURATION
      const urgnt = timer <= 8
      ctx.fillStyle = urgnt ? 'rgba(239,68,68,0.75)' : 'rgba(0,0,0,0.65)'
      ctx.beginPath(); ctx.roundRect(CW / 2 - 100, 8, 200, 42, 8); ctx.fill()

      ctx.fillStyle = urgnt ? '#fca5a5' : '#9ca3af'; ctx.font = '9px monospace'
      ctx.textAlign = 'center'; ctx.textBaseline = 'top'
      ctx.fillText('ACTIVE RUNWAY', CW / 2, 13)

      ctx.fillStyle = urgnt ? '#fff' : '#4ade80'; ctx.font = 'bold 22px monospace'
      ctx.textBaseline = 'bottom'
      ctx.fillText(`RWY ${active}`, CW / 2, 48)

      // Countdown arc underline
      ctx.strokeStyle = urgnt ? '#f87171' : '#4ade80'; ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(CW / 2, 48, 32, Math.PI, Math.PI + pct * Math.PI)
      ctx.stroke()

      ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.font = '9px monospace'
      ctx.textBaseline = 'bottom'; ctx.textAlign = 'right'
      ctx.fillText(`${timer}s`, CW / 2 + 96, 48)
    }

    // Hint bar
    if (gs === 'playing') {
      const hint = drw
        ? `Release near RWY ${active} threshold to set path`
        : `Draw path to RWY ${active} threshold (glowing green)`
      ctx.fillStyle = 'rgba(0,0,0,0.45)'
      ctx.beginPath(); ctx.roundRect(CW / 2 - 220, CH - 30, 440, 22, 5); ctx.fill()
      ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.font = '11px sans-serif'
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText(hint, CW / 2, CH - 19)
    }

    // Idle overlay
    if (gs === 'idle') {
      ctx.fillStyle = 'rgba(6,17,31,0.78)'; ctx.fillRect(0, 0, CW, CH)
      ctx.fillStyle = '#4ade80'; ctx.font = 'bold 28px sans-serif'
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText('ATC MADNESS 🗼', CW / 2, CH / 2 - 46)
      ctx.fillStyle = 'rgba(255,255,255,0.72)'; ctx.font = '15px sans-serif'
      ctx.fillText('Draw paths from pilots to the active runway threshold', CW / 2, CH / 2 - 6)
      ctx.fillText('Planes loop until landed · Active runway rotates every 28s · Avoid collisions', CW / 2, CH / 2 + 20)
      if (hsRef.current > 0) {
        ctx.fillStyle = '#fbbf24'; ctx.font = '13px sans-serif'
        ctx.fillText(`Best: ${hsRef.current} pts`, CW / 2, CH / 2 + 50)
      }
      ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.font = '14px sans-serif'
      ctx.fillText('Click to start', CW / 2, CH / 2 + 78)
    }

    // Game over overlay
    if (gs === 'over') {
      ctx.fillStyle = 'rgba(6,17,31,0.82)'; ctx.fillRect(0, 0, CW, CH)
      ctx.fillStyle = '#ef4444'; ctx.font = 'bold 34px sans-serif'
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText('Airspace Closed! 🚫', CW / 2, CH / 2 - 46)
      ctx.fillStyle = '#fff'; ctx.font = 'bold 22px sans-serif'
      ctx.fillText(`Score: ${scoreRef.current}`, CW / 2, CH / 2 - 4)
      const hs = hsRef.current
      if (scoreRef.current > 0 && scoreRef.current >= hs) {
        ctx.fillStyle = '#fbbf24'; ctx.font = '15px sans-serif'
        ctx.fillText('🏆 New High Score!', CW / 2, CH / 2 + 28)
      } else if (hs > 0) {
        ctx.fillStyle = '#9ca3af'; ctx.font = '13px sans-serif'
        ctx.fillText(`Best: ${hs} pts`, CW / 2, CH / 2 + 28)
      }
      ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = '14px sans-serif'
      ctx.fillText('Click to try again', CW / 2, CH / 2 + 62)
    }
  }, [])

  // ── Physics tick ─────────────────────────────────────────────────────────────
  const tick = useCallback(() => {
    if (gsRef.current !== 'playing') return
    const planes     = planesRef.current
    const active     = activeRwyRef.current
    const thresholds = layoutRef.current.thresholds
    const activeThr  = thresholds.find(t => t.num === active)!

    planes.forEach(p => {
      if (p.status !== 'flying') return

      // Trail
      p.trail.unshift({ x: p.x, y: p.y, a: 1 })
      if (p.trail.length > 16) p.trail.pop()
      p.trail.forEach((t, i) => { t.a = 1 - i / 16 })

      // Follow path waypoints
      if (p.path.length > 0) {
        const tgt = p.path[0]
        const dx = tgt.x - p.x, dy = tgt.y - p.y
        const d  = Math.hypot(dx, dy)
        if (d < 4) {
          p.path.shift()
        } else {
          const tvx = (dx / d) * p.speed
          const tvy = (dy / d) * p.speed
          p.vx += (tvx - p.vx) * 0.12
          p.vy += (tvy - p.vy) * 0.12
        }
      }
      p.x += p.vx; p.y += p.vy

      // Landing: only counts at the ACTIVE threshold end
      if (inRect(p.x, p.y, activeThr)) {
        p.status = 'landing'
        const multi = Math.max(1, comboRef.current)
        const pts   = (ROLE_PTS[p.role] ?? 100) * multi
        labelsRef.current.push({
          x: p.x, y: p.y - 28,
          text: multi > 1 ? `+${pts} ×${multi}` : `+${pts}`,
          color: '#4ade80', alpha: 1, vy: -0.8,
        })
        scoreRef.current += pts
        comboRef.current++
        const existing = parseInt(localStorage.getItem('atc-hs2') ?? '0', 10)
        if (scoreRef.current > existing) {
          localStorage.setItem('atc-hs2', String(scoreRef.current))
          setHighScore(scoreRef.current)
        }
        return
      }

      // Plane enters an INACTIVE threshold → warn once (cooldown), clear path, let it fly through
      if (p.wrongRwyCD > 0) {
        p.wrongRwyCD--
      } else {
        const wrongThr = thresholds.find(t => t.num !== active && inRect(p.x, p.y, t))
        if (wrongThr) {
          labelsRef.current.push({ x: p.x, y: p.y - 22, text: `RWY ${wrongThr.num} inactive!`, color: '#fbbf24', alpha: 1, vy: -0.7 })
          p.path = []            // clear path so player must redraw
          p.wrongRwyCD = 180    // 3-second cooldown at 60fps — no spam
        }
      }

      // Wrap-around: plane re-enters from the opposite edge, path cleared
      const WRAP = 68
      let wrapped = false
      if      (p.x < -WRAP)      { p.x = CW + WRAP - 10; wrapped = true }
      else if (p.x > CW + WRAP)  { p.x = -WRAP + 10;     wrapped = true }
      if      (p.y < -WRAP)      { p.y = CH + WRAP - 10; wrapped = true }
      else if (p.y > CH + WRAP)  { p.y = -WRAP + 10;     wrapped = true }
      if (wrapped) { p.path = []; p.wrongRwyCD = 0 }
    })

    // Landing animation (expand + fade)
    planes.filter(p => p.status === 'landing').forEach(p => {
      p.alpha -= 0.04; p.scale += 0.03
      if (p.alpha <= 0) { p.status = 'done'; p.alpha = 0 }
    })

    // Collision detection
    const active2 = planes.filter(p => p.status === 'flying')
    for (let i = 0; i < active2.length; i++) {
      for (let j = i + 1; j < active2.length; j++) {
        const a = active2[i], b = active2[j]
        if (Math.hypot(a.x - b.x, a.y - b.y) < COLLISION_R * 2) {
          ;[a, b].forEach(p => { p.status = 'crashed'; p.alpha = 0 })
          labelsRef.current.push({
            x: (a.x + b.x) / 2, y: (a.y + b.y) / 2,
            text: '💥 COLLISION!', color: '#ef4444', alpha: 1, vy: -1,
          })
          comboRef.current = 0
          livesRef.current = Math.max(0, livesRef.current - 1)
          if (livesRef.current <= 0) gsRef.current = 'over'
        }
      }
    }

    // Float labels
    labelsRef.current = labelsRef.current.filter(l => l.alpha > 0.02)
    labelsRef.current.forEach(l => { l.y += l.vy; l.alpha -= 0.014 })

    // Cleanup
    planesRef.current = planes.filter(p => p.status !== 'done' && p.status !== 'crashed')
  }, [])

  // ── RAF loop ─────────────────────────────────────────────────────────────────
  const loop = useCallback(() => {
    tick(); draw()
    rafRef.current = requestAnimationFrame(loop)
  }, [tick, draw])

  useEffect(() => {
    rafRef.current = requestAnimationFrame(loop)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [loop])

  // ── Spawn ────────────────────────────────────────────────────────────────────
  const spawnPlane = useCallback(() => {
    if (gsRef.current !== 'playing') return
    const flying = planesRef.current.filter(p => p.status === 'flying')
    if (flying.length >= MAX_ACTIVE) { spawnRef.current = setTimeout(spawnPlane, 2000); return }

    const usedNames = new Set(flying.map(p => p.username))
    // Only use the first 30 entries — the ones we actually preloaded into imgPool
    const POOL_SIZE = Math.min(customUserImages.length, 30)
    const pool = customUserImages.slice(0, POOL_SIZE).filter(u => !usedNames.has(u.username))
    if (pool.length === 0) { spawnRef.current = setTimeout(spawnPlane, 2000); return }

    const entry  = pool[Math.floor(Math.random() * pool.length)]
    const imgIdx = customUserImages.slice(0, POOL_SIZE).findIndex(u => u.username === entry.username)
    const spd    = ROLE_SPD[entry.role] ?? 2.0

    const edge = Math.floor(Math.random() * 4)
    let sx = 0, sy = 0
    if      (edge === 0) { sx = -50;     sy = 60 + Math.random() * (CH - 140) }
    else if (edge === 1) { sx = CW + 50; sy = 60 + Math.random() * (CH - 140) }
    else if (edge === 2) { sx = 60 + Math.random() * (CW - 180); sy = -50 }
    else                 { sx = 60 + Math.random() * (CW - 180); sy = CH + 50 }

    // Head toward mid-airspace (player must redirect to active runway)
    const midX = 160 + Math.random() * 340
    const midY = 90  + Math.random() * 260
    const ang  = Math.atan2(midY - sy, midX - sx)

    planesRef.current.push({
      id: ++uid, x: sx, y: sy,
      vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd,
      speed: spd, img: imgPool.current[imgIdx] ?? null,
      username: entry.username, role: entry.role,
      path: [], status: 'flying', alpha: 1, scale: 1, trail: [], wrongRwyCD: 0,
    })

    const delay = Math.max(2200, SPAWN_BASE - Math.floor(scoreRef.current / 250) * 300)
    spawnRef.current = setTimeout(spawnPlane, delay)
  }, [])

  // ── Start / restart ───────────────────────────────────────────────────────────
  const startGame = useCallback(() => {
    if (spawnRef.current) clearTimeout(spawnRef.current)
    planesRef.current = []; labelsRef.current = []; drawingRef.current = null
    scoreRef.current = 0; comboRef.current = 0; livesRef.current = 3
    const layout           = LAYOUTS[Math.floor(Math.random() * LAYOUTS.length)]
    layoutRef.current      = layout
    activeRwyRef.current   = layout.thresholds[Math.floor(Math.random() * layout.thresholds.length)].num
    activeTimerRef.current = ACTIVE_DURATION
    gsRef.current = 'playing'
    spawnRef.current = setTimeout(spawnPlane, 500)
  }, [spawnPlane])

  // ── Mouse ─────────────────────────────────────────────────────────────────────
  const getPos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const r = canvasRef.current!.getBoundingClientRect()
    return { x: (e.clientX - r.left) * (CW / r.width), y: (e.clientY - r.top) * (CH / r.height) }
  }

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (gsRef.current !== 'playing') { startGame(); return }
    const { x, y } = getPos(e)
    const plane = planesRef.current.find(p => p.status === 'flying' && Math.hypot(p.x - x, p.y - y) < 20)
    if (plane) drawingRef.current = { planeId: plane.id, pts: [{ x: plane.x, y: plane.y }] }
  }, [startGame])

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const drw = drawingRef.current
    if (!drw || gsRef.current !== 'playing') return
    const { x, y } = getPos(e)
    const last = drw.pts[drw.pts.length - 1]
    if (Math.hypot(x - last.x, y - last.y) > 10) drw.pts.push({ x, y })
  }, [])

  const handleMouseUp = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const drw = drawingRef.current
    if (!drw || gsRef.current !== 'playing') { drawingRef.current = null; return }
    const { x, y } = getPos(e)
    drw.pts.push({ x, y })

    if (drw.pts.length > 3) {
      const plane = planesRef.current.find(p => p.id === drw.planeId && p.status === 'flying')
      if (plane) {
        // The plane has moved since mousedown, so drw.pts[0] may be behind the plane.
        // Find the waypoint closest to the plane's CURRENT position and start from there.
        let bestIdx = 0, bestDist = Infinity
        drw.pts.forEach((pt, i) => {
          const d = Math.hypot(pt.x - plane.x, pt.y - plane.y)
          if (d < bestDist) { bestDist = d; bestIdx = i }
        })
        const path = drw.pts.slice(bestIdx + 1)
        if (path.length > 0) plane.path = path
      }
    }
    drawingRef.current = null
  }, [])

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] gap-6 p-4">
      <Link href="/dashboard/games" className="self-start flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
        ← Arcade
      </Link>
      <div className="md:hidden flex flex-col items-center text-center gap-4 py-20 px-6">
        <div className="text-6xl">🖥️</div>
        <h2 className="text-2xl font-black tracking-tight">Desktop Only</h2>
        <p className="text-muted-foreground text-sm max-w-xs">ATC requires a larger screen.</p>
      </div>

      <div className="hidden md:flex flex-col items-center gap-4 w-full">
        <div className="text-center">
          <h1 className="text-3xl font-black tracking-tight">ATC MADNESS 🗼</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Draw paths to the active runway threshold · planes loop until landed · only collisions cost lives
          </p>
        </div>

        <div className="flex items-center gap-8 text-sm flex-wrap justify-center">
          <div className="text-center">
            <div className="text-2xl font-black text-yellow-500">🏆 {highScore}</div>
            <div className="text-muted-foreground text-xs">High Score</div>
          </div>
          <div className="text-xs text-muted-foreground flex gap-3">
            <span><span className="text-blue-400 font-bold">User</span> 100</span>
            <span><span className="text-purple-400 font-bold">Mod</span> 150</span>
            <span><span className="text-orange-400 font-bold">Staff</span> 200</span>
            <span><span className="text-red-400 font-bold">Dev</span> 300</span>
            <span className="text-muted-foreground">× combo</span>
          </div>
        </div>

        {!loaded
          ? <p className="text-muted-foreground text-xs animate-pulse">Loading pilot avatars…</p>
          : <canvas
              ref={canvasRef}
              width={CW}
              height={CH}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className="rounded-2xl border-2 border-border shadow-2xl cursor-crosshair select-none"
            />
        }
      </div>
    </div>
  )
}
