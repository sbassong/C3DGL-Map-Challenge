const Router = require('express').Router();
const mapRouter = require('./mapRoutes');

Router.use('/', mapRouter);

module.exports = Router;