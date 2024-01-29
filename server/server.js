const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const initialLocations = [
  {
    id: 'id1',
    name: 'Denver',
    lat: 39.742043,
    lng: -104.991531,
  },
  {
    id: 'id2',
    name: 'LA',
    lat: 34.052235,
    lng: -118.243683,
  },
  {
    id: 'id3',
    name: 'Boston',
    lat: 42.364506,
    lng: -71.038887,
  },
];

app.locals.idIndex = 3;
app.locals.locations = initialLocations;

app.get('/locations', (req, res) => res.send({ locations: app.locals.locations }));

// validate coordinates and name
app.post('/validate', (req, res) => {
  try {
    const { lng, lat, name } = req.body;
    const errors = [];
    
    // isFinite coerces str to num and rejects non-finite or non-number values
    const isLngValid = isFinite(lng) && Math.abs(lng) <= 180; // values should be floats between -180 and 180
    const isLatValid = isFinite(lat) && Math.abs(lat) <= 90; // values should be floats between -90 and 90

    console.log(lng, lat, name)
    console.log(isLngValid, isLatValid, name)

    if (isLatValid && isLngValid && name) {
      res.send({payload: {lng, lat, name}, status: 201});
    } else {
      if (!isLngValid) errors.push("Invalid longitude. Value should be between -180 and 180")
      if (!isLatValid) errors.push("Invalid latitude. Value should be between -90 and 90")
      if (!name || typeof name !== "string") errors.push("Invalid or missing location name")
      res.send({errors, status: 406});
    }
  } catch (error) {
    throw error
  }
});

app.use(express.static(path.resolve(__dirname, '..', 'build')));

app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, '..', 'build', 'index.html'));
});

const portNumber = process.env.PORT || 3001;

app.listen(portNumber, () => {
  console.log('RrrarrrrRrrrr server alive on port 3001');
});
