/************************************************************************************************************************************
* RESOURCES:                                                                                                                        *
* getCommand: https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/example_dynamodb_GetItem_section.html                *
*************************************************************************************************************************************/

// Imports
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand } = require('@aws-sdk/lib-dynamodb');
const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

// DynamoDB clients
const client = new DynamoDBClient();
const docClient = DynamoDBDocumentClient.from(client);


/**
* Function create and return preSignedUrl for get requests
*/
async function generatePreSignedUrl(Bucket, Key) {
    const s3Client = new S3Client();

    const getObjectParams = {
        Bucket: Bucket,
        Key: Key
    };

    const command = new GetObjectCommand(getObjectParams);
    const url = await getSignedUrl(s3Client, command, {expiresIn: 3600});
    return url;
}


exports.handler = async (event) => {
    console.log(event);

    //--------------------------------------------------
    // exstract userID
    if (!event.queryStringParameters == null || event.queryStringParameters.userID == null) {
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
    // get user details by userID
    const params = {
        TableName: process.env.USERS_TABLE_NAME,
        Key: {userID: userID}
    };

    const response = await docClient.send(new GetCommand(params));
    const item = response.Item;
    //--------------------------------------------------


    //--------------------------------------------------
    // check if user doesnt exist
    if (!item) {
        return {
            statusCode: 404,
            body: JSON.stringify({error: "userID doesnt exist"}),
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
                }
        };
    }
    //--------------------------------------------------


    // get presignedurl for profile
    const profileUrl = await generatePreSignedUrl(process.env.BUCKET_NAME, userID+"/profile.png");

    
    return {
        statusCode: 200,
        body: JSON.stringify({userDetails: item, profile: profileUrl}),
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        }
    };
    //--------------------------------------------------
};
  