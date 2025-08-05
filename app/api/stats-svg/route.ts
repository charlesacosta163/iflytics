import { NextRequest } from 'next/server';
import { getUserStats } from '@/lib/actions';
import { matchATCRankToTitle, getFlightsFromServer } from '@/lib/actions';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get('username') || 'Guest';
  const theme = searchParams.get('theme')?.toLowerCase() || 'default';
  const font = searchParams.get('font')?.toLowerCase() || 'inter';
  const text = 'white';

  // Font families
  const fonts = {
    inter: 'system-ui, -apple-system, Inter',
    mono: 'ui-monospace, SFMono-Regular, Menlo',
    serif: 'ui-serif, Georgia',
    casual: 'ui-sans-serif, -apple-system',
    modern: 'Helvetica Neue, Arial',
  };

  const selectedFont = fonts[font as keyof typeof fonts] || fonts.inter;

  // Pastel theme colors (darker variants)
  const themes = {
    default: '#1a1d21',
    sage: '#718176',    // Darker sage green
    lavender: '#7671A3', // Darker purple
    rose: '#B68E95',    // Darker pink
    sky: '#6B99AD',     // Darker blue
    peach: '#C49B82',   // Darker peach
    mint: '#75A69A',    // Darker mint
    lilac: '#9B8BAB',   // Darker lilac
    sand: '#A69485',     // Darker sand
    blue: '#3b82f6',
    green: '#22c55e',
    red: '#ef4444',
    yellow: '#eab308',
    purple: '#8b5cf6',
    orange: '#f97316',
    pink: '#ec4899',
  };

  const selectedTheme = themes[theme as keyof typeof themes] || themes.default;

  // Format flight time from minutes to hours and minutes
  const formatFlightTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const userObj = await getUserStats(username);

  if (userObj.result.length === 0) {
    return new Response('User not found', { status: 404 });
  }

  const data = userObj.result[0];

  const atcRank = await matchATCRankToTitle(data.atcRank.toString());

  const flightsInExpertServer = await getFlightsFromServer();

  const isFlyingInExpertServer = flightsInExpertServer.some((flight: any) => flight.username === data.discourseUsername);


  const svg = `
  <svg width="500" height="320" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="cardGradient">
        <stop offset="100%" style="stop-color:${selectedTheme};stop-opacity:1" />
      </linearGradient>
      <filter id="shadow">
        <feDropShadow dx="0" dy="4" stdDeviation="4" flood-opacity="0.25"/>
      </filter>
    </defs>
    
    <!-- Card Background -->
    <rect width="500" height="320" rx="15" fill="url(#cardGradient)" filter="shadow"/>
    
    <!-- Header -->
    <g transform="translate(30, 40)">
      <text font-family="${selectedFont}" font-size="24" font-weight="bold" fill="${text}">
        ${data.discourseUsername || 'Guest'}
      </text>
      <text x="0" y="25" font-family="${selectedFont}" font-size="14" fill="${text}" opacity="0.8">
        Grade ${data.grade} ${data.virtualOrganization ? '• ' + data.virtualOrganization : ''}
      </text>
    </g>

    <!-- Main Stats Grid -->
    <g transform="translate(30, 110)">
      <!-- XP -->
      <g>
        <text font-family="${selectedFont}" font-size="14" fill="${text}" opacity="0.8">XP</text>
        <text y="25" font-family="${selectedFont}" font-size="20" font-weight="bold" fill="${text}">
          ${data.xp.toLocaleString()}
        </text>
      </g>

      <!-- Online Flights -->
      <g transform="translate(160, 0)">
        <text font-family="${selectedFont}" font-size="14" fill="${text}" opacity="0.8">Online Flights</text>
        <text y="25" font-family="${selectedFont}" font-size="20" font-weight="bold" fill="${text}">
          ${data.onlineFlights.toLocaleString()}
        </text>
      </g>

      <!-- Landing Count -->
      <g transform="translate(320, 0)">
        <text font-family="${selectedFont}" font-size="14" fill="${text}" opacity="0.8">Landings</text>
        <text y="25" font-family="${selectedFont}" font-size="20" font-weight="bold" fill="${text}">
          ${data.landingCount.toLocaleString()}
        </text>
      </g>

      <!-- Flight Time -->
      <g transform="translate(0, 70)">
        <text font-family="${selectedFont}" font-size="14" fill="${text}" opacity="0.8">Flight Time</text>
        <text y="25" font-family="${selectedFont}" font-size="20" font-weight="bold" fill="${text}">
          ${formatFlightTime(data.flightTime)}
        </text>
      </g>

      <!-- ATC Operations -->
      <g transform="translate(160, 70)">
        <text font-family="${selectedFont}" font-size="14" fill="${text}" opacity="0.8">ATC Operations</text>
        <text y="25" font-family="${selectedFont}" font-size="20" font-weight="bold" fill="${text}">
          ${data.atcOperations.toLocaleString()}
        </text>
      </g>

      <!-- ATC Rank -->
      <g transform="translate(320, 70)">
        <text font-family="${selectedFont}" font-size="14" fill="${text}" opacity="0.8">ATC Rank</text>
        <text y="25" font-family="${selectedFont}" font-size="20" font-weight="bold" fill="${text}">
          ${atcRank || '-'}
        </text>
      </g>

    </g>

    <!-- Expert Server Status -->
    <g transform="translate(30, 240)">
      <text font-family="${selectedFont}" font-size="14" fill="${text}" opacity="0.8">Expert Server Status</text>
      <text y="25" font-family="${selectedFont}" font-size="20" font-weight="bold" fill="${text}">
                 ${isFlyingInExpertServer ? '<tspan fill="#dcedc8">Flying</tspan>' : '<tspan fill="#ffcdd2">Not flying</tspan>'}
      </text>
    </g>
    
    <!-- Footer -->
    <text x="30" y="300" font-family="${selectedFont}" font-size="12" fill="${text}" opacity="0.7">
      Generated by <a href="https://iflytics.app/user/${data.discourseUsername}" fill="#ffe985" target="_blank" style="text-decoration: underline; color: ${text};">IFlytics</a> • Updated ${new Date().toLocaleDateString()}
    </text>
  </svg>
  `;

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'no-cache',
    },
  });
}
