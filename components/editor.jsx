import { useEffect, useState } from "react"
import { Button } from './ui/button'
import { useMap } from "react-map-gl/maplibre";
import LocationForm from "./forms/LocationForm";
import randomName from "@scaleway/random-name";

export default function FeaturePopup({ draw, mapName, mapId }) {
  const { map } = useMap()
  const [popup, setPopup] = useState()

  function handleClick(e) {
    // console.log("pre select", draw.getSelected())
    if (!draw.getSelected().features.length) return
    const f = draw.getSelected().features[0]
    if (draw.getMode() !== 'simple_select' && draw.getMode() !== 'direct_select') return
    const feature = draw.get(f.id) || f
    // console.log("selected", feature)
    setPopup(feature)
  }

  useEffect(() => {
    if (!map || !draw) return
    // map.on('touchstart', handleClick)
    map.on('click', handleClick)
    return () => {
      map.off('click', handleClick)
      // map.off('touchstart', handleClick)
    }
  }, [map, draw])

  useEffect(() => {
    if (!popup || !draw) return
    // duplicate of controls save function
    const urlParams = new URLSearchParams(window.location.search);
    const mapId = mapName + "-" + urlParams.get('id')
    const geojson = draw.getAll()
    if (!geojson.features.length) return
    const prev = JSON.parse(localStorage.getItem('maps')) || {}
    localStorage.setItem('maps', JSON.stringify({
      ...prev, [mapId]: {
        geojson,
        name: prev[mapId]?.name || randomName(),
        updated: Date.now(),
        map: mapName,
      }
    }))
  }, [popup, draw])

  return (
    <div
      style={{
        position: 'absolute',
        left: '20px',
        bottom: '20px',
        background: 'black',
        padding: '8px',
        zIndex: 10,
      }}
      className="border"
    >
      {popup && <LocationForm feature={popup} mapName={mapName} draw={draw} setPopup={setPopup} />}
    </div>
  );
}
