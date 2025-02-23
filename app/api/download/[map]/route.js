import { readFile } from "fs/promises"
import path from "path"
import { feature } from 'topojson-client'

export async function GET(req, { params }) {
  const dataDir = path.join(process.cwd(), "/app", "[map]", "topojson")
  const { map } = await params

  const url = new URL(req.url)
  const urlParams = new URLSearchParams(url.search)
  const format = urlParams.get('format') ? "geo" : "topo"

  const filePath = path.join(dataDir, `${map}.json`)
  let buffer = await readFile(filePath)

  if (format === "geo") {
    const topojson = JSON.parse(buffer.toString())

    // Iterate over each layer and convert to GeoJSON
    const combinedFeatures = Object.keys(topojson.objects).reduce((features, key) => {
      const geojsonLayer = feature(topojson, topojson.objects[key]);

      // If it's a FeatureCollection, merge its features; otherwise, push the single feature.
      if (geojsonLayer.type === "FeatureCollection") {
        return features.concat(geojsonLayer.features);
      } else {
        features.push(geojsonLayer);
        return features;
      }
    }, [])

    buffer = JSON.stringify({
      type: "FeatureCollection",
      features: combinedFeatures
    })
  }

  path.resolve(`app/[map]/topojson/fallout.json`)
  path.resolve(`app/[map]/topojson/lancer.json`)
  path.resolve(`app/[map]/topojson/lancer_starwall.json`)

  const headers = new Headers()
  headers.append("Content-Disposition", `attachment; filename="${map}.${format}.json"`)
  headers.append("Content-Type", "application/json")
  return new Response(buffer, {
    headers,
  })
}
