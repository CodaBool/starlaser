import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Heart, Github, UserRound, Copyright, Sparkles, Telescope, SquareArrowOutUpRight, MoonStar, Sparkle, BookOpen, Bug, Pencil, Plus, MapPin, RectangleHorizontal, Map, ArrowRightFromLine, Hexagon, ListCollapse, User, LogOut, Ruler, CodeXml, Menu, Crosshair } from "lucide-react"
import { select } from 'd3'

function toggle(name, mode) {
  if (mode.has(name)) {
    mode.delete(name)
    select('.textbox').style("visibility", "hidden")
    select('.point').style("visibility", "hidden")
    select('.line').style("visibility", "hidden")
  } else {
    if (mode.has("measure")) {
      toggle("measure", mode)
    } else if (mode.has("crosshair")) {
      toggle("crosshair", mode)
    }
    mode.add(name)
    select(".line").raise()
  }
}

export default function Hamburger({ mode }) {
  return (
    <DropdownMenu >
      <DropdownMenuTrigger className="m-5 ml-12 absolute hamburger cursor-pointer z-10"><Menu width={40} height={40} className="cursor-pointer" /></DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Tools</DropdownMenuLabel>
        <DropdownMenuItem className="cursor-pointer" onPointerUp={() => toggle("measure", mode)}>
          <Ruler /> Measure <input type="checkbox" checked={mode.has("measure")} readOnly />
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer" onPointerUp={() => toggle("crosshair", mode)}>
          <Crosshair /> Coordinate <input type="checkbox" checked={mode.has("crosshair")} readOnly />
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Links</DropdownMenuLabel>
        <DropdownMenuItem className="cursor-pointer"><Copyright /> License</DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer"><Heart /> Credits</DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer"><Plus /> Contribute</DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer"><Github /> Source Code</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
