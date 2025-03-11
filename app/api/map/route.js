import db from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from '../auth/[...nextauth]/route'

// export async function PUT(req) {
//   try {
//     const session = await getServerSession(authOptions)
//     if (!session) throw "unauthorized"
//     const body = await req.json()
//     const user = await db.user.findUnique({ where: { email: session.user.email } })
//     if (!user) throw "there is an issue with your account or session"
//     await db.user.update({
//       where: { id: user.id },
//       data: { alias: body.alias }
//     })
//     return Response.json({ msg: "success" })
//   } catch (err) {
//     console.error(err)
//     if (typeof err === 'string') {
//       return Response.json({ err }, { status: 400 })
//     } else if (typeof err?.message === "string") {
//       return Response.json({ err: err.message }, { status: 500 })
//     } else {
//       return Response.json(err, { status: 500 })
//     }
//   }
// }

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) throw "unauthorized"
    const body = await req.json()
    console.log("body", body, typeof body.geojson.features)
    const user = await db.user.findUnique({ where: { email: session.user.email } })
    if (!user) throw "there is an issue with your account or session"

    let locations = 0
    let territories = 0
    let guides = 0
    body.geojson.features.forEach(f => {
      if (f.geometry.type === "Point") {
        locations++
      } else if (f.geometry.type.includes("Poly")) {
        territories++
      } else if (f.geometry.type === "LineString") {
        guides++
      }
    })
    console.log("user geojson", body, {
      name: body.name,
      userId: user.id,
      locations,
      territories,
      guides,
      map: body.map
    })

    const map = await db.map.create({
      data: {
        name: body.name,
        userId: user.id,
        locations,
        territories,
        guides,
        map: body.map
      }
    })

    // TODO: upload to R2 here
    // https://developers.cloudflare.com/r2/examples/aws/aws-sdk-js

    return Response.json({ msg: "success", map })
  } catch (err) {
    console.error(err)
    if (typeof err === 'string') {
      return Response.json({ err }, { status: 400 })
    } else if (typeof err?.message === "string") {
      return Response.json({ err: err.message }, { status: 500 })
    } else {
      return Response.json(err, { status: 500 })
    }
  }
}
