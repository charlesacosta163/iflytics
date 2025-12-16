import { Flight } from "./types"

// Return the user's grade along with their current stats
export function getInfiniteFlightGrade(
    xp: number, 
    totalFlightTime: number, 
    totalLandings: number, 
    violationsByLevel: any, 
    flights: Flight[]
) {
    try {
        const flightsWithinNinetyDays = getFlightsWithinNinetyDays(flights)
        const flightTimeWithinNinetyDays = flightsWithinNinetyDays.reduce((acc, flight) => acc + Math.round(flight.totalTime), 0)
        const landingCountWithinNinetyDays = flightsWithinNinetyDays.reduce((acc, flight) => acc + flight.landingCount, 0)

        // Calculate user's violation stats
        const violationsDay = getViolationsLastDay(flights)
        const violationsWeek = getViolationsLastWeek(flights)
        const violationsYear = getViolationsLastYear(flights)
        const level1ViolationsPerLandingsRatio = getLevel1ViolationsPerLandingsRatioYear(flights)

        // Determine grade
        let userGrade = 1
        for (let i = gradeConstraintsData.length - 1; i >= 1; i--) {
            const grade = gradeConstraintsData[i]
            
            const meetsBasicRequirements = 
                xp >= grade.minXp &&
                totalFlightTime >= grade.minFlightTime &&
                totalLandings >= grade.minLandingCount &&
                flightTimeWithinNinetyDays >= grade.minFlightTimeNinetyDays &&
                landingCountWithinNinetyDays >= grade.minLandingCountNinetyDays
            
            if (!meetsBasicRequirements) {
                continue
            }

            const meetsViolations = meetsViolationRequirements(flights, grade)
            
            if (meetsBasicRequirements && meetsViolations) {
                userGrade = grade.grade
                break
            }
        }

        // Return user's actual stats with their grade
        return {
            grade: userGrade,
            xp: xp,
            flightTime: totalFlightTime,
            landingCount: totalLandings,
            flightTimeNinetyDays: flightTimeWithinNinetyDays,
            landingCountNinetyDays: landingCountWithinNinetyDays,
            lvlOneViolationsDay: violationsDay.level1,
            lvlOneViolationsWeek: violationsWeek.level1,
            lvlOneViolationsPerLandingsRatioYear: level1ViolationsPerLandingsRatio,
            lvlTwoViolationsYear: violationsYear.level2,
            lvlThreeViolationsWeek: violationsWeek.level3,
            lvlThreeViolationsYear: violationsYear.level3,
            totalLvlTwoThreeViolationsYear: violationsYear.level2 + violationsYear.level3
        }

    } catch (err) {
        console.log(err)
        return {
            grade: 1,
            xp: xp,
            flightTime: totalFlightTime,
            landingCount: totalLandings,
            flightTimeNinetyDays: 0,
            landingCountNinetyDays: 0,
            lvlOneViolationsDay: 0,
            lvlOneViolationsWeek: 0,
            lvlOneViolationsPerLandingsRatioYear: 0,
            lvlTwoViolationsYear: 0,
            lvlThreeViolationsWeek: 0,
            lvlThreeViolationsYear: 0,
            totalLvlTwoThreeViolationsYear: 0
        }
    }
}

export function getFlightsWithinNinetyDays(flights: Flight[]) {
    // Sample Entry:  "created": "2022-01-10T10:37:41.965626",

    const today = new Date()
    const ninetyDaysAgo = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000)

    return flights.filter((flight: Flight) => {
        const flightDate = new Date(flight.created)
        return flightDate >= ninetyDaysAgo
    })

}

export function getUserViolationCount(violationObj: Record<string, number>) {
    let count = 0;
  
    for (const key in violationObj) {
      count += Number(violationObj[key]);
    }
  
    return count;
}


// ==================== VIOLATION UTILITY FUNCTIONS ==================== //

/**
 * Get flights within a specific number of days
 */
