
import { useEffect } from "react"
import { pointer, zoomTransform, geoDistance, select } from 'd3'

const MENU_HEIGHT_PX = 0

export default function Toolbox({ mode, svg, g, width, height, projection, mobile, holdTimer, svgRef, map }) {
  useEffect(() => {
    console.log(svg, svgRef.current)
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
      .attr('y', 100)
      .attr('class', 'textbox')
      .attr('text-anchor', 'middle')
      .attr('fill', 'white')
      .attr('opacity', 0.7)
      .style('font-size', '30px')
      .style('pointer-events', 'none')
      .style('visibility', 'hidden')

    // left app
    svg.on("mouseout", () => {
      crosshairX.style('visibility', 'hidden')
      crosshairY.style('visibility', 'hidden')
    })
    // svg.on("touchstart", (e) => { console.log("touchstart") })

    // mouse down doesn't work here for some reason but does in map.jsx
    svg.on("click", e => {
      if (!mode.has("measure") || mobile) return
      const [mouseX, mouseY] = pointer(e)
      const transform = zoomTransform(svgRef.current)
      const transformedX = (mouseX - transform.x) / transform.k;
      const transformedY = (mouseY - transform.y) / transform.k
      const point = projection.invert([transformedX, transformedY])
      const coord = projection(point)
      holdTimer = setTimeout(() => {
        pointRef.setAttribute('cx', coord[0])
        pointRef.setAttribute('cy', coord[1])
        pointRef.style.visibility = 'visible'
        select(pointRef).raise()
        if (lineRef.x1.baseVal.value === 0) {
          return
        }
        lineRef.setAttribute('x1', coord[0])
        lineRef.setAttribute('y1', coord[1])
        select(lineRef).raise()
      }, 200)
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
        r={5}
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
