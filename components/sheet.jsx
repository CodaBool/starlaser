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

  function handleMouseOver(location) {
    selectAll('.location')
      .filter(d => d.properties.name === location.name)
      .classed('pulse', true)
      .attr('fill', 'orange')
      .attr('stroke', 'orange')
      .raise()
  }

  function handleMouseOut(location) {
    selectAll('.location')
      .filter(d => d.properties.name === location.name)
      .classed('pulse', false)
      .attr('fill', d => color(map, d.properties, "fill", d.geometry.type))
      .attr('stroke', d => color(map, d.properties, "stroke", d.geometry.type))
  }

  return (
    <Sheet onOpenChange={setDrawerOpen} open={drawerOpen} modal={false} style={{ color: 'white' }} >
      <SheetContent side="bottom" style={{ maxHeight: '50vh', overflowY: 'auto' }} className="map-sheet">
        <SheetHeader >
          <SheetTitle className="text-center">{coordinates ? `x: ${Math.floor(coordinates[0])}, y: ${Math.floor(coordinates[1])}` : 'unknown'}</SheetTitle>
          <SheetDescription />
        </SheetHeader >
        <div className="flex flex-wrap justify-center">
          {locations?.map(location => {
            // console.log("l, check for description", location)
            const params = new URLSearchParams({
              description: location.description || "",
              name: location.name,
              map,
            }).toString()
            return (
              <Link href={`/contribute/redirect?${params}`} key={location.name}>
                <Card
                  className="min-h-[80px] m-2 min-w-[150px]"
                  onMouseOver={() => handleMouseOver(location)}
                  onMouseOut={() => handleMouseOut(location)}
                >
                  <CardContent className="p-2 text-center">
                    {location.thirdParty && <Badge variant="destructive" className="mx-auto">unofficial</Badge>}
                    <p className="font-bold text-xl text-center">{location.name}</p>
                    <p className="text-center text-gray-400">{location.type}</p>
                    {location.faction && <Badge className="mx-auto">{location.faction}</Badge>}
                    {location.destroyed && <Badge className="mx-auto">destroyed</Badge>}
                    {location.capital && <Badge variant="destructive" className="mx-auto">capital</Badge>}
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
