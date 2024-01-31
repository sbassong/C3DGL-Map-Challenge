const AWS = require('aws-sdk');
const config = require('./awsConfig.js');

AWS.config.update(config.aws_remote_config);
const docClient = new AWS.DynamoDB.DocumentClient();

const addLocation = function (req, res) {
  const location = { ...req.body };
  var params = {
    TableName: config.aws_table_name,
    Item: {
    'locations-and-polygons': JSON.stringify(location),
    'item-type': 'location',
    },
  };

  // Call DynamoDB client to add the item to the table
  docClient.put(params, function (err, data) {
		if (err) {
			res.send({
				success: false,
				message: err
			});
		} else {
			res.send({
				success: true,
				message: 'Location successfuly added',
				locations: data
			});
		}
  });
};

const getLocations = async function (req, res) {
  AWS.config.update(config.aws_remote_config);
  const docClient = new AWS.DynamoDB.DocumentClient();
  const params = {
		TableName: config.aws_table_name,
	};
	// scans all the items in the provided table
  docClient.scan(params, function (err, data) {
    if (err) {
			console.log(err);
			res.send({
				success: false,
				message: err
			});
    } else {
			// filter and parse the returned data
						console.log(res.header())
			const locations = [];
			data.Items.forEach((item) => {
				if (item['item-type'] === 'location') {
					locations.push(JSON.parse(item['locations-and-polygons']));
				} 
			});
			
			res.send({
				success: true,
				locations: locations
			});
    }
  });
};

const addPolygon = function (req, res) {
  AWS.config.update(config.aws_remote_config);
  const docClient = new AWS.DynamoDB.DocumentClient();
  const polygon = { ...req.body };
  var params = {
		TableName: config.aws_table_name,
		Item: {
			'locations-and-polygons': JSON.stringify(polygon),
			'item-type': 'polygon',
		},
  };

  docClient.put(params, function (err, data) {
		if (err) {
			res.send({
					success: false,
					message: err
			});
		} else {
			res.send({
				success: true,
				message: 'Polygon successfuly added',
				polygons: data
			});
		}
  });
};

const getPolygons = async function (req, res) {
  AWS.config.update(config.aws_remote_config);
  const docClient = new AWS.DynamoDB.DocumentClient();
  const params = {
		TableName: config.aws_table_name,
	};

  docClient.scan(params, function (err, data) {
    if (err) {
			console.log(err);
			res.send({
				success: false,
				message: err
			});
    } else {
			const polygons = [];
			data.Items.forEach((item) => {
				if (item['item-type'] === 'polygon') {
					polygons.push(JSON.parse(item['locations-and-polygons']));
				} 
			});

			res.send({
				success: true,
				polygons: polygons,
			});
    }
  });
};

const validateCoordinates = async function (req, res) {
  try {
    const { lng, lat, name } = req.body;
    const errors = [];
    
    // Number.isFinite rejects non-finite or non-number values
    const isLngValid = () => Number.isFinite(lng) && Math.abs(lng) <= 180; // values should be floats between -180 and 180
    const isLatValid = () => Number.isFinite(lat) && Math.abs(lat) <= 90; // values should be floats between -90 and 90

    if (isLatValid() && isLngValid() && name) {
      res.send({payload: {lng, lat, name}, status: 201});
    } else {
      if (!isLngValid()) errors.push("Invalid longitude. Value should be between -180 and 180");
      if (!isLatValid()) errors.push("Invalid latitude. Value should be between -90 and 90");
      if (!name || typeof name !== "string") errors.push("Invalid or missing location name");

      res.send({errors, status: 406});
    }
  } catch (error) {
    throw error
  }
};

module.exports = {
  addLocation,
  getLocations,
  addPolygon,
  getPolygons,
	validateCoordinates
};