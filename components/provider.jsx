'use client'

import { SessionProvider } from 'next-auth/react'
import { MapProvider } from 'react-map-gl/maplibre'

export default function Provider({ children }) {
  return (

    <SessionProvider>
      <MapProvider>
        {children}
      </MapProvider>
    </SessionProvider>
  )
}
