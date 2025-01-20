import Image from "next/image"
// import lancer from '@/public/lancer_landing.webp'
import placeholder1 from '@/public/placeholder_1_landing.webp'
import placeholder2 from '@/public/placeholder_2_landing.webp'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function page() {
  return (
    <>
      <h1 className="text-5xl my-4 text-center">Maps</h1 >
      <div className="container mx-auto flex flex-wrap justify-center">
        <Link href="/lancer">
          <Card className="m-4 max-w-[400px] cursor-pointer">
            <CardHeader>
              <CardTitle className="text-center">LANCER</CardTitle >
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
          <Card className="m-4 max-w-[400px] cursor-pointer">
            <CardHeader>
              <CardTitle className="text-center">FALLOUT</CardTitle >
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
        {/* <Card className="m-4 max-w-[600px] cursor-pointer">
          <CardHeader>
            <CardTitle className="text-center">ALIEN</CardTitle >
          </CardHeader>
          <CardContent>
            <Image
              src={placeholder}
              alt="Alien Map"
              className="hover-grow"
            />
          </CardContent>
        </Card >
        <Card className="m-4 max-w-[600px] cursor-pointer">
          <CardHeader>
            <CardTitle className="text-center">FALLOUT</CardTitle >
          </CardHeader>
          <CardContent>
            <Image
              src={placeholder}
              alt="Fallout Map"
              className="hover-grow"
            />
          </CardContent>
        </Card > */}
      </div>
    </>
  )
}
