'use client'
import { useEffect, useState } from 'react'
import MapComponent from './map'
import { getConsts, isMobile } from '@/lib/utils'
import Map from 'react-map-gl/maplibre'
import Controls from './controls.jsx'
import Editor from './editor'
import { useSearchParams } from 'next/navigation'
import { create } from 'zustand'

export const useStore = create((set) => ({
  editorTable: null,
  setEditorTable: editorTable => set({ editorTable }),
}))

export default function Cartographer({ name, data, stargazer }) {
  const { SCALE, CENTER, STYLE, VIEW, MAX_ZOOM, MIN_ZOOM, BOUNDS, BG } = getConsts(name)
  const [size, setSize] = useState()
  const mobile = isMobile()
  const [draw, setDraw] = useState()
  const params = useSearchParams()
  const mini = params.get("mini") === "1"

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
        scrollZoom={!mini}
        dragPan={!mini}
        doubleClickZoom={!mini}
        attributionControl={false}
        initialViewState={VIEW}
        maxZoom={MAX_ZOOM}
        minZoom={MIN_ZOOM}
        style={{ width: size.width, height: size.height }}
        mapStyle={STYLE}
      >
        {(!mobile && !mini && !stargazer) && <Controls setDraw={setDraw} draw={draw} name={name} params={params} setSize={setSize} />}
        <MapComponent width={size.width} height={size.height} name={name} data={data} mobile={mobile} SCALE={SCALE} CENTER={CENTER} mini={mini} params={params} stargazer={stargazer} />
      </Map>
      {(!mini && !stargazer) && <Editor draw={draw} mapName={name} />}
      <div style={{ width: size.width, height: size.height, background: `radial-gradient(${BG})`, zIndex: -1, top: 0, position: "absolute" }}></div>
    </>
  )
}