export function getFlightsWithinDays(flights: Flight[], days: number) {
    const today = new Date()
    const daysAgo = new Date(today.getTime() - days * 24 * 60 * 60 * 1000)
    
    return flights.filter((flight: Flight) => {
        const flightDate = new Date(flight.created)
        return flightDate >= daysAgo
    })
}

/**
 * Count violations by level from flights
 */
export function countViolationsByLevel(flights: Flight[]) {
    const counts = { level1: 0, level2: 0, level3: 0 }
    
    flights.forEach(flight => {
        if (flight.violations && Array.isArray(flight.violations)) {
            flight.violations.forEach((violation: any) => {
                const level = violation.level || violation.type
                if (level === 1 || level === 'level1') counts.level1++
                else if (level === 2 || level === 'level2') counts.level2++
                else if (level === 3 || level === 'level3') counts.level3++
            })
        }
    })
    
    return counts
}

/**
 * Get violations within the last day (24 hours)
 */
export function getViolationsLastDay(flights: Flight[]) {
    const flightsLastDay = getFlightsWithinDays(flights, 1)
    return countViolationsByLevel(flightsLastDay)
}

/**
 * Get violations within the last week (7 days)
 */
export function getViolationsLastWeek(flights: Flight[]) {
    const flightsLastWeek = getFlightsWithinDays(flights, 7)
    return countViolationsByLevel(flightsLastWeek)
}

/**
 * Get violations within the last year (365 days)
 */
export function getViolationsLastYear(flights: Flight[]) {
    const flightsLastYear = getFlightsWithinDays(flights, 365)
    return countViolationsByLevel(flightsLastYear)
}

/**
 * Calculate Level 1 violations per landings ratio for the year
 */
export function getLevel1ViolationsPerLandingsRatioYear(flights: Flight[]) {
    const flightsLastYear = getFlightsWithinDays(flights, 365)
    const violations = countViolationsByLevel(flightsLastYear)
    const totalLandings = flightsLastYear.reduce((acc, flight) => acc + flight.landingCount, 0)
    
    if (totalLandings === 0) return 0
    return violations.level1 / totalLandings
}

/**
 * Check if user meets violation requirements for a specific grade
 */
export function meetsViolationRequirements(
    flights: Flight[],
    gradeConstraints: typeof gradeConstraintsData[0]
) {
    const violationsDay = getViolationsLastDay(flights)
    const violationsWeek = getViolationsLastWeek(flights)
    const violationsYear = getViolationsLastYear(flights)
    const level1Ratio = getLevel1ViolationsPerLandingsRatioYear(flights)
    
    const totalLevel2And3Year = violationsYear.level2 + violationsYear.level3
    
    // Check all violation constraints
    const checks = {
        level1Day: gradeConstraints.maxLvlOneViolationsDay === 0 || 
                   violationsDay.level1 <= gradeConstraints.maxLvlOneViolationsDay,
        
        level1Week: gradeConstraints.maxLvlOneViolationsWeek === 0 || 
                    violationsWeek.level1 <= gradeConstraints.maxLvlOneViolationsWeek,
        
        level1Ratio: gradeConstraints.maxLvlOneViolationsPerLandingsRatioYear === 0 || 
                     level1Ratio <= gradeConstraints.maxLvlOneViolationsPerLandingsRatioYear,
        
        level2Year: gradeConstraints.maxLvlTwoViolationsYear === 0 || 
                    violationsYear.level2 <= gradeConstraints.maxLvlTwoViolationsYear,
        
        level3Week: gradeConstraints.maxLvlThreeViolationsWeek === 0 || 
                    violationsWeek.level3 <= gradeConstraints.maxLvlThreeViolationsWeek,
        
        level3Year: gradeConstraints.maxLvlThreeViolationsYear === 0 || 
                    violationsYear.level3 <= gradeConstraints.maxLvlThreeViolationsYear,
        
        totalLevel2And3: gradeConstraints.maxTotalLvlTwoThreeViolationsYear === 0 || 
                        totalLevel2And3Year <= gradeConstraints.maxTotalLvlTwoThreeViolationsYear
    }
    
    // Return true only if ALL checks pass
    return Object.values(checks).every(check => check)
}

