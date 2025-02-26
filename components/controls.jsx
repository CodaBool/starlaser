// import MapboxDraw from '@mapbox/mapbox-gl-draw';
import { useControl } from 'react-map-gl/maplibre'
import MapboxDraw from "@hyvilo/maplibre-gl-draw"
import { useCallback, useEffect, useState } from 'react'

export default function DrawControl(props) {
  const [features, setFeatures] = useState({});

  const onCreate = useCallback(e => {
    console.log("create ran")
    return {}
  }, []);

  const onUpdate = useCallback(e => {
    setFeatures(currFeatures => {
      const newFeatures = { ...currFeatures };
      for (const f of e.features) {
        newFeatures[f.id] = f;
      }
      return newFeatures;
    });
  }, []);

  const onDelete = useCallback(e => {
    setFeatures(currFeatures => {
      const newFeatures = { ...currFeatures };
      for (const f of e.features) {
        delete newFeatures[f.id];
      }
      return newFeatures;
    });
  }, []);




  const d = useControl(
    () => new MapboxDraw(props),
    ({ map }) => {
      map.on('draw.create', onCreate);
      map.on('draw.update', onUpdate);
      map.on('draw.delete', onDelete);
    },
    ({ map }) => {
      map.off('draw.create', onCreate);
      map.off('draw.update', onUpdate);
      map.off('draw.delete', onDelete);
    },
    {
      position: props.position
    }
  )
  useEffect(() => props.setDraw(d), [])
  return null;
}
