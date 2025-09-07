import React from "react";
import { Badge } from "./ui/badge";
import { formatDate } from "@/lib/utils";
import { LuTowerControl } from "react-icons/lu";
import {
  Accordion,
  AccordionItem,
  AccordionContent,
  AccordionTrigger
} from "@/components/ui/accordion";
import { getAirportLocally } from "@/lib/sync-actions";

// ---- Helpers ----
function formatHM(min: number) {
  const h = Math.floor((min ?? 0) / 60);
  const m = Math.round((min ?? 0) % 60);
  return `${h}h ${m}m`;
}
function round(n: number, d = 0) {
  const p = 10 ** d;
  return Math.round(((n ?? 0) as number) * p) / p;
}
function sessionAvgRateHr(bucketOps: number, sessionMin: number) {
  return (bucketOps / Math.max(sessionMin || 0.0001, 0.0001)) * 60;
}

// Accept either `session` prop OR a direct aggregated object
type UserATCSessionCardProps = { session?: any } & Record<string, any>;

const UserATCSessionCard: React.FC<UserATCSessionCardProps> = (props) => {
  // If props itself looks like the session, use it; else use props.session
  const s =
    (props as any)?.traffic
      ? (props as any)
      : (props as any)?.session;

  // Hard guard: no data yet or not aggregated
  if (!s || !s.traffic) {
    return (
      <div className="p-8 bg-white rounded-xl border">
        <p className="text-gray-500">No session data.</p>
      </div>
    );
  }

  const local = s.traffic.surface ?? {};
  const radar   = s.traffic.radar ?? {};
  const overall = s.traffic.overall ?? {};

  const overallBadge = overall.bucket === "radar" ? "Radar" : "Surface";
  const overallLevel = overall.level ?? "Light";

  const opsTotal = s.opsTotal ?? ((local.ops ?? 0) + (radar.ops ?? 0));
  const opsPerHr = (opsTotal / Math.max(s.durationMin || 0.0001, 0.0001)) * 60;

  const surfaceSessionAvg = sessionAvgRateHr(local.ops ?? 0, s.durationMin ?? 0);
  const radarSessionAvg   = sessionAvgRateHr(radar.ops ?? 0, s.durationMin ?? 0);

  const byFreq: any[] = Array.isArray(s.byFrequency) ? s.byFrequency : [];
  const surfaceRows = byFreq.filter((r) =>
    ["Ground", "Tower", "Clearance"].includes(r?.type)
  );
  const radarRows = byFreq.filter((r) =>
    ["Approach", "Departure", "Center"].includes(r?.type)
  );

  const airport = getAirportLocally(s.airportIcao) || "Unknown"

  return (
    <div className="flex flex-col">
      <section className="flex flex-col gap-4 p-6 sm:p-8 rounded-t-xl 
                    bg-white dark:bg-gray-900 dark:text-light">
  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
    {/* Left Side of Header */}
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter 
                       text-gray-900 dark:text-light">
          {s.airportIcao || "N/A"}
        </h2>
        <Badge
          className={`text-sm sm:text-base md:text-lg rounded-full px-3 sm:px-4
                     ${local?.ops > 0 && radar?.ops > 0
                        ? "bg-gradient-to-r from-indigo-500 to-emerald-500 text-white"
                        : local?.ops > 0
                          ? "bg-emerald-500 text-white"
                          : radar?.ops > 0
                            ? "bg-indigo-500 text-white"
                            : "bg-gray-300 text-gray-700 dark:bg-gray-700 dark:text-gray-300"}`}
        >
          {local?.ops > 0 && radar?.ops > 0
            ? "Radar + Local"
            : local?.ops > 0
              ? "Local"
              : radar?.ops > 0
                ? "Radar"
                : "No Ops"}
        </Badge>
      </div>

      <div className="flex gap-2 items-center text-xs sm:text-sm text-gray-500 font-medium">
        <span>
          {formatDate(s.start)} — {s.server || "Server"}
        </span>
      </div>
    </div>

    {/* Right Side of Header — Key Stats */}
    <div className="flex flex-wrap gap-4 sm:gap-6 items-center">
      <div className="flex flex-col items-center gap-1">
        <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-emerald-600 dark:text-emerald-400">
          {opsTotal}
        </span>
        <span className="font-medium text-xs sm:text-sm text-gray-500">Total Ops</span>
      </div>

      <div className="flex flex-col items-center gap-1">
        <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-600 dark:text-blue-400">
          {formatHM(s.durationMin ?? 0)}
        </span>
        <span className="font-medium text-xs sm:text-sm text-gray-500">Session Time</span>
      </div>

      <div className="flex flex-col items-center gap-1">
        <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-purple-600 dark:text-purple-400">
          {round(opsPerHr)}
        </span>
        <span className="font-medium text-xs sm:text-sm text-gray-500">Ops / hr</span>
      </div>
    </div>
  </div>

  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 font-medium mt-2">
    <div className="flex flex-wrap gap-3">
      <span className="flex gap-2 items-center text-xs sm:text-sm text-gray-400">
        <LuTowerControl /> {airport.name || "Unknown Airport"}
      </span>

      {s.violationsTotal > 0 && (
        <span className="flex gap-2 items-center text-xs sm:text-sm text-red-500">
          <span className="w-2 h-2 rounded-full bg-red-500" />
          {s.violationsTotal ?? 0} Violations Issued
        </span>
      )}
    </div>

    <Badge
      className={`rounded-full text-xs sm:text-sm md:text-base px-3 sm:px-4
                 ${opsTotal === 0
                    ? "bg-gray-300 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                    : overallLevel === "Light"
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-800 dark:text-emerald-200"
                      : overallLevel === "Medium"
                        ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-700 dark:text-yellow-200"
                        : "bg-red-100 text-red-700 dark:bg-red-700 dark:text-red-200"}`}
    >
      {opsTotal === 0 ? "No" : overallLevel} Traffic
    </Badge>
  </div>
</section>


      <Accordion
        type="single"
        collapsible
        className="w-full bg-gray-100 dark:bg-gray-900 rounded-b-xl px-8"
        defaultValue="item-1"
      >
        <AccordionItem value="item-1">
          <AccordionTrigger className="text-lg">Session Info</AccordionTrigger>
          <AccordionContent className="flex flex-col gap-6">

  {/* Local Summary */}
  <div className="w-full rounded-lg p-4 border 
                  bg-emerald-50 border-emerald-200 
                  dark:bg-emerald-950 dark:border-emerald-800">
    <h3 className="font-bold mb-2 text-xl tracking-tight 
                   text-emerald-700 dark:text-emerald-300">
      Local Control Summary
    </h3>

    {(local?.ops ?? 0) > 0 ? (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div>
          <div className="text-gray-500 dark:text-gray-400">Level</div>
          <div className="font-medium">{local.level ?? "Light"}</div>
        </div>
        <div>
          <div className="text-gray-500 dark:text-gray-400">Ops (GND/TWR/CLR)</div>
          <div className="font-medium">{local.ops ?? 0}</div>
        </div>
        <div>
          <div className="text-gray-500 dark:text-gray-400">Peak Rate</div>
          <div className="font-medium">{round(local.peakRateHr)} / hr</div>
        </div>
        <div>
          <div className="text-gray-500 dark:text-gray-400">Avg (session window)</div>
          <div className="font-medium">{round(surfaceSessionAvg)} / hr</div>
        </div>
      </div>
    ) : (
      <div className="text-sm text-gray-500 dark:text-gray-400">No Local activity.</div>
    )}

    {/* Local breakdown */}
    {local?.ops > 0 && surfaceRows.length > 0 && (
      <div className="mt-4">
        <div className="text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-2">
          Frequency Breakdown
        </div>
        <ul className="text-sm grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {surfaceRows.map((r, i) => (
            <li
              key={i}
              className="flex justify-between rounded-md border p-2 
                         bg-emerald-500 text-white 
                         dark:bg-emerald-600 dark:border-emerald-700"
            >
              <span className="font-medium">{r?.type ?? "Unknown"}</span>
              <span>
                {(r?.ops ?? 0)} ops • {round(r?.rateHr)} / hr
              </span>
            </li>
          ))}
        </ul>
      </div>
    )}
  </div>

  {/* Radar Summary */}
  <div className="w-full rounded-lg p-4 border 
                  bg-indigo-50 border-indigo-200 
                  dark:bg-indigo-950 dark:border-indigo-800">
    <h3 className="font-bold mb-2 text-xl tracking-tight 
                   text-indigo-700 dark:text-indigo-300">
      Radar Control Summary
    </h3>

    {(radar?.ops ?? 0) > 0 ? (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div>
          <div className="text-gray-500 dark:text-gray-400">Level</div>
          <div className="font-medium">{radar.level ?? "Light"}</div>
        </div>
        <div>
          <div className="text-gray-500 dark:text-gray-400">Ops (APP/DEP/CTR)</div>
          <div className="font-medium">{radar.ops ?? 0}</div>
        </div>
        <div>
          <div className="text-gray-500 dark:text-gray-400">Peak Rate</div>
          <div className="font-medium">{round(radar.peakRateHr)} / hr</div>
        </div>
        <div>
          <div className="text-gray-500 dark:text-gray-400">Avg (session window)</div>
          <div className="font-medium">{round(radarSessionAvg)} / hr</div>
        </div>
      </div>
    ) : (
      <div className="text-sm text-gray-500 dark:text-gray-400">No Radar activity.</div>
    )}

    {/* Radar breakdown */}
    {radar?.ops > 0 && radarRows.length > 0 && (
      <div className="mt-4">
        <div className="text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-2">
          Frequency Breakdown
        </div>
        <ul className="text-sm grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {radarRows.map((r, i) => (
            <li
              key={i}
              className="flex justify-between rounded-md border p-2 
                         bg-indigo-500 text-white 
                         dark:bg-indigo-600 dark:border-indigo-700"
            >
              <span className="font-medium">{r?.type ?? "Unknown"}</span>
              <span>
                {(r?.ops ?? 0)} ops • {round(r?.rateHr)} / hr
              </span>
            </li>
          ))}
        </ul>
      </div>
    )}
  </div>

</AccordionContent>

        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default UserATCSessionCard;
