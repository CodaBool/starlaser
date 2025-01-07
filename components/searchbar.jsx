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
import { panTo } from "@/components/map"
import { useEffect, useRef, useState } from "react"

export default function MenuComponent({ map, data, width, height, mobile }) {
  const [active, setActive] = useState()
  const cmd = useRef(null)
  const input = useRef(null)

  function search(e, d) {
    if (typeof e === "object") e.preventDefault()

    // close search menu
    setActive(false)
    input.current.blur()
    panTo(d, width, height)
  }

  useEffect(() => {
    if (input.current) {
      input.current.addEventListener('blur', () => setActive(false));
    }
    function down(e) {
      if (e.code === 'Space') {
        input.current.focus()
        setActive(true)

        // TODO: there is a bug with Lancer the location list has missing items if a timeout is not used
        // setTimeout(() => {
        // setOpen(true)
        // }, 0)
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

  const combinedData = [...data.guide, ...data.location, ...data.territory]

  return (
    <div className="flex mt-5 w-full justify-center absolute z-100">
      <Command className="rounded-lg border shadow-md w-4/5 searchbar" style={{ backgroundColor: "#020e03", borderColor: "#0a400d" }}>
        <CommandInput placeholder={mobile ? "Search for a location" : "press Space to search"} ref={input} onClick={() => setActive(true)} style={{ backgroundColor: "#020e03" }} />
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
