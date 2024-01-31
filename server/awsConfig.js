require('dotenv').config();

const tableName = process.env.DYNAMO_TABLE;
const accessKeyId = process.env.DYNAMO_ACCESS_KEY_ID;
const secretAccessKey = process.env.DYNAMO_SECRET_ACCESS_KEY;
const region = process.env.DYNAMO_REGION;

module.exports = {
    aws_table_name: tableName,
    aws_remote_config: {
      accessKeyId: accessKeyId,
      secretAccessKey: secretAccessKey,
      region: region,
    },
    // aws_local_config: {
    //   //Provide details for local configuration
    // }
};