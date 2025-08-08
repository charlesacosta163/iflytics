import { NextRequest } from 'next/server';
import { getUserStats } from '@/lib/actions';
import { matchATCRankToTitle, getFlightsFromServer } from '@/lib/actions';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get('username') || 'Guest';
  const theme = searchParams.get('theme')?.toLowerCase() || 'default';
  const font = searchParams.get('font')?.toLowerCase() || 'inter';
  
  // Custom color parameters
  const customCardColor = searchParams.get('card_color');
  const customTextColor = searchParams.get('text_color');

  // Helper function to validate and normalize hex color
  const normalizeHex = (hex: string | null): string | null => {
    if (!hex) return null;
    
    // Remove # if present
    const cleanHex = hex.replace('#', '');
    
    // Validate 6-digit hex
    if (!/^[A-Fa-f0-9]{6}$/.test(cleanHex)) {
      return null;
    }
    
    return `#${cleanHex}`;
  };

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
    sage: '#718176',
    lavender: '#7671A3',
    rose: '#B68E95',
    sky: '#6B99AD',
    peach: '#C49B82',
    mint: '#75A69A',
    lilac: '#9B8BAB',
    sand: '#A69485',
    blue: '#3b82f6',
    green: '#22c55e',
    red: '#ef4444',
    yellow: '#eab308',
    purple: '#8b5cf6',
    orange: '#f97316',
    pink: '#ec4899',
  };

  // Determine card color (custom hex takes priority over theme)
  const selectedCardColor = normalizeHex(customCardColor) 
    || themes[theme as keyof typeof themes] 
    || themes.default;

  // Determine text color (custom hex takes priority, fallback to white)
  const selectedTextColor = normalizeHex(customTextColor) || 'white';

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
      <filter id="shadow">
        <feDropShadow dx="0" dy="4" stdDeviation="4" flood-opacity="0.25"/>
      </filter>
    </defs>
    
    <!-- Card Background -->
    <rect width="500" height="320" rx="15" fill="${selectedCardColor}" filter="shadow"/>
    
    <!-- Header -->
    <g transform="translate(30, 40)">
      <text font-family="${selectedFont}" font-size="24" font-weight="bold" fill="${selectedTextColor}">
        ${data.discourseUsername || 'Guest'}
      </text>
      <text x="0" y="25" font-family="${selectedFont}" font-size="14" fill="${selectedTextColor}" opacity="0.8">
        Grade ${data.grade} ${data.virtualOrganization ? '• ' + data.virtualOrganization : ''}
      </text>
    </g>

    <!-- Main Stats Grid -->
    <g transform="translate(30, 110)">
      <!-- XP -->
      <g>
        <text font-family="${selectedFont}" font-size="14" fill="${selectedTextColor}" opacity="0.8">XP</text>
        <text y="25" font-family="${selectedFont}" font-size="20" font-weight="bold" fill="${selectedTextColor}">
          ${data.xp.toLocaleString()}
        </text>
      </g>

      <!-- Online Flights -->
      <g transform="translate(160, 0)">
        <text font-family="${selectedFont}" font-size="14" fill="${selectedTextColor}" opacity="0.8">Online Flights</text>
        <text y="25" font-family="${selectedFont}" font-size="20" font-weight="bold" fill="${selectedTextColor}">
          ${data.onlineFlights.toLocaleString()}
        </text>
      </g>

      <!-- Landing Count -->
      <g transform="translate(320, 0)">
        <text font-family="${selectedFont}" font-size="14" fill="${selectedTextColor}" opacity="0.8">Landings</text>
        <text y="25" font-family="${selectedFont}" font-size="20" font-weight="bold" fill="${selectedTextColor}">
          ${data.landingCount.toLocaleString()}
        </text>
      </g>

      <!-- Flight Time -->
      <g transform="translate(0, 70)">
        <text font-family="${selectedFont}" font-size="14" fill="${selectedTextColor}" opacity="0.8">Flight Time</text>
        <text y="25" font-family="${selectedFont}" font-size="20" font-weight="bold" fill="${selectedTextColor}">
          ${formatFlightTime(data.flightTime)}
        </text>
      </g>

      <!-- ATC Operations -->
      <g transform="translate(160, 70)">
        <text font-family="${selectedFont}" font-size="14" fill="${selectedTextColor}" opacity="0.8">ATC Operations</text>
        <text y="25" font-family="${selectedFont}" font-size="20" font-weight="bold" fill="${selectedTextColor}">
          ${data.atcOperations.toLocaleString()}
        </text>
      </g>

      <!-- ATC Rank -->
      <g transform="translate(320, 70)">
        <text font-family="${selectedFont}" font-size="14" fill="${selectedTextColor}" opacity="0.8">ATC Rank</text>
        <text y="25" font-family="${selectedFont}" font-size="20" font-weight="bold" fill="${selectedTextColor}">
          ${atcRank || '-'}
        </text>
      </g>

    </g>

    <!-- Expert Server Status -->
    <g transform="translate(30, 240)">
      <text font-family="${selectedFont}" font-size="14" fill="${selectedTextColor}" opacity="0.8">Expert Server Status</text>
      <text y="25" font-family="${selectedFont}" font-size="20" font-weight="bold" fill="${selectedTextColor}">
                 ${isFlyingInExpertServer ? 'Flying' : 'Not flying'}
      </text>
    </g>
    
    <!-- Footer -->
    <text x="30" y="300" font-family="${selectedFont}" font-size="12" fill="${selectedTextColor}" opacity="0.7">
      Generated by <a href="https://iflytics.app/user/${data.discourseUsername}" target="_blank" style="text-decoration: underline; color: ${selectedTextColor};">IFlytics</a> • Updated ${new Date().toLocaleDateString()}
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
