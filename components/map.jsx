'use client'
import * as d3 from 'd3'
import maplibregl, {
  MapMouseEvent,
  LngLat,
} from 'maplibre-gl'
import { useMap } from 'react-map-gl/maplibre'
import { geoPath, geoMercator, geoTransform } from 'd3-geo'
import { useEffect, useRef, useState } from 'react'
import { color, important, positionTooltip, bg, accent, ignoreList } from "@/lib/utils.js"
import { ZoomIn, ZoomOut } from "lucide-react"
import Tooltip from './tooltip'
import Sheet from './sheet'
import AutoResize from './autoresize'
import Hamburger from './hamburger'
import Toolbox from './toolbox'
import * as SVG from './svg.js'
import turfCentroid from '@turf/centroid'
import * as turf from '@turf/turf'
import * as turfHelper from "@turf/helpers"

let projection, svg, zoom, path, g, tooling, mode = new Set([])

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

export function panTo(d, width, height, e, customZoom, map) {
  mode.add("zooming")
  let geometry = d.geometry
  if (d.geometry.type === "LineString") {
    const polygon = turfHelper.lineString(d.geometry.coordinates)
    geometry = turf.center(polygon).geometry
  } else if (d.geometry.type.includes("Poly")) {
    const polygon = turfHelper.multiPolygon([d.geometry.coordinates])
    geometry = turf.center(polygon).geometry
  }
  const [x, y] = geometry.coordinates
  const current = map.getZoom()
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

  const longitude = d.geometry.coordinates.length === 2 ? d.geometry.coordinates[0] : x
  const latitude = d.geometry.coordinates.length === 2 ? d.geometry.coordinates[1] : y
  map.flyTo({ center: [longitude, latitude], duration: 400 })
  setTimeout(() => mode.delete("zooming"), 751)
  return [longitude, latitude]
}

