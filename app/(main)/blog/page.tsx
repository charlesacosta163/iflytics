import React from "react";
import { PiNewspaperLight } from "react-icons/pi";
import { TbBolt } from "react-icons/tb";
import BlogImageBlock from "@/components/blog-image-block";

type Section = { label: string | null; items: string[] };

type SubEntry = {
  id: string;
  version: string;
  date: string;
  title: string;
  images: string[];
  sections: Section[];
};

type Entry = SubEntry & {
  badge: string | null;
  badgeColor: string;
  subVersions: SubEntry[];
};

const UPDATE_NOTES: Entry[] = [
  {
    id: "v1-7-0",
    version: "v1.7.0-synthpunk",
    date: "May 22, 2026",
    title: "IFlytics Arcade and IFC Card Customization Updates",
    badge: "Latest",
    badgeColor: "bg-blue-500",
    images: ['/images/blog/v1.7.0-blog1.png'],
    sections: [
      {
        label: "IFlytics Arcade",
        items: [
          "Added IFlytics Arcade — a centralized hub for minigames, available on all plans (Free, Premium, and Lifetime).",
          "Built as a fun addition for users visiting the dashboard or flight tracker.",
          "Games: Find The Pilot, IFlytics Snake, Flappy User, Memory Match, IFlytics Breaker, Whack the Users, ATC Madness.",
        ],
      },
      {
        label: "IFC Card Customization",
        items: [
          "Added border customization.",
          "Added shadow customization.",
          "Available in Dashboard Mode under the Profile section.",
        ],
      },
    ],
    subVersions: [{
      id: "v1-7-1",
      version: "v1.7.1-synthpunk",
      date: "May 25, 2026",
      title: "IFlytics New Map Theme: Earth",
      images: [],
      sections: [
        {
          label: "New Map Theme: Earth",
          items: [
            "Added a new map theme: Earth.",
            "Satellite-imagery of flight tracker",
          ],
        },
      ],
    }],
  },
  {
    id: "v1-6-0",
    version: "v1.6.0-tweepop",
    date: "May 2, 2026",
    title: "Community Timeline Feature",
    badge: null,
    badgeColor: "",
    images: ['/images/blog/v1.6.0-blog1.png'],
    sections: [
      {
        label: "Community Timeline",
        items: [
          "Added the Community Timeline Page under the Community tab.",
          "Visualizes IFlytics community growth month by month, starting from June 2025.",
          "Members are grouped by join month, sorted newest to oldest.",
          "Each month displays the number of pilots who joined.",
        ],
      },
      {
        label: "Other Fixes",
        items: [
          "Redesigned the dashboard sidebar.",
          "Fixed incorrect violation counts in User ATC History.",
          "Added profile pictures for newly registered users.",
        ],
      },
    ],
    subVersions: [
      {
        id: "v1-6-1",
        version: "v1.6.1-tweepop",
        date: "May 20, 2026",
        title: "Flight History Aircraft Fix and Community Map Beta",
        images: ['/images/blog/v1.6.1-blog1.png'],
        sections: [
          {
            label: null,
            items: [
              "Fixed the Unknown Aircraft issue when viewing flight histories.",
              "Added profile pictures for newly registered users.",
            ],
          },
          {
            label: "Community Map Beta",
            items: [
              "Located on the Community page.",
              "Shows IFlytics users currently flying on the Expert Server.",
              "Each pilot is represented by their profile picture on the map.",
              "Tapping a profile picture shows callsign, altitude, speed, and heading.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "v1-5-0",
    version: "v1.5.0-postpunk",
    date: "December 16, 2025",
    title: "Grade Progression Tracker and App Design Overhaul",
    badge: null,
    badgeColor: "",
    images: ['/images/blog/v1.5.0-blog2.png','/images/blog/v1.5.0-blog1.png'],
    sections: [
      {
        label: "Grade Progression Tracker",
        items: [
          "Added the Grade Progression Tracker in Dashboard Mode, based on Infinite Flight's grading requirements.",
          "Users can view current progress toward the next grade, or select higher grades to plan ahead.",
          "Organized requirement sections: Overall totals, 90-day totals, Violation examination.",
          "Added progress counters showing how many requirements are completed.",
          "Added an overall progress summary toward the selected grade.",
        ],
      },
      {
        label: "App Design Overhaul",
        items: [
          "Refreshed User Search page.",
          "Updated Community page.",
          "Updated Main Dashboard page.",
          "Modernized the overall visual style of the app.",
        ],
      },
    ],
    subVersions: [
      {
        id: "v1-5-1",
        version: "v1.5.1-postpunk",
        date: "December 19, 2025",
        title: "Monthly Stat Comparison Tracker",
        images: [],
        sections: [
          {
            label: null,
            items: [
              "Added a Monthly Stat Comparison Tracker to the dashboard.",
              "Shows how the user's current month compares to the previous month across Flights, Flight time, Landings, and XP.",
              "Added arrows to indicate increases or decreases.",
              "Added a short trend message summarizing recent activity.",
            ],
          },
        ],
      },
      {
        id: "v1-5-2",
        version: "v1.5.2-postpunk",
        date: "December 24, 2025",
        title: "Minor Adjustments",
        images: [],
        sections: [
          {
            label: null,
            items: [
              "Fixed the Discord server link.",
              "Fixed an issue where the leaderboard was capped at only 50 users.",
              "Added profile pictures for newly registered users.",
              "Noted upcoming fixes: miscounted ATC violations in ATC History, incorrect AP+ statuses on the flight tracker.",
            ],
          },
        ],
      },
      {
        id: "v1-5-3",
        version: "v1.5.3-postpunk",
        date: "February 19, 2026",
        title: "Aircraft Analysis Fixes and Anniversary Updates",
        images: [],
        sections: [
          {
            label: null,
            items: [
              "Fixed an issue where the Aircraft Analysis section displayed a constant error message when opening the Aircraft tab.",
              "Added more profile pictures for newly registered users.",
              "Announced 6-month anniversary discounts.",
              "Shared milestone progress, including reaching 400 users.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "v1-4-0",
    version: "v1.4.0-slowcore",
    date: "September 18, 2025",
    title: "VA/VO Filtering and Expert Server Map Improvements",
    badge: null,
    badgeColor: "",
    images: ['/images/blog/v1.4.0-blog1.png'],
    sections: [
      {
        label: null,
        items: [
          "Added Virtual Airline / Virtual Organization (VA/VO) filtering to the Expert Server flight map.",
          "Users can filter active map users by a specific VA or VO.",
          "Added a redesigned user popup — larger display for bigger screens, opens from the bottom of the page.",
          "Users can minimize the popup and analyze the selected pilot's flight plan.",
        ],
      },
    ],
    subVersions: [
      {
        id: "v1-4-1",
        version: "v1.4.1-slowcore",
        date: "September 29, 2025",
        title: "Training and Casual Server Support",
        images: [],
        sections: [
          {
            label: null,
            items: [
              "Added Training Server and Casual Server support to the flight tracker.",
              "ATC information was adjusted for each server.",
              "VA data was made available for each server.",
              "Hotfix: fixed an issue where users were not updating immediately when switching servers.",
            ],
          },
        ],
      },
      {
        id: "v1-4-4",
        version: "v1.4.4-slowcore",
        date: "December 13, 2025",
        title: "Page Lookup Utility Tool",
        images: ['/images/blog/v1.4.4-blog1.png'],
        sections: [
          {
            label: null,
            items: [
              "Added a Page Lookup Tool in Guest Mode, located inside the User Flight History section.",
              "Allows users to jump directly to a specific page of their flight history instead of navigating manually.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "v1-3-0",
    version: "v1.3.0-shoegaze",
    date: "September 14, 2025",
    title: "Community Leaderboard",
    badge: null,
    badgeColor: "",
    images: ['/images/blog/v1.3.0-blog1.png'],
    sections: [
      {
        label: "Community-Wide Statistics",
        items: [
          "Total pilots, combined flight hours, total flights, total landings, community grade average, ATC operations, and experience points.",
        ],
      },
      {
        label: "Top Performer Categories",
        items: [
          "Most XP, Most flights, Total flight time, Most landings, Top ATC controllers, Most violations / creative pilots.",
        ],
      },
      {
        label: null,
        items: [
          "Added goal progress bars showing progress toward community milestones.",
          "Leaderboard syncs automatically with user flight data.",
        ],
      },
    ],
    subVersions: [],
  },
  {
    id: "v1-2-0",
    version: "v1.2.0-noisepop",
    date: "September 7, 2025",
    title: "ATC Sessions History and Breakdown",
    badge: null,
    badgeColor: "",
    images: ['/images/blog/v1.2.0-blog1.png'],
    sections: [
      {
        label: "ATC Sessions History",
        items: [
          "Added ATC Sessions History in Guest Mode — expands IFlytics beyond pilot stats to include controller-focused analytics.",
          "Each session card includes: airport and frequency info, Ground/Tower/Approach/Center types, total operations, session duration, ops per hour, violations issued, and traffic classification.",
        ],
      },
      {
        label: "ATC Traffic Classification",
        items: [
          "Sessions are classified as Light, Medium, or Heavy.",
          "Classification is based on ops per hour and session length.",
          "Short sessions use raw ops to avoid inflated ops/hour values.",
        ],
      },
      {
        label: "Local vs Radar Control Breakdown",
        items: [
          "Local: Ground, Tower, Clearance.",
          "Radar: Approach, Departure, Center.",
          "Displays level, total ops, average ops/hour, peak rate, and frequency breakdown.",
        ],
      },
    ],
    subVersions: [],
  },
  {
    id: "v1-1-0",
    version: "v1.1.0-powerpop",
    date: "September 1,2025",
    title: "Monthly Timeframes and IFC Stats Card Customization",
    badge: null,
    badgeColor: "",
    images: ['/images/blog/v1.1.0-blog1.png','/images/blog/v1.1.0-blog2.png'],
    sections: [
      {
        label: "Monthly Timeframes (Premium)",
        items: [
          "Users can view stats by specific month and year.",
          "Users can see which months contain flight data.",
          "Data is based on the user's last 800 flights.",
        ],
      },
      {
        label: "IFC Stats Card Customization Tool",
        items: [
          "Located inside the Profile page.",
          "Allows users to customize themes, colors, and fonts.",
          "Lets users copy/paste their generated stats card into their IFC profile description.",
        ],
      },
      {
        label: "UI and Misc Improvements",
        items: [
          "Additional bug fixes.",
          "Added subscription color-coding to navbar borders.",
          "Added more profile pictures for newly registered users.",
        ],
      },
    ],
    subVersions: [
      {
        id: "v1-1-x",
        version: "v1.1.x-powerpop",
        date: "September 2, 2025",
        title: "Hotfix",
        images: [],
        sections: [
          {
            label: null,
            items: [
              "Fixed an issue where Custom Flight Frames were not displaying in the UI.",
              "Renewed the Discord server link.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "v1-0-0",
    version: "v1.0.0-poppunk",
    date: "August 26, 2025",
    title: "Official Launch",
    badge: null,
    badgeColor: "",
    images: ['/images/blog/v1.0.0-blog1.png'],
    sections: [
      {
        label: "Core Purpose",
        items: [
          "View detailed Infinite Flight statistics.",
          "Use IFlytics as a personal flight analytics dashboard.",
          "Track flights through a functioning flight tracker with Expert Server support.",
        ],
      },
      {
        label: null,
        items: [
          "Launch discount codes were introduced for Premium and Lifetime plans.",
          "Community feedback and feature suggestions accepted from day one.",
        ],
      },
    ],
    subVersions: [
      {
        id: "v1-0-1",
        version: "v1.0.1-poppunk",
        date: "August 27, 2025",
        title: "Launch Fixes and Server Recovery",
        images: [],
        sections: [
          {
            label: null,
            items: [
              "Released after maintenance mode was lifted.",
              "Fixed an issue where Airline Analysis and Route Frequency features were not displaying in the UI.",
              "Fixed a critical server error affecting payments.",
              "Added more user profile pictures.",
              "Launch discount period was extended to October 1.",
            ],
          },
        ],
      },
    ],
  },
];

// ─── Section list inside a card ───────────────────────────────────────────────

function SectionList({ sections }: { sections: Section[] }) {
  return (
    <div className="flex flex-col gap-4">
      {sections.map((sec, i) => (
        <div key={i}>
          {sec.label && (
            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1.5">
              {sec.label}
            </p>
          )}
          <ul className="flex flex-col gap-1.5">
            {sec.items.map((item, j) => (
              <li key={j} className="flex items-start gap-2.5 text-sm text-gray-600 dark:text-gray-300">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600 flex-shrink-0" />
                {item.split(' — ')[0]}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

// ─── Sub-version card ─────────────────────────────────────────────────────────

function SubVersionCard({ entry }: { entry: SubEntry }) {
  return (
    <div
      id={entry.id}
      className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/20 p-5 scroll-mt-6"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold text-gray-400 dark:text-gray-500 font-mono tracking-wide">
              {entry.version}
            </span>
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
              patch
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500 ml-auto">{entry.date}</span>
          </div>
          <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200 leading-snug mt-0.5">
            {entry.title}
          </h3>
        </div>
      </div>
      <BlogImageBlock images={entry.images} version={entry.version} />
      <SectionList sections={entry.sections} />
    </div>
  );
}

// ─── Main entry card ──────────────────────────────────────────────────────────

function EntryCard({ entry }: { entry: Entry }) {
  return (
    <div className="flex flex-col gap-0">
      <article
        id={entry.id}
        className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/10 p-6 scroll-mt-6"
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-700 flex-shrink-0">
            <TbBolt className="text-gray-500 dark:text-gray-400 text-base" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-gray-400 dark:text-gray-500 font-mono tracking-wide">
                {entry.version}
              </span>
              {entry.badge && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white ${entry.badgeColor}`}>
                  {entry.badge}
                </span>
              )}
              <span className="text-xs text-gray-400 dark:text-gray-500 ml-auto">{entry.date}</span>
            </div>
            <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 leading-snug mt-0.5">
              {entry.title}
            </h2>
          </div>
        </div>

        <BlogImageBlock images={entry.images} version={entry.version} />
        <SectionList sections={entry.sections} />
      </article>

      {/* Sub-versions */}
      {entry.subVersions.length > 0 && (
        <div className="ml-6 flex flex-col gap-0">
          {entry.subVersions.map((sub) => (
            <div key={sub.id} className="relative pl-6 pt-3">
              {/* Connecting line */}
              <div className="absolute left-0 top-0 bottom-3 w-px bg-gray-200 dark:bg-gray-700" />
              <div className="absolute left-0 top-[22px] w-4 h-px bg-gray-200 dark:bg-gray-700" />
              <SubVersionCard entry={sub} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BlogPage() {
  return (
    <div className="min-h-screen w-full max-w-[1000px] mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-2">
          <PiNewspaperLight className="text-gray-400 text-xl" />
          <span className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
            IFlytics Blog
          </span>
        </div>
        <h1 className="text-3xl lg:text-4xl font-black text-gray-900 dark:text-gray-100 tracking-tight mb-2">
          Update History
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
          A full log of changes, improvements, and features since launch.
        </p>
      </div>

      {/* Mobile TOC — horizontal scrolling pill bar */}
      <div className="lg:hidden mb-6 -mx-4 px-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">
          Jump to
        </p>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {UPDATE_NOTES.map((entry) => (
            <React.Fragment key={entry.id}>
              <a
                href={`#${entry.id}`}
                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                {entry.version}
                {entry.badge && (
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                )}
              </a>
              {entry.subVersions.map((sub) => (
                <a
                  key={sub.id}
                  href={`#${sub.id}`}
                  className="flex-shrink-0 px-3 py-1.5 rounded-full border border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-xs font-medium text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                >
                  {sub.version}
                </a>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="flex gap-8 items-start">
        {/* Sidebar TOC — sticky desktop */}
        <aside className="hidden lg:block w-52 flex-shrink-0 sticky top-6 self-start">
          <div className="rounded-2xl  border-gray-200 dark:border-gray-700 bg-gray-50/10 dark:bg-gray-800/10 p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">
              Contents
            </p>
            <nav className="flex flex-col gap-0.5">
              {UPDATE_NOTES.map((entry) => (
                <React.Fragment key={entry.id}>
                  <a
                    href={`#${entry.id}`}
                    className="flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors py-1 rounded"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500 flex-shrink-0" />
                    {entry.version}
                    {entry.badge && (
                      <span className="ml-auto text-[10px] font-bold text-blue-500">NEW</span>
                    )}
                  </a>
                  {entry.subVersions.map((sub) => (
                    <a
                      key={sub.id}
                      href={`#${sub.id}`}
                      className="flex items-center gap-2 text-xs font-medium text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors py-0.5 pl-4 rounded"
                    >
                      <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600 flex-shrink-0" />
                      {sub.version.split('-')[0]}
                    </a>
                  ))}
                </React.Fragment>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 flex flex-col gap-6">
          {UPDATE_NOTES.map((entry) => (
            <EntryCard key={entry.id} entry={entry} />
          ))}
        </main>
      </div>

      <div className="mt-12 flex justify-center">
        <a
          href="#"
          className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold text-gray-400 dark:text-gray-500 border border-gray-200 dark:border-gray-700 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
        >
          ↑ Back to top
        </a>
      </div>
    </div>
  );
}
