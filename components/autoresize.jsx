import { zoomIdentity } from 'd3'
import { useEffect } from "react"

let resizeTimeout
export default function AutoResize({ svg, zoom, projection, mobile, width, height, setTooltip, positionTooltip, center }) {
  useEffect(() => {
    // has issues on mobile, just disable
    if (!svg || !zoom || !projection || mobile) return
    setTooltip()
    positionTooltip({ pageX: 0, pageY: 0 })

    // recenter back on Cradle if the window is resized
    // TODO: support mobile landscape (currently is offcentered)
    const [x, y] = projection(center)

    // debounce the resize events
    clearTimeout(resizeTimeout)
    resizeTimeout = setTimeout(() => {
      const resizeOffsetX = (window.innerWidth - width) / 2
      const resizeOffsetY = (window.innerWidth - height) / 2
      if (Math.abs(width / 2 - x + resizeOffsetX) < 2 && Math.abs(height / 2 - y - 200 + resizeOffsetY) < 2) return
      console.log("window resized, recentering by", Math.floor(width / 2 - x + resizeOffsetX), Math.floor(height / 2 - y - 200 + resizeOffsetY))
      const transform = zoomIdentity.translate(width / 2 - x + resizeOffsetX, height / 2 - y - 200 + resizeOffsetY).scale(1)
      svg.transition().duration(500).call(zoom.transform, transform)
    }, 250)
  }, [width, height])

}
