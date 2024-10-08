/************************************************************************************************************************************
* RESOURCES:                                                                                                                        *
* deleteCommand: https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/example_dynamodb_DeleteItem_section.html          *
* delete sns topic: https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/sns-examples-managing-topics.html             *
*************************************************************************************************************************************/

// Imports
const { DynamoDBClient }                                       = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, DeleteCommand }    = require('@aws-sdk/lib-dynamodb');
const { S3Client, ListObjectsV2Command, DeleteObjectsCommand } = require("@aws-sdk/client-s3");
const { SNSClient, DeleteTopicCommand }                        = require("@aws-sdk/client-sns");


// DynamoDB clients
const client = new DynamoDBClient();
const docClient = DynamoDBDocumentClient.from(client);


// SNS client
const snsClient = new SNSClient();


/**
 * Function to delete a folder from an S3 bucket.
 */
async function deleteFolder(Bucket, Key) {
    const s3Client = new S3Client();

    // List objects in the specified prefix
    let listParams = {
        Bucket: Bucket,
        Prefix: Key
    };

    let objectsToDelete = [];
    let listedObjects;

    do {
        listedObjects = await s3Client.send(new ListObjectsV2Command(listParams));
        
        // Collect objects to delete
        if (listedObjects.Contents.length > 0) {
            listedObjects.Contents.forEach(obj => {
                objectsToDelete.push({ Key: obj.Key });
            });
        }
        
        // Set the marker for the next batch
        listParams.ContinuationToken = listedObjects.NextContinuationToken;
    } while (listedObjects.IsTruncated);

    // Delete objects
    if (objectsToDelete.length > 0) {
        let deleteParams = {
            Bucket: Bucket,
            Delete: {
                Objects: objectsToDelete
            }
        };

        await s3Client.send(new DeleteObjectsCommand(deleteParams));
    }
}



/*
* function deletes an sns topic
*/
async function deleteTopic(topicArn) {
    const response = await snsClient.send(
      new DeleteTopicCommand({ TopicArn: topicArn }),
    );
    return response.TopicArn;
}



exports.handler = async (event) => {
    console.log(event);

    // Parse POST parameters data
    const data = JSON.parse(event.body);


    //--------------------------------------------------
    // Exstract userID
    const userID = data.userID;
    if (!userID) {
        return { 
            statusCode: 404,
            body: JSON.stringify({error: "userID is missing"}),
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
    // Check if user exists
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
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            }
        };
    }
    //--------------------------------------------------


    //--------------------------------------------------
    // Delete user by userID from the: DynamoDB users table,
    //                                 S3 user folder,
    //                                 sns user topic,
    //                                 DynamoDB topics table
    await docClient.send(new DeleteCommand(params));           // DynamoDB users table
    await deleteFolder(process.env.BUCKET_NAME, userID + "/"); // S3 user folder,
    const params2 = {
        TableName: process.env.TOPICS_TABLE_NAME,
        Key: { userID: userID }
    };
    const response2 = await docClient.send(new GetCommand(params2));
    const topicArn = response2.Item.topicArn;
    await deleteTopic(topicArn);                               // delete the sns itself
    await docClient.send(new DeleteCommand(params2));           // delete user db entry for sns
    //--------------------------------------------------


    return {
        statusCode: 200,
        body: JSON.stringify({ msg: "User deleted successfully" }),
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        }
    };
};
