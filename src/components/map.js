import React, {useEffect, useRef, useState} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import './map.css';
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import { getInitialLocations, validateCoordinates } from '../api.js';
import mapActions from '../actions.js';

const formInitialState = { lng: '', lat: '', name: ''};
// helper for generating unique ID for each location/poligon object
const generateRandomStringID = () => {
  return Math.random().toString(36).substring(2, 10);
};

export default function Map(props) {
  const mapContainerRef = useRef();
  const map = useRef(null);
  const [lng] = useState(props.lng || -104.991531);
  const [lat] = useState(props.lat || 39.742043);
  const [style] = useState('https://devtileserver.concept3d.com/styles/c3d_default_style/style.json');
  const [zoom] = useState(3);
  const [formValues, setFormValues] = useState(formInitialState);
  const [validationErrors, setValidationsErrors] = useState([]);

  // store
  // const storedLocations = useSelector((state) => state.locations);
  // const storedPolygons = useSelector((state) => state.polygons);
  const dispatch = useDispatch();

  const addMarkerToMap = async (locationObj) => {
    dispatch(mapActions.addMarkerLocation(locationObj));
    const popup = new maplibregl.Popup()
      .setMaxWidth("fit-content")
      .setHTML(`<h4>${locationObj.name}</h4>`)

    const marker = new maplibregl.Marker()
      .setLngLat([locationObj.lng, locationObj.lat])
      .setPopup(popup) // adds popup
      .addTo(map.current);
  };
  
  const handleFormChange = (e) => setFormValues({ ...formValues, [e.target.name]: e.target.value });
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setValidationsErrors([]);

    // validates form values in backend
    const validation = await validateCoordinates({
      lng: parseFloat(formValues.lng),
      lat: parseFloat(formValues.lat),
      name: formValues.name
    });

    // returns a 201 and formValues if valid, otherwise return errors to be displayed
    if (validation.status === 201) {
      const markerLocationObject = {
        id: generateRandomStringID(),
        lat: validation.payload?.lat, 
        lng: validation.payload?.lng,
        name: validation.payload?.name
      };
      await addMarkerToMap(markerLocationObject);
      map.current.flyTo({
        center: [validation.payload?.lng, validation.payload?.lat], // or [lat, lng] as per req? would not center on marker if so.
        zoom,
        speed: 0.7
      });
    } else if (validation.status === 406) {
      setValidationsErrors(validation.errors);
    }
    return;
  };

  // handler for Enter keypress event, will trigger a hidden submit button which calls handleFormSubmit
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
    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

    map.current.on('draw.create', newDraw);
    map.current.on('draw.delete', newDraw);
    map.current.on('draw.update', newDraw);
    map.current.on('load', seedInitialMarkers);

    function newDraw(e) {
      const data = draw.getAll();
      console.log("data:", data);
    };

    // fetches initial locations, creates markers, saves them to redux, and adds them to the map
    async function seedInitialMarkers() {
      const initialLocations = await getInitialLocations();
      initialLocations?.forEach((location) => {
        addMarkerToMap(location);
      });
    };
  
    return () => {
      map.current.remove();
    }
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
              value={formValues.lng}
              onChange={handleFormChange}
            />
          </label>
          <label>
            latitude: 
            <input
              required
              name="lat"
              type="number"
              placeholder='39.742043'
              value={formValues.lat}
              onChange={handleFormChange} 
            />
          </label>
          <label>
            name:
            <input
              required
              name="name"
              type="text"
              placeholder='Denver'
              value={formValues.name}
              onChange={handleFormChange} 
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
