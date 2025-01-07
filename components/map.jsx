'use client'
import * as d3 from 'd3'
import { geoPath, geoMercator } from 'd3-geo'
import { useEffect, useRef, useState } from 'react'
import { color, important, positionTooltip, DRAWER_OFFSET_PX, MENU_HEIGHT_PX } from "@/lib/utils.js"
import Tooltip from './tooltip'
import Sheet from './sheet'
import AutoResize from './autoresize'
import Hamburger from './hamburger'
import Toolbox from './toolbox'

let projection, svg, zoom, path, g, holdTimer, mode = new Set([])

export function panTo(d, width, height) {
  const [x, y] = path.centroid(d)
  const scale = d.geometry.type === "Point" ? 18 : 3
  const resizeOffsetX = (window.innerWidth - width) / 2
  const resizeOffsetY = (window.innerWidth - height) / 2
  console.log("moving to group", d.properties.name, Math.floor(width / 2 - x * scale + resizeOffsetX), Math.floor(height / 2 - y * scale - DRAWER_OFFSET_PX + resizeOffsetY))
  const transform = d3.zoomIdentity.translate(width / 2 - x * scale + resizeOffsetX, height / 2 - y * scale - DRAWER_OFFSET_PX + resizeOffsetY).scale(scale)
  svg.transition().duration(750).call(zoom.transform, transform)
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
    const locations = data.location.filter(p => {
      return Math.sqrt(
        Math.pow(p.geometry.coordinates[0] - d.geometry.coordinates[0], 2) +
        Math.pow(p.geometry.coordinates[1] - d.geometry.coordinates[1], 2)
      ) <= 1
    }).map(p => p.properties)
    setDrawerContent({ locations, coordinates: d.geometry.coordinates })
    setDrawerOpen(true)
    panTo(d, width, height)
  }

  function hover(e, { properties, geometry }) {
    const fill = geometry.type !== "LineString"
    const stroke = geometry.type !== "Point"
    if (e.type === "mouseover") {
      if (fill) d3.select(e.currentTarget).attr('fill', 'rgba(61, 150, 98, 0.5)')
      if (stroke) d3.select(e.currentTarget).attr('stroke', 'rgba(61, 150, 98, .7)')
      setTooltip(properties)
      positionTooltip(e)
    } else if (e.type === "mouseout") {
      if (fill) d3.select(e.currentTarget).attr('fill', color(map, properties, "fill", geometry.type))
      if (stroke) d3.select(e.currentTarget).attr('stroke', color(map, properties, "stroke", geometry.type))
      setTooltip()
      document.querySelector(".map-tooltip").style.visibility = "hidden"
    }
  }

  useEffect(() => {
    window.holdTimer
    svg = d3.select('.map')
    g = d3.select('g')
    projection = geoMercator().scale(SCALE).center(CENTER).translate([width / 2, height / 2])
    path = geoPath().projection(projection)
    svg.attr("style", "background: radial-gradient(#06402B 0%, #000000 100%)")

    // territory
    g.append('g')
      .selectAll('path')
      .data(data.territory)
      .enter().append('path')
      .attr('class', d => d.properties.unofficial ? 'unofficial territory' : 'territory')
      .attr('d', path)
      .attr('stroke-width', .5)
      .attr('fill', d => color(map, d.properties, "fill", d.geometry.type))
      .attr('stroke', d => color(map, d.properties, "stroke", d.geometry.type))
      .on("mouseover", hover)
      .on("click", (e, d) => {
        if (mode.has("measure") || (mode.has("crosshair") && mobile)) return
        const [x, y] = panTo(d, width, height)
        setDrawerContent({ locations: [d.properties], coordinates: projection.invert([x, y]) })
        setDrawerOpen(true)
      })
      .on("mouseout", hover)
      .on("mousemove", e => positionTooltip(e))

    // guide
    g.append('g')
      .selectAll('.lines')
      .data(data.guide)
      .enter().append('path')
      .attr('class', 'guide')
      .attr('d', path)
      .attr('stroke-width', .8)
      .attr('fill', "none")
      .attr('stroke', d => color(map, d.properties, "stroke", d.geometry.type))
      .on("mouseover", hover)
      .on("mouseout", hover)

    // location
    g.append('g')
      .selectAll('.point')
      .data(data.location)
      .enter()
      .append(d => important(map, d.properties) ? document.createElementNS(d3.namespaces.svg, 'rect') : document.createElementNS(d3.namespaces.svg, 'circle'))
      .attr('class', d => d.properties.unofficial ? 'unofficial location' : 'location')
      .attr('r', d => important(map, d.properties) ? null : .5)
      .attr('cx', d => important(map, d.properties) ? null : projection(d.geometry.coordinates)[0])
      .attr('cy', d => important(map, d.properties) ? null : projection(d.geometry.coordinates)[1])
      .attr('x', d => important(map, d.properties) ? projection(d.geometry.coordinates)[0] : null)
      .attr('y', d => important(map, d.properties) ? projection(d.geometry.coordinates)[1] : null)
      .attr('width', d => important(map, d.properties) ? 5 : null)
      .attr('height', d => important(map, d.properties) ? 5 : null)
      .attr('fill', d => color(map, d.properties, "fill", d.geometry.type))
      // .attr('stroke', d => color(map, d.properties, "stroke"))
      .on("click", (e, d) => handlePointClick(e, d))
      .on("mouseover", hover)
      .on("mouseout", hover)

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

    // location label
    g.append('g')
      .selectAll('.point-label')
      .data(data.location)
      .enter().append('text')
      .attr('class', d => d.properties.unofficial ? 'unofficial location-label' : 'official location-label')
      .attr('x', d => projection(d.geometry.coordinates)[0])
      .attr('y', d => projection(d.geometry.coordinates)[1] + (important(map, d.properties) ? 10 : 5))
      .text(d => !d.properties.crowded ? d.properties.name : '')
      .style('font-size', d => important(map, d.properties) ? '4px' : '2px')
      .style('font-weight', d => important(map, d.properties) && 600)
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





    zoom = d3.zoom()
      // .scaleExtent([1, 8])
      // .translateExtent([[-2800, 2000], [2000, 2000]])
      .on('zoom', e => {
        g.attr('transform', e.transform)

        // prevents measure dot from being moved on pan for both mobile and desktop
        if (mode.add("measureStart")) {
          mode.delete("measureStart")
        }

        d3.selectAll('.crosshair').style("visibility", "hidden")

        // TODO: prevents measure dot from being moved on pan for both mobile and desktop
        // if (holdTimer) clearTimeout(holdTimer)
        g.selectAll('.location').style('r', d => {
          if (important(map, d.properties)) return
          if (e.transform.k < 1) return 3
          if (e.transform.k < 3) return 1.5
          if (e.transform.k < 15) return 1
          return .6
        })
        g.selectAll('.location-label').style('opacity', d => {
          if (e.transform.k < 1) return important(map, d.properties) ? 1 : 0
          return 1
        })
        g.selectAll('.territory').style('stroke-width', () => e.transform.k < 4 ? .5 : .1)
        g.selectAll('.guide').style('stroke-width', () => e.transform.k < 4 ? 1 : .3)
        g.selectAll('.point').style('r', () => e.transform.k < 4 ? 5 : 1)
        g.selectAll('.location-label').style('font-size', d => {
          if (e.transform.k < 1) return important(map, d.properties) ? '10px' : '8px'
          if (e.transform.k < 3) return important(map, d.properties) ? '8px' : '6px'
          if (e.transform.k < 15) return important(map, d.properties) ? '6px' : '4px'
          return important(map, d.properties) ? '4px' : '2px'
        })

      })
      .on("start", () => {
        svg.style("cursor", "grabbing")
        document.querySelector(".map-tooltip").style.visibility = "hidden"
        d3.selectAll('.crosshair').style("visibility", "hidden")
      })
      .on("end", () => svg.style("cursor", "grab"))


    svg.call(zoom)
    setMount(true)
  }, [])

  return (
    <>
      <Hamburger mode={mode} />
      <Tooltip {...tooltip} />
      <AutoResize svg={svg} zoom={zoom} projection={projection} mobile={mobile} width={width} height={height} setTooltip={setTooltip} positionTooltip={positionTooltip} center={CENTER} />
      <Sheet {...drawerContent} setDrawerOpen={setDrawerOpen} drawerOpen={drawerOpen} map={map} />
      <svg width={width} height={height} className='map select-none' ref={svgRef}>
        <g>
          {mount && <Toolbox mode={mode} svg={svg} svgRef={svgRef} width={width} height={height} projection={projection} mobile={mobile} map={map} />}
        </g>
      </svg>
    </>
  )
}
