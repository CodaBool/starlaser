'use client'
import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { geoPath, geoMercator, geoTransform } from 'd3-geo'
import { color, important, positionTooltip, bg, accent, ignoreList } from "./utils.js"
import { ZoomIn, ZoomOut } from "lucide-react"
import * as SVG from './svg.js'
import Map from 'react-map-gl/maplibre'
import maplibregl, {
  MapMouseEvent,
  LngLat,
} from 'maplibre-gl'
import mapStyle from './style.json'

let projection, svg, zoom, path, g, tile, mode = new Set([])

export function getIcon(d, create, simple) {
  const icon = SVG[d.properties.icon] || SVG[d.properties.type]
  if (simple) return typeof icon
  if (create) {
    if (icon) {
      return document.createElementNS(d3.namespaces.svg, 'g')
    } else {
      return document.createElementNS(d3.namespaces.svg, 'circle')
    }
  }
  return icon ? icon : null
}

export function panTo(d, width, height, e, customZoom) {
  mode.add("zooming")
  const [x, y] = path.centroid(d)
  const current = d3.zoomTransform(svg.node()).k
  if (current > 50 && d.geometry.type.includes("Poly")) {
    // clicked on faction when at max zooom, this likely was a mistake
    return [x, y]
  }
  const offsetX = (window.innerWidth - width) / 2
  const offsetY = (window.innerHeight - height) / 2
  const bounds = path.bounds(d);
  const topMostPoint = bounds[0][1] < bounds[1][1] ? bounds[0] : bounds[1];
  const bottomMostPoint = bounds[0][1] > bounds[1][1] ? bounds[0] : bounds[1];

  // Calculate the height of the object
  const yDifference = Math.abs(topMostPoint[1] - bottomMostPoint[1])

  // set max and min zoom levels, 500/dif is decent middle ground for large and small territories
  let scale = Math.min(Math.max(500 / yDifference, 1), current)
  if (customZoom) scale = customZoom

  const drawerOffset = window.innerHeight * 0.14 // best guess for drawer height
  const t = d3.zoomIdentity.translate(width / 2 + offsetX, height / 2 + offsetY - drawerOffset).scale(scale).translate(-x, -y)
  svg.transition().duration(400).call(zoom.transform, t)
  setTimeout(() => mode.delete("zooming"), 751)
  return [x, y]
}


const position = [47, 2]

const bounds = [
  [51.49, -0.08],
  [51.5, -0.06],
]

let dots, dots2



export default function MapComponent({ width, height, data, map, mobile, CENTER, SCALE }) {
  const mapRef = useRef(null)
  const svgRef = useRef(null)
  const [mount, setMount] = useState()



  useEffect(() => setMount(true), [])
  useEffect(() => {
    if (!mount || !mapRef?.current) return
    console.log("mounted")
    // svg = d3.select('.map')
    // g = d3.select('g')
    //
    projection = geoMercator()
    function projectPoint(lon, lat) {
      let point = mapRef.current.project(new maplibregl.LngLat(lon, lat));
      this.stream.point(point.x, point.y);
    }
    let transform = geoTransform({ point: projectPoint });
    path = geoPath().projection(transform);

    // maplibre way
    const map = mapRef.current.getCanvasContainer()
    const svg = d3
      .select(map)
      .append("svg")
      .attr("width", "100%")
      .attr("height", "100%")
      .style("position", "absolute")
      .style("z-index", 2)


    const territory = svg
      .selectAll('path')
      .data(data.territory)
      .enter().append('path')
      .attr('stroke-width', .836)
      .attr('fill', d => color("fallout", d.properties, "fill", d.geometry.type))
      .attr('stroke', d => color("fallout", d.properties, "stroke", d.geometry.type))

    const guide = svg
      .selectAll('.lines')
      .data(data.guide)
      .enter().append('path')
      .attr('class', 'guide')
      .attr('stroke-width', 2)
      .attr('fill', "none")
      .attr('stroke', d => color("fallout", d.properties, "stroke", d.geometry.type))


    const location = svg.selectAll("img")
      .data(data.location)
      .enter()
      .append("foreignObject")
      .html(d => getIcon(d))
      .attr("width", 20)
      .attr("height", 20)
      .attr('fill', d => color("fallout", d.properties, "fill", d.geometry.type))


    function render() {
      guide.attr("d", path)
      territory.attr("d", path)
      location
        .attr("x", d => path.centroid(d)[0])
        .attr("y", d => path.centroid(d)[1])
    }

    mapRef.current.on("viewreset", render)
    mapRef.current.on("move", render)
    mapRef.current.on("moveend", render)
    render()
  }, [mount])

  return (
    <Map
      initialViewState={{
        longitude: -100,
        latitude: 40,
        zoom: 3.5
      }}
      style={{ width, height }}
      ref={mapRef}
      mapStyle={mapStyle}
    />
  )
}
