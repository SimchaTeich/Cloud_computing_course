/************************************************************************************************************************************
* RESOURCES:                                                                                                                        *
* getCommand: https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/example_dynamodb_GetItem_section.html                *
*************************************************************************************************************************************/

// Imports
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand } = require('@aws-sdk/lib-dynamodb');
const { S3Client } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { PutObjectCommand } = require('@aws-sdk/client-s3');

// DynamoDB clients
const client = new DynamoDBClient();
const docClient = DynamoDBDocumentClient.from(client);


/**
* Function create and return preSignedUrl for put requests
*/
async function generatePreSignedUrl(Bucket, Key) {
    const s3Client = new S3Client();

    const putObjectParams = {
        Bucket: Bucket,
        Key: Key
    };

    const command = new PutObjectCommand(putObjectParams);
    let url;
    try{
    url = await getSignedUrl(s3Client, command, {expiresIn: 3600});
    } catch (err) {
        return "error";
    }

    return url;
}


exports.handler = async (event) => {
    console.log(event);

    // exstract userID
    if (!event.queryStringParameters == null || event.queryStringParameters.userID == null)
    {
        return {statusCode:200, body: JSON.stringify({msg: "userID is missing"})};
    }
    const userID = event.queryStringParameters.userID;

    // Check if user doesnt exists
    const params = {
        TableName: process.env.USERS_TABLE_NAME,
        Key: { userID: userID }
    };
    const response = await docClient.send(new GetCommand(params));
    const item = response.Item;
    if (!item) {
        return { statusCode: 404, body: JSON.stringify({ msg: "UserID doesn't exist" }) };
    }

    // else, prepare the preSignUrl:
    const url = await generatePreSignedUrl(process.env.BUCKET_NAME, userID+"/profile.png");

    return {
        statusCode: 200,
        body: JSON.stringify({ url: url }),
        headers: {
          'Access-Control-Allow-Origin': '*', // Adjust this as needed
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      };
      
};
  