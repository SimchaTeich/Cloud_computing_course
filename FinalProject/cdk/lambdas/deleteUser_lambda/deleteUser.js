/************************************************************************************************************************************
* RESOURCES:                                                                                                                        *
* deleteCommand: https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/example_dynamodb_DeleteItem_section.html          *
*************************************************************************************************************************************/

// Imports
const querystring = require('node:querystring');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');
const { S3Client, ListObjectsV2Command, DeleteObjectsCommand } = require("@aws-sdk/client-s3");

// DynamoDB clients
const client = new DynamoDBClient();
const docClient = DynamoDBDocumentClient.from(client);


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


exports.handler = async (event) => {
    console.log(event);

    // Parse POST parameters data
    const data = event.body;
    const parsedData = querystring.parse(data);

    // Exstract userID
    if (!parsedData["userID"]) {
        return { statusCode: 400, body: JSON.stringify({ msg: "userID is missing" }) };
    }
    const userID = parsedData["userID"];

    // Check if user exists
    const params = {
        TableName: process.env.USERS_TABLE_NAME,
        Key: { userID: userID }
    };
    const response = await docClient.send(new GetCommand(params));
    const item = response.Item;
    if (!item) {
        return { statusCode: 404, body: JSON.stringify({ msg: "UserID doesn't exist" }) };
    }

    // Delete user by userID
    await docClient.send(new DeleteCommand(params));

    // Finally, delete user folder
    await deleteFolder(process.env.BUCKET_NAME, userID + "/");

    return { statusCode: 200, body: JSON.stringify({ msg: "User deleted successfully" }) };
};
