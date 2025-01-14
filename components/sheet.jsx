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
import { color } from "@/lib/utils.js"

export default function SheetComponent({ setDrawerOpen, drawerOpen, locations, coordinates, map }) {

  function handleMouseOver(properties, geometry) {
    let className = ".territory"
    if (geometry.type === "LineString") {
      className = ".guide"
    } else if (geometry.type === "Point") {
      className = ".location"
    }
    selectAll(className)
      .filter(d => d.properties.name === properties.name)
      .classed('pulse', true)
      .attr('fill', () => className === ".guide" ? "none" : 'orange')
      .attr('stroke', () => className === ".location" ? null : 'orange')
      .attr('opacity', () => className === ".territory" ? .4 : 1)
  }

  function handleMouseOut(properties, geometry) {
    selectAll('.location')
      .filter(d => d.properties.name === properties.name)
      .classed('pulse', false)
      .attr('fill', d => color(map, d.properties, "fill", d.geometry.type))

    let className = ".territory"
    if (geometry.type === "LineString") {
      className = ".guide"
    } else if (geometry.type === "Point") {
      className = ".location"
    }
    selectAll(className)
      .filter(d => d.properties.name === properties.name)
      .classed('pulse', false)
      .attr('fill', d => className === ".guide" ? "none" : color(map, d.properties, "fill", d.geometry.type))
      .attr('stroke', d => className === ".location" ? null : color(map, d.properties, "stroke", d.geometry.type))
      .attr('opacity', d => className === ".territory" ? (d.properties.type === "faction" || d.properties.type === "region") ? .1 : 1 : 1)

  }

  function handle(e) {
    // console.log("click outside")
    e.preventDefault()
  }

  return (
    <Sheet onOpenChange={setDrawerOpen} open={drawerOpen} modal={false} style={{ color: 'white' }}>
      <SheetContent side="bottom" style={{ maxHeight: '50vh', overflowY: 'auto' }} className="map-sheet" onPointerDownOutside={handle}>
        <SheetHeader >
          <SheetTitle className="text-center">{coordinates ? `x: ${Math.floor(coordinates[0])}, y: ${Math.floor(coordinates[1])}` : 'unknown'}</SheetTitle>
          <SheetDescription />
        </SheetHeader >
        <div className="flex flex-wrap justify-center">
          {locations?.map(({ properties, geometry }) => {
            const params = new URLSearchParams({
              description: properties.description || "",
              name: properties.name,
              map,
            }).toString()
            return (
              <Link href={`/contribute/redirect?${params}`} key={properties.name}>
                <Card
                  className="min-h-[80px] m-2 min-w-[150px]"
                  onMouseOver={() => handleMouseOver(properties, geometry)}
                  onMouseOut={() => handleMouseOut(properties, geometry)}
                >
                  <CardContent className="p-2 text-center">
                    {properties.unofficial && <Badge variant="destructive" className="mx-auto">unofficial</Badge>}
                    <p className="font-bold text-xl text-center">{properties.name}</p>
                    <p className="text-center text-gray-400">{properties.type}</p>
                    {properties.faction && <Badge className="mx-auto">{properties.faction}</Badge>}
                    {properties.destroyed && <Badge className="mx-auto">destroyed</Badge>}
                    {properties.capital && <Badge variant="destructive" className="mx-auto">capital</Badge>}
                  </CardContent>
                </Card >
              </Link>
            )
          })}
        </div>
      </SheetContent >
    </Sheet >
  )
}
