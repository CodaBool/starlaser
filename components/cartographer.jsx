'use client'
import { useEffect, useState } from 'react'
import MapComponent from './map'
import { getConsts, isMobile } from '@/lib/utils'
import Map from 'react-map-gl/maplibre'
import DrawControl from './controls.jsx'
import Editor from './editor'
import { useSearchParams } from 'next/navigation'

export default function Cartographer({ name, data }) {
  const { SCALE, CENTER, STYLE, VIEW, MAX_ZOOM, MIN_ZOOM, BOUNDS, BG } = getConsts(name)
  const [size, setSize] = useState()
  const mobile = isMobile()
  const [draw, setDraw] = useState()
  const params = useSearchParams()

  useEffect(() => {
    const handleResize = () => setSize({ width: window.innerWidth, height: window.innerHeight })
    window.addEventListener('resize', handleResize)
    setSize({ width: window.innerWidth, height: window.innerHeight })
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // wait until I know how large the window is
  // this only takes miliseconds it seems, so its fine to wait
  if (!size) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent text-indigo-900 rounded-full" />
      </div>
    )
  }

  return (
    <>
      <Map
        id="map"
        dragRotate={false}
        attributionControl={false}
        initialViewState={VIEW}
        maxZoom={MAX_ZOOM}
        minZoom={MIN_ZOOM}
        style={{ width: size.width, height: size.height }}
        mapStyle={STYLE}
      // onClick={handleMapClick}
      >
        {!mobile && <DrawControl setDraw={setDraw} draw={draw} name={name} params={params} />}
        <MapComponent width={size.width} height={size.height} name={name} data={data} mobile={mobile} SCALE={SCALE} CENTER={CENTER} />
      </Map>
      <Editor draw={draw} mapName={name} />
      <div style={{ width: size.width, height: size.height, background: `radial-gradient(${BG})`, zIndex: -1, top: 0, position: "absolute" }}></div>
    </>
  )
}