/**
 * Get detailed violation report for debugging/display
 */
export function getViolationReport(flights: Flight[]) {
    return {
        lastDay: getViolationsLastDay(flights),
        lastWeek: getViolationsLastWeek(flights),
        lastYear: getViolationsLastYear(flights),
        level1PerLandingsRatio: getLevel1ViolationsPerLandingsRatioYear(flights)
    }
}
  

export const gradeConstraintsData = [
    {
        grade: 1,
        minXp: 0,
        minFlightTime: 0, // Hours
        minLandingCount: 0,
        minFlightTimeNinetyDays: 0,
        minLandingCountNinetyDays: 0,
        maxLvlOneViolationsDay: 0,
        maxLvlOneViolationsWeek: 0,
        maxLvlOneViolationsPerLandingsRatioYear: 0, // Ratio
        maxLvlTwoViolationsYear: 0,
        maxLvlThreeViolationsWeek: 0,
        maxLvlThreeViolationsYear: 0,
        maxTotalLvlTwoThreeViolationsYear: 0
    },
    {
        grade: 2,
        minXp: 2000,
        minFlightTime: 300, // 5 Hours
        minLandingCount: 25,
        minFlightTimeNinetyDays: 0,
        minLandingCountNinetyDays: 0,
        maxLvlOneViolationsDay: 7,
        maxLvlOneViolationsWeek: 25,
        maxLvlOneViolationsPerLandingsRatioYear: 0.8, // Ratio
        maxLvlTwoViolationsYear: 10,
        maxLvlThreeViolationsWeek: 5,
        maxLvlThreeViolationsYear: 10,
        maxTotalLvlTwoThreeViolationsYear: 10
    },
    {
        grade: 3,
        minXp: 50000,
        minFlightTime: 3000, // 50 Hours
        minLandingCount: 100,
        minFlightTimeNinetyDays: 0,
        minLandingCountNinetyDays: 0,
        maxLvlOneViolationsDay: 5,
        maxLvlOneViolationsWeek: 5,
        maxLvlOneViolationsPerLandingsRatioYear: 0.5, // Ratio
        maxLvlTwoViolationsYear: 5,
        maxLvlThreeViolationsWeek: 0,
        maxLvlThreeViolationsYear: 5,
        maxTotalLvlTwoThreeViolationsYear: 5
    },
    {
        grade: 4,
        minXp: 80000,
        minFlightTime: 7200, // 120 Hours
        minLandingCount: 400,
        minFlightTimeNinetyDays: 1800, // 30 Hours
        minLandingCountNinetyDays: 100,
        maxLvlOneViolationsDay: 0,
        maxLvlOneViolationsWeek: 0,
        maxLvlOneViolationsPerLandingsRatioYear: 0.22, // Ratio
        maxLvlTwoViolationsYear: 4,
        maxLvlThreeViolationsWeek: 0,
        maxLvlThreeViolationsYear: 4,
        maxTotalLvlTwoThreeViolationsYear: 4
    },
    {
        grade: 5,
        minXp: 175000,
        minFlightTime: 30000, // 500 Hours
        minLandingCount: 800,
        minFlightTimeNinetyDays: 4200, // 70 Hours
        minLandingCountNinetyDays: 180,
        maxLvlOneViolationsDay: 0,
        maxLvlOneViolationsWeek: 0,
        maxLvlOneViolationsPerLandingsRatioYear: 0.05, // Ratio
        maxLvlTwoViolationsYear: 2,
        maxLvlThreeViolationsWeek: 0,
        maxLvlThreeViolationsYear: 2,
        maxTotalLvlTwoThreeViolationsYear: 2
    }
]