import {
  Card,
  CardContent,
} from "@/components/ui/card"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Badge } from '@/components/ui/badge.jsx'
import Link from "next/link"
import { selectAll } from 'd3'
import { color, accent, genLink } from "@/lib/utils.js"
import { panTo } from "@/components/map"
import * as SVG from './svg.js'

export default function SheetComponent({ setDrawerOpen, drawerOpen, locations, coordinates, map, selected, width, height }) {

  function handleMouseOver(properties, geometry) {
    let className = ".territory"

    if (geometry.type === "LineString") {
      className = ".guide"
    } else if (geometry.type === "Point") {
      className = ".location"
    }
    selectAll(className)
      .filter(d => d.properties.name === properties.name)
      .classed('animate-pulse', true)
      .attr('fill', () => className === ".guide" ? "none" : accent(map, 1))
      .attr('stroke', () => className === ".location" ? null : accent(map, 1))
  }

  function handleMouseOut(properties, geometry) {
    let className = ".territory"
    if (geometry.type === "LineString") {
      className = ".guide"
    } else if (geometry.type === "Point") {
      className = ".location"
    }
    selectAll(className)
      .filter(d => d.properties.name === properties.name)
      .classed('animate-pulse', false)
      .attr('fill', d => className === ".guide" ? "none" : color(map, d.properties, "fill", d.geometry.type))
      .attr('stroke', d => className === ".location" ? null : color(map, d.properties, "stroke", d.geometry.type))

  }

  function handle(e) {
    e.preventDefault()
  }

  return (
    <Sheet onOpenChange={setDrawerOpen} open={drawerOpen} modal={false} style={{ color: 'white' }}>
      <SheetContent side="bottom" style={{ maxHeight: '38vh', overflowY: 'auto' }} className="map-sheet" onPointerDownOutside={handle}>
        <SheetHeader >
          <SheetTitle className="text-center">{coordinates ? `x: ${Math.floor(coordinates[0])}, y: ${Math.floor(coordinates[1])}` : 'unknown'}</SheetTitle>
          <SheetDescription />
        </SheetHeader >
        <div className="flex flex-wrap justify-center">
          {locations?.map(d => {
            const { properties, geometry } = d
            const params = new URLSearchParams({
              description: properties.description || "",
              name: properties.name,
              map,
            }).toString()
            const icon = SVG[d.properties.type]
            const card = (
              <Card
                className="min-h-[80px] m-2 min-w-[150px] cursor-pointer"
                onMouseOver={() => handleMouseOver(properties, geometry)}
                onMouseOut={() => handleMouseOut(properties, geometry)}
              >
                <CardContent className={`p-2 text-center ${selected === properties.name ? 'bg-yellow-800' : 'hover:bg-yellow-950'}`}>
                  {properties.unofficial && <Badge variant="destructive" className="mx-auto">unofficial</Badge>}

                  <p className="font-bold text-xl text-center">{properties.name}</p>
                  <p className="text-center text-gray-400 flex justify-center"><span dangerouslySetInnerHTML={{ __html: icon }} style={{ fill: "white", margin: '.2em' }} />{properties.type}</p>
                  {properties.faction && <Badge className="mx-auto">{properties.faction}</Badge>}
                  {properties.destroyed && <Badge className="mx-auto">destroyed</Badge>}
                  {properties.capital && <Badge variant="destructive" className="mx-auto">capital</Badge>}
                </CardContent>
              </Card >
            )
            return properties.name === selected ? (
              <Link
                href={genLink(d, map)}
                target="_blank"
                key={properties.name}
              >
                {card}
              </Link>
            ) : <div key={properties.name} onClick={() => panTo(d, width, height, null, 80)}>{card}</div>
          })}
        </div>
      </SheetContent >
    </Sheet >
  )
}
