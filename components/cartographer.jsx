'use client'
import { useEffect, useState } from 'react'
import MapComponent from './map'
import { getConsts, isMobile } from '@/lib/utils'
import SearchBar from './searchbar'
import Map from 'react-map-gl/maplibre'
import mapStyle from '@/lib/style.json'

export default function Cartographer({ name, data }) {
  const { SCALE, CENTER } = getConsts(name)
  const [size, setSize] = useState()
  const mobile = isMobile()

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
      <SearchBar map={name} data={data} width={size.width} height={size.height} mobile={mobile} />
      <Map
        id="map"
        initialViewState={{
          longitude: -100,
          latitude: 40,
          zoom: 3.5
        }}
        style={{ width: size.width, height: size.height }}
        mapStyle={mapStyle}
      >
        <MapComponent width={size.width} height={size.height} name={name} data={data} mobile={mobile} SCALE={SCALE} CENTER={CENTER} />
      </Map>
    </>
  )
}
