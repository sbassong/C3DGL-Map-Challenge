const addMarkerLocation = (location) => {
  return { type: "ADD_LOCATION", payload: location};
} ;

const addPolygon = (polygon) => {
  return { type: "ADD_POLYGON", payload: polygon};
};

const mapActions = {
  addMarkerLocation,
  addPolygon
};

export default  mapActions
