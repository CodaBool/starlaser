'use client'
import { useEffect, useState } from 'react'
import MapComponent from './map'
import { combineAndDownload, getConsts, isMobile } from '@/lib/utils'
import Map from 'react-map-gl/maplibre'
import Controls from './controls.jsx'
import Editor from './editor'
import { useSearchParams, useRouter } from 'next/navigation'
import { create } from 'zustand'
import { feature } from 'topojson-client'

export const useStore = create((set) => ({
  editorTable: null,
  setEditorTable: editorTable => set({ editorTable }),
}))

export default function Cartographer({ name, data, stargazer, rawTopojson, mapId }) {
  const { SCALE, CENTER, STYLE, VIEW, MAX_ZOOM, MIN_ZOOM, BOUNDS, BG } = getConsts(name)
  const [size, setSize] = useState()
  const mobile = isMobile()
  const [draw, setDraw] = useState()
  const params = useSearchParams()
  const router = useRouter()
  const mini = params.get("mini") === "1"
  let loading = false

  useEffect(() => {
    const handleResize = () => setSize({ width: window.innerWidth, height: window.innerHeight })
    window.addEventListener('resize', handleResize)
    setSize({ width: window.innerWidth, height: window.innerHeight })
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  if (rawTopojson) {
    if (typeof localStorage === 'undefined') {
      loading = true
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent text-indigo-900 rounded-full" />
        </div>
      )
    }
    const maps = JSON.parse(localStorage.getItem('maps'))
    if (maps) {
      const localGeojson = maps[name + "-" + mapId]
      if (localGeojson?.geojson) {
        localGeojson.geojson.features = localGeojson.geojson.features.map(feature => {
          feature.properties.userCreated = true;
          return feature;
        })
        const [rawGeojson, type] = combineAndDownload("topojson", rawTopojson, localGeojson.geojson)
        const combinedData = JSON.parse(rawGeojson)

        // TODO: the layer name here will be different for each map
        const layers = Object.keys(combinedData.objects)
        const newData = layers.reduce((acc, layer) => {
          acc[layer] = feature(combinedData, combinedData.objects[layer]).features
          return acc
        }, {})
        data = newData
      } else {
        setTimeout(() => router.replace(`/${name}`), 200)
        loading = true
      }
    } else {
      setTimeout(() => router.replace(`/${name}`), 200)
      loading = true
    }
  }

  // wait until I know how large the window is
  // this only takes miliseconds it seems, so its fine to wait
  if (!size) loading = true
  if (loading) {
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
        {(!mobile && !mini && !stargazer && !rawTopojson) && <Controls setDraw={setDraw} draw={draw} name={name} params={params} setSize={setSize} />}
        <MapComponent width={size.width} height={size.height} name={name} data={data} mobile={mobile} SCALE={SCALE} CENTER={CENTER} mini={mini} params={params} stargazer={stargazer} />
      </Map>
      {(!mini && !stargazer && !rawTopojson) && <Editor draw={draw} mapName={name} />}
      <div style={{ width: size.width, height: size.height, background: `radial-gradient(${BG})`, zIndex: -1, top: 0, position: "absolute" }}></div>
    </>
  )
}
