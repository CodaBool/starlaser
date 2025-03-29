'use client'
import * as d3 from 'd3'
import maplibregl, {
  MapMouseEvent,
  LngLat,
} from 'maplibre-gl'
import { useMap } from 'react-map-gl/maplibre'
import { geoPath, geoMercator, geoTransform } from 'd3-geo'
import { useEffect, useRef, useState } from 'react'
import { color, important, positionTooltip, accent, ignoreList, getConsts, hashString } from "@/lib/utils.js"
import { ZoomIn, ZoomOut } from "lucide-react"
import Tooltip from './tooltip'
import Sheet from './sheet'
import AutoResize from './autoresize'
import Hamburger from './hamburger'
import Toolbox from './toolbox'
import * as SVG from './svg.js'
import turfCentroid from '@turf/centroid'
import { domToPng } from 'modern-screenshot'
import * as turf from '@turf/turf'
import SearchBar from './searchbar'
import { Calibrate, Link } from './foundry'

let projection, svg, zoom, path, g, tooling, clickCir, guideLabel, mode = new Set([])

// Function to generate circle data from center (longitude, latitude) and radius
function generateCircle(center, radius) {
  const centerPoint = turf.point(center)
  const circle = turf.circle(centerPoint, radius, { units: 'kilometers' })
  return {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: circle.geometry.coordinates
        }
      }
    ]
  }
}

export async function getIcon(d, fillRGBA) {
  const icon = d.properties.icon || SVG[d.properties.type]
  const fill = fillRGBA || d.properties.fill
  const stroke = d.properties.stroke

  // if (d.properties.userCreated) {
  //   // console.log(d)
  //   window.parent.postMessage({
  //     type: 'log',
  //     message: d,
  //   }, '*')
  // }

  // Apply to all <path>, <circle>, <rect>, etc.
  const forceAttrs = (svg, fill, stroke) => {
    if (fill) {
      svg = svg.replace(/(<(path|circle|rect|polygon|g)[^>]*?)\s*(fill=".*?")?/gi, (match, before) => {
        return `${before} fill="${fill}" `;
      });
    }
    if (stroke) {
      svg = svg.replace(/(<(path|circle|rect|polygon|g)[^>]*?)\s*(stroke=".*?")?/gi, (match, before) => {
        return `${before} stroke="${stroke}" `;
      });
    }
    return svg;
  };

  if (icon && !icon.startsWith("http")) {
    return forceAttrs(icon, fill, stroke);
  }

  if (icon?.startsWith("http")) {
    try {
      const res = await fetch(icon)
      let remoteSvg = await res.text();
      return forceAttrs(remoteSvg, fill, stroke);
    } catch (e) {
      console.log(`WARN: failed to fetch icon: ${icon}`, e);
      return null;
    }
  }

  return null;
}


