'use client'
import Link from "next/link"
import { useEffect, useState } from "react"
import { Eye, Trash2, ArrowRightFromLine, Pencil, Save, Cloud, CloudDownload } from 'lucide-react'
import { Input } from "./ui/input"
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { combineAndDownload } from "@/lib/utils"
import { toast } from "sonner"

export default function ClientMaps({ map, revalidate }) {
  const [maps, setMaps] = useState({})
  const [nameInput, setNameInput] = useState()
  const [showNameInput, setShowNameInput] = useState()

  useEffect(() => {
    setMaps(JSON.parse(localStorage.getItem('maps')))
  }, [])

  function deleteMap(key) {
    if (window.confirm('Are you sure you want to delete this map?')) {
      const updatedMaps = { ...maps }
      delete updatedMaps[key]
      localStorage.setItem('maps', JSON.stringify(updatedMaps))
      setMaps(updatedMaps)
    }
  }

  function uploadMap(key, name) {
    const body = JSON.stringify(maps[key])
    fetch('/api/map', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body,
    })
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          toast.warning(data.error)
        } else {
          toast.success(`${data.map} map, ${data.name}, successfully uploaded`)
          revalidate(`/app/${map}/export`)
        }
      })
      .catch(err => {
        console.log(err)
        toast.warning("A server error occurred")
      });
  }

  function editName(key, name) {
    setNameInput(name)
    setShowNameInput(key)
    setTimeout(() => {
      document.getElementById(`local-map-${key}`)?.focus()
    }, 200)
  }

  function saveName(key) {
    const updatedMaps = { ...maps, [key]: { ...maps[key], name: nameInput } }
    localStorage.setItem('maps', JSON.stringify(updatedMaps))
    setMaps(updatedMaps)
    setShowNameInput(false)
    setNameInput(null)
  }

  async function download(type, key) {
    try {
      const response = await fetch(`/api/download/${map}`)
      const data = await response.json()
      const localGeojson = maps[key].geojson
      const [finalData, fileType] = combineAndDownload(type, data, localGeojson)

      // Create and trigger file download
      const blob = new Blob([finalData], { type: fileType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${map}.${type}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading map:", error);
    }
  }

  if (!Object.entries(maps || {}).length) return (
    <p>You have no maps saved locally. <Link href={`/${map}?new=1`} className="text-blue-300">Create a new map</Link></p>
  )

  return (
    <div className="flex items-center my-2">
      {Object.entries(maps || {}).map(([key, data]) => {
        const [name, dateId] = key.split('-')
        return (
          <div key={key} className="bg-gray-800 p-4 m-2 rounded-lg shadow-lg w-full md:w-[440px]">
            {showNameInput === key
              ? <>
                <Input value={nameInput} className="w-[80%] mb-4 inline" id={`local-map-${key}`}
                  onChange={(e) => setNameInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') saveName(key)
                  }}
                />
                <Save onClick={() => saveName(key)} size={22} className="cursor-pointer inline ml-4" />
              </>
              : <h2 className="text-2xl font-bold mb-4">{data.name} <Pencil onClick={() => editName(key, data.name)} size={16} className="cursor-pointer inline ml-4" /></h2>
            }
            <p className="text-gray-400 ">Created: {new Date(parseInt(dateId)).toLocaleDateString("en-US", {
              hour: "numeric",
              minute: "numeric",
              month: "long",
              day: "numeric",
            })}</p>
            <p className="text-gray-400 ">Last Updated: {new Date(data.updated).toLocaleDateString("en-US", {
              hour: "numeric",
              minute: "numeric",
              month: "long",
              day: "numeric",
            })}</p>
            <p className="text-gray-400 ">Locations: {data.geojson?.features.filter(f => f.geometry.type === "Point").length}</p>
            <p className="text-gray-400 ">Territories: {data.geojson?.features.filter(f => f.geometry.type.includes("Poly")).length}</p>
            <p className="text-gray-400">Guides: {data.geojson?.features.filter(f => f.geometry.type === "LineString").length}</p>
            <div className="flex justify-between items-center mt-4">
              <Link href={`/${name}?id=${dateId}`} className="text-blue-300"><Button size="sm" className="cursor-pointer rounded" variant="outline"><Eye /> View</Button></Link>
              <div className="flex space-x-2">
                <Button size="sm" className="text-red-500 cursor-pointer rounded" variant="destructive" onClick={() => deleteMap(key)}><Trash2 /> Delete</Button>
                <Button size="sm" className="cursor-pointer rounded" onClick={() => uploadMap(key, data.name)}><Cloud /> Upload</Button>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button size="sm" className="cursor-pointer rounded"><ArrowRightFromLine /> Export</Button>
                  </PopoverTrigger>
                  <PopoverContent className="flex flex-col text-sm">
                    <p className='mb-3 text-gray-200'>This is your map data combined with the core map data</p>
                    <hr className='border my-2 border-gray-500' />
                    <p className='my-2 text-gray-300'>Topojson is a newer version of Geojson, and the recommended format for Stargazer</p>
                    <Button className="cursor-pointer w-full" variant="secondary" onClick={() => download("topojson", key)}>
                      <ArrowRightFromLine className="ml-[.6em] inline" /> Topojson
                    </Button>
                    <p className='my-2 text-gray-300'>Geojson is an extremely common spec for geography data</p>
                    <Button className="cursor-pointer w-full my-2" variant="secondary" onClick={() => download("geojson", key)}>
                      <ArrowRightFromLine className="ml-[.6em] inline" /> <span className="ml-[5px]">Geojson</span>
                    </Button>
                    <p className='my-2 text-gray-300'>KML can be imported into a <a href="https://www.google.com/maps/d/u/0/?hl=en" className='text-blue-300' target="_blank">Google Maps</a> layer. Which can be easily distributed publicly for free.</p>
                    <Button className="cursor-pointer w-full" variant="secondary" onClick={() => download("kml", key)}>
                      <ArrowRightFromLine className="ml-[.6em] inline" /> <span className="ml-[5px]">KML</span>
                    </Button>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  )
}


export function MapCard({ map, revalidate }) {
  const [nameInput, setNameInput] = useState()
  const [showNameInput, setShowNameInput] = useState()

  function saveMap(body) {
    fetch('/api/map', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ ...body, id: map.id }),
    })
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          toast.warning(data.error)
        } else {
          setShowNameInput(false)
          revalidate(`/app/${map.map}/export`)
          toast.success(`Remote map for ${map.map} updated successfully`)
        }
      })
      .catch(err => {
        console.log(err)
        toast.warning("A server error occurred")
      })
  }

  function deleteMap(id) {
    if (!window.confirm('Are you sure you want to delete this map?')) return
    fetch('/api/map', {
      method: 'DELETE',
      body: id,
    })
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          toast.warning(data.error)
        } else {
          revalidate(`/app/${map.map}/export`)

          toast.success(`Map with id ${id} successfully deleted`)
          // Optionally, you can add code here to update the UI after deletion
        }
      })
      .catch(err => {
        console.log(err)
        toast.warning("A server error occurred")
      })
  }

  async function saveLocally() {
    const response = await fetch(`/api/map?id=${map.id}`)
    const data = await response.json()
    const key = `${map.map}-${Date.now()}`
    const prev = JSON.parse(localStorage.getItem('maps')) || {}
    localStorage.setItem('maps', JSON.stringify({
      ...prev, [key]: {
        geojson: JSON.parse(data.geojson),
        name: data.name,
        updated: Date.now(),
        map: map.map,
      }
    }))
    toast.success("Map saved locally")
    // TODO: use zustard to have the clientMaps see the new localstorage
  }

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
      {showNameInput
        ? <>
          <Input value={nameInput} className="w-[80%] mb-4 inline" id={`local-map-${map.id}`}
            onChange={(e) => setNameInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') saveMap({ name: nameInput })
            }}
          />
          <Save onClick={() => saveMap({ name: nameInput })} size={22} className="cursor-pointer inline ml-4" />
        </>
        : <h2 className="text-2xl font-bold mb-4">{map.name} <Pencil onClick={() => { setNameInput(map.name); setShowNameInput(true) }} size={16} className="cursor-pointer inline ml-4" /></h2>
      }
      <p className="text-gray-400 ">Created: {new Date(map.createdAt).toLocaleDateString("en-US", {
        hour: "numeric",
        minute: "numeric",
        month: "long",
        day: "numeric",
      })}</p>
      <p className="text-gray-400 ">Last Updated: {new Date(map.updatedAt).toLocaleDateString("en-US", {
        hour: "numeric",
        minute: "numeric",
        month: "long",
        day: "numeric",
      })}</p>
      <p className="text-gray-400 ">Locations: {map.locations}</p>
      <p className="text-gray-400 ">Territories: {map.territories}</p>
      <p className="text-gray-400">Guides: {map.guides}</p>
      <div className="flex justify-between items-center mt-4">
        <Button size="sm" className="cursor-pointer rounded text-blue-300" onClick={saveLocally} variant="outline"><CloudDownload /> Save Locally</Button>
        <div className="flex space-x-2">
          <Button size="sm" className="text-red-500 cursor-pointer rounded" variant="destructive" onClick={() => deleteMap(map.id)}><Trash2 /> Delete</Button>
        </div>
      </div>
    </div>
  )
}
