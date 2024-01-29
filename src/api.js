
import Axios from 'axios';

export const BASE_URL = process.env.NODE_ENV === 'production'
  ? `${window.location.origin}/`
  : 'http://127.0.0.1:3001';

const Api = Axios.create({ baseURL: BASE_URL });

export const getInitialLocations = async() => {
  try {
    const res = await Api.get('/locations');
    return res.data.locations;
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
