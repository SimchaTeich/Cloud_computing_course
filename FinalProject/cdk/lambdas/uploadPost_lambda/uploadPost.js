/************************************************************************************************************************************
* RESOURCES:                                                                                                                        *
* 
*************************************************************************************************************************************/

// imports
const { DynamoDBClient }                                 = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, GetCommand } = require('@aws-sdk/lib-dynamodb');
const uuid                                               = require('uuid');
//const {S3Client, PutObjectCommand}                     = require('@aws-sdk/client-s3');


// DynamoDB clients
const client = new DynamoDBClient();
const docClient = DynamoDBDocumentClient.from(client);


// /*
// * function creates a folder on bucket
// * Input: Bucket name and folder path
// */
// async function createFolder(Bucket, Key) {
//   const client  = new S3Client();
//   const command = new PutObjectCommand({Bucket, Key});
//   return client.send(command);
// }


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


//   //--------------------------------------------------
//   // create the user folder in the s3 bucket
//   await createFolder(process.env.BUCKET_NAME, userID+"/");
//   //--------------------------------------------------


    return {
        statusCode: 200,
        body: JSON.stringify({msg: "The post was uploaded successfully"}),
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        }
    };
};
