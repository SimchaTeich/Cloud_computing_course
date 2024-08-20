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
    const url = await getSignedUrl(s3Client, command, {expiresIn: 3600});
    return url;
}


exports.handler = async (event) => {
    console.log(event);

    //--------------------------------------------------
    // exstract userID
    if (!event.queryStringParameters == null || event.queryStringParameters.userID == null)
    {
        return {
            statusCode: 404,
            body: JSON.stringify({error: "userID is missing"}),
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            }
        };
    }
    const userID = event.queryStringParameters.userID;
    //--------------------------------------------------


    //--------------------------------------------------
    // Check if user doesnt exists
    const params = {
        TableName: process.env.USERS_TABLE_NAME,
        Key: { userID: userID }
    };
    const response = await docClient.send(new GetCommand(params));
    const item = response.Item;
    if (!item) {
        return { 
            statusCode: 404, 
            body: JSON.stringify({error: "UserID doesn't exist"}),
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            }
        };
    }
    //--------------------------------------------------


    //--------------------------------------------------
    // prepare the preSignUrl:
    const url = await generatePreSignedUrl(process.env.BUCKET_NAME, userID+"/profile.png");

    return {
        statusCode: 200,
        body: JSON.stringify({ preSignedUrl: url }),
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
    };
    //--------------------------------------------------
};
  