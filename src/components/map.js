import React, {useEffect, useRef, useState} from 'react';
import MarkerForm from './markerForm.js';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import './map.css';
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import { getInitialLocations } from '../api.js';

const initialFormValue = { lng: '', lat: '', name: '' };

export default function Map(props) {
  const mapContainerRef = useRef();
  const map = useRef(null);
  const [lng] = useState(props.lng || -104.991531);
  const [lat] = useState(props.lat || 39.742043);
  const [style] = useState('https://devtileserver.concept3d.com/styles/c3d_default_style/style.json');
  const [zoom] = useState(3);
  const [formValues, setFormValues] = useState({initialFormValue});

  const handleFormChange = (e) => setFormValues({ ...formValues, [e.target.name]: e.target.value });
  
  useEffect(() => {
    if (map.current) return;
    map.current = new maplibregl.Map({
      container: mapContainerRef.current,
      style,
      center: [lng, lat],
      zoom
    });
    const draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        polygon: true,
        trash: true,
        point: true
      }
    });
    map.current.addControl(draw, 'top-left');
    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');
    
    map.current.on('load', seedInitialMarkers)
    map.current.on('draw.create', newDraw);
    map.current.on('draw.delete', newDraw);
    map.current.on('draw.update', newDraw);

    function newDraw(e) {
      const data = draw.getAll();
      console.log("data:", data);
    }

    async function seedInitialMarkers() {
      const initialLocations = await getInitialLocations();

      initialLocations?.forEach((location) => {
        const marker = new maplibregl.Marker()
          .setLngLat([location.lng, location.lat])
          .addTo(map.current);
      });
    }
  
    return () => {
      map.current.remove();
    }
  }, []);



  return (
      <div className="map-wrap">
        <a href="https://www.maptiler.com" className="watermark"><img
            src="https://api.maptiler.com/resources/logo.svg" alt="MapTiler logo"/></a>
        <div ref={mapContainerRef} className="map"/>
        <MarkerForm 
          handleFormChange={handleFormChange}
          formValues={formValues}
        />
      </div>
  );
}
