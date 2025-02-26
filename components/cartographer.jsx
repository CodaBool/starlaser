'use client'
import { useCallback, useEffect, useState } from 'react'
import MapComponent from './map'
import { getConsts, isMobile } from '@/lib/utils'
import Map from 'react-map-gl/maplibre'
import mapStyle from '@/lib/style.json'
import DrawControl from './controls.jsx'
import { Button } from './ui/button'

export default function Cartographer({ name, data }) {
  const { SCALE, CENTER, STYLE, VIEW, MAX_ZOOM, MIN_ZOOM, BOUNDS, BG } = getConsts(name)
  const [size, setSize] = useState()
  const mobile = isMobile()
  const [features, setFeatures] = useState({})
  const [popup, setPopup] = useState()
  const [draw, setDraw] = useState()


  let style = mapStyle
  if (STYLE === "none") {
    // where we are going we don't need vector tiles
    style = { version: 8, layers: [{
      "id": "background",
      "type": "background",
      "layout": {"visibility": "none"},
      "paint": {"background-opacity": 0}
    },], sources: {}, }
  }

  const onUpdate = useCallback(e => {
    console.log("update", e);
    setFeatures(curr => {
      const newFeatures = { ...curr };
      for (const f of e.features) {
        newFeatures[f.id] = f;
      }
      return newFeatures;
    });
  }, []);

  const onDelete = useCallback(e => {
    setFeatures(curr => {
      const newFeatures = { ...curr };
      for (const f of e.features) {
        delete newFeatures[f.id];
      }
      return newFeatures;
    });
  }, []);

  // When the map is clicked, query the drawn layers for a feature.
  // Adjust the layers array to match the ones from your draw control.
  const handleMapClick = (e) => {
    if (!draw.getSelected().features.length) return
    const f = draw.getSelected().features[0]
    if (draw.getMode() !== 'simple_select' && draw.getMode() !== 'direct_select') return
    const feature = draw.get(f.id) || f
    console.log("selected", f, "vs id select", feature)
    setPopup({ feature, position: { x: e.point.x, y: e.point.y } });
  };

  // Update the feature properties in state (and optionally update the drawn feature)
  const saveFeatureProps = (id, properties) => {
    console.log("saving", id, properties)

    setFeatures(curr => {
      const feature = curr[id];
      if (feature) {
        const updated = { ...feature, properties };
        return { ...curr, [id]: updated };
      }
      return curr;
    })
    if (draw) {
      const feature = draw.get(id)
      if (feature) {
        const updatedFeature = { ...feature, properties }
        draw.delete([id]);
        draw.add(updatedFeature);
      }
    }
  }


  useEffect(() => {
    const handleResize = () => setSize({ width: window.innerWidth, height: window.innerHeight })
    window.addEventListener('resize', handleResize)
    setSize({ width: window.innerWidth, height: window.innerHeight })
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (!draw) return
    console.log(draw)
  }, [draw])

  // wait until I know how large the window is
  // this only takes miliseconds it seems, so its fine to wait
  if (!size) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent text-indigo-900 rounded-full" />
      </div>
    )
  }

  return (
    <>
      <Map
        id="map"
        dragRotate={false}
        attributionControl={false}
        initialViewState={VIEW}
        maxZoom={MAX_ZOOM}
        minZoom={MIN_ZOOM}
        style={{ width: size.width, height: size.height }}
        mapStyle={style}
        // onClick={handleMapClick}
      >
          {/* <DrawControl
            position="top-right"
            controls={{
              combine_features: false,
              uncombine_features: false,
            }}
            onUpdate={onUpdate}
            onDelete={onDelete}
            setDraw={setDraw}
          /> */}
        <MapComponent width={size.width} height={size.height} name={name} data={data} mobile={mobile} SCALE={SCALE} CENTER={CENTER} />
      </Map>
      {/* {popup && (
        <FeaturePopup
          feature={popup.feature}
          onSave={saveFeatureProps}
          onClose={() => setPopup(null)}
        />
      )} */}
      <div style={{width: size.width, height: size.height, background: `radial-gradient(${BG})`, zIndex: -1, top:0, position: "absolute"}}></div>
    </>
  )
}


function FeaturePopup({ feature, onSave, onClose }) {
  // Convert feature properties from an object to an array of { key, value } pairs
  const initialRows = Object.entries(feature.properties || {}).map(([key, value]) => ({ key, value }));
  const [rows, setRows] = useState(initialRows)

  // Update a row's key or value
  const handleChange = (index, field, newValue) => {
    const newRows = [...rows];
    newRows[index] = { ...newRows[index], [field]: newValue };
    setRows(newRows);
  }

  // Add a new empty row
  const addRow = () => {
    setRows([...rows, { key: '', value: '' }]);
  }

  // On save, convert the rows back into an object (ignoring rows with empty keys)
  const handleSave = () => {
    const newProps = {};
    rows.forEach(({ key, value }) => {
      if (key.trim()) {
        newProps[key] = value;
      }
    })
    onSave(feature.id, newProps);
  }

  return (
    <div
      style={{
        position: 'absolute',
        left: '20px',
        bottom: '20px',
        background: 'white',
        padding: '10px',
        border: '1px solid #ccc',
        zIndex: 100,
        color: "black",
      }}
    >
      <h4 className="text-xl mb-4 text-bold">Edit Feature</h4>
      <table>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              <td style={{ paddingRight: '5px' }}>
                <input
                  value={row.key}
                  placeholder="Property Key"
                  onChange={(e) => handleChange(index, 'key', e.target.value)}
                />
              </td>
              <td>
                <input
                  value={row.value}
                  placeholder="Property Value"
                  onChange={(e) => handleChange(index, 'value', e.target.value)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Button onClick={addRow} className="cursor-pointer">Add Row</Button>
      <Button onClick={handleSave} className="cursor-pointer">Save</Button>
      <Button onClick={onClose} className="cursor-pointer">Close</Button>
    </div>
  );
}