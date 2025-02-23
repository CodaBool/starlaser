import Image from "next/image"
// import lancer from '@/public/lancer_landing.webp'
import placeholder1 from '@/public/placeholder_1_landing.webp'
import placeholder2 from '@/public/placeholder_2_landing.webp'
import placeholder3 from '@/public/placeholder_3_landing.webp'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function page() {
  return (
    <>
      <h1 className="text-5xl my-5 text-center">Sci-Fi Maps</h1 >
      <div className="container mx-auto flex flex-wrap justify-center">
        <Link href="/lancer">
          <Card className="m-5 max-w-[230px] cursor-pointer lg:max-w-[441px]">
            <CardHeader>
              <CardTitle className="text-center">LANCER</CardTitle >
              <CardDescription className="text-center">CodaBool</CardDescription>
            </CardHeader>
            <CardContent>
              <Image
                src={placeholder2}
                alt="Lancer Map"
                className="hover-grow"
              />
            </CardContent>
          </Card >
        </Link >
        <Link href="/fallout">
          <Card className="m-5 max-w-[230px] cursor-pointer lg:max-w-[441px]">
            <CardHeader>
              <CardTitle className="text-center">FALLOUT</CardTitle >
              <CardDescription className="text-center">CodaBool</CardDescription>
            </CardHeader>
            <CardContent>
              <Image
                src={placeholder1}
                alt="Fallout Map"
                className="hover-grow"
              />
            </CardContent>
          </Card >
        </Link>
      </div>
      <div className="container mx-auto flex flex-wrap justify-center">
        <Link href="https://www.nightcity.io/red">
          <Card className="m-5 max-w-[100px] cursor-pointer lg:max-w-[200px]">
            <CardHeader>
              <CardTitle className="text-center">CYBERPUNK</CardTitle >
              <CardDescription className="text-xs text-center">Devianaut & DeviousDrizzle</CardDescription>
            </CardHeader>
            <CardContent>
              <Image
                src={placeholder3}
                alt="Cyberpunk RED Map"
                className="hover-grow"
              />
            </CardContent>
          </Card >
        </Link >
        <Link href="https://hbernberg.carto.com/viz/76e286d4-fbab-11e3-b014-0e73339ffa50/embed_map">
          <Card className="m-5 max-w-[100px] cursor-pointer lg:max-w-[200px]">
            <CardHeader>
              <CardTitle className="text-center">STAR WARS</CardTitle >
              <CardDescription className="text-xs text-center">Henry M Bernberg</CardDescription>
            </CardHeader>
            <CardContent>
              <Image
                src={placeholder3}
                alt="Star Wars Map"
                className="hover-grow"
              />
            </CardContent>
          </Card >
        </Link>
        <Link href="https://map.weylandyutani.company/">
          <Card className="m-5 max-w-[100px] cursor-pointer lg:max-w-[200px]">
            <CardHeader>
              <CardTitle className="text-center">ALIEN</CardTitle >
              <CardDescription className="text-xs text-center">Clay DeGruchy</CardDescription>
            </CardHeader>
            <CardContent>
              <Image
                src={placeholder3}
                alt="Alien Map"
                className="hover-grow"
              />
            </CardContent>
          </Card >
        </Link>
        <Link href="https://jambonium.co.uk/40kmap">
          <Card className="m-5 max-w-[100px] cursor-pointer lg:max-w-[200px]">
            <CardHeader>
              <CardTitle className="text-center">WARHAMMER</CardTitle >
              <CardDescription className="text-xs text-center">Michelle Louise Janion</CardDescription>
            </CardHeader>
            <CardContent>
              <Image
                src={placeholder3}
                alt="Warhammer Map"
                className="hover-grow"
              />
            </CardContent>
          </Card >
        </Link>
      </div>
    </>
  )
}
