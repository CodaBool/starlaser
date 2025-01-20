'use client'
import * as d3 from 'd3'
import { geoPath, geoMercator } from 'd3-geo'
import { useEffect, useRef, useState } from 'react'
import { color, important, positionTooltip } from "@/lib/utils.js"
import Tooltip from './tooltip'
import Sheet from './sheet'
import AutoResize from './autoresize'
import Hamburger from './hamburger'
import Toolbox from './toolbox'
import * as SVG from './svg.js'

let projection, svg, zoom, path, g, mode = new Set([])

function getIcon(d, create, simple) {
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

export default function Map({ width, height, data, map, mobile, CENTER, SCALE }) {
  const [tooltip, setTooltip] = useState()
  const [drawerOpen, setDrawerOpen] = useState()
  const [drawerContent, setDrawerContent] = useState()
  const [mount, setMount] = useState()
  const svgRef = useRef(null)

  function handlePointClick(e, d) {
    if (mode.has("measure") || (mode.has("crosshair") && mobile)) return
    // add nearby locations to drawer
    if (document.querySelector(".click-circle")) {
      document.querySelector(".click-circle").remove()
    }
    const zoomLevel = d3.zoomTransform(svg.node()).k
    let selectionRadius = 31
    if (zoomLevel > 30) {
      selectionRadius = 4
    }

    const locationsUnsorted = data.location.filter(p => {
      let cutoff = 1.17
      if (zoomLevel > 30) cutoff = 0.15
      return Math.sqrt(
        Math.pow(p.geometry.coordinates[0] - d.geometry.coordinates[0], 2) +
        Math.pow(p.geometry.coordinates[1] - d.geometry.coordinates[1], 2)
      ) <= cutoff
    })
    g.append('circle')
      .attr('cx', projection(d.geometry.coordinates)[0])
      .attr('cy', projection(d.geometry.coordinates)[1])
      .attr('r', selectionRadius)
      .attr("class", "click-circle")
      .attr('stroke', 'rgba(255, 165, 0, .3)')
      .attr('stroke-width', .2)
      .attr('fill', 'rgba(255, 165, 0, .1)')
      .style('pointer-events', 'none')

    const locations = locationsUnsorted.sort((a, b) => a.properties.name.localeCompare(b.properties.name))
    setDrawerContent({ locations, coordinates: d.geometry.coordinates, selected: d.properties.name })
    setDrawerOpen(true)
    panTo(d, width, height)
  }

  function hover(e, { properties, geometry }) {
    const guide = geometry.type === "LineString"
    const location = geometry.type === "Point"
    const territory = geometry.type.includes("Poly")
    const faction = territory && (properties.type === "region" || properties.type === "faction")
    if (e.type === "mouseover") {
      if (faction || location) d3.select(e.currentTarget).attr('fill', 'orange')
      if (guide) d3.select(e.currentTarget).attr('stroke', 'orange')
      if (location || guide) d3.select(e.currentTarget).style('cursor', 'crosshair')
      setTooltip(properties)
      positionTooltip(e)
    } else if (e.type === "mouseout") {
      if (!guide) d3.select(e.currentTarget).attr('fill', color(map, properties, "fill", geometry.type))
      if (!location) d3.select(e.currentTarget).attr('stroke', color(map, properties, "stroke", geometry.type))
      setTooltip()
      document.querySelector(".map-tooltip").style.visibility = "hidden"
    }
  }

  useEffect(() => {
    svg = d3.select('.map')
    g = d3.select('g')
    projection = geoMercator().scale(SCALE).center(CENTER).translate([width / 2, height / 2])
    path = geoPath().projection(projection)
    svg.attr("style", "background: radial-gradient(#06402B 0%, #000000 100%)")

    const territory = g.append('g')
      .selectAll('path')
      .data(data.territory)
      .enter().append('path')
      .attr('class', d => `${d.properties.unofficial ? 'unofficial territory' : 'territory'} ${(d.properties.type === "faction" || d.properties.type === "region") ? 'raise' : ''}`)
      .attr('d', path)
      .attr('stroke-width', .836)
      .attr('fill', d => color(map, d.properties, "fill", d.geometry.type))
      .attr('stroke', d => color(map, d.properties, "stroke", d.geometry.type))
      .attr('opacity', d => (d.properties.type === "faction" || d.properties.type === "region") ? .1 : 1)
      .on("mouseover", hover)
      .on("click", (e, d) => {
        if (mode.has("measure") || (mode.has("crosshair") && mobile) || (d.properties.type !== "region" && d.properties.type !== "faction")) return
        const [x, y] = panTo(d, width, height, e)
        setDrawerContent({ locations: [d], coordinates: projection.invert([x, y]), selected: d.properties.name })
        setDrawerOpen(true)
      })
      .on("mouseout", hover)
      .on("mousemove", e => positionTooltip(e))

    const guide = g.append('g')
      .selectAll('.lines')
      .data(data.guide)
      .enter().append('path')
      .attr('class', 'guide')
      .attr('d', path)
      .attr('stroke-width', 1.67)
      .attr('fill', "none")
      .attr('stroke', d => color(map, d.properties, "stroke", d.geometry.type))
      .on("mouseover", hover)
      .on("click", (e, d) => {
        if (mode.has("measure") || (mode.has("crosshair") && mobile)) return
        const [x, y] = panTo(d, width, height, e)
        setDrawerContent({ locations: [d], coordinates: projection.invert([x, y]), selected: d.properties.name })
        setDrawerOpen(true)
      })
      .on("mouseout", hover)

    const location = g.append('g')
      .selectAll('.point')
      .data(data.location)
      .enter().append(d => getIcon(d, true))
      .attr('r', 3.3)
      .attr('cx', d => projection(d.geometry.coordinates)[0])
      .attr('cy', d => projection(d.geometry.coordinates)[1])
      .attr('transform', d => {
        if (getIcon(d, null, true) === "undefined") return
        return `translate(${projection(d.geometry.coordinates)[0]}, ${projection(d.geometry.coordinates)[1]}) scale(0.3)`
      })
      .attr('fill', d => color(map, d.properties, "fill", d.geometry.type))
      .attr('class', d => d.properties.unofficial === "unofficial" ? 'unofficial location' : 'location')
      .html(d => {
        if (getIcon(d, null, true) === "undefined") return
        return getIcon(d)
      })
      .on('click', (event, d) => handlePointClick(event, d))
      .on('mouseover', hover)
      .on('mouseout', hover);

    // territory labels
    // g.append('g')
    //   .selectAll('.group-label')
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
    // .style('pointer-events', 'none')

    const locationLabel = g.append('g')
      .selectAll('.point-label')
      .data(data.location)
      .enter().append('text')
      .attr('class', d => d.properties.unofficial ? 'unofficial location-label' : 'official location-label')
      .attr('x', d => projection(d.geometry.coordinates)[0])
      .attr('y', d => projection(d.geometry.coordinates)[1] + 13.375)
      // .attr('y', d => projection(d.geometry.coordinates)[1] + (important(map, d.properties) ? 11 : 9))
      .text(d => d.properties.name)
      .style('font-size', d => important(map, d.properties) ? '10.85px' : '8.35px')
      .style('font-weight', d => important(map, d.properties) && 600)
      .style('opacity', d => (important(map, d.properties) && !d.properties.crowded) ? 1 : 0)
      .style('text-anchor', 'middle')
      .style('fill', 'white')
      .style('pointer-events', 'none')
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
      .domain([.8, 80]) // Input domain: zoom levels
      .range([3.5, 0.2]); // Output range: radius values

    zoom = d3.zoom()
      .scaleExtent([.8, 80])
      // .translateExtent([[-2800, 2000], [2000, 2000]])
      .on('zoom', e => {
        g.attr('transform', e.transform)
        // svg.interrupt()
        // prevents measure dot from being moved on pan for both mobile and desktop
        if (mode.has("measureStart")) {
          mode.delete("measureStart")
        } else if (mode.has("crosshairZoom")) {
          mode.delete("crosshairZoom")
        }

        const s = radiusScale(e.transform.k)
        guide.attr('stroke-width', () => s / 2)
        territory.attr('stroke-width', () => s / 4)
        location.attr('r', d => {
          if (important(map, d.properties)) return
          return s
        })
        location.attr('width', d => {
          if (!important(map, d.properties)) return
          return s + .3
        })
        location.attr('height', d => {
          if (!important(map, d.properties)) return
          return s + .3
        })
        location.attr('transform', d => {
          if (getIcon(d, null, true) === "undefined") return
          return `
            translate(${projection(d.geometry.coordinates)[0]}, ${projection(d.geometry.coordinates)[1]})
            scale(${s / 10})
            translate(-8, -8)
          `
        })
        locationLabel.style('opacity', d => {
          if (e.transform.k > 50) {
            return 1
          } else {
            if (d.properties.crowded) return 0
          }
          if (e.transform.k < 1.6) return important(map, d.properties) ? 1 : 0
          return 1
        })
        // territory.style('stroke-width', () => s / 5)
        // guide.style('stroke-width', () => s / 3)
        locationLabel.style('font-size', d => {
          if (e.transform.k > 50) {
            return `${s * 1.5}px`
          } else {
            return `${s + (important(map, d.properties) ? 2 : 0)}px`
          }
        })
        locationLabel.attr('y', d => (
          projection(d.geometry.coordinates)[1] + (s * (important(map, d.properties) ? 4 : 2.5))
        ))
      })
      .on("start", () => {
        svg.style("cursor", "grabbing")
        document.querySelector(".map-tooltip").style.visibility = "hidden"
        d3.selectAll('.crosshair').style("visibility", "hidden")
        if (!mode.has("zooming")) setDrawerOpen(false)
      })
      .on("end", () => svg.style("cursor", "grab"))


    svg.call(zoom)
    setMount(true)
    // bring some territories to the front
    d3.selectAll(".raise").raise()
  }, [])

  return (
    <>
      <Hamburger mode={mode} />
      <Tooltip {...tooltip} />
      <AutoResize svg={svg} zoom={zoom} projection={projection} mobile={mobile} width={width} height={height} setTooltip={setTooltip} positionTooltip={positionTooltip} center={CENTER} />
      <Sheet {...drawerContent} setDrawerOpen={setDrawerOpen} drawerOpen={drawerOpen} map={map} width={width} height={height} />
      <svg width={width} height={height} className='map select-none' ref={svgRef}>
        <g>
          {mount && <Toolbox mode={mode} svg={svg} svgRef={svgRef} width={width} height={height} projection={projection} mobile={mobile} map={map} />}
        </g>
      </svg>
    </>
  )
}
