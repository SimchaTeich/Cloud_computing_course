/************************************************************************************************************************************
* RESOURCES:                                                                                                                        *
* getCommand: https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/example_dynamodb_GetItem_section.html                *
* check if object exist: https://stackoverflow.com/questions/26726862/how-to-determine-if-object-exists-aws-s3-node-js-sdk          *
* insert new key-value: https://stackoverflow.com/questions/28527712/how-to-add-key-value-pair-in-the-json-object-already-declared  *
*************************************************************************************************************************************/

// Imports
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand } = require('@aws-sdk/lib-dynamodb');
const { S3Client, GetObjectCommand, HeadObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

// DynamoDB clients
const client = new DynamoDBClient();
const docClient = DynamoDBDocumentClient.from(client);

// S3 client
const s3Client = new S3Client();


/**
* Function check if an object is exist in s3
*/
async function checkFileIsExist(Bucket, Key) {
    const params = {
        Bucket: Bucket,
        Key: Key
    };

    const command = new HeadObjectCommand(params);
    
    try {
        await s3Client.send(command);
        return true;
    } catch {
        return false;
    }
}


/**
* Function create and return preSignedUrl for get requests
*/
async function generatePreSignedUrl(Bucket, Key) {
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


    //--------------------------------------------------
    // check if there is a valid profile image
    const validProfile = await checkFileIsExist(process.env.BUCKET_NAME, userID+"/profile.png");
    let profileUrl = "";
    
    // get preSignedUrl for profile
    if (validProfile) {
        profileUrl = await generatePreSignedUrl(process.env.BUCKET_NAME, userID+"/profile.png");
    }

    // update item with profile image
    item["validProfileImg"] = validProfile;
    if (validProfile) {
        item["profilePreSignedUrl"] = profileUrl;
    }

    return {
        statusCode: 200,
        body: JSON.stringify({userDetails: item}),
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        }
    };
    //--------------------------------------------------
};
  