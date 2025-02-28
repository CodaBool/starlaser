import { ArrowLeft, Heart, Map, Terminal, Plus, WifiOff, Cloud } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import db from "@/lib/db"
import ClientMaps from '@/components/clientMaps'
import { Button } from '@/components/ui/button'

export default async function Export({ params, searchParams }) {
  // const
  const session = await getServerSession(authOptions)
  const { map } = await params
  // const { c: commentFormOpen } = await searchParams
  const user = session ? await db.user.findUnique({ where: { email: session.user.email } }) : null
  const cloud = await db.map.findMany({
    where: {
      userId: user?.id,
      map,
    },
  })
  return (
    <div className='text-white mx-auto md:container p-4 mt-2 md:mt-14'>
      {/* <Link href="/" className="mb-4">
        <ArrowLeft size={42} />
      </Link> */}
      <h1 className='md:text-6xl text-4xl inline'>{map.charAt(0).toUpperCase() + map.slice(1)} Maps</h1>
      <Link href={`/${map}?new=1`} className='ml-8'><Button className="text-black cursor-pointer rounded pr-[1.8em] relative top-[-8px]" variant="secondary"><Plus /> New </Button></Link>
      <h2 className='md:text-4xl text-2xl my-4'><WifiOff className='inline relative top-[-4px]' size={30} /> Local</h2>
      <h3 className='text-gray-300'>Saved in browser</h3>
      <ClientMaps />

      <h2 className='md:text-4xl text-2xl my-4'><Cloud className='inline relative top-[-4px]' size={34} /> Cloud</h2>

      {/* TODO: should have a redirect param to this page */}
      {cloud.length === 0 &&
        <h3 className='text-gray-300'>Provide an <Link href="/api/auth/signin" className='text-blue-300'>email address</Link> to publish a map</h3>
      }
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {cloud.map(map => (
          <div key={map.id} className="bg-gray-800 p-4 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-2">{map.name}</h2>
            <p className="text-gray-400 mb-4">{map.description}</p>
            <div className="flex justify-between items-center">
              <Link href={`/maps/${map.id}`} className="text-blue-300">View</Link>
              <div className="flex space-x-2">
                <button className="text-red-500">Delete</button>
                <button className="text-yellow-500">Edit</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
