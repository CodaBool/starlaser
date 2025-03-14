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
import { Heart, Github, UserRound, Copyright, Sparkles, Telescope, SquareArrowOutUpRight, MoonStar, Sparkle, BookOpen, Bug, Pencil, Plus, MapPin, RectangleHorizontal, Map, ArrowRightFromLine, Hexagon, ListCollapse, User, LogOut, Ruler, CodeXml, Settings, HeartHandshake } from "lucide-react"
import Link from "next/link"
import { signOut, useSession } from "next-auth/react"

export default function Menu({ path, params }) {
  const { data: session } = useSession()

  return (
    <Menubar>

      <MenubarMenu>
        <MenubarTrigger>Menu</MenubarTrigger>
        <MenubarContent>
          <MenubarSub>
            <MenubarSubTrigger className="cursor-pointer"><Map size={16} className="mr-1" /> Maps</MenubarSubTrigger >
            <MenubarSubContent>
              <MenubarSub>
                <MenubarSubTrigger className="cursor-pointer"><Hexagon size={16} className="inline mr-1" /> Lancer</MenubarSubTrigger>
                <MenubarSubContent>
                  <a href="/lancer">
                    <MenubarItem className="cursor-pointer">
                      <UserRound size={16} className="inline mr-1" /> Janederscore
                    </MenubarItem>
                  </a>

                  <a href="/lancer?variant=starwall">
                    <MenubarItem className="cursor-pointer">
                      <UserRound size={16} className="inline mr-1" /> Starwall
                    </MenubarItem>
                  </a>
                </MenubarSubContent>
              </MenubarSub>
              <MenubarItem>
                <a href="/fallout"><Settings size={16} className="inline mr-1" /> Fallout</a>
              </MenubarItem>
            </MenubarSubContent>
          </MenubarSub>


          <MenubarSub>
            <MenubarSubTrigger className="cursor-pointer"><ArrowRightFromLine size={16} className="mr-1" /> Export</MenubarSubTrigger >
            <MenubarSubContent>
              <MenubarSub>
                <MenubarSubTrigger className="cursor-pointer"><Hexagon size={16} className="inline mr-1" /> Lancer</MenubarSubTrigger>
                <MenubarSubContent>
                  <a href="/lancer/export">
                    <MenubarItem className="cursor-pointer">
                      <UserRound size={16} className="inline mr-1" /> Janederscore
                    </MenubarItem>
                  </a>

                  <a href="/lancer_starwall/export">
                    <MenubarItem className="cursor-pointer">
                      <UserRound size={16} className="inline mr-1" /> Starwall
                    </MenubarItem>
                  </a>
                </MenubarSubContent>
              </MenubarSub>
              <MenubarItem>
                <a href="/fallout/export"><Settings size={16} className="inline mr-1" /> Fallout</a>
              </MenubarItem>
            </MenubarSubContent>
          </MenubarSub>

          <MenubarSub>
            <MenubarSubTrigger className="cursor-pointer"><HeartHandshake size={16} className="mr-1" /> Contribute</MenubarSubTrigger >
            <MenubarSubContent>
              <MenubarSub>
                <MenubarSubTrigger className="cursor-pointer"><Hexagon size={16} className="inline mr-1" /> Lancer</MenubarSubTrigger>
                <MenubarSubContent>
                  <a href="/contribute/lancer">
                    <MenubarItem className="cursor-pointer">
                      <UserRound size={16} className="inline mr-1" /> Janederscore
                    </MenubarItem>
                  </a>

                  <a href="/contribute/lancer_starwall">
                    <MenubarItem className="cursor-pointer">
                      <UserRound size={16} className="inline mr-1" /> Starwall
                    </MenubarItem>
                  </a>
                </MenubarSubContent>
              </MenubarSub>
              <MenubarItem>
                <a href="/contribute/fallout"><Settings size={16} className="inline mr-1" /> Fallout</a>
              </MenubarItem>
            </MenubarSubContent>
          </MenubarSub>

          <MenubarItem>
            <a href="/"><Map size={16} className="inline mr-1" /> Other Maps</a>
          </MenubarItem>

          {/* {(path === "/profile" || path === "/contribute") &&
            <MenubarSub>
              <MenubarSubTrigger className="cursor-pointer"><Heart size={16} className="mr-1" />Contribute</MenubarSubTrigger >
              <MenubarSubContent>
                <Link href={`/contribute/lancer`}>
                  <MenubarItem className="cursor-pointer">
                    <Hexagon size={16} className="inline mr-1" /> Lancer
                  </MenubarItem>
                </Link>
              </MenubarSubContent >
            </MenubarSub>
          } */}

          <a href="https://github.com/codabool/community-vtt-maps/issues" target="_blank">
            <MenubarItem inset className="cursor-pointer  pl-2"><Bug size={16} className="inline mr-1" /> Issues</MenubarItem>
          </a>

        </MenubarContent>

      </MenubarMenu>

      {session &&
        <MenubarMenu>
          <MenubarTrigger className="cursor-pointer">Account</MenubarTrigger  >
          <MenubarContent>
            <MenubarSeparator />
            <Link href="/profile">
              <MenubarItem className="cursor-pointer pl-[.98em]">
                <User size={18} className="inline mr-1" /> Profile
              </MenubarItem >
            </Link>
            <MenubarItem onClick={signOut} className="ps-4 cursor-pointer">
              <LogOut size={16} className="inline mr-1" /> Sign out
            </MenubarItem >
          </MenubarContent>
        </MenubarMenu>
      }
    </Menubar>
  )
}
