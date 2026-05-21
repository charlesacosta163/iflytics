import React from 'react'
import Link from 'next/link'
import { Monitor, Trophy, Zap } from 'lucide-react'
import { SiPcgamingwiki } from "react-icons/si";
import { FaRegFaceSmileBeam } from 'react-icons/fa6';
import { LuAirVent, LuMapPin, LuWalletCards} from 'react-icons/lu';
import { LuPlane } from 'react-icons/lu';
import { LuHammer } from 'react-icons/lu';
import { VscSnake } from "react-icons/vsc";
import { RiRouteLine } from "react-icons/ri";



// ─── Game definitions ─────────────────────────────────────────────────────────
type Difficulty = 'Easy' | 'Medium' | 'Hard'

const GAMES = [
  {
    title: 'Find the Pilot',
    icon: <LuMapPin className="w-4 h-4 inline-block mr-2" />,
    description: 'Find the pilot in the grid. The pilot is the one with the most points.',
    route: '/map/game',
    image: '/images/games/findthepilot.png',
    difficulty: 'Easy' as Difficulty,
    desktopOnly: false,
  },
  {
    title: 'Snake',
    icon: <VscSnake className="w-4 h-4 inline-block mr-2" />,
    description: 'Eat pilots and grow your serpent. Role-based scoring — snag a Dev for 100 pts.',
    route: '/dashboard/games/snake',
    image: '/images/games/snakegame.png',
    difficulty: 'Medium' as Difficulty,
    desktopOnly: true,
  },
  {
    title: 'Flappy User',
    icon: <LuPlane className="w-4 h-4 inline-block mr-2" />,
    description: "Fly as yourself through pipe obstacles made of other pilots. Land safely or hear who finished you.",
    route: '/dashboard/games/flappy',
    image: '/images/games/flappygame.png',
    difficulty: 'Hard' as Difficulty,
    desktopOnly: true,
  },
  {
    title: 'Memory Match',
    icon: <LuWalletCards className="w-4 h-4 inline-block mr-2" />,
    description: 'Flip and match pairs of pilot avatars. Race for fewest moves and fastest time.',
    route: '/dashboard/games/memory',
    image: '/images/games/memorygame.png',
    difficulty: 'Easy' as Difficulty,
    desktopOnly: false,
  },
  {
    title: 'IFlytics Breaker',
    icon: <LuAirVent className="w-4 h-4 inline-block mr-2" />,
    description: 'Pilots are bricks with role-based HP. Staff and Devs take multiple hits to clear.',
    route: '/dashboard/games/breaker',
    image: '/images/games/brickgame.png',
    difficulty: 'Medium' as Difficulty,
    desktopOnly: true,
  },
  {
    title: 'Whack the Users',
    icon: <LuHammer className="w-4 h-4 inline-block mr-2" />,
    description: 'Pilots pop out of holes — faster roles disappear quicker. Hit Devs for 150 pts.',
    route: '/dashboard/games/whack',
    image: '/images/games/whackgame.png',
    difficulty: 'Easy' as Difficulty,
    desktopOnly: false,
  },
  {
    title: 'ATC MADNESS',
    icon: <RiRouteLine className="w-4 h-4 inline-block mr-2" />,
    description: 'Draw flight paths to guide pilots to the active runway. Planes loop — only collisions cost lives.',
    route: '/dashboard/games/atc',
    image: '/images/games/atcgame.png',
    difficulty: 'Hard' as Difficulty,
    desktopOnly: true,
  },
]

const DIFFICULTY_STYLES: Record<Difficulty, string> = {
  Easy:   'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  Medium: 'bg-yellow-500/20  text-yellow-300  border-yellow-500/30',
  Hard:   'bg-red-500/20     text-red-300     border-red-500/30',
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function GamesPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 rounded-[20px]" style={{ backgroundImage: 'url(/starfall-gif.gif)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', backgroundAttachment: 'fixed' }}>
      {/* Header */}
      <div className="space-y-1 text-white">
        <h1 className="text-3xl font-black tracking-tight"><SiPcgamingwiki className="w-6 h-6 inline-block mr-2 text-white" /> IFlytics Arcade</h1>
        <p className=" text-sm text-gray-300">
          Mini-games featuring IFlytics community users <FaRegFaceSmileBeam className="w-4 h-4 inline-block mr-2" />
        </p>
      </div>

      {/* Stats bar */}
      <div className="flex gap-6 text-sm text-gray-300 flex-wrap">
        <span className="flex items-center gap-1.5">
          <Trophy className="w-4 h-4 text-yellow-500" />
          {GAMES.length} games
        </span>
        <span className="flex items-center gap-1.5">
          <Monitor className="w-4 h-4 text-blue-400" />
          {GAMES.filter(g => g.desktopOnly).length} desktop-only
        </span>
        <span className="flex items-center gap-1.5">
          <Zap className="w-4 h-4 text-purple-400" />
          High scores saved locally
        </span>
      </div>

      {/* Game grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {GAMES.map(game => (
          <Link key={game.route} href={game.route} className="group block">
            <div className="relative overflow-hidden rounded-2xl border border-border h-52 cursor-pointer transition-all duration-300 group-hover:border-white/20 group-hover:shadow-2xl group-hover:-translate-y-1">

              {/* Backdrop image */}
              <img
                src={game.image}
                alt={game.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />

              {/* Gradient overlay – stronger at bottom for text legibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10" />

              {/* Hover tint */}
              <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors duration-300" />

              {/* Top badges */}
              <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2">
                {game.desktopOnly ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-black/50 text-white/70 border border-white/15 backdrop-blur-sm">
                    <Monitor className="w-2.5 h-2.5" /> Desktop
                  </span>
                ) : <span />}

                <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border backdrop-blur-sm ${DIFFICULTY_STYLES[game.difficulty]}`}>
                  {game.difficulty}
                </span>
              </div>

              {/* Bottom content */}
              <div className="absolute bottom-0 left-0 right-0 p-4">

                <div className="flex items-center text-white">
                  {game.icon}
                <h3 className="text-white font-black text-base leading-tight tracking-tight">
                  {game.title}
                </h3>
                </div>
                <p className="text-white/55 text-[11px] mt-1 leading-snug line-clamp-2">
                  {game.description}
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[11px] text-white/60 font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    Play →
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
