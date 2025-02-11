
import { useEffect } from "react"
import * as d3 from 'd3'
import { pointer, zoomTransform, geoDistance, select, selectAll } from 'd3'
import { useMap } from 'react-map-gl/maplibre'
import { geoPath, geoMercator, geoTransform } from 'd3-geo'
import distance from '@turf/distance'
import { point as turfPoint } from '@turf/helpers'
import maplibregl, {
  MapMouseEvent,
  LngLat,
} from 'maplibre-gl'

let point

export default function Toolbox({ mode, g, width, height, mobile, svgRef, name }) {
  const { map } = useMap()

  useEffect(() => {
    if (!map) return
    // console.log(map)
    const projection = geoMercator()
    function projectPoint(lon, lat) {
      let point = map.project(new maplibregl.LngLat(lon, lat))
      this.stream.point(point.x, point.y)
    }
    const transform = geoTransform({ point: projectPoint })
    const path = geoPath().projection(transform)

    const pointRef = document.querySelector(".point-click")
    const lineRef = document.querySelector(".line-click")

    const svg = d3
      .select(map.getCanvasContainer())
      .append("svg")
      .attr("width", "100%")
      .attr("height", "100%")
      .style("position", "absolute")
      .style("z-index", 3)
      .attr('pointer-events', 'none')

    point = svg
      .append("circle")
      .attr('class', 'point-click')
      .attr('r', 4)
      .attr('fill', 'orange')
      .style("visibility", "hidden")
      .attr('pointer-events', 'none')
    const line = svg
      .append("line")
      .attr('class', 'line-click')
      .attr('stroke', 'orange')
      // .attr('stroke-dasharray', "5,5")
      .style("visibility", "hidden")
      .attr('pointer-events', 'none')

    const crosshairX = svg
      .append("line")
      .attr('class', 'crosshair crosshair-x')
      .attr('x2', width)
      .attr('y1', height / 2)
      .attr('y2', height / 2)
      .attr('stroke', 'white')
      .attr('stroke-width', 1)
      .attr('pointer-events', 'none')
      .style('visibility', 'hidden')

    const crosshairY = svg
      .append("line")
      .attr('class', 'crosshair crosshair-x')
      .attr('x1', width / 2)
      .attr('x2', width / 2)
      .attr('y2', height)
      .attr('stroke', 'white')
      .attr('stroke-width', 1)
      .attr('pointer-events', 'none')
      .style('visibility', 'hidden')

    const text = svg.append('text')
      .attr('x', width / 2)
      .attr('y', () => mobile ? 100 : 120)
      .attr('class', 'textbox')
      .attr('text-anchor', 'middle')
      .attr('fill', 'white')
      .attr('opacity', 0.7)
      .style('font-size', () => mobile ? '1em' : '2.2em')
      .style('pointer-events', 'none')
      .style('visibility', 'hidden')

    function render() {
      const { x, y } = map.project(new maplibregl.LngLat(point.attr("lng"), point.attr("lat")))
      point.attr("cx", x).attr("cy", y)
    }

    map.on("move", render)
    render()

    // left app
    window.addEventListener('mouseout', (e) => {
      crosshairX.style('visibility', 'hidden')
      crosshairY.style('visibility', 'hidden')
      line.style('visibility', 'hidden')
    })

    // mobile & desktop event for click ends
    // TODO: see if this can be shortened
    window.addEventListener("pointerdown", e => {
      const [mouseX, mouseY] = pointer(e)
      const { lat, lng } = map.unproject([mouseX, mouseY])

      if (mode.has("crosshair")) {
        mode.add("crosshairZoom")
        setTimeout(() => {
          if (!mode.has("crosshairZoom")) return
          crosshairX.attr('lng', lng).attr('lat', lat).attr('y1', mouseY).attr('y2', mouseY).style('visibility', 'visible')
          crosshairY.attr('lng', lng).attr('lat', lat).attr('x1', mouseX).attr('x2', mouseX).style('visibility', 'visible')
          text.text(`X: ${lng.toFixed(1)}, Y: ${lat.toFixed(1)}`).style('visibility', 'visible')

        }, 200)
      } else if (mode.has("measure")) {
        mode.add("measureStart")
        setTimeout(() => {
          if (!mode.has("measureStart") || !pointRef) return
          console.log("start a measure")
          if (text._groups[0][0].style.visibility === "hidden") {
            select("textbox").style("visibility", "visible")
          }
          pointRef.style.visibility = 'visible'
          select(lineRef.current).raise()
          select(pointRef).raise()
          if (mobile) {
            if (lineRef.x2.baseVal.value !== 0) {
              // reset
              pointRef.setAttribute('cx', coord[0])
              pointRef.setAttribute('cy', coord[1])
              lineRef.style.visibility = 'hidden'
              lineRef.setAttribute('x1', coord[0]);
              lineRef.setAttribute('y1', coord[1])
              lineRef.setAttribute('x2', 0)
              lineRef.setAttribute('y2', 0)
            } else if (lineRef.x1.baseVal.value === 0) {
              // first point
              pointRef.setAttribute('cx', coord[0])
              pointRef.setAttribute('cy', coord[1])
              lineRef.setAttribute('x1', coord[0]);
              lineRef.setAttribute('y1', coord[1])
            } else {
              // second point
              lineRef.setAttribute('x2', transformedX);
              lineRef.setAttribute('y2', transformedY)
              lineRef.style.visibility = 'visible'
              const point = projection.invert([pointRef.getAttribute('cx'), pointRef.getAttribute('cy')])
              const point2 = projection.invert([transformedX, transformedY])

              if (name === "fallout") {
                const miles = geoDistance(point, point2) * 3959; // Earth's radius in miles
                const walkingSpeedMph = 3; // average walking speed in miles per hour
                const walkingTimeHours = miles / walkingSpeedMph;
                const walkingTimeDays = walkingTimeHours / 24;
                text.text(`${miles.toFixed(1)} miles | ${walkingTimeDays.toFixed(1)} days on foot (3mph)`).style('visibility', 'visible')

              } else if (name === "lancer") {
                const lightYears = geoDistance(point, point2) * 87 // 87 is arbitrary to get a close enough ly distance from the map
                const relativeTime = (lightYears / Math.sinh(Math.atanh(0.995))).toFixed(1)
                text.text(`${lightYears.toFixed(1)}ly | ${relativeTime} rel. years (.995u) | ${(lightYears / 0.995).toFixed(1)} real years`).style('visibility', 'visible')
              }

            }
          } else {
            point.attr('lng', lng).attr('lat', lat).attr('cx', mouseX).attr('cy', mouseY).style('visibility', 'visible')
            if (!line.attr("x1") || line.attr("x1") === 0) return
            line.attr('x1', lng).attr('y1', lat)
          }
        }, 200)
      }
    })

    window.addEventListener("mousemove", (e) => {
      if (mobile) return
      if (mode.has("crosshair")) {
        const [mouseX, mouseY] = pointer(e)
        const transform = zoomTransform(svg.node())
        const transformedX = (mouseX - transform.x) / transform.k;
        const transformedY = (mouseY - transform.y) / transform.k
        const [x, y] = projection.invert([transformedX, transformedY])
        crosshairX.attr('y1', mouseY).attr('y2', mouseY).style('visibility', 'visible')
        crosshairY.attr('x1', mouseX).attr('x2', mouseX).style('visibility', 'visible')
        text.text(`X: ${x.toFixed(1)}, Y: ${y.toFixed(1)}`).style('visibility', 'visible')
      } else if (mode.has("measure")) {
        if (!pointRef) return
        if (!pointRef.getAttribute('cx')) return
        if (!point.attr("lng")) return
        if (lineRef.style.visibility === "hidden") {
          lineRef.style.visibility = 'visible'
        }
        if (pointRef.style.visibility === "hidden") {
          pointRef.style.visibility = 'visible'
        }
        if (text._groups[0][0].style.visibility === "hidden") {
          text.style("visibility", "visible")
        }
        const [mouseX, mouseY] = pointer(e)
        const { lat, lng } = map.unproject([mouseX, mouseY])
        lineRef.setAttribute('x2', mouseX)
        lineRef.setAttribute('y2', mouseY)
        lineRef.setAttribute('x1', point.attr("cx"))
        lineRef.setAttribute('y1', point.attr("cy"))

        if (name === "fallout") {
          const turfPoint1 = turfPoint([point.attr("lng"), point.attr("lat")])
          const turfPoint2 = turfPoint([lng, lat])
          const miles = distance(turfPoint1, turfPoint2, { units: 'miles' })
          const walkingSpeedMph = 3; // average walking speed in miles per hour
          const walkingTimeHours = miles / walkingSpeedMph;
          text.text(`${miles.toFixed(1)} miles | ${walkingTimeHours.toFixed(1)} hours on foot (3mph)`);
        } else if (name === "lancer") {
          const lightYears = geoDistance(point, point2) * 87 // 87 is arbitrary to get a close enough ly distance from the map
          const relativeTime = (lightYears / Math.sinh(Math.atanh(0.995))).toFixed(1)
          text.text(`${lightYears.toFixed(1)}ly | ${relativeTime} rel. years (.995u) | ${(lightYears / 0.995).toFixed(1)} real years`)
        }
      }
    })
  }, [map])

  return (
    <>
    </>
  )
}
