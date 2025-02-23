import { readFile } from "fs/promises"
import path from "path"

export async function GET(req, { params }) {
  const dataDir = path.join(process.cwd(), "/app", "[map]", "topojson")
  const { map } = await params
  const filePath = path.join(dataDir, `${map}.json`)
  const buffer = await readFile(filePath)
  const headers = new Headers()
  headers.append("Content-Disposition", `attachment; filename="${map}.topo.json"`)
  headers.append("Content-Type", "application/json")
  return new Response(buffer, {
    headers,
  })
}
