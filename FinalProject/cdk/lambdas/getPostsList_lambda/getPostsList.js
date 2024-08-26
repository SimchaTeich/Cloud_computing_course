/************************************************************************************************************************************
* RESOURCES:                                                                                                                        *
* scanCommand example: https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/dynamodb/command/ScanCommand/                  *
* add element to json arr: https://www.quora.com/How-do-you-add-elements-to-a-JSON-Array                                            *
* rekognition Detect Lables: https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/rekognition/command/DetectLabelsCommand/ *
*************************************************************************************************************************************/

// Imports
const { DynamoDBClient }                                  = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand, GetCommand } = require('@aws-sdk/lib-dynamodb');
const { S3Client, GetObjectCommand, HeadObjectCommand }   = require("@aws-sdk/client-s3");
const { getSignedUrl }                                    = require('@aws-sdk/s3-request-presigner');
const { RekognitionClient, DetectLabelsCommand }          = require("@aws-sdk/client-rekognition");

// DynamoDB clients
const client = new DynamoDBClient();
const docClient = DynamoDBDocumentClient.from(client);

// S3 client
const s3Client = new S3Client();

// Rekognition Client
const rekoClient = new RekognitionClient({ region: 'us-east-1' });


/**
* Function check if an object is exist in s3
*/
async function checkFileIsExist(Bucket, Key) {
    const command = new HeadObjectCommand({
        Bucket: Bucket,
        Key: Key
    });
    
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


/**
* Function return username by userID
*/
async function getUserName(userID) {
    const response = await docClient.send(new GetCommand({
        TableName: process.env.USERS_TABLE_NAME,
        Key: {userID: userID},
        ProjectionExpression: "username",
    }));
    return response.Item.username;
}


/**
* Function return post image preSignedUrl GET by postID
*/
async function getImage(postID) {
    // check if there is a valid image
    const validImage = await checkFileIsExist(process.env.POSTS_BUCKET_NAME, postID+"/image.png");
    let imageUrl = "";
    
    // get preSignedUrl for image
    if (validImage) {
        imageUrl = await generatePreSignedUrl(process.env.POSTS_BUCKET_NAME, postID+"/image.png");
    }

    // update item with image
    let item = {};
    item["validImage"] = validImage;
    if (validImage) {
        item["imagePreSignedUrl"] = imageUrl;
    }

    return item;
}


/**
* Function return tag for image
*/
async function getTags(postID) { 
    const command = new DetectLabelsCommand({
        Image: {
            S3Object: {
                Bucket: process.env.POSTS_BUCKET_NAME,
                Name: postID+"/image.png"
            }
        }
    });
    
    let response = [];
    try {
        response = await rekoClient.send(command);
        return response.Labels.map((lable) => lable.Name);
    } catch (error) {
        return [];
    }
}


exports.handler = async (event) => {
    console.log(event);

    //--------------------------------------------------
    // exstract userID
    if (event.queryStringParameters == null || !event.queryStringParameters.hasOwnProperty('userID')) {
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
    // check if user doesnt exist
    const response1 = await docClient.send(new GetCommand({
        TableName: process.env.USERS_TABLE_NAME,
        Key: {userID: userID}
    }));
    const item = response1.Item;
    if (!item) {
        return {
            statusCode: 404,
            body: JSON.stringify({error: "userID doesnt exist"}),
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            }
        };
    }
    //--------------------------------------------------


    //--------------------------------------------------
    // scan posts table
    const response2 = await docClient.send(new ScanCommand({
        TableName: process.env.POSTS_TABLE_NAME,
        //Limit: 2
    }));
    const items = response2.Items;
    const count = response2.Count;
    //--------------------------------------------------


    //--------------------------------------------------
    // For each post, find username and GET preSinedUrl for image
    let postsArr = [];
    for (const item of items) {
        let post = {};
        post["username"] = await getUserName(item.userID);
        post["title"]    = item.title;
        post["body"]     = item.body;
        post["image"]    = await getImage(item.postID);
        if (post["image"].validImage) {
            post["tags"] = await getTags(item.postID);
        }
        postsArr.push(post);
    }
    //--------------------------------------------------


    return {
        statusCode: 200,
        body: JSON.stringify({posts: postsArr, count: count}),
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        }
    };
};
  