"use client"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Heart, Github, UserRound, Copyright, Sparkles, Telescope, SquareArrowOutUpRight, MoonStar, Sparkle, BookOpen, Bug, Pencil, Plus, MapPin, RectangleHorizontal, Map, ArrowRightFromLine, Hexagon, ListCollapse, User, LogOut, Ruler, CodeXml, Menu, Crosshair } from "lucide-react"
import { searchBar } from "@/lib/utils.js"
import * as turf from '@turf/turf'
import { useEffect, useRef, useState } from "react"

export default function MenuComponent({ map, data, mobile, name, panTo }) {
  const [active, setActive] = useState()
  const cmd = useRef(null)
  const input = useRef(null)

  async function search(e, d) {
    if (typeof e === "object") e.preventDefault()

    // close search menu
    setActive(false)
    input.current.blur()
    const zoom = d.geometry.type === "Point" ? 8 : null
    let { coordinates } = d.geometry
    if (d.geometry.type !== "Point") {
      const centroid = turf.centroid(d)
      coordinates = centroid.geometry.coordinates
    }
    await map.jumpTo({ center: coordinates, zoom })
    panTo(d, zoom, true)
  }

  useEffect(() => {
    if (input.current) {
      input.current.addEventListener('blur', () => setActive(false));
    }
    function down(e) {
      if (e.code === 'Space') {
        if (input.current !== document.activeElement) {
          e.preventDefault()
        }
        input.current.focus()
        setActive(true)
      } else if (e.code === "Escape") {
        setActive(false)
      }
    }

    document.addEventListener('keydown', down)
    return () => {
      document.removeEventListener('keydown', down)
      input?.current?.removeEventListener('blur', () => setActive(false));
    }
  }, [])

  const combinedData = [...data.guide || [], ...data.location, ...data.territory]

  // "#020e03"
  // "#0a400d"
  // "#020e03"

  return (
    <div className="flex mt-5 w-full justify-center absolute z-10">
      <Command className="rounded-lg border shadow-md w-4/5 searchbar" style={{ backgroundColor: searchBar[name].background, borderColor: searchBar[name].border }}>
        <CommandInput placeholder={mobile ? "Search for a location" : "press Space to search"} ref={input} onClick={() => setActive(true)} style={{ backgroundColor: searchBar[name].background }} />
        {active &&
          <CommandList style={{ height: '351px', zIndex: 100 }}>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup ref={cmd} heading="Suggestions">
              {combinedData.map((d, index) => (
                <CommandItem key={index} value={d.properties.name} className="cursor-pointer z-100" onMouseDown={e => search(e, d)} onSelect={e => search(e, d)} onTouchEnd={e => search(e, d)}>
                  {d.properties.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        }
      </Command >
    </div>
  )
}
