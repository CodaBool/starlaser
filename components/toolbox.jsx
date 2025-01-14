
import { useEffect } from "react"
import { pointer, zoomTransform, geoDistance, select, selectAll } from 'd3'

export default function Toolbox({ mode, svg, g, width, height, projection, mobile, svgRef, map }) {
  useEffect(() => {
    const pointRef = document.querySelector(".point")
    const lineRef = document.querySelector(".line")

    const crosshairX = svg.append('line')
      .attr('class', 'crosshair crosshair-x')
      .attr('x2', width)
      .attr('y1', height / 2)
      .attr('y2', height / 2)
      .attr('stroke', 'white')
      .attr('pointer-events', 'none')
      .style('visibility', 'hidden')
    const crosshairY = svg.append('line')
      .attr('class', 'crosshair crosshair-y')
      .attr('x1', width / 2)
      .attr('x2', width / 2)
      .attr('y2', height)
      .attr('stroke', 'white')
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

    // left app
    svg.on("mouseout", () => {
      crosshairX.style('visibility', 'hidden')
      crosshairY.style('visibility', 'hidden')
    })

    // mobile & desktop event for click ends
    // TODO: see if this can be shortened
    svg.on("pointerdown", e => {
      const [mouseX, mouseY] = pointer(e)
      const transform = zoomTransform(svgRef.current)
      const transformedX = (mouseX - transform.x) / transform.k;
      const transformedY = (mouseY - transform.y) / transform.k
      const point = projection.invert([transformedX, transformedY])
      if (mode.has("crosshair")) {
        mode.add("crosshairZoom")
        setTimeout(() => {
          if (!mode.has("crosshairZoom")) return
          crosshairX.attr('y1', mouseY).attr('y2', mouseY).style('visibility', 'visible')
          crosshairY.attr('x1', mouseX).attr('x2', mouseX).style('visibility', 'visible')
          text.text(`X: ${point[0].toFixed(1)}, Y: ${point[1].toFixed(1)}`).style('visibility', 'visible')
          // crosshairX.style('visibility', 'visible')
          // crosshairY.style('visibility', 'visible')
        }, 200)
      } else if (mode.has("measure")) {
        const coord = projection(point)
        mode.add("measureStart")
        setTimeout(() => {
          if (!mode.has("measureStart")) return
          // if (text._groups[0][0].style.visibility === "hidden") {
          //   select("textbox").style("visibility", "visible")
          // }

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

              if (map === "fallout") {
                const miles = geoDistance(point, point2) * 3959; // Earth's radius in miles
                const walkingSpeedMph = 3; // average walking speed in miles per hour
                const walkingTimeHours = miles / walkingSpeedMph;
                const walkingTimeDays = walkingTimeHours / 24;
                text.text(`${miles.toFixed(1)} miles | ${walkingTimeDays.toFixed(1)} days on foot (3mph)`).style('visibility', 'visible')

              } else if (map === "lancer") {
                const lightYears = geoDistance(point, point2) * 87 // 87 is arbitrary to get a close enough ly distance from the map
                const relativeTime = (lightYears / Math.sinh(Math.atanh(0.995))).toFixed(1)
                text.text(`${lightYears.toFixed(1)}ly | ${relativeTime} rel. years (.995u) | ${(lightYears / 0.995).toFixed(1)} real years`).style('visibility', 'visible')
              }

            }
          } else {
            pointRef.setAttribute('cx', coord[0])
            pointRef.setAttribute('cy', coord[1])
            pointRef.style.visibility = 'visible'
            if (lineRef.x1.baseVal.value === 0) return
            lineRef.setAttribute('x1', coord[0])
            lineRef.setAttribute('y1', coord[1])
          }
        }, 200)
      }
    })

    svg.on("mousemove", (e) => {
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
        if (!pointRef.getAttribute('cx')) return
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
        const transform = zoomTransform(svg.node())
        const transformedX = (mouseX - transform.x) / transform.k
        const transformedY = (mouseY - transform.y) / transform.k
        lineRef.setAttribute('x1', pointRef.getAttribute('cx'))
        lineRef.setAttribute('y1', pointRef.getAttribute('cy'))
        lineRef.setAttribute('x2', transformedX)
        lineRef.setAttribute('y2', transformedY)
        const point = projection.invert([pointRef.getAttribute('cx'), pointRef.getAttribute('cy')])
        const point2 = projection.invert([transformedX, transformedY])

        if (map === "fallout") {
          const miles = geoDistance(point, point2) * 3959; // Earth's radius in miles
          const walkingSpeedMph = 3; // average walking speed in miles per hour
          const walkingTimeHours = miles / walkingSpeedMph;
          const walkingTimeDays = walkingTimeHours / 24;
          text.text(`${miles.toFixed(1)} miles | ${walkingTimeDays.toFixed(1)} days on foot (3mph)`);

        } else if (map === "lancer") {
          const lightYears = geoDistance(point, point2) * 87 // 87 is arbitrary to get a close enough ly distance from the map
          const relativeTime = (lightYears / Math.sinh(Math.atanh(0.995))).toFixed(1)
          text.text(`${lightYears.toFixed(1)}ly | ${relativeTime} rel. years (.995u) | ${(lightYears / 0.995).toFixed(1)} real years`)
        }
      }
    })
  }, [])

  return (
    <>
      <circle
        r={2.4}
        className="point"
        fill="orange"
        style={{ visibility: 'hidden', pointerEvents: "none" }}
      />
      <line
        className="line"
        stroke="orange"
        strokeDasharray="5,5"
        style={{ visibility: 'hidden', pointerEvents: "none" }}
      />
    </>
  )
}
