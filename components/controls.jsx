// import MapboxDraw from '@mapbox/mapbox-gl-draw';
import { useControl } from 'react-map-gl/maplibre'
import MapboxDraw from "@hyvilo/maplibre-gl-draw"
import { useCallback, useEffect, useState } from 'react'
import randomName from '@scaleway/random-name'
import { useRouter } from 'next/navigation'

export default function DrawControl({ name, setDraw, draw, params }) {
  const [saveTrigger, setSaveTrigger] = useState()
  const [mapId, setMapId] = useState()
  const router = useRouter()

  useEffect(() => {
    if (!draw || !mapId) return
    const geojson = draw.getAll()
    if (!geojson.features.length) return
    console.log("saving", mapId)
    const prev = JSON.parse(localStorage.getItem('maps')) || {}
    console.log("prev", prev, "new", { ...prev, [mapId]: {} })
    localStorage.setItem('maps', JSON.stringify({
      ...prev, [mapId]: {
        geojson,
        name: prev[mapId]?.name || randomName(),
        updated: Date.now(),
        map: name,
      }
    }))
  }, [saveTrigger, mapId])

  useEffect(() => {
    if (!mapId) return
    console.log("map id change", mapId)
  }, [mapId])

  useEffect(() => {
    if (!draw) return
    const savedMaps = JSON.parse(localStorage.getItem('maps')) || {}
    const mapsWithData = Object.keys(savedMaps).filter(id => id.split('-')[0] === name)

    // if no data exists set an id and save
    if (!mapsWithData.length || params.get("new")) {
      console.log("no data exists, or given create param")
      const id = Date.now()
      setMapId(`${name}-${id}`)

      const url = new URL(window.location).toString().split("?")[0] + "?id=" + id
      console.log("replaced URL to", url)
      window.history.replaceState(null, '', url)

      setSaveTrigger(p => !p)
      return
    }

    // if id is set save
    if (mapId) {
      console.log("mapId already exists", mapId, "save")
      setSaveTrigger(p => !p)
      return
    }

    console.log(mapsWithData.length, "map found")

    // if data exists ask to restore and save id
    // const matchingMapsCount = mapsWithData.length;
    // console.log(`Number of saved maps that match the name "${name}":`, matchingMapsCount);

    if (params.get("id")) {
      // TODO: toast system, show a message "restored local map"
      console.log("chose map from URL param")
      const mId = `${name}-${params.get("id")}`
      const geojson = savedMaps[mId]?.geojson
      if (geojson) {
        setMapId(mId)
        draw.add(savedMaps[mId].geojson || {})
        return
      } else {
        // TODO: give toast message "map not found locally"
        console.log("could not find map using id", mId)

      }
    }

    for (const [key, data] of Object.entries(savedMaps)) {
      // console.log("storage", data)
      const mapName = key.split('-')[0]
      if (mapName !== name) continue
      let daysAgo = Math.floor((Date.now() - parseInt(key.split('-')[1])) / (1000 * 60 * 60 * 24))
      if (daysAgo === 0) {
        daysAgo = "today"
      } else if (daysAgo === 1) {
        daysAgo = "yesterday"
      } else {
        daysAgo = daysAgo + " days ago"
      }
      console.log("found", mapsWithData.length, "previous maps for", mapName, "from", daysAgo)
      // TODO: need a way to have multiple stored maps for the same map
      const restore = window.confirm(`${mapsWithData.length === 1 ? "A previous session was found" : mapsWithData.length + " previous sessions found, one"} from ${daysAgo}. Would you like to ${mapsWithData.length === 1 ? "restore this session" : "choose a session to restore"}?`)
      if (restore) {
        if (mapsWithData.length === 1) {
          console.log("restore session, only one found", key)
          setMapId(key)
          draw.add(data)
          return
        } else {
          console.log(`need to redirect to /${name}/export page since there are multiple`, key)
          router.push(`/${name}/export`)
          return
        }
      } else {
        // TODO: toast system, show a message "fresh map started"
        console.log("start a new session")

        // duplicate of ?new=1 conditional
        const id = Date.now()
        setMapId(`${name}-${id}`)
        const url = new URL(window.location).toString().split("?")[0] + "?id=" + id
        console.log("replaced URL to", url)
        window.history.replaceState(null, '', url)

        setSaveTrigger(p => !p)
        return
      }
    }
  }, [draw]);

  function s() {
    setSaveTrigger(p => !p)
  }

  const d = useControl(
    () => new MapboxDraw({
      controls: {
        combine_features: false,
        uncombine_features: false,
      }
    }),
    ({ map }) => {
      map.on('draw.create', s);
      map.on('draw.update', s);
      map.on('draw.delete', s);
    },
    ({ map }) => {
      map.off('draw.create', s);
      map.off('draw.update', s);
      map.off('draw.delete', s);
    },
    {
      position: "top-right"
    }
  )
  useEffect(() => setDraw(d), [])
  return null;
}
