
import Axios from 'axios';

export const BASE_URL = process.env.NODE_ENV === 'production'
  ? `https://c3d-code-challenge-6747da207e29.herokuapp.com/`
  : 'http://127.0.0.1:3001';

const Api = Axios.create({ baseURL: BASE_URL });

export const getInitialLocationsFromDynamo = async() => {
  try {
    const res = await Api.get('/locations');
    return res.data.locations;
  } catch (error) {
    throw error
  }
};

export const addLocationToDynamo = async(location) => {
  try {
    const res = await Api.post("/addlocation", location);
    return res.data;
  } catch (error) {
    throw error
  }
};

export const getPolygonsFromDynamo = async() => {
  try {
    const res = await Api.get('/polygons');
    return res.data.polygons;
  } catch (error) {
    throw error
  }
};

export const addPolygonToDynamo = async(polygon) => {
  try {
    const res = await Api.post("/addpolygon", polygon);
    return res.data;
  } catch (error) {
    throw error
  }
};

export const validateCoordinates = async(coordObj) => {
  try {
    const res = await Api.post("/validate", coordObj);
    return res.data;
  } catch (error) {
    throw error
  }
};


