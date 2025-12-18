import { Flight } from "./types";

export function getPreviousMonthStats(flights: Flight[]) {
    // Only account last month's stats
    // Accumulate total flight time, total landings, total xp

    const now = new Date();

    // Filter flights from the previous month
    const startOfLastMonth = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        1
    );

    const startOfThisMonth = new Date(
        now.getFullYear(),
        now.getMonth(),
        1
    );

    const lastMonthFlights = flights.filter((flight) => {
        const flightDate = new Date(flight.created);
        return (
            flightDate >= startOfLastMonth &&
            flightDate < startOfThisMonth
        );
    });

    // Calculate stats
    const totalFlightTime = lastMonthFlights.reduce((acc, flight) => acc + (flight.totalTime || 0), 0);
    const totalLandings = lastMonthFlights.reduce((acc, flight) => acc + (flight.landingCount || 0), 0);
    const totalXP = lastMonthFlights.reduce((acc, flight) => acc + (flight.xp || 0), 0);
    const totalFlights = lastMonthFlights.length;

    return {
        totalFlightTime,
        totalLandings,
        totalXP,
        totalFlights,
        flights: lastMonthFlights
    };
}

export function getThisMonthStats(flights: Flight[]) {
    // Only account this month's stats
    // Accumulate total flight time, total landings, total xp

    const now = new Date();

    const startOfThisMonth = new Date(
        now.getFullYear(),
        now.getMonth(),
        1
    );

    const thisMonthFlights = flights.filter((flight) => {
        const flightDate = new Date(flight.created);
        return flightDate >= startOfThisMonth;
    });

    // Calculate stats
    const totalFlightTime = thisMonthFlights.reduce((acc, flight) => acc + (flight.totalTime || 0), 0);
    const totalLandings = thisMonthFlights.reduce((acc, flight) => acc + (flight.landingCount || 0), 0);
    const totalXP = thisMonthFlights.reduce((acc, flight) => acc + (flight.xp || 0), 0);
    const totalFlights = thisMonthFlights.length;

    return {
        totalFlightTime,
        totalLandings,
        totalXP,
        totalFlights,
        flights: thisMonthFlights
    };
}