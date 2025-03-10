'use client'
import Link from "next/link"
import { useEffect, useState } from "react"
import { Eye, Trash2, ArrowRightFromLine, Pencil, Save } from 'lucide-react'
import { Input } from "./ui/input"
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { feature } from 'topojson-client'
import { topology } from 'topojson-server'
import { toKML } from '@placemarkio/tokml'
// import geojsonMerge from '@mapbox/geojson-merge'z

export default function ClientMaps({ map }) {
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

  function combineAndDownload(type, key) {

    window.alert("combined data not available yet. also export format for user data is not respected yet. All buttons give geojson. You must use a site like https://findthatpostcode.uk/tools/merge-geojson or npx mapshaper")
    fetch(`/api/download/${map}`)
      .then(response => response.json())
      .then(data => {


        const localGeojson = maps[key].geojson;


        // const serverData = feature(data, data.objects[Object.keys(data.objects)[0]])
        // console.log("1", serverData, "2", localGeojson)
        // var combined1 = geojsonMerge.merge([
        //   serverData,
        //   localGeojson
        // ]);
        // console.log("combined simple", combined1)
        // const topology2 = topology({ foo: combined1 })
        // console.log("topology2", topology2)

        const blob2 = new Blob([JSON.stringify(localGeojson)], { type: "application/json" })
        const url2 = URL.createObjectURL(blob2);
        const a2 = document.createElement("a");
        a2.href = url2;
        a2.download = `${map}.${type}`;
        document.body.appendChild(a2);
        a2.click();
        document.body.removeChild(a2);

        return

        const location = {
          type: "FeatureCollection",
          features: localGeojson.features.filter(f => f.geometry.type === "Point")
        };
        const territory = {
          type: "FeatureCollection",
          features: localGeojson.features.filter(f => f.geometry.type.includes("Poly"))
        };
        const guide = {
          type: "FeatureCollection",
          features: localGeojson.features.filter(f => f.geometry.type === "LineString")
        };

        // Convert GeoJSON to TopoJSON
        const localTopojson = topology({ location, territory, guide }, {});

        // Helper function to merge layers
        function mergeLayers(layerName, topo1, topo2) {
          const geometries1 = topo1.objects[layerName]?.geometries || [];
          const geometries2 = topo2.objects[layerName]?.geometries || [];
          return [...geometries1, ...geometries2];
        }

        // Merge the layers
        const mergedTerritory = mergeLayers('territory', localTopojson, data);
        const mergedGuide = mergeLayers('guide', localTopojson, data);
        const mergedLocation = mergeLayers('location', localTopojson, data);

        // Combine all layers into one object
        const mergedObjects = {
          territory: { type: 'GeometryCollection', geometries: mergedTerritory },
          guide: { type: 'GeometryCollection', geometries: mergedGuide },
          location: { type: 'GeometryCollection', geometries: mergedLocation },
        };

        // Create the final combined topojson object with the correct structure
        const combinedTopojson = {
          type: 'Topology',
          objects: mergedObjects,
          arcs: localTopojson.arcs.concat(data.arcs), // Combine the arcs from both topologies
          transform: localTopojson.transform, // Reuse the transform from localTopojson (or merge if needed)
        };

        console.log("Combined TopoJSON:", combinedTopojson);

        // const serverTopojson = topology({ server: feature(data, data.objects[Object.keys(data.objects)[0]]) });

        // const combinedTopojson = {
        //   type: "Topology",
        //   objects: {
        //     location: {
        //       type: "GeometryCollection",
        //       geometries: [
        //         ...localTopojson.objects.local.geometries.filter(f => f.type === "Point"),
        //         ...serverTopojson.objects.server.geometries.filter(f => f.type === "Point")
        //       ]
        //     },
        //     territory: {
        //       type: "GeometryCollection",
        //       geometries: [
        //         ...localTopojson.objects.local.geometries.filter(f => f.type.includes("Poly")),
        //         ...serverTopojson.objects.server.geometries.filter(f => f.type.includes("Poly"))
        //       ]
        //     },
        //     guide: {
        //       type: "GeometryCollection",
        //       geometries: [
        //         ...localTopojson.objects.local.geometries.filter(f => f.type === "LineString"),
        //         ...serverTopojson.objects.server.geometries.filter(f => f.type === "LineString")
        //       ]
        //     }
        //   },
        //   arcs: [...localTopojson.arcs, ...serverTopojson.arcs],
        //   transform: localTopojson.transform || serverTopojson.transform
        // };

        console.log("combinedTopojson", combinedTopojson);


        let convertedData
        if (type === "geojson") {
          convertedData = feature(combinedTopojson, combinedTopojson.objects[Object.keys(combinedTopojson.objects)[0]])
        } else if (type === "topojson") {
          convertedData = combinedTopojson;
        } else if (type === "kml") {
          const geojson = feature(combinedTopojson, combinedTopojson.objects[Object.keys(combinedTopojson.objects)[0]]);
          convertedData = toKML(geojson)
        }
        let blob
        if (type === "kml") {
          blob = new Blob([JSON.stringify(convertedData)], { type: "application/vnd.google-earth.kml+xml" })
        } else {
          blob = new Blob([JSON.stringify(convertedData)], { type: "application/json" })
        }
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${map}.${type}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      })
      .catch(error => console.error('Error downloading map:', error));
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
      {Object.entries(maps || {}).map(([key, data]) => {
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
              <Link href={`/${name}?id=${dateId}`} className="text-blue-300"><Button className="cursor-pointer rounded" variant="outline"><Eye /> View</Button></Link>
              <div className="flex space-x-2">
                <Button className="text-red-500 cursor-pointer rounded" variant="destructive" onClick={() => deleteMap(key)}><Trash2 /> Delete</Button>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button className="cursor-pointer rounded"><ArrowRightFromLine /> Export</Button>
                  </PopoverTrigger>
                  <PopoverContent className="flex flex-col text-sm">
                    <p className='mb-3 text-gray-200'>This is your map data combined with the core map data</p>
                    <hr className='border my-2 border-gray-500' />
                    <p className='my-2 text-gray-300'>Topojson is a newer version of Geojson, with the benefit of smaller file size</p>
                    <Button className="cursor-pointer w-full" variant="secondary" onClick={() => combineAndDownload("topojson", key)}>
                      <ArrowRightFromLine className="ml-[.6em] inline" /> Topojson
                    </Button>
                    <p className='my-2 text-gray-300'>Geojson is an extremely common spec for geography data</p>
                    <Button className="cursor-pointer w-full my-2" variant="secondary" onClick={() => combineAndDownload("geojson", key)}>
                      <ArrowRightFromLine className="ml-[.6em] inline" /> <span className="ml-[5px]">Geojson</span>
                    </Button>
                    <p className='my-2 text-gray-300'>KML can be imported into a <a href="https://www.google.com/maps/d/u/0/?hl=en" className='text-blue-300' target="_blank">Google Maps</a> layer. Which can be easily distributed publicly for free.</p>
                    <Button className="cursor-pointer w-full" variant="secondary" onClick={() => combineAndDownload("kml", key)}>
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
