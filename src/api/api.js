
import Axios from 'axios';

export const BASE_URL = process.env.NODE_ENV === 'production'
  ? `${window.location.origin}/api`
  : 'http://127.0.0.1:3001/api';

const Api = Axios.create({ baseURL: BASE_URL });

export const getItemsFromDynamo = async() => {
  try {
    const res = await Api.get('/');
    return res.data;
  } catch (error) {
    console.error(error);
  }
};

export const ValidateLocationAndAddToDynamo = async(location) => {
  try {
    const res = await Api.post("/locations", location);
    return res.data;
  } catch (error) {
    console.error(error);
  }
};

export const addPolygonToDynamo = async(polygon) => {
  try {
    const res = await Api.post("/polygons", polygon);
    return res.data;
  } catch (error) {
    console.error(error);
  }
};



