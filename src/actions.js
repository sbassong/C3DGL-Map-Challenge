export const storeMarkerLocation = (location) => {
  return { type: "ADD_LOCATION", payload: location};
} ;

export const storePolygonGeojson = (polygon) => {
  return { type: "ADD_POLYGON", payload: polygon};
};

