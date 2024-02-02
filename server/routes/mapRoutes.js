const Router = require('express').Router();
const {
  getItems,
  addLocation,
  addPolygon,
} = require('./actions');

Router.get('/', getItems);
Router.post('/locations', addLocation);
Router.post('/polygons', addPolygon);

module.exports = Router;