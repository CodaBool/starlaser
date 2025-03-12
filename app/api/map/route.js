import db from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from '../auth/[...nextauth]/route'
import { S3Client, PutObjectCommand, DeleteObjectsCommand, GetObjectCommand } from "@aws-sdk/client-s3"
import crypto from 'crypto'
const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.CF_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CF_ACCESS_ID,
    secretAccessKey: process.env.CF_ACCESS_SECRET,
  },
})

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) throw "unauthorized"
    const searchParams = req.nextUrl.searchParams
    const id = searchParams.get('id')
    const user = await db.user.findUnique({ where: { email: session.user.email } })
    if (!user) throw "there is an issue with your account or session"
    const map = await db.map.findUnique({
      where: { id },
    })
    if (map.userId !== user.id) throw "unauthorized"

    // TODO: should allow for anyone to GET if published

    const command = new GetObjectCommand({
      Bucket: "maps",
      Key: id,
      ResponseContentType: "application/json",
    })
    const response = await s3.send(command)

    // Read stream to buffer
    const geojson = await response.Body?.transformToString();

    if (!geojson) throw 'file not found'

    return Response.json({ name: map.name, geojson })
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
export async function PUT(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) throw "unauthorized"
    const body = await req.json()
    const user = await db.user.findUnique({ where: { email: session.user.email } })
    if (!user) throw "there is an issue with your account or session"
    const map = await db.map.findUnique({
      where: { id: body.id },
    })
    if (map.userId !== user.id) throw "unauthorized"

    const updates = { ...map }
    let geojsonChange = false
    if (body.geojson) {
      if (!validGeojson(body.geojson)) throw "invalid geojson"
      const { locations, territories, guides } = getFeatureData(body.geojson)
      updates.locations = locations
      updates.territories = territories
      updates.guides = guides
      const newHash = crypto.createHash('sha256').update(JSON.stringify(body.geojson)).digest('hex')
      geojsonChange = map.hash !== newHash
      if (!geojsonChange) throw "this map is already in sync"
      updates.hash = newHash
    }
    if (body.name) {
      updates.name = body.name
    }
    if (typeof body.published !== 'undefined') {
      updates.published = body.published
    }

    await db.map.update({
      where: { id: body.id },
      data: {
        name: updates.name,
        published: updates.published,
        guides: updates.guides,
        locations: updates.locations,
        territories: updates.territories,
        hash: updates.hash,
      }
    })

    // only put R2 if the geojson has changed
    if (geojsonChange) {
      const command = new PutObjectCommand({
        Body: JSON.stringify(body.geojson),
        Bucket: "maps",
        Key: map.id,
        // CacheControl: "STRING_VALUE",
        ContentType: "application/json",
        // Expires: new Date("TIMESTAMP"),
        Metadata: {
          "user": user.id,
          "map": map.map,
          "alias": user.alias,
          "email": user.email,
        },
      })
      const response = await s3.send(command)
    }

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
export async function DELETE(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) throw "unauthorized"
    const id = await req.text()
    const user = await db.user.findUnique({ where: { email: session.user.email } })
    if (!user) throw "there is an issue with your account or session"
    const map = await db.map.findUnique({
      where: { id },
    })
    if (map.userId !== user.id) throw "unauthorized"
    const deleteCommand = new DeleteObjectsCommand({
      Bucket: "maps",
      Delete: {
        Objects: [
          { Key: id }
        ]
      }
    })
    const response = await s3.send(deleteCommand)
    const deleted = await db.map.delete({
      where: { id },
    })

    return Response.json({ msg: "success", map: deleted })
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
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) throw "unauthorized"
    const body = await req.json()
    const user = await db.user.findUnique({ where: { email: session.user.email } })
    if (!user) throw "there is an issue with your account or session"

    if (!validGeojson(body.geojson)) throw "invalid geojson"

    const maps = await db.map.findMany({
      where: { userId: user.id },
    })

    if (maps.length > 9) {
      throw "only 10 cloud maps are allowed"
    }

    const { locations, territories, guides } = getFeatureData(body.geojson)

    const hash = crypto.createHash('sha256').update(JSON.stringify(body.geojson)).digest('hex')
    console.log("uploading map with hash", hash)

    const map = await db.map.create({
      data: {
        name: body.name,
        userId: user.id,
        locations,
        territories,
        guides,
        hash,
        map: body.map
      }
    })

    if (!map?.id) throw "failed to upload map"

    const command = new PutObjectCommand({
      Body: JSON.stringify(body.geojson),
      Bucket: "maps",
      Key: map.id,
      // CacheControl: "STRING_VALUE",
      ContentType: "application/json",
      // Expires: new Date("TIMESTAMP"),
      Metadata: {
        "user": user.id,
        "map": body.map,
        "alias": user.alias,
        "email": user.email,
      },
      // Tagging: "STRING_VALUE",
    })
    const response = await s3.send(command)
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


function getFeatureData(geojson) {
  let locations = 0
  let territories = 0
  let guides = 0
  geojson.features.forEach(f => {
    if (f.geometry.type === "Point") {
      locations++
    } else if (f.geometry.type.includes("Poly")) {
      territories++
    } else if (f.geometry.type === "LineString") {
      guides++
    }
  })
  return { locations, territories, guides }
}

function validGeojson(geojson) {
  if (!geojson.type || geojson.type !== 'FeatureCollection') return false;
  if (!Array.isArray(geojson.features)) return false;
  for (const feature of geojson.features) {
    if (!feature.type || feature.type !== 'Feature') return false;
    if (!feature.geometry || typeof feature.geometry !== 'object') return false;
    if (!feature.geometry.type || !['Point', 'LineString', 'Polygon', 'MultiPoint', 'MultiLineString', 'MultiPolygon', 'GeometryCollection'].includes(feature.geometry.type)) return false;
    if (!feature.geometry.coordinates || !Array.isArray(feature.geometry.coordinates)) return false;
  }
  return true;
}
