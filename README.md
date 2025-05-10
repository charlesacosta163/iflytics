# IFlytics

IFlytics is a web application for tracking user statistics in Infinite Flight. Users can search by their Infinite Flight Community (IFC) username to view general statistics and flight history, powered by the Infinite Flight Live API.

## Features

### Search
- Input an IFC username to look up a user's Infinite Flight stats.

### General Stats
Displays key metrics for a user:
- Total Flights
- Total XP
- Total Landings
- Total Flight Time
- Average Flight Time (in minutes)
- Average XP per Flight
- Grade
- ATC Rank
- ATC Operations

### Flights
- Paginated list of recent flights
- Displays date, callsign, aircraft, airline, server, XP, flight time, and violation count
- Expandable cards with additional flight details

## Technology Stack

- Next.js (App Router)
- Tailwind CSS
- Shadcn UI
- TypeScript
- Infinite Flight Live API

## Future Plans

- Implement a dashboard style native application where users can log in and track their statistics on given time frames
- Display Charts for advanced data visualization (Premium Tiers)
- Enable filtering by specific data types within time frames (e.g., flight time, flight count, XP earned, etc...)

## Terms of Use

- No permanent data is stored from the API. Caching is temporary and used only to optimize requests.
- Sessions are subject to a 15-minute timeout to comply with Infinite Flight's usage policy.

## Disclaimer

IFlytics is not affiliated with or endorsed by Infinite Flight or Flying Development Studio. All data is provided via the official Infinite Flight API under its public usage terms.
