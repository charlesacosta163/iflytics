import React from 'react'
import { LiveryAnalysisPanel } from '../livery-analysis-panel'

type LiveryCatalogEntry = {
  id: string
  aircraftID: string
  aircraftName: string
  liveryName: string
}

const FlightsLivery = async ({
  flights,
  liveries: liveryCatalog,
}: {
  flights: { liveryId?: string }[]
  user: unknown
  liveries: LiveryCatalogEntry[]
  role?: string
}) => {
  const liveryById = new Map(
    liveryCatalog.map((livery) => [livery.id, livery])
  )

  const liveryCounts = flights.reduce<Record<string, number>>((acc, flight) => {
    const id = flight.liveryId
    if (!id) return acc
    acc[id] = (acc[id] ?? 0) + 1
    return acc
  }, {})

  const liveries = Object.entries(liveryCounts)
    .map(([liveryId, count]) => {
      const match = liveryById.get(liveryId)
      if (!match?.aircraftID) return null

      return {
        aircraftId: match.aircraftID,
        liveryId,
        aircraftName: match.aircraftName,
        liveryName: match.liveryName,
        count,
      }
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null)
    .sort((a, b) => b.count - a.count)

  return <LiveryAnalysisPanel liveries={liveries} />
}

export default FlightsLivery
