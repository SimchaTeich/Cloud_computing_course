/************************************************************************************************************************************
* RESOURCES:                                                                                                                        *
* 
*************************************************************************************************************************************/

// imports
const { DynamoDBClient }                                 = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, GetCommand } = require('@aws-sdk/lib-dynamodb');
const uuid                                               = require('uuid');
const {S3Client, PutObjectCommand}                       = require('@aws-sdk/client-s3');
const { getSignedUrl }                                   = require('@aws-sdk/s3-request-presigner');


// DynamoDB clients
const client = new DynamoDBClient();
const docClient = DynamoDBDocumentClient.from(client);


/*
* function creates a folder on bucket
* Input: Bucket name and folder path
*/
async function createFolder(Bucket, Key) {
    const client  = new S3Client();
    const command = new PutObjectCommand({Bucket, Key});
    return client.send(command);
}


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
    // exstract post parameters data
    const data = JSON.parse(event.body);

    const userID = data.userID;
    const title = data.title;
    const body = data.body;
    //--------------------------------------------------

 
    //--------------------------------------------------
    // Check if user doesnt exists
    const response = await docClient.send(new GetCommand({
        TableName: process.env.USERS_TABLE_NAME,
        Key: { userID: userID }
    }));
    if (!response.Item) {
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
    // else, create a new postID and insert to the posts table.
    const postID = uuid.v4();
    const putcommand = new PutCommand({
        TableName: process.env.POSTS_TABLE_NAME,
        Item: {
            postID: postID,
            userID: userID,
            title: title,
            body: body
        },
    });
    await docClient.send(putcommand);
    //--------------------------------------------------


    //--------------------------------------------------
    // create the post folder in the s3 bucket for image of post
    await createFolder(process.env.POSTS_BUCKET_NAME, postID+"/");
    //--------------------------------------------------


    //--------------------------------------------------
    // prepare the preSignUrl
    const url = await generatePreSignedUrl(process.env.POSTS_BUCKET_NAME, postID+"/image.png");
    //--------------------------------------------------


    return {
        statusCode: 200,
        body: JSON.stringify({
            msg: "The post was uploaded successfully",
            preSignedUrl: url
        }),
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        }
    };
};
