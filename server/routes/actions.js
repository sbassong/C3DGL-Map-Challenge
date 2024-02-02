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


const addLocation = async function (req, res) {
	const { formValues } = req.body;
	console.log(formValues)
	const validationStatus = validateFormValues(formValues);

	if (validationStatus?.isValid) {
		const command = new PutCommand({
			TableName: tableName,
			Item: {
				'item': JSON.stringify(validationStatus?.location),
				'type': 'location',
			},
			ReturnValues: 'ALL_OLD'
		});

		docClient.send(command, function (err, data) {
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

const addPolygon = async function (req, res) {
	const { polygon } = req.body;
	const command = new PutCommand({
		TableName: tableName,
		Item: {
			'item': JSON.stringify(polygon),
			'type': 'polygon',
		},
		ReturnValues: 'ALL_OLD'
	});

	docClient.send(command, function (err, data) {
		if (err) {
			res.send({
				success: false,
				message: err
			});
		} else {
			res.send({
				success: true,
				payload: polygon
			});
		}
	});
};


const getItems = async function (req, res) {
	const command = new ScanCommand({
    TableName: tableName,
  });

	// scans all the items in the provided table
  docClient.send(command, function (err, data) {
    if (err) {
			res.send({
				success: false,
				message: err
			});
    } else {
			console.log(data.Items)
			res.send({
				success: true,
				items: data.Items
			});
    }
  });
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
	getItems,
  addLocation,
  addPolygon
};