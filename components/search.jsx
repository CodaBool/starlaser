import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { useRef } from "react"
// import { panTo } from "@/app/[map]/page"
import { useSearchParams } from 'next/navigation'

// TODO: allow for a third community ran variant
// const starwallPoints = feature(topo.starwallPoints, topo.starwallPoints.objects.collection)
// const janederscorePoints = feature(topo.janederscorePoints, topo.janederscorePoints.objects.collection)

// WARN: if the topojson doesn't have the points under "collection" this will fail
export default function Search({ setOpen, map, data }) {
  const cmd = useRef(null)
  const searchParams = useSearchParams()

  // const creator = searchParams.get("variant") === "starwall" ? "starwall" : "janederscore"
  // const data = searchParams.get("variant") === "starwall" ? starwallPoints : janederscorePoints

  // TODO: enter detection doesnt seem necessary anymore, verify that this is the case
  // function handleEnter(e) {
  //   if (e.code !== 'Enter') return
  //   // const name = cmd.current.querySelector('[data-selected="true"]').textContent
  //   // panTo(name, creator)
  //   // setOpen(false)
  // }

  // TODO: add polygon search as well
  // can use shadcn/ui of Command groups

  // console.log(combinedData)
  return (

  )
}
