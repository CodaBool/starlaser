'use client'
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "@/components/ui/menubar"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Heart, Github, UserRound, Copyright, Sparkles, Telescope, SquareArrowOutUpRight, MoonStar, Sparkle, BookOpen, Bug, Pencil, Plus, MapPin, RectangleHorizontal, Map, ArrowRightFromLine, Hexagon, ListCollapse, User, LogOut, Ruler, CodeXml } from "lucide-react"
// import SearchDialog from './dialog'
import Link from "next/link"
import { signOut, useSession } from "next-auth/react"
import { useEffect } from "react"

let newParams = ""

export default function Menu({ path, map }) {
  const { data: session } = useSession()

  useEffect(() => {
    // this approach could be improved but seems to work for now
    const urlParams = new URLSearchParams(window.location.search)
    // newParams = new URLSearchParams({ v }).toString()
  }, [])
  return (<div>menu placeholder</div>)

  // if (map) {
  //   return (
  //     <Menubar>

  //       <MenubarMenu>

  //         <MenubarTrigger>Menu</MenubarTrigger>
  //         <MenubarContent>
  //           <MenubarSub>
  //             <MenubarSubTrigger className="cursor-pointer"><Map size={16} className="mr-1" /> Maps</MenubarSubTrigger >
  //             <MenubarSubContent>
  //               <MenubarSub>
  //                 <MenubarSubTrigger className="cursor-pointer"><Hexagon size={16} className="inline mr-1" /> Lancer</MenubarSubTrigger>
  //                 <MenubarSubContent>
  //                   <a href="/lancer">
  //                     <MenubarItem className="cursor-pointer">
  //                       <UserRound size={16} className="inline mr-1" /> Janederscore
  //                     </MenubarItem>
  //                   </a>

  //                   <a href="/lancer?variant=starwall">
  //                     <MenubarItem className="cursor-pointer">
  //                       <UserRound size={16} className="inline mr-1" /> Starwall
  //                     </MenubarItem>
  //                   </a>
  //                 </MenubarSubContent>
  //                 <MenubarSubTrigger className="cursor-pointer"><Hexagon size={16} className="inline mr-1" /> Fallout</MenubarSubTrigger>
  //                 <MenubarSubContent>
  //                   <a href="/fallout">
  //                     <MenubarItem className="cursor-pointer">
  //                       <UserRound size={16} className="inline mr-1" /> CodaBool
  //                     </MenubarItem>
  //                   </a>
  //                 </MenubarSubContent>
  //               </MenubarSub>
  //             </MenubarSubContent>
  //           </MenubarSub>

  //           <MenubarSub>
  //             <MenubarSubTrigger className="cursor-pointer"><ArrowRightFromLine size={16} className="mr-1" /> Export</MenubarSubTrigger >
  //             <MenubarSubContent>
  //               {/* See handleDownload's comment on why public folder is not used */}
  //               {/* <Link href="/points.topojson" target="_blank" download> */}
  //               <MenubarItem className="cursor-pointer" onClick={() => console.log("i need a map")}>
  //                 <MapPin size={16} className="inline mr-1" /> Placeholder Map
  //               </MenubarItem >
  //               <MenubarItem className="cursor-pointer text-gray-500">
  //                 <CodeXml size={16} className="inline mr-1" /> Create Embed
  //               </MenubarItem >
  //             </MenubarSubContent>
  //           </MenubarSub>

  //           <MenubarSub>
  //             <MenubarSubTrigger className="cursor-pointer"><Heart size={16} className="mr-1" />Contribute</MenubarSubTrigger >
  //             <MenubarSubContent>
  //               <Link href={`/contribute/${map}?${newParams}`}>
  //                 <MenubarItem className="cursor-pointer">
  //                   <Pencil size={16} className="inline mr-1" /> Edit an existing Location
  //                 </MenubarItem>
  //               </Link>
  //               <Link href={session ? `/contribute/${map}?post=true` : "/contribute"}>
  //                 <MenubarItem className="cursor-pointer">
  //                   <Plus size={16} className="inline mr-1" /> Add a new Location
  //                 </MenubarItem >
  //               </Link>
  //               <a href="https://github.com/codabool/community-vtt-maps/issues" target="_blank">
  //                 <MenubarItem className="cursor-pointer">
  //                   <Bug size={16} className="inline mr-1" /> Something Else
  //                 </MenubarItem >
  //               </a>
  //             </MenubarSubContent>
  //           </MenubarSub>

  //           <AboutMenu />

  //         </MenubarContent>
  //       </MenubarMenu>

  //       <MenubarMenu>
  //         <SearchDialog />
  //       </MenubarMenu>

  //     </Menubar>
  //   )
  // } else {
  //   return (
  //     <Menubar>

  //       <MenubarMenu>
  //         <MenubarTrigger>Menu</MenubarTrigger>
  //         <MenubarContent>
  //           <MenubarSub>
  //             <MenubarSubTrigger className="cursor-pointer"><Map size={16} className="mr-1" /> Maps</MenubarSubTrigger >
  //             <MenubarSubContent>
  //               <MenubarSub>
  //                 <MenubarSubTrigger className="cursor-pointer"><Hexagon size={16} className="inline mr-1" /> Lancer</MenubarSubTrigger>
  //                 <MenubarSubContent>
  //                   <a href="/lancer">
  //                     <MenubarItem className="cursor-pointer">
  //                       <UserRound size={16} className="inline mr-1" /> Janederscore
  //                     </MenubarItem>
  //                   </a>

  //                   <a href="/lancer?variant=starwall">
  //                     <MenubarItem className="cursor-pointer">
  //                       <UserRound size={16} className="inline mr-1" /> Starwall
  //                     </MenubarItem>
  //                   </a>
  //                 </MenubarSubContent>
  //               </MenubarSub>
  //             </MenubarSubContent>
  //           </MenubarSub>

  //           {/* {(path === "/profile" || path === "/contribute") &&
  //             <MenubarSub>
  //               <MenubarSubTrigger className="cursor-pointer"><Heart size={16} className="mr-1" />Contribute</MenubarSubTrigger >
  //               <MenubarSubContent>
  //                 <Link href={`/contribute/lancer`}>
  //                   <MenubarItem className="cursor-pointer">
  //                     <Hexagon size={16} className="inline mr-1" /> Lancer
  //                   </MenubarItem>
  //                 </Link>
  //               </MenubarSubContent >
  //             </MenubarSub>
  //           } */}

  //           <a href="https://github.com/codabool/community-vtt-maps/issues" target="_blank">
  //             <MenubarItem inset className="cursor-pointer  pl-2"><Bug size={16} className="inline mr-1" /> Issues</MenubarItem>
  //           </a>

  //           <AboutMenu />

  //         </MenubarContent>

  //       </MenubarMenu>

  //       {session &&
  //         <MenubarMenu>
  //           <MenubarTrigger className="cursor-pointer">Account</MenubarTrigger  >
  //           <MenubarContent>
  //             <MenubarSeparator />
  //             <Link href="/profile">
  //               <MenubarItem className="cursor-pointer pl-[.98em]">
  //                 <User size={18} className="inline mr-1" /> Profile
  //               </MenubarItem >
  //             </Link>
  //             <MenubarItem onClick={signOut} className="ps-4 cursor-pointer">
  //               <LogOut size={16} className="inline mr-1" /> Sign out
  //             </MenubarItem >
  //           </MenubarContent>
  //         </MenubarMenu>
  //       }
  //     </Menubar>
  //   )
  // }
}