export default function Map({ width, height, data, name, mobile, params, locked }) {
  const { map } = useMap()
  const [tooltip, setTooltip] = useState()
  const [drawerOpen, setDrawerOpen] = useState()
  const [drawerContent, setDrawerContent] = useState()
  const { CENTER, SCALE, CLICK_ZOOM, NO_PAN, LAYER_PRIO } = getConsts(name)


  async function pan(d, locations, fit) {
    if (locked && !fit) return
    mode.add("zooming")
    let fly = true, lat, lng, coordinates = d.geometry.coordinates
    let zoomedOut = map.getZoom() < 6

    // force a zoom if panning to location by search
    if (fit) zoomedOut = true
    let zoom = map.getZoom()

    if (d.geometry.type === "Point") {
      [lng, lat] = coordinates

      // zoom in for location clicks, if zoomed out
      if (zoomedOut) {
        zoom = CLICK_ZOOM
      }

    } else {

      // remove sheet circle
      if (document.querySelector(".click-circle")) {
        document.querySelector(".click-circle").remove()
      }

      // find center of territory or guide
      const centroid = turf.centroid(d)
      coordinates = centroid.geometry.coordinates
      lng = coordinates[0]
      lat = coordinates[1]

      // zoom view to fit territory or guide when searched
      if (fit) {
        const bounds = path.bounds(d);
        const [[x0, y0], [x1, y1]] = bounds;
        const dx = x1 - x0;
        const dy = y1 - y0;
        const padding = 20;
        const newZoom = Math.min(
          map.getZoom() + Math.log2(Math.min(map.getContainer().clientWidth / (dx + padding), map.getContainer().clientHeight / (dy + padding))),
          map.getMaxZoom()
        )
        zoom = newZoom
      }
      if (!zoomedOut) fly = false
    }

    // offset for sheet
    // TODO: doesn't this always need to be done?
    if (zoomedOut) {
      const arbitraryNumber = locations?.length > 5 ? 9.5 : 10
      let zoomFactor = Math.pow(2, arbitraryNumber - map.getZoom())
      zoomFactor = Math.max(zoomFactor, 4)
      const latDiff = (map.getBounds().getNorth() - map.getBounds().getSouth()) / zoomFactor
      lat = coordinates[1] - latDiff / 2
    }

    if (fly) {
      map.flyTo({ center: [lng, lat], duration: 800, zoom })
      setTimeout(() => mode.delete("zooming"), 801)
    }

    setDrawerContent({ locations: locations || [d], coordinates, selected: d.properties.name })
    setDrawerOpen(true)
  }

  function hover(e, { properties, geometry }) {
    if ((mode.has("crosshair") && mobile) || locked) return
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

  function getTextCoord(d) {
    if (d.properties.type !== "line") {
      const point = map.project(new maplibregl.LngLat(...turf.centroid(d).geometry.coordinates))
      return [point.x, point.y]
    }
    const i = data.territory.filter(d => d.properties.type === "line").findIndex(line => line.properties.name === d.properties.name)
    // Compute the geographic centroid of the feature
    const pointy = turf.point([-77, 42]);
    const offsetCoord = turf.destination(pointy, ((i + 1) * 550), 45)
    const point = map.project(new maplibregl.LngLat(...offsetCoord.geometry.coordinates))
    return [point.x, point.y]
  }

  useEffect(() => {
    if (!map) return
    if (svg) svg.remove()

    console.log("map component using data", data)


    // keep user features on top, also create a layering based on importance
    data.territory.sort((a, b) => {
      const aTypeIndex = LAYER_PRIO.indexOf(a.properties.type);
      const bTypeIndex = LAYER_PRIO.indexOf(b.properties.type);
      if (aTypeIndex === bTypeIndex) {
        if (a.properties.userCreated && !b.properties.userCreated) return 1;
        if (!a.properties.userCreated && b.properties.userCreated) return -1;
        return 0;
      }
      return aTypeIndex - bTypeIndex;
    });

    projection = geoMercator()
    function projectPoint(lon, lat) {
      let point = map.project(new maplibregl.LngLat(lon, lat))
      this.stream.point(point.x, point.y)
    }
    const transform = geoTransform({ point: projectPoint })
    path = geoPath().projection(transform)

    svg = d3
      .select(map.getCanvasContainer())
      .append("svg")
      .attr("width", "100%")
      .attr("height", "100%")
      .style("position", "absolute")
      .style("z-index", 5)

    if (name.includes("lancer")) {
      // svg.style("background", `radial-gradient(${bg[name]})`)
      for (let i = 0; i < height * width / 10000; i++) {
        svg.append('circle')
          .attr('class', 'background')
          .attr('cx', Math.random() * width)
          .attr('cy', Math.random() * height)
          .attr('r', Math.random() * 2)
          .style('fill', `rgba(255, 255, 255, ${Math.random() / 3})`)
      }

      guideLabel = svg
        .selectAll('.guide-label')
        .data(data.territory.filter(d => d.properties.type === "line"))
        .enter().append('text')
        .text(d => d.properties.name)
        .attr('class', 'guide-label')
        .style('font-size', '.8em')
        .attr("pointer-events", "none")
        .style('fill', 'rgba(255, 255, 255, 0.6)')
    }

    const territory = svg
      .selectAll('path')
      .data(data.territory)
      .enter().append('path')
      .attr('class', d => `territory ${d.properties.unofficial && 'unofficial'} territory-${d.properties.type}`)
      .attr('stroke-width', 2.5)
      .attr('fill', d => color(name, d.properties, "fill", d.geometry.type))
      .attr('stroke', d => color(name, d.properties, "stroke", d.geometry.type))
      .on("mouseover", hover)
      .on("click", (e, d) => {
        if (mode.has("measure") || (mode.has("crosshair") && mobile)) return
        if (NO_PAN.includes(d.properties.type)) return
        pan(d)
      })
      .on("mouseout", hover)
      .on("mousemove", e => positionTooltip(e))

    // const territoryLabel = svg
    //   .selectAll('.territory-label')
    //   .data(data.territory)
    //   // .data(data.location.filter(d => important(name, d.properties) && !d.properties.crowded))
    //   .enter().append('text')
    //   .text(d => d.properties.name)
    //   .attr('class', d => d.properties.unofficial ? 'unofficial territory-label' : 'official territory-label')
    //   .style('font-weight', d => important(name, d.properties) && 600)
    //   .style('text-anchor', 'middle')
    //   .style('font-size', '.6em')
    //   .attr('dy', '.35em')
    //   .style('fill', 'white')
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
        pan(d)
      })
      .on("mouseout", hover)

    const location = svg.selectAll("img")
      .data(data.location)
      .enter()
      .append("foreignObject")
      .html(d => getIcon(d))
      .attr("width", d => d.properties.type === "star" ? 10 : 20)
      .attr("height", d => d.properties.type === "star" ? 10 : 20)
      .attr('fill', d => color(name, d.properties, "fill", d.geometry.type))
      .attr("pointer-events", "bounding-box")
      .attr('class', d => `${d.properties.unofficial === "unofficial" ? "unoffical" : ""} location ${d.properties.userCreated ? "user" : ""}`)
      .on('click', (e, d) => {
        if (mode.has("measure") || (mode.has("crosshair") && mobile) || locked) return
        const bounds = map.getBounds()
        const diagonalDistance = turf.distance(
          turf.point([bounds.getWest(), bounds.getSouth()]),
          turf.point([bounds.getEast(), bounds.getNorth()]),
          { units: 'kilometers' }
        );
        let selectionRadius = Math.min(diagonalDistance / 15, 140)
        if (document.querySelector(".click-circle")) {
          document.querySelector(".click-circle").remove()
        }
        if (map.getZoom() < 6) selectionRadius = 25
        if (name.includes("lancer")) selectionRadius = 100
        clickCir = svg
          .selectAll('click-circle')
          .data(generateCircle(d.geometry.coordinates, selectionRadius).features)
          .enter().append('path')
          .attr('d', d => path(d.geometry))
          .attr('fill', accent(name, 0.1))
          .attr('stroke', accent(name, 0.15))
          .attr("class", "click-circle")
          .attr("pointer-events", "none")
          .attr("visibility", `${name.includes("lancer") ? "hidden" : "visible"}`)
        const locations = data.location.filter(location => {
          const point = turf.point(location.geometry.coordinates);
          return turf.booleanPointInPolygon(point, clickCir.data()[0]);
        }) || []
        pan(d, locations)
      })
      .on('mouseover', hover)
      .on('mouseout', hover)

    const locationLabel = svg
      .selectAll('.location-label')
      .data(data.location.filter(d => important(name, d.properties) && d.properties.label))
      .enter().append('text')
      .text(d => d.properties.name)
      .attr('class', d => d.properties.unofficial ? 'unofficial location-label' : 'official location-label')
      .style('font-size', d => important(name, d.properties) ? '10.85px' : '8.35px')
      .style('font-weight', d => important(name, d.properties) && 600)
      .style('text-anchor', 'middle')
      .style('fill', 'white')
      .attr('dy', '-.8em')
      .attr('dx', '.7em')
      .style('pointer-events', 'none')


    // Now fetch icons asynchronously and inject them
    data.location.forEach(async (d, i) => {
      // if (d.properties.name === "Cressidium") {
      //   console.log(d, i)
      // }
      // if (d.properties.icon) console.log("fetching icon", d.properties.name)
      const iconMarkup = await getIcon(d)
      // if (d.properties.icon) {

      //   console.log("finished fetch for icon", d.properties.name, " |result =", iconMarkup)
      // }

      if (iconMarkup) {
        location._groups[0][i].innerHTML = iconMarkup;
      }
    });

    function render() {

      // document.querySelector(".map-tooltip").style.visibility = "hidden"
      // d3.selectAll('.crosshair').style("visibility", "hidden")
      // if (!mode.has("zooming")) setDrawerOpen(false)

      // prevents measure dot from being moved on pan for both mobile and desktop
      if (mode.has("measureStart")) {
        mode.delete("measureStart")
      } else if (mode.has("crosshairZoom")) {
        mode.delete("crosshairZoom")
      } else if (mode.has("crosshair")) {
        d3.selectAll('.crosshair').style("visibility", "hidden")
        document.querySelector(".map-tooltip").style.visibility = "hidden"
      }
      if (mode.has("measure")) {
        if (document.querySelector(".line-click")) {
          document.querySelector(".line-click").style.visibility = 'hidden'
        }
      }
      guide.attr("d", path)
      territory.attr("d", path)
      clickCir?.attr("d", path)
      guideLabel
        ?.attr("x", d => getTextCoord(d)[0])
        .attr("y", d => getTextCoord(d)[1])
      locationLabel
        ?.attr("x", d => getTextCoord(d)[0])
        .attr("y", d => getTextCoord(d)[1])
      location
        .attr("x", d => path.centroid(d)[0])
        .attr("y", d => path.centroid(d)[1])
    }

    // capture a webp screenshot
    if (params.get("img")) {
      map.on('load', async var1 => {

        const userMadeLocations = data.location.filter(d => d.properties.userCreated && map.getBounds().contains(new maplibregl.LngLat(d.geometry.coordinates[0], d.geometry.coordinates[1])))
        // console.log("User made locations currently on screen:", userMadeLocations)

        window.parent.postMessage({
          type: 'log',
          message: userMadeLocations,
        }, '*')

        // all userMadeLocations should have an icon prop added which uses
        userMadeLocations.forEach(location => {
          if (!location.properties.icon) {
            const type = location.properties.type;
            location.properties.icon = `https://github.com/CodaBool/starlaser/raw/refs/heads/main/public/svg/default/${type}.svg`;
          }
        });

        const userMadeLocationsWithPixels = userMadeLocations.map(location => {
          const point = map.project(new maplibregl.LngLat(location.geometry.coordinates[0], location.geometry.coordinates[1]))
          return {
            ...location,
            pixelCoordinates: {
              top: point.y,
              left: point.x
            }
          };
        });

        const userLocationElements = document.querySelectorAll('.user.location');

        window.parent.postMessage({
          type: 'featureData',
          featureData: userMadeLocationsWithPixels,
        }, '*')

        window.parent.postMessage({
          type: 'log',
          message: "waiting for icons",
        }, '*')

        const checkIconsLoaded = async () => {
          const checkInterval = 100; // milliseconds
          const maxAttempts = 100; // maximum number of attempts before giving up
          let attempts = 0;

          while (attempts < maxAttempts) {
            const allIconsLoaded = Array.from(userLocationElements).every(element => {
              const svgContent = element.innerHTML
              if (!svgContent && svgContent.includes('<svg')) console.log("loading icon", element, attempts, "/", maxAttempts)
              return svgContent && svgContent.includes('<svg');
            });

            if (allIconsLoaded) {
              return true;
            }

            await new Promise(resolve => setTimeout(resolve, checkInterval));
            attempts++;
          }

          return false;
        };

        await checkIconsLoaded();

        window.parent.postMessage({
          type: 'log',
          message: "icons loaded",
        }, '*')

        domToPng(document.querySelector('#map'), { scale: 2 }).then((d3PNG) => {
          const img1 = new Image();
          const img2 = new Image();
          img1.src = map.getCanvas().toDataURL()
          img2.src = d3PNG
          img1.onload = () => {
            img2.onload = () => {
              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d')

              // Scale up canvas size
              const scale = 2;
              canvas.width = width * scale;
              canvas.height = height * scale;

              console.log("screenshot size", canvas.width, canvas.height)

              // Optionally, apply higher-quality rendering
              ctx.imageSmoothingEnabled = true;
              ctx.imageSmoothingQuality = 'high';

              // Set canvas size based on the images (they are expected to be the same size)
              ctx.drawImage(img1, 0, 0, canvas.width, canvas.height);
              ctx.drawImage(img2, 0, 0, canvas.width, canvas.height);

              // Create a download link for the combined image
              const webpImage = canvas.toDataURL('image/webp', .98)
              window.parent.postMessage({
                type: 'webpImage',
                webpImage,
              }, '*')
            };
          };
        });
      });
    }

    map.on("viewreset", render)
    map.on("move", render)
    map.on("moveend", render)
    render()

    if (locked) {
      const featName = params.get("name")
      const x = parseFloat(params.get("x"))
      const y = parseFloat(params.get("y"))
      const geometry = params.get("type")
      if (!geometry || !x || !y || !featName) return
      const d = data[geometry].find(f => {
        if (geometry === "location") {
          return f.properties.name === featName && f.geometry.coordinates[0] === x && f.geometry.coordinates[1] === y
        } else {
          const coordinates = d3.geoPath().centroid(f)
          return f.properties.name === featName && coordinates[0] === x && coordinates[1] === y
        }
      })
      if (d) {
        pan(d, [d], true)
        d3.selectAll("." + geometry)
          .filter(p => d.geometry.coordinates === p.geometry.coordinates)
          .classed('animate-pulse', true)
          .attr('fill', () => geometry === "guide" ? "none" : accent(name, .7, "255, 142, 0"))
          .attr('stroke', () => geometry === "location" ? null : accent(name, .7, "255, 142, 0"))
      }
    }
    return () => {
      map.off("viewreset", render)
      map.off("move", render)
      map.off("moveend", render)
    }
  }, [map])

  if (locked) return (<Tooltip {...tooltip} mobile={mobile} />)
  if (params.get("calibrate")) return (
    <>
      <Calibrate mode={mode} svg={svg} width={width} height={height} projection={projection} mobile={mobile} name={name} />
      <Tooltip {...tooltip} mobile={mobile} />
    </>
  )

  return (
    <>
      {params.get("link") && <Link mode={mode} svg={svg} width={width} height={height} projection={projection} mobile={mobile} name={name} params={params} />}
      <AutoResize svg={svg} zoom={zoom} projection={projection} mobile={mobile} width={width} height={height} setTooltip={setTooltip} positionTooltip={positionTooltip} center={CENTER} />
      <Sheet {...drawerContent} setDrawerOpen={setDrawerOpen} drawerOpen={drawerOpen} name={name} map={map} />
      <Toolbox mode={mode} svg={svg} width={width} height={height} projection={projection} mobile={mobile} name={name} />
      {params.get("hamburger") !== "0" && <Hamburger mode={mode} name={name} c={params.get("c") === "1"} />}
      <Tooltip {...tooltip} mobile={mobile} />
      {params.get("search") !== "0" && <SearchBar map={map} name={name} data={data} pan={pan} mobile={mobile} />}
      <div className="absolute mt-28 ml-11 mr-[.3em] cursor-pointer z-10 bg-[rgba(0,0,0,.3)] rounded-xl zoom-controls" >
        <ZoomIn size={34} onClick={() => map.zoomIn()} className='m-2 hover:stroke-blue-200' />
        <ZoomOut size={34} onClick={() => map.zoomOut()} className='m-2 mt-4 hover:stroke-blue-200' />
      </div>
    </>
  )
}
