import React, {useEffect, useRef, useState} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import maplibregl from 'maplibre-gl';
import MaplibreGeocoder from '@maplibre/maplibre-gl-geocoder';
import '@maplibre/maplibre-gl-geocoder/dist/maplibre-gl-geocoder.css';
import 'maplibre-gl/dist/maplibre-gl.css';
import './map.css';
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import { getInitialLocations, validateCoordinates } from '../api.js';
import { handleForwardGeocode, handleReverseGeocode } from '../geocodeHandlers.js';
import mapActions from '../actions.js';

export default function Map(props) {
  const mapContainerRef = useRef();
  const map = useRef(null);
  const geoCoder = useRef(null);
  const [lng] = useState(props.lng || -104.991531);
  const [lat] = useState(props.lat || 39.742043);
  const [style] = useState('https://devtileserver.concept3d.com/styles/c3d_default_style/style.json');
  const [zoom] = useState(3);
  const [formLng, setFormLng] = useState('');
  const [formLat, setFormLat] = useState('');
  const [formName, setFormName] = useState('');
  const [validationErrors, setValidationsErrors] = useState([]);

  // store
  const storedLocations = useSelector((state) => state.locations);
  // const storedPolygons = useSelector((state) => state.polygons);
  const dispatch = useDispatch();

  // form values handlers
  const handleLngChange = (e) => setFormLng(e.target.value);
  const handleLatChange = (e) => setFormLat(e.target.value);
  const handleNameChange = (e) => setFormName(e.target.value);

  // TODO
  // 1. figure out how to use lng and lat values in tandem with forward geocoding. 

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setValidationsErrors([]);
    // validates coords in backend
    const validation = await validateCoordinates({
      lng: parseFloat(formLng).toFixed(6),
      lat: parseFloat(formLat).toFixed(6),
      name: formName,
    });
    // returns a 201 and form values if valid, otherwise, save errors to be displayed
    if (validation.status === 201) {
      await geoCoder.current.setProximity({
        latitude: validation.payload?.lat, 
        longitude: validation.payload?.lng, 
      });
      geoCoder.current.query(validation.payload?.name);
    } else if (validation.status === 406) {
      setValidationsErrors(validation.errors);
    }
    return;
  };

  // handler for Enter keypress event, will trigger submit button which calls handleFormSubmit
  const handleFormKeypressEvent = async () => {
    let form = document.querySelector("#marker-form");
    form?.addEventListener("keypress", async (e) => {
      if (e?.key === "Enter" || e?.charCode === 13) {
        e.preventDefault();
        const hiddenSubmitButton = document.querySelector(".hidden-submit-button");
        hiddenSubmitButton.click();
      } else return
    }, false);
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

    map.current.on('draw.create', newDraw);
    map.current.on('draw.delete', newDraw);
    map.current.on('draw.update', newDraw);

    function newDraw(e) {
      const data = draw.getAll();
      console.log("data:", data);
    };
  
    return () => {
      map.current.remove();
    }
  }, []);

  // handles setting up a geocoder instance
  useEffect(() => {
    if (geoCoder.current) return;
    let GeoApi = { forwardGeocode: (config) => handleForwardGeocode(config) };
    const geoCoderOptions = { 
      maplibregl,
      marker: false,
      zoom: 10,
      limit: 2,
      showResultMarkers: false,
      clearAndBlurOnEsc: true,
      debounceSearch: 500,
      proximity: { 
        latitude: parseFloat(formLat).toFixed(6),
        longitude: parseFloat(formLng).toFixed(6),
      }
    };

    geoCoder.current = new MaplibreGeocoder(GeoApi, geoCoderOptions);
    // geocoder control has to be attached to map, so it's added but not displayed
    map.current?.addControl(geoCoder.current);
    let geoDiv = document.querySelector(".maplibregl-ctrl-geocoder");
    geoDiv.style.display = "none";

    // once geocoder throws a result, create and store a location obj to redux based on the feature
    geoCoder.current.on("result", (e) => {
      const markerToStore = {
        lng: e.result.center[0].toFixed(6),
        lat: e.result.center[1].toFixed(6),
        name: e.result.properties.name,
      };
      dispatch(mapActions.addMarkerLocation(markerToStore));
    });
  }, []);
  
  // sets listener for form submission on "Enter" keypress event
  useEffect(() => {
    handleFormKeypressEvent();

    return () => {
      let form = document.querySelector("#marker-form");
      form?.removeEventListener("keypress", async (e) => {
          console.log('removed listener');
      }, false);
    }
  }, []);


  // handles setting persisting markers on map based on redux store state
  useEffect(() => {
    if (storedLocations?.length <= 0) {
      map.current?.on('load', seedInitialMarkers)

      // fetches initial locations, creates markers, saves them to redux, and adds them to the map
      async function seedInitialMarkers() {
        const initialLocations = await getInitialLocations();
        initialLocations?.forEach((location) => {
          dispatch(mapActions.addMarkerLocation(location));
          const marker = new maplibregl.Marker()
            .setLngLat([location.lng, location.lat])
            .addTo(map.current);
        });
      };
    } else {
      // on storedLocations updating, we use the last location entry to set a new marker
      const marker = new maplibregl.Marker()
        .setLngLat([
          storedLocations[storedLocations.length - 1].lng,
          storedLocations[storedLocations.length - 1].lat
        ])
        .addTo(map.current);
    }
  }, [storedLocations]);

  return (
    <div className="map-wrap">
      <a href="https://www.maptiler.com" className="watermark"><img
          src="https://api.maptiler.com/resources/logo.svg" alt="MapTiler logo"/></a>
      <div ref={mapContainerRef} className="map"/>
      <form id='marker-form' >
        <div className='form-inputs'>
          <label>
            longitude: 
            <input
              required
              name="lng"
              type="number"
              placeholder='-104.991531'
              value={formLng}
              onChange={handleLngChange}
            />
          </label>
          <label>
            latitude: 
            <input
              required
              name="lat"
              type="number"
              placeholder='39.742043'
              value={formLat}
              onChange={handleLatChange} 
            />
          </label>
          <label>
            name:
            <input
              required
              name="name"
              type="text"
              placeholder='Denver'
              value={formName}
              onChange={handleNameChange} 
            />
          </label>
        </div>
        <button
          className='hidden-submit-button'
          style={{display: "none"}}
          type='submit'
          onClick={handleSubmitForm} 
        />
      </form>
      { validationErrors?.length > 0 && 
      <ul className='errors-list'>
        { validationErrors?.length > 0 && validationErrors?.map((error, i) => (
          <li key={`error-${i}`}>
            <label>error: </label>{error}
          </li>
        ))}
      </ul>
      }
    </div>
  );
}
