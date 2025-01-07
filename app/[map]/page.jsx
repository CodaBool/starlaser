export const dynamic = 'force-static'
import fs from "fs"
import path from "path"
import { feature } from 'topojson-client'
import Cartographer from "@/components/cartographer"


export default async function mapLobby({ params }) {
  const dataDir = path.join(process.cwd(), "/app", "[map]", "topojson");
  const { map } = await params
  const filePath = path.join(dataDir, `${map}.json`)
  if (map === "favicon.ico") return
  if (map === "lancer") return
  const content = await fs.promises.readFile(filePath, 'utf8');
  // const content = fs.readFileSync(filePath, 'utf-8')
  const topojson = JSON.parse(content)

  // TODO: the layer name here will be different for each map
  const layers = Object.keys(topojson.objects)
  const layerObjects = layers.reduce((acc, layer) => {
    acc[layer] = feature(topojson, topojson.objects[layer]).features
    return acc
  }, {})
  return <Cartographer data={layerObjects} map={map} />
}

export async function generateStaticParams() {
  const dataDir = path.join(process.cwd(), "/app", "[map]", "topojson");
  const folders = fs.readdirSync(dataDir).filter(f => fs.statSync(path.join(dataDir, f)))
  return folders.map(folder => ({ slug: folder }))
}
