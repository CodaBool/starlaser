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
  const [popup, setPopup] = useState()
  const [draw, setDraw] = useState()
  const params = useSearchParams()

  // When the map is clicked, query the drawn layers for a feature.
  // Adjust the layers array to match the ones from your draw control.
  const handleMapClick = (e) => {
    if (!draw.getSelected().features.length) return
    const f = draw.getSelected().features[0]
    if (draw.getMode() !== 'simple_select' && draw.getMode() !== 'direct_select') return
    const feature = draw.get(f.id) || f
    console.log("select", f)
    setPopup({ feature, position: { x: e.point.x, y: e.point.y } });
  };

  // Update the feature properties in state (and optionally update the drawn feature)
  // const saveFeatureProps = (id, properties) => {
  //   console.log("saving", id, properties)
  //   setFeatures(curr => {
  //     const feature = curr[id];
  //     if (feature) {
  //       const updated = { ...feature, properties };
  //       return { ...curr, [id]: updated };
  //     }
  //     return curr;
  //   })
  //   if (draw) {
  //     const feature = draw.get(id)
  //     if (feature) {
  //       const updatedFeature = { ...feature, properties }
  //       draw.delete([id]);
  //       draw.add(updatedFeature);
  //     }
  //   }
  // }

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
        onClick={handleMapClick}
      >
        <DrawControl setDraw={setDraw} draw={draw} name={name} params={params} />
        <MapComponent width={size.width} height={size.height} name={name} data={data} mobile={mobile} SCALE={SCALE} CENTER={CENTER} />
      </Map>
      {popup && (
        <Editor
          feature={popup.feature}
          // onSave={saveFeatureProps}
          onClose={() => setPopup(null)}
        />
      )}
      <div style={{ width: size.width, height: size.height, background: `radial-gradient(${BG})`, zIndex: -1, top: 0, position: "absolute" }}></div>
    </>
  )
}
