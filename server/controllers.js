const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand, ScanCommand } = require("@aws-sdk/lib-dynamodb");
const { fromIni } = require('@aws-sdk/credential-provider-ini');

const tableName = 'C3DMC-dynamodb';
const client = new DynamoDBClient( {
	credentials: fromIni({
    filepath: ".aws/credentials.ini",
		profile: 'default'
  }),
	region: 'us-west-2',
});
const docClient = DynamoDBDocumentClient.from(client);


// 
const addLocation = async function (req, res) {
		const { formValues, type } = req.body;
		const validationStatus = validateFormValues(formValues);

		if (validationStatus?.isValid) {
			const command = new PutCommand({
				TableName: tableName,
				Item: {
					'locations-and-polygons': JSON.stringify(validationStatus?.location),
					'item-type': type,
				},
				ReturnValues: 'ALL_OLD'
			});

			await docClient.send(command, function (err, data) {
				if (err) {
					res.send({
						success: false,
						message: err
					});
				} else {
					res.send({
						success: true,
						payload: validationStatus?.location
					});
				}
			});
		} else {
			res.send({
				success: false,
				payload: validationStatus?.errors
			})
		}
};

// 	const command = new ListTablesCommand({});

//   const response = await client.send(command);
//   console.log(response.TableNames.join("\n"));
//   return response;

//   Call DynamoDB client to add the item to the table
//   client.put(params, function (err, data) {
// 		if (err) {
// 			res.send({
// 				success: false,
// 				message: err
// 			});
// 		} else {
// 			res.send({
// 				success: true,
// 				message: 'Location successfuly added',
// 				locations: data
// 			});
// 		}
//   });
// };

const getLocations = async function (req, res) {
  // AWS.config.update(config.aws_remote_config);
  // const docClient = new AWS.DynamoDB.DocumentClient();
  // const params = {
	// 	TableName: config.aws_table_name,
	// };
	// // scans all the items in the provided table
  // docClient.scan(params, function (err, data) {
  //   if (err) {
	// 		console.log(err);
	// 		res.send({
	// 			success: false,
	// 			message: err
	// 		});
  //   } else {
	// 		// filter and parse the returned data
	// 		const locations = [];
	// 		data.Items.forEach((item) => {
	// 			if (item['item-type'] === 'location') {
	// 				locations.push(JSON.parse(item['locations-and-polygons']));
	// 			} 
	// 		});
			
	// 		res.send({
	// 			success: true,
	// 			locations: locations
	// 		});
  //   }
  // });
};

const addPolygon = function (req, res) {
  // AWS.config.update(config.aws_remote_config);
  // const docClient = new AWS.DynamoDB.DocumentClient();
  // const polygon = { ...req.body };
  // const params = {
	// 	TableName: config.aws_table_name,
	// 	Item: {
	// 		'locations-and-polygons': JSON.stringify(polygon),
	// 		'item-type': 'polygon',
	// 	},
  // };

  // docClient.put(params, function (err, data) {
	// 	if (err) {
	// 		res.send({
	// 				success: false,
	// 				message: err
	// 		});
	// 	} else {
	// 		res.send({
	// 			success: true,
	// 			message: 'Polygon successfuly added',
	// 			polygons: data
	// 		});
	// 	}
  // });
};

const getPolygons = async function (req, res) {
  // AWS.config.update(config.aws_remote_config);
  // const docClient = new AWS.DynamoDB.DocumentClient();
  // const params = {
	// 	TableName: config.aws_table_name,
	// };

  // docClient.scan(params, function (err, data) {
  //   if (err) {
	// 		console.log(err);
	// 		res.send({
	// 			success: false,
	// 			message: err
	// 		});
  //   } else {
	// 		const polygons = [];
	// 		data.Items.forEach((item) => {
	// 			if (item['item-type'] === 'polygon') {
	// 				polygons.push(JSON.parse(item['locations-and-polygons']));
	// 			} 
	// 		});

	// 		res.send({
	// 			success: true,
	// 			polygons: polygons,
	// 		});
  //   }
  // });
};

// helpers
const generateRandomStringID = () => { // unique ids for polygons and locations
  return Math.random().toString(36).substring(2, 10);
};
const validateLng = (lng) => Number.isFinite(lng) && Math.abs(lng) <= 180; // values should be floats between -180 and 180
const validateLat = (lat) => Number.isFinite(lat) && Math.abs(lat) <= 90; // values should be floats between -90 and 90

function validateFormValues ({lng, lat, name}) {
	const errors = [];
	const id = generateRandomStringID();
	const isLngValid = validateLng(lng);
	const isLatValid = validateLat(lat);

	if (isLatValid && isLngValid && name) {
		return { isValid: true, location: { id, lng, lat, name } };
	} else {
		if (!isLngValid) errors.push("Non-valid longitude. Value should be between -180 and 180");
		if (!isLatValid) errors.push("Non-valid latitude. Value should be between -90 and 90");
		if (!name || typeof name !== "string") errors.push("Non-valid or missing location name");
		return { isValid: false, errors };
	}
};

module.exports = {
  addLocation,
  getLocations,
  addPolygon,
  getPolygons,
};