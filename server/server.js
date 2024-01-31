require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const app = express();
const { getLocations, addLocation, getPolygons, addPolygon, validateCoordinates } = require('./controllers');

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// // Obsolete, initialLocations now in DynamoDB
// const initialLocations = [
//   {
//     id: 'id1',
//     name: 'Denver',
//     lat: 39.742043,
//     lng: -104.991531,
//   },
//   {
//     id: 'id2',
//     name: 'LA',
//     lat: 34.052235,
//     lng: -118.243683,
//   },
//   {
//     id: 'id3',
//     name: 'Boston',
//     lat: 42.364506,
//     lng: -71.038887,
//   },
// ];

// app.locals.idIndex = 3;
// app.locals.locations = initialLocations;

// routes
app.get('/locations', getLocations);
app.post('/addlocation', addLocation);
app.get('/polygons', getPolygons);
app.post('/addpolygon', addPolygon);
app.post('/validate', validateCoordinates);


if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.resolve(__dirname, '..', 'build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'build', 'index.html'));
  })
} else {
  app.use(express.static(path.resolve(__dirname, '..', 'build')));
  
  app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, '..', 'build', 'index.html'));
  });

}

const portNumber = process.env.PORT || 3001;

app.listen(portNumber, () => {
  console.log('RrrarrrrRrrrr server alive on port 3001');
});
