'use client'

import { useEffect, useRef, useState } from 'react'
import { Map } from 'maplibre-gl'
import { customUserImages } from '@/lib/data'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { RiCloseLine } from 'react-icons/ri'
import Link from 'next/link'
import { FaEye } from 'react-icons/fa'

type PopupInfo = {
    id: string | null
    x: number
    y: number
    username: string
    customImage: string | null
    displayName: string
    callsign: string | null
    altitude: number | null
    speed: number | null
    heading: number | null
}

export default function CommunityMap({
    flights,
    users
}: {
    flights: any[]
    users: any[]
}) {
    const mapRef = useRef<Map | null>(null)
    const [popupInfo, setPopupInfo] = useState<PopupInfo | null>(null)

    const iflyticsFlights = flights.filter((flight) =>
        users.some((user) => user.ifc_username === flight.username)
    )

    useEffect(() => {
        const map = new Map({
            container: 'map',
            style: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
            center: [0, 0],
            zoom: 2,
            renderWorldCopies: false,
        })
        mapRef.current = map

        map.on('load', () => {
            const iflyticsFlights = flights.filter((flight) =>
                users.some((user) => user.ifc_username === flight.username)
            )

            // Match each flight to a user and their custom image
            const flightsWithImages = iflyticsFlights.map((flight) => {
                const user = users.find((u) => u.ifc_username === flight.username)
                const customImage = user
                    ? customUserImages.find((c) => c.username === user.ifc_username)?.image
                    : null
                return { ...flight, imageId: `user-${flight.username}`, customImage }
            })

            // Load each user image onto a circular canvas, then register with the map
            const loadImage = (flight: any) =>
                new Promise<void>((resolve) => {
                    if (!flight.customImage) { resolve(); return }

                    const img = new Image()
                    img.crossOrigin = 'anonymous'
                    img.onload = () => {
                        const size = 48
                        const canvas = document.createElement('canvas')
                        canvas.width = canvas.height = size
                        const ctx = canvas.getContext('2d')
                        if (ctx) {
                            ctx.beginPath()
                            ctx.arc(size / 2, size / 2, size / 2, 0, 2 * Math.PI)
                            ctx.clip()
                            ctx.drawImage(img, 0, 0, size, size)
                            const imageData = ctx.getImageData(0, 0, size, size)
                            if (!map.hasImage(flight.imageId)) {
                                map.addImage(flight.imageId, imageData)
                            }
                        }
                        resolve()
                    }
                    img.onerror = () => resolve()
                    img.src = flight.customImage
                })

            Promise.all(flightsWithImages.map(loadImage)).then(() => {
                const geojson: GeoJSON.FeatureCollection = {
                    type: 'FeatureCollection',
                    features: flightsWithImages
                        .filter((f) => f.latitude != null && f.longitude != null)
                        .map((flight) => ({
                            type: 'Feature',
                            geometry: {
                                type: 'Point',
                                coordinates: [flight.longitude, flight.latitude],
                            },
                            properties: {
                                imageId: flight.customImage ? flight.imageId : '__none__',
                                username: flight.username,
                                callsign: flight.callsign,
                                heading: flight.heading ?? 0,
                                altitude: flight.altitude ?? null,
                                speed: flight.speed ?? null,
                            },
                        })),
                }

                map.addSource('community-flights', { type: 'geojson', data: geojson })

                // Layer for users with a custom profile image
                map.addLayer({
                    id: 'community-flights-images',
                    type: 'symbol',
                    source: 'community-flights',
                    filter: ['!=', ['get', 'imageId'], '__none__'],
                    layout: {
                        'icon-image': ['get', 'imageId'],
                        'icon-size': 0.6,
                        'icon-allow-overlap': true,
                        'icon-ignore-placement': true,
                    },
                })

                // Fallback circle layer for users without a custom image
                map.addLayer({
                    id: 'community-flights-fallback',
                    type: 'circle',
                    source: 'community-flights',
                    filter: ['==', ['get', 'imageId'], '__none__'],
                    paint: {
                        'circle-radius': 6,
                        'circle-color': '#3b82f6',
                        'circle-stroke-width': 2,
                        'circle-stroke-color': '#ffffff',
                    },
                })

                const showPopup = (e: any) => {
                    const feature = e.features?.[0]
                    if (!feature) return

                    const { username, callsign, heading, altitude, speed } = feature.properties
                    const user = users.find((u) => u.ifc_username === username)

                    setPopupInfo({
                        id: user?.ifc_user_id ?? null,
                        x: e.point.x,
                        y: e.point.y,
                        username,
                        customImage: user ? customUserImages.find((c) => c.username === user.ifc_username)?.image ?? null : "",
                        displayName: user?.display_name ?? username,
                        callsign: callsign ?? null,
                        altitude: altitude ?? null,
                        speed: speed ?? null,
                        heading: heading ?? null,
                    })
                }

                map.on('click', 'community-flights-images', showPopup)
                map.on('click', 'community-flights-fallback', showPopup)

                // Close popup when clicking empty map area
                map.on('click', (e) => {
                    const features = map.queryRenderedFeatures(e.point, {
                        layers: ['community-flights-images', 'community-flights-fallback'],
                    })
                    if (features.length === 0) setPopupInfo(null)
                })

                map.on('mouseenter', 'community-flights-images', () => { map.getCanvas().style.cursor = 'pointer' })
                map.on('mouseenter', 'community-flights-fallback', () => { map.getCanvas().style.cursor = 'pointer' })
                map.on('mouseleave', 'community-flights-images', () => { map.getCanvas().style.cursor = '' })
                map.on('mouseleave', 'community-flights-fallback', () => { map.getCanvas().style.cursor = '' })
            })
        })

        return () => map.remove()
    }, [flights, users])

    return (
        <div className='relative overflow-hidden w-full rounded-[20px]' style={{ height: 'calc(100vh - 10rem)' }}>
            <div id="map" style={{ width: '100%', height: '100%' }} />

            <div className="absolute top-3 left-3 z-10 bg-background/80 backdrop-blur-sm border rounded-lg px-3 py-2 text-sm pointer-events-none">
                <span className="text-muted-foreground font-medium">IFlytics users flying in ES:</span>
                <span className="ml-2 font-bold text-foreground">{iflyticsFlights.length}</span>
            </div>

            {popupInfo && (
                <Card
                    className="absolute z-10 w-64 py-4 shadow-lg pointer-events-auto"
                    style={{ left: popupInfo.x + 12, top: popupInfo.y - 12 }}
                >
                    <CardHeader className="pb-0">
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-3">
                                {popupInfo.customImage ? (
                                    <img
                                        src={popupInfo.customImage}
                                        alt={popupInfo.displayName}
                                        width={44}
                                        height={44}
                                        className="rounded-full object-cover shrink-0"
                                    />
                                ) : (
                                    <div className="w-11 h-11 rounded-full bg-muted flex items-center justify-center text-base font-semibold shrink-0">
                                        {popupInfo.displayName.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <div>
                                    <CardTitle className="text-sm">{popupInfo.displayName}</CardTitle>
                                    <CardDescription>@{popupInfo.username}</CardDescription>
                                </div>
                            </div>
                            <button
                                onClick={() => setPopupInfo(null)}
                                className="text-muted-foreground hover:text-foreground transition-colors mt-0.5 shrink-0"
                            >
                                <RiCloseLine size={18} />
                            </button>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-3 text-sm space-y-1">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Callsign</span>
                            <span className="font-medium">{popupInfo.callsign ?? '—'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Altitude</span>
                            <span className="font-medium">
                                {popupInfo.altitude != null ? `${Math.round(popupInfo.altitude).toLocaleString()} ft` : '—'}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Speed</span>
                            <span className="font-medium">
                                {popupInfo.speed != null ? `${Math.round(popupInfo.speed)} kts` : '—'}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Heading</span>
                            <span className="font-medium">
                                {popupInfo.heading != null ? `${Math.round(popupInfo.heading)}°` : '—'}
                            </span>
                        </div>

                        <Link href={`/dashboard/users/${popupInfo.id}`} className="text-primary text-white transition-colors flex font-bold justify-center items-center gap-1 hover:text-white bg-blue-500 hover:bg-blue-600 px-3 py-2 rounded-lg"><FaEye /> View Profile</Link>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}