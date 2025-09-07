// --- Frequency helpers ---
export const SURFACE_TYPES: Set<number> = new Set([0, 1, 3]); // Ground, Tower, Clearance
export const RADAR_TYPES: Set<number>   = new Set([4, 5, 6]); // Approach, Departure, Center
export const IGNORE_TYPES: Set<number>  = new Set([7, 2, 8, 9, 10, 11]); // ATIS, Unicom, etc.

export function getFacilityType(n: number): any {
  switch (n) {
    case 0: return "Ground";
    case 1: return "Tower";
    case 2: return "Unicom";
    case 3: return "Clearance";
    case 4: return "Approach";
    case 5: return "Departure";
    case 6: return "Center";
    case 7: return "ATIS";
    case 8: return "Aircraft";
    case 9: return "Recorded";
    case 10: return "Unknown";
    case 11: return "Unused";
    default: return "Unknown";
  }
}

export const RATE_THRESHOLDS: any = {
  surface: { medium: 50, heavy: 100 }, // <50 light, 50–100 medium, ≥100 heavy
  radar:   { medium: 150, heavy: 350 } // <150 light, 150–350 medium, ≥350 heavy
};

// Classify with short-session guard: scale thresholds by duration for small windows
export function classifyBucket(rateHr: number, ops: number, durationMin: number, bucket: any): any {
  const { medium, heavy } = RATE_THRESHOLDS[bucket];
  if (durationMin < 15) {
    const scale = durationMin / 60;     // fraction of an hour
    const medOps = medium * scale;      // time-scaled ops cutoffs
    const hevOps = heavy * scale;
    if (ops >= hevOps) return "Heavy";
    if (ops >= medOps) return "Medium";
    return "Light";
  }
  if (rateHr >= heavy) return "Heavy";
  if (rateHr >= medium) return "Medium";
  return "Light";
}

// Utility
const rank: any = { Light: 1, Medium: 2, Heavy: 3 };

// --- Aggregation by atcSessionGroupId with per-bucket traffic ---
export function aggregateAtcSessionsWithBuckets(rows: any[]): any[] {
  const groups = new Map<string, any[]>();
  for (const r of rows) {
    const key = r.atcSessionGroupId ?? r.id;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(r);
  }

  const out: any[] = [];

  for (const [groupId, list] of groups.entries()) {
    // chronological for start/end
    list.sort((a: any, b: any) => new Date(a.created).getTime() - new Date(b.created).getTime());
    const startISO = list[0]?.created || new Date(0).toISOString();
    const endISO   = list.reduce(
      (acc: string, r: any) => (new Date(r.updated) > new Date(acc) ? r.updated : acc),
      startISO
    );
    const sessionDurationMin =
      Math.max(0, (new Date(endISO).getTime() - new Date(startISO).getTime()) / 60000);

    // airport + coords (pick most common ICAO if present)
    const icaos = list.map((r: any) => r.facility?.airportIcao).filter(Boolean);
    let airportIcao: any = null;
    if (icaos.length) {
      const count: any = {};
      for (const i of icaos) count[i] = (count[i] || 0) + 1;
      airportIcao = Object.keys(count).sort((a, b) => count[a] - count[b]).pop();
    }
    const coordRow = airportIcao
      ? list.find((r: any) => r.facility?.airportIcao === airportIcao)
      : list[0];
    const lat = coordRow?.facility?.latitude ?? null;
    const lon = coordRow?.facility?.longitude ?? null;

    // By-frequency detail
    const byFrequency = list.map((r: any) => ({
      type: getFacilityType(r.facility?.frequencyType),
      typeCode: r.facility?.frequencyType,
      ops: r.operations || 0,
      durationMin: r.totalTime || 0,
      rateHr: ((r.operations || 0) / Math.max(r.totalTime || 0.0001, 0.0001)) * 60
    }));

    // Bucket builder: use ONLY surface/radar rows; ignore ATIS/Unicom/etc.
    function buildBucket(selectFn: any, tag: any): any {
      const rows = byFrequency.filter((fr: any) => selectFn(fr.typeCode));
      if (rows.length === 0) {
        return {
          bucket: tag, ops: 0, timeMin: 0, avgRateHr: 0, peakRateHr: 0,
          peakOps: 0, peakTimeMin: 0, level: "Light"
        };
      }
      const ops = rows.reduce((s: number, r: any) => s + r.ops, 0);
      const timeMin = rows.reduce((s: number, r: any) => s + r.durationMin, 0); // may over-sum if parallel
      const avgRateHr = (ops / Math.max(timeMin || 0.0001, 0.0001)) * 60;
      const peak = rows.reduce((best: any, r: any) => (r.rateHr > best.rateHr ? r : best), rows[0]);
      const level = classifyBucket(peak.rateHr, peak.ops, peak.durationMin, tag);
      return {
        bucket: tag,
        ops, timeMin,
        avgRateHr: Number.isFinite(avgRateHr) ? avgRateHr : 0,
        peakRateHr: peak.rateHr,
        peakOps: peak.ops,
        peakTimeMin: peak.durationMin,
        level
      };
    }

    const surface = buildBucket((code: number) => SURFACE_TYPES.has(code), "surface");
    const radar   = buildBucket((code: number) => RADAR_TYPES.has(code),   "radar");

    // Overall: pick the heavier of the two buckets (ties prefer radar)
    let overall: any = surface;
    if (rank[radar.level] > rank[surface.level] ||
        (rank[radar.level] === rank[surface.level] && radar.peakRateHr > surface.peakRateHr)) {
      overall = radar;
    }

    out.push({
      groupId,
      airportIcao, lat, lon,
      server: list[0]?.server || "Unknown",
      start: startISO,
      end: endISO,
      durationMin: sessionDurationMin,
      opsTotal: list.reduce((s: number, r: any) => s + (r.operations || 0), 0),
      violationsTotal: list.reduce((s: number, r: any) => s + (r.violationsIssued || 0), 0),
      traffic: {
        overall: {
          bucket: overall.bucket,
          level: overall.level,
          rateHr: overall.peakRateHr,
          windowMin: overall.peakTimeMin
        },
        surface,
        radar
      },
      byFrequency
    });
  }

  return out.sort((a: any, b: any) => new Date(b.end).getTime() - new Date(a.end).getTime());
}

/* Usage:
import { aggregateAtcSessionsWithBuckets } from "./atc-aggregate";

const sessions: any[] = aggregateAtcSessionsWithBuckets(rowsFromApi);
console.log(sessions[0].traffic.overall);
*/
