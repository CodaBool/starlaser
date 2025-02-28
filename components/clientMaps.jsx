'use client'
import Link from "next/link"
import { useEffect, useState } from "react"
import { Button } from "./ui/button"
import { Eye, Trash2, ArrowRightFromLine, Pencil, Save } from 'lucide-react'
import { Input } from "./ui/input"

export default function ClientMaps() {
  const [maps, setMaps] = useState({})
  const [nameInput, setNameInput] = useState()
  const [showNameInput, setShowNameInput] = useState()

  useEffect(() => {
    setMaps(JSON.parse(localStorage.getItem('maps')))
  }, [])

  function deleteMap(key) {
    const updatedMaps = { ...maps }
    delete updatedMaps[key]
    localStorage.setItem('maps', JSON.stringify(updatedMaps))
    setMaps(updatedMaps)
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
      {Object.entries(maps).map(([key, data]) => {
        const [name, dateId] = key.split('-')
        return (
          <div key={key} className="bg-gray-800 p-4 rounded-lg shadow-lg">
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
            <p className="text-gray-400 ">Created: {new Date(parseInt(dateId)).toLocaleDateString()}</p>
            <p className="text-gray-400 ">Last Updated: {new Date(data.updated).toLocaleDateString()}</p>
            <p className="text-gray-400 ">Locations: {data.geojson?.features.filter(f => f.geometry.type === "Point").length}</p>
            <p className="text-gray-400 ">Territories: {data.geojson?.features.filter(f => f.geometry.type.includes("Poly")).length}</p>
            <p className="text-gray-400">Guides: {data.geojson?.features.filter(f => f.geometry.type === "LineString").length}</p>
            <div className="flex justify-between items-center mt-4">
              <Link href={`/${name}?id=${dateId}`} className="text-blue-300"><Button className="cursor-pointer rounded" variant="outline"><Eye /> View</Button></Link>
              <div className="flex space-x-2">
                <Button className="text-red-500 cursor-pointer rounded" variant="destructive" onClick={() => deleteMap(key)}><Trash2 /> Delete</Button>
                <Button className="cursor-pointer rounded"><ArrowRightFromLine /> Export</Button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  )
}
