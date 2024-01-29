import React, {useEffect, useRef, useState} from 'react';
import maplibregl from 'maplibre-gl';
import MaplibreGeocoder from '@maplibre/maplibre-gl-geocoder';
import '@maplibre/maplibre-gl-geocoder/dist/maplibre-gl-geocoder.css';
import 'maplibre-gl/dist/maplibre-gl.css';
import './map.css';
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import { getInitialLocations, validateCoordinates } from '../api.js';
import { handleForwardGeocode, handleReverseGeocode } from '../geocodeHandlers.js';

const initialFormValues = { lng: 'null', lat: 'null', name: '' }; // initial state of form on map load

export default function Map(props) {
  const mapContainerRef = useRef();
  const map = useRef(null);
  const geoCoder = useRef(null);
  const [lng] = useState(props.lng || -104.991531);
  const [lat] = useState(props.lat || 39.742043);
  const [style] = useState('https://devtileserver.concept3d.com/styles/c3d_default_style/style.json');
  const [zoom] = useState(3);
  const [formValues, setFormValues] = useState(initialFormValues);
  const [validationErrors, setValidationsErrors] = useState([]);

  const handleFormChange = (e) => setFormValues({ ...formValues, [e.target.name]: e.target.value });
  const handleCloseErrors = () => setValidationsErrors([])

  const handleSubmitForm = async (e) => {
    handleCloseErrors()
    e.stopPropagation();
    e.preventDefault();
    const validation = await validateCoordinates(formValues);
    console.log(validation)
    if (validation.status === 201) {
      handleCloseErrors()
      geoCoder.current.setProximity({
        latitude: parseFloat(validation.payload.lat), 
        longitude: parseFloat(validation.payload.lng), 
      });
      // geoCoder.current.query(validation.payload.name);
    } else if (validation.status === 406) {
      setValidationsErrors(validation.errors);
    }
    return;
  };

  const handleSubmitOnKeypress = async () => {
    let form = document.querySelector(".marker-form");
    form?.addEventListener("keypress", (e) => {
      if (e?.key === "Enter" || e?.charCode === 13) handleSubmitForm(e);
    });
  };
  
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
    map.current.addControl(new maplibregl.NavigationControl(), 'top-left');
    
    map.current.on('load', seedInitialMarkers) // loads markers for initially available locations
    map.current.on('draw.create', newDraw);
    map.current.on('draw.delete', newDraw);
    map.current.on('draw.update', newDraw);

    function newDraw(e) {
      const data = draw.getAll();
      console.log("data:", data);
    }

    // handles fetching initial locations, creating markers, and adding them to the map
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

  // handles setting up a geocoder instance
  useEffect(() => {
    if (geoCoder.current) return
    console.log('running geocoder setup')
    let GeoApi = { forwardGeocode: (config) => handleForwardGeocode(config) };

    const geoCoderOptions = { 
      maplibregl,
      marker: true,
      zoom: 12,
      limit: 1,
      showResultMarkers: false,
      clearAndBlurOnEsc: true,
      proximity: { latitude: parseFloat(formValues.lat), longitude: parseFloat(formValues.lng) }
    };

    geoCoder.current = new MaplibreGeocoder(GeoApi, geoCoderOptions);
    // geocoder control has to be attached to map, so it's added but not displayed
    map.current?.addControl(geoCoder.current);
    let geoDiv = document.querySelector(".maplibregl-ctrl-geocoder");
    geoDiv.style.display = "none";
  }, []);
  
  useEffect(() => {
    handleSubmitOnKeypress();
  });
  // }, []);

  return (
    <div className="map-wrap">
      <a href="https://www.maptiler.com" className="watermark"><img
          src="https://api.maptiler.com/resources/logo.svg" alt="MapTiler logo"/></a>
      <div ref={mapContainerRef} className="map"/>

      <form className='marker-form' >
        <div className='form-inputs'>
          <label>
            longitude: 
            <input
              required
              name="lng"
              type="number"
              placeholder='-104.991531'
              value={formValues.lng}
              onChange={(e) => handleFormChange(e)}
            />
          </label>
          <br />
          <label>
            latitude: 
            <input
              required
              name="lat"
              type="number"
              placeholder='39.742043'
              value={formValues.lat}
              onChange={(e) => handleFormChange(e)} 
            />
          </label>
          <label>
            name:
            <input
              id="geocoder-input"
              required
              name="name"
              type="text"
              placeholder='Denver'
              value={formValues.name}
              onChange={async (e) => handleFormChange(e)} 
            />
          </label>
        </div>
      </form>

      { validationErrors?.length > 0 && 
      <ul className='errors-list'>
        { validationErrors?.length > 0 && validationErrors?.map((error) => (
          <li><label>error: </label>{error}</li>
        ))}
      </ul>}
      
    </div>
  );
}
