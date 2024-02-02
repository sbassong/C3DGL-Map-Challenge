import React, {useEffect, useRef, useState} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import Form from './form/form.js';
import ErrorsPanel from './errorsPanel/errorsPanel.js';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import './map.css';
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import { 
  getItemsFromDynamo,
  ValidateLocationAndAddToDynamo,
  addPolygonToDynamo,
} from '../../api/api.js';
import { storeMarkerLocation, storePolygonGeojson } from '../../redux/actions.js';

const formInitialState = { lng: '', lat: '', name: ''};

export default function Map(props) {
  const mapContainerRef = useRef();
  const map = useRef(null);
  const formRef = useRef();
  const buttonRef = useRef();
  const [lng] = useState(props.lng || -104.991531);
  const [lat] = useState(props.lat || 39.742043);
  const [style] = useState('https://devtileserver.concept3d.com/styles/c3d_default_style/style.json');
  const [zoom] = useState(3);
  const [formValues, setFormValues] = useState(formInitialState);
  const [validationErrors, setValidationsErrors] = useState([]);

  const storedLocations = useSelector((state) => state.locations);
  const storedPolygons = useSelector((state) => state.polygons);
  const dispatch = useDispatch();

  const handleFormChange = (e) => setFormValues({ ...formValues, [e.target.name]: e.target.value });

  const handleFormKeypressEvent = async () => {
    formRef.current?.addEventListener("keypress", async (e) => {
      if (e?.key === "Enter" || e?.charCode === 13) {
        console.log(e)
        e.preventDefault();
        console.log(buttonRef.current)
        buttonRef.current?.click();
      } else return;
    });
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setValidationsErrors([]);
    
    console.log(formValues)
    const response = await ValidateLocationAndAddToDynamo({ // validates form values in backend
      lng: parseFloat(formValues.lng),
      lat: parseFloat(formValues.lat),
      name: formValues.name
    });

    if (!response?.success && response?.payload.length > 0) setValidationsErrors(response?.errors);
    else if (response?.success && response?.payload) {
      await seedMarkerToMap(response?.payload);
      map.current.flyTo({
        center: [response.payload?.lng, response.payload?.lat],
        zoom,
        speed: 0.7
      });
    } else return;
  };


  const seedMarkerToMap = async (location) => {
    dispatch(storeMarkerLocation(location));
    const marker = new maplibregl.Marker()
      .setLngLat([location.lng, location.lat])
      .setPopup(new maplibregl.Popup().setText(location.name)) // adds popup
      .addTo(map.current);
  };

  const seedPolygonToMap = (polygon) => {
    dispatch(storePolygonGeojson(polygon));
    map.current?.addSource(polygon.id, {
      "type": "geojson",
      "data": {
        "type": polygon.type,
        "geometry": polygon.geometry,
      },
    });
    map.current?.addLayer({
      "id": polygon.id,
      "type": "fill",
      "source": polygon.id,
      "layout": {},
      "paint": {
        "fill-color": "#0080ff",
        "fill-opacity": 0.5,
      },
    });
  };

  const fetchAndSeedDynamoItems = async () => {
    const response = await getItemsFromDynamo();
    if (!response?.success) return;
    response.items?.forEach((dbEntry) => {
      if (dbEntry.type === 'location') seedMarkerToMap(JSON.parse(dbEntry.item));
      else seedPolygonToMap(JSON.parse(dbEntry?.item));
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
    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

    map.current.on('draw.create', async (e) => {
      newDraw(e);
      await storePolygonData(e);
    });
    map.current.on('draw.delete', newDraw);
    map.current.on('draw.update', newDraw);
    map.current.on('load', fetchAndSeedDynamoItems);

    function newDraw(e) {
      const data = draw.getAll();
      console.log("data:", data);
    };

    async function storePolygonData (e) {
      if (e?.type === 'draw.create') {
        const polygon = e?.features[0];
        dispatch(storePolygonGeojson(polygon));
        await addPolygonToDynamo(polygon);
      }
    };
    
    handleFormKeypressEvent()
    
    return () => {
      map.current.remove();
      formRef.current?.removeEventListener("keypress", handleFormKeypressEvent);
    }
  }, []);

  return (
    <div className="map-wrap">
      <a href="https://www.maptiler.com" className="watermark"><img
          src="https://api.maptiler.com/resources/logo.svg" alt="MapTiler logo"/></a>
      <div ref={mapContainerRef} className="map"/>
      <Form
        formRef={formRef}
        buttonRef={buttonRef}
        formValues={formValues}
        handleFormChange={(e) => handleFormChange(e)}
        handleSubmitForm={handleSubmitForm}
        validationErrors={validationErrors}
      />
      { validationErrors?.length > 0 && 
        <ErrorsPanel validationErrors={validationErrors} 
      />}
    </div>
  );
}