export default function Map({ width, height, data, name, mobile, CENTER, SCALE }) {
  const { map } = useMap()
  const [tooltip, setTooltip] = useState()
  const [drawerOpen, setDrawerOpen] = useState()
  const [drawerContent, setDrawerContent] = useState()

  function handlePointClick(e, d) {
    if (mode.has("measure") || (mode.has("crosshair") && mobile)) return
    // add nearby locations to drawer
    if (document.querySelector(".click-circle")) {
      document.querySelector(".click-circle").remove()
    }
    let selectionRadius = 31
    if (map.getZoom() > 30) {
      selectionRadius = 4
    }

    const locationsUnsorted = data.location.filter(p => {
      let cutoff = 1.17
      if (map.getZoom() > 30) cutoff = 0.15
      return Math.sqrt(
        Math.pow(p.geometry.coordinates[0] - d.geometry.coordinates[0], 2) +
        Math.pow(p.geometry.coordinates[1] - d.geometry.coordinates[1], 2)
      ) <= cutoff
    })

    let point = map.project(new maplibregl.LngLat(d.geometry.coordinates[0], d.geometry.coordinates[1]))

    tooling = svg.append("circle")
      .attr("cx", point.x)
      .attr("cy", point.y)
      .attr("r", selectionRadius)
      .attr("lng", d.geometry.coordinates[0])
      .attr("lat", d.geometry.coordinates[1])
      .attr('fill', accent(name, 0.1))
      .attr('stroke', accent(name, 0.15))
      .attr("class", "click-circle")

    const locations = locationsUnsorted.sort((a, b) => a.properties.name.localeCompare(b.properties.name))
    setDrawerContent({ locations, coordinates: d.geometry.coordinates, selected: d.properties.name })
    setDrawerOpen(true)
    panTo(d, width, height, null, null, map)
  }

  function hover(e, { properties, geometry }) {
    const guide = geometry.type === "LineString"
    const location = geometry.type === "Point"
    const territory = geometry.type?.includes("Poly")
    if (e.type === "mouseover") {
      setTooltip(properties)
      positionTooltip(e)
      if (ignoreList[name].includes(properties.type)) return
      // if (territory) d3.select(e.currentTarget).attr('fill', accent(name, 0.01))
      if (location) d3.select(e.currentTarget).attr('fill', accent(name, 1))
      if (guide || territory) d3.select(e.currentTarget).attr('stroke', accent(name, 0.2))
      if (location || guide) d3.select(e.currentTarget).style('cursor', 'crosshair')
    } else if (e.type === "mouseout") {
      if (!guide) d3.select(e.currentTarget).attr('fill', color(name, properties, "fill", geometry.type))
      if (!location) d3.select(e.currentTarget).attr('stroke', color(name, properties, "stroke", geometry.type))
      setTooltip()
      document.querySelector(".map-tooltip").style.visibility = "hidden"
    }
  }

  useEffect(() => {
    if (!map) return
    if (svg) svg.remove()

    // using replace
    projection = geoMercator()
    function projectPoint(lon, lat) {
      let point = map.project(new maplibregl.LngLat(lon, lat))
      this.stream.point(point.x, point.y)
    }
    let transform = geoTransform({ point: projectPoint })
    path = geoPath().projection(transform)
    // svg.attr("style", `background: radial-gradient(${bg[map]})`)

    if (name === "lancer") {
      for (let i = 0; i < height * width / 10000; i++) {
        svg.append('circle')
          .attr('class', 'background')
          .attr('cx', Math.random() * width)
          .attr('cy', Math.random() * height)
          .attr('r', Math.random() * 2)
          .style('fill', `rgba(255, 255, 255, ${Math.random() / 3})`)
      }
    }

    svg = d3
      .select(map.getCanvasContainer())
      .append("svg")
      .attr("width", "100%")
      .attr("height", "100%")
      .style("position", "absolute")
      .style("z-index", 2)

    const territory = svg
      .selectAll('path')
      .data(data.territory)
      .enter().append('path')
      .attr('class', d => `${d.properties.unofficial ? 'unofficial territory' : 'territory'} ${(d.properties.type === "faction" || d.properties.type === "region") ? 'raise' : ''}`)
      .attr('stroke-width', 2.5)
      .attr('fill', d => color(name, d.properties, "fill", d.geometry.type))
      .attr('stroke', d => color(name, d.properties, "stroke", d.geometry.type))
      .on("mouseover", hover)
      .on("click", (e, d) => {
        if (mode.has("measure") || (mode.has("crosshair") && mobile) || (d.properties.type !== "region" && d.properties.type !== "faction")) return
        const coordinates = panTo(d, width, height, e, null, map)
        setDrawerContent({ locations: [d], coordinates, selected: d.properties.name })
        setDrawerOpen(true)
      })
      .on("mouseout", hover)
      .on("mousemove", e => positionTooltip(e))

    // territory labels
    // g.append('g')
    //   .selectAll('.territory-label')
    //   .data(data.territory)
    //   .enter().append('text')
    //   .attr('class', d => d.properties.unofficial ? 'unofficial territory-label' : 'territory-label')
    //   .attr('x', d => path.centroid(d)[0])
    //   .attr('y', d => path.centroid(d)[1])
    //   .attr('dy', '.35em')
    //   .text(d => d.properties.name)
    //   .style('font-size', '5px')
    //   .style('fill', 'white')
    //   .style('text-anchor', 'middle')
    //   .style('pointer-events', 'none')


    const guide = svg
      .selectAll('.lines')
      .data(data.guide || [])
      .enter().append('path')
      .attr('class', 'guide')
      .attr('stroke-width', 3)
      .attr('fill', "none")
      .attr('stroke', d => color(name, d.properties, "stroke", d.geometry.type))
      .on("mouseover", hover)
      .on("click", (e, d) => {
        if (mode.has("measure") || (mode.has("crosshair") && mobile)) return
        const coordinates = panTo(d, width, height, e, null, map)
        setDrawerContent({ locations: [d], coordinates, selected: d.properties.name })
        setDrawerOpen(true)
      })
      .on("mouseout", hover)

    // guide labels
    // g.selectAll('.guide-label')
    //   .data(data.guide)
    //   .enter().append('text')
    //   .attr('class', 'guide-label guide')
    //   .attr('x', d => {
    //     const centroid = path.centroid(d);
    //     const bounds = path.bounds(d);
    //     const topMostPoint = bounds[0][1] < bounds[1][1] ? bounds[0] : bounds[1];
    //     const radius = Math.sqrt(
    //       Math.pow(topMostPoint[0] - centroid[0], 2) +
    //       Math.pow(topMostPoint[1] - centroid[1], 2)
    //     )
    //     const offsetX = 20
    //     return centroid[0] + offsetX + (radius / 5);
    //   })
    //   .attr('y', d => {
    //     const bounds = path.bounds(d);
    //     const topMostPoint = bounds[0][1] < bounds[1][1] ? bounds[0] : bounds[1]
    //     return topMostPoint[1] + 35;
    //   })
    //   .text(d => d.properties.name)
    //   .style('font-size', '.7em')
    //   .style('fill', 'white')
    //   .style('pointer-events', 'none')

    const location = svg.selectAll("img")
      .data(data.location)
      .enter()
      .append("foreignObject")
      .html(d => getIcon(d))
      .attr("width", 20)
      .attr("height", 20)
      .attr('fill', d => color(name, d.properties, "fill", d.geometry.type))
      .attr("pointer-events", "bounding-box")
      .attr('class', d => d.properties.unofficial === "unofficial" ? 'unofficial location' : 'location')
      .on('click', (event, d) => handlePointClick(event, d))
      .on('mouseover', hover)
      .on('mouseout', hover)

    // const locationLabel = g.append('g')
    //   .selectAll('.location-label')
    //   .data(data.location)
    //   .enter().append('text')
    //   .attr('class', d => d.properties.unofficial ? 'unofficial location-label' : 'official location-label')
    //   .attr('x', d => projection(d.geometry.coordinates)[0])
    //   .attr('y', d => projection(d.geometry.coordinates)[1] + 13.375)
    //   // .attr('y', d => projection(d.geometry.coordinates)[1] + (important(map, d.properties) ? 11 : 9))
    //   .text(d => d.properties.name)
    //   .style('font-size', d => important(map, d.properties) ? '10.85px' : '8.35px')
    //   .style('font-weight', d => important(map, d.properties) && 600)
    //   .style('opacity', d => (important(map, d.properties) && !d.properties.crowded) ? 1 : 0)
    //   .style('text-anchor', 'middle')
    //   .style('fill', 'white')
    //   .style('pointer-events', 'none')


    // g.append('g')
    //   .selectAll('.guide-label')
    //   .data(data.guide)
    //   .enter().append('text')
    //   .attr('class', d => d.properties.unofficial ? 'unofficial guide-label' : 'official guide-label')
    //   // .attr('x', d => {
    //   //   const centroid = path.centroid(d);
    //   //   const bounds = path.bounds(d);
    //   //   const topMostPoint = bounds[0][1] < bounds[1][1] ? bounds[0] : bounds[1];
    //   //   const radius = Math.sqrt(
    //   //     Math.pow(topMostPoint[0] - centroid[0], 2) +
    //   //     Math.pow(topMostPoint[1] - centroid[1], 2)
    //   //   )
    //   //   const offsetX = 0
    //   //   return centroid[0] + offsetX + (radius / 5);
    //   // })
    //   // .attr('y', d => {
    //   //   const bounds = path.bounds(d);
    //   //   const topMostPoint = bounds[0][1] < bounds[1][1] ? bounds[0] : bounds[1]
    //   //   return topMostPoint[1] + 35;
    //   // })
    //   .text(d => d.properties.name)
    //   .style('font-size', '.1em')
    //   .style('fill', 'white')
    //   .style('pointer-events', 'none')

    const radiusScale = d3.scalePow()
      .exponent(.01) // Adjust the exponent to control the rate of change
      .domain([.8, 500]) // Input domain: zoom levels
      .range([3.5, 0.2]) // Output range: radius values

    function render() {
      // prevents measure dot from being moved on pan for both mobile and desktop
      if (mode.has("measureStart")) {
        mode.delete("measureStart")
      } else if (mode.has("crosshairZoom")) {
        mode.delete("crosshairZoom")
      }
      guide.attr("d", path)
      territory.attr("d", path)
      location
        .attr("x", d => path.centroid(d)[0])
        .attr("y", d => path.centroid(d)[1])
      if (svg.select(".click-circle").node()) {
        const cir = svg.select(".click-circle")
        let { x, y } = map.project(new maplibregl.LngLat(cir.attr("lng"), cir.attr("lat")))
        svg.select(".click-circle").attr("cx", x).attr("cy", y)
      }
    }

    map.on("viewreset", render)
    map.on("move", render)
    map.on("moveend", render)
    render()
    return () => {
      map.off("viewreset", render)
      map.off("move", render)
      map.off("moveend", render)
    }

    // const zoom = d3.zoom()
    //   .on("zoom", ({ transform }) => {
    //     g.attr('transform', transform)

    //     const tiles = tile(transform);

    //     image = image.data(tiles, d => d).join("image")
    //       .attr("xlink:href", d => url(...d))
    //       .attr("x", ([x]) => (x + tiles.translate[0]) * tiles.scale)
    //       .attr("y", ([, y]) => (y + tiles.translate[1]) * tiles.scale)
    //       .attr("width", tiles.scale)
    //       .attr("height", tiles.scale);

    //     projection
    //       .scale(transform.k / (2 * Math.PI))
    //       .translate([transform.x, transform.y])

    //     // if (mode.has("measureStart")) {
    //     //   mode.delete("measureStart")
    //     // } else if (mode.has("crosshairZoom")) {
    //     //   mode.delete("crosshairZoom")
    //     // }

    //     // const s = radiusScale(transform.k)
    //     // guide.attr('stroke-width', () => s / 2)
    //     // territory.attr('stroke-width', () => s / 4)
    //     // location.attr('r', d => {
    //     //   if (important(map, d.properties)) return
    //     //   return s
    //     // })
    //     // location.attr('width', d => {
    //     //   if (!important(map, d.properties)) return
    //     //   return s + .3
    //     // })
    //     // location.attr('height', d => {
    //     //   if (!important(map, d.properties)) return
    //     //   return s + .3
    //     // })
    //     // location.attr('transform', d => {
    //     //   if (getIcon(d, null, true) === "undefined") return
    //     //   return `
    //     //     translate(${projection(d.geometry.coordinates)[0]}, ${projection(d.geometry.coordinates)[1]})
    //     //     scale(${s / 10})
    //     //     translate(-8, -8)
    //     //   `
    //     // })
    //     // locationLabel.style('opacity', d => {
    //     //   if (transform.k > 50) {
    //     //     return 1
    //     //   } else {
    //     //     if (d.properties.crowded) return 0
    //     //   }
    //     //   if (transform.k < 1.6) return important(map, d.properties) ? 1 : 0
    //     //   return 1
    //     // })
    //     // // territory.style('stroke-width', () => s / 5)
    //     // // guide.style('stroke-width', () => s / 3)
    //     // locationLabel.style('font-size', d => {
    //     //   if (transform.k > 50) {
    //     //     return `${s * 1.5}px`
    //     //   } else {
    //     //     return `${s + (important(map, d.properties) ? 2 : 0)}px`
    //     //   }
    //     // })
    //     // locationLabel.attr('y', d => (
    //     //   projection(d.geometry.coordinates)[1] + (s * (important(map, d.properties) ? 4 : 2.5))
    //     // ))
    //     // image.lower();
    //   })
    //   .on("start", () => {
    //     svg.style("cursor", "grabbing")
    //     document.querySelector(".map-tooltip").style.visibility = "hidden"
    //     d3.selectAll('.crosshair').style("visibility", "hidden")
    //     if (!mode.has("zooming")) setDrawerOpen(false)
    //   })
    //   .on("end", () => svg.style("cursor", "grab"))

    // // svg.call(zoom)
    // svg.call(zoom.transform, d3.zoomIdentity
    //   .translate(width / 2, height / 2)
    //   .scale(-4096)
    //   .translate(...projection([-98 - 35 / 60, 39 + 50 / 60]))
    //   .scale(-1))




    // zoom = d3.zoom()
    //   .scaleExtent([.8, 500])
    //   // .translateExtent([[-2800, 2000], [2000, 2000]])
    //   .on('zoom', ({ transform }) => {
    //     g.attr('transform', transform)

    //     // svg.interrupt()
    //     // prevents measure dot from being moved on pan for both mobile and desktop
    //     if (mode.has("measureStart")) {
    //       mode.delete("measureStart")
    //     } else if (mode.has("crosshairZoom")) {
    //       mode.delete("crosshairZoom")
    //     }

    //     const s = radiusScale(transform.k)
    //     guide.attr('stroke-width', () => s / 2)
    //     territory.attr('stroke-width', () => s / 4)
    //     location.attr('r', d => {
    //       if (important(map, d.properties)) return
    //       return s
    //     })
    //     location.attr('width', d => {
    //       if (!important(map, d.properties)) return
    //       return s + .3
    //     })
    //     location.attr('height', d => {
    //       if (!important(map, d.properties)) return
    //       return s + .3
    //     })
    //     location.attr('transform', d => {
    //       if (getIcon(d, null, true) === "undefined") return
    //       return `
    //         translate(${projection(d.geometry.coordinates)[0]}, ${projection(d.geometry.coordinates)[1]})
    //         scale(${s / 10})
    //         translate(-8, -8)
    //       `
    //     })
    //     locationLabel.style('opacity', d => {
    //       if (transform.k > 50) {
    //         return 1
    //       } else {
    //         if (d.properties.crowded) return 0
    //       }
    //       if (transform.k < 1.6) return important(map, d.properties) ? 1 : 0
    //       return 1
    //     })
    //     // territory.style('stroke-width', () => s / 5)
    //     // guide.style('stroke-width', () => s / 3)
    //     locationLabel.style('font-size', d => {
    //       if (transform.k > 50) {
    //         return `${s * 1.5}px`
    //       } else {
    //         return `${s + (important(map, d.properties) ? 2 : 0)}px`
    //       }
    //     })
    //     locationLabel.attr('y', d => (
    //       projection(d.geometry.coordinates)[1] + (s * (important(map, d.properties) ? 4 : 2.5))
    //     ))
    //     // tileGroup.lower();
    //   })
    //   .on("start", () => {
    //     svg.style("cursor", "grabbing")
    //     document.querySelector(".map-tooltip").style.visibility = "hidden"
    //     d3.selectAll('.crosshair').style("visibility", "hidden")
    //     if (!mode.has("zooming")) setDrawerOpen(false)
    //   })
    //   .on("end", () => svg.style("cursor", "grab"))

    // svg.call(zoom)
    // bring some territories to the front
    // d3.selectAll(".raise").raise()
  }, [map])

  return (
    <>
      <Hamburger mode={mode} />
      <Tooltip {...tooltip} />
      {mobile &&
        <div className="absolute mt-28 ml-12 mr-[.3em] cursor-pointer z-10 bg-[rgba(0,0,0,.3)] rounded-xl zoom-controls" >
          <ZoomIn size={34} onClick={() => map.zoomIn()} className='m-2 hover:stroke-blue-200' />
          <ZoomOut size={34} onClick={() => map.zoomOut()} className='m-2 mt-4 hover:stroke-blue-200' />
        </div>
      }
      <AutoResize svg={svg} zoom={zoom} projection={projection} mobile={mobile} width={width} height={height} setTooltip={setTooltip} positionTooltip={positionTooltip} center={CENTER} />
      <Sheet {...drawerContent} setDrawerOpen={setDrawerOpen} drawerOpen={drawerOpen} name={name} width={width} height={height} />
      <Toolbox mode={mode} svg={svg} width={width} height={height} projection={projection} mobile={mobile} name={name} />
    </>
  )
}
