// Imports
const { DynamoDBClient, QueryCommand }       = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, GetCommand } = require('@aws-sdk/lib-dynamodb');


// DynamoDB clients
const client = new DynamoDBClient();
const docClient = DynamoDBDocumentClient.from(client);


exports.handler = async (event) => {
    console.log(event);

    //--------------------------------------------------
    // exstract post parameters data
    const data = JSON.parse(event.body);
    
    const userID = data.userID;
    const publisherEmail = data.publisherEmail;
    //--------------------------------------------------


    //--------------------------------------------------
    // check if user doesnt exist
    const params = {
        TableName: process.env.USERS_TABLE_NAME,
        Key: {userID: userID}
    };
    const response1 = await docClient.send(new GetCommand(params));
    const item = response1.Item;
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


    //------------------------------------------------------------------------------------------
    // check if publisher is exist by email
    const quarycommand = new QueryCommand({
        TableName: process.env.USERS_TABLE_NAME,
        IndexName: 'emailIndex',
        KeyConditionExpression: 'email = :email',
        ExpressionAttributeValues: {
        ':email': { S: publisherEmail },
        },
    });

    const response2 = await client.send(quarycommand);
    if (response2.Count == 0)
    {
        return {
            statusCode: 404,
            body: JSON.stringify({error: "Publisher doesnt exist"}),
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            }
        };
    }
    //------------------------------------------------------------------------------------------


    //--------------------------------------------------
    // check if email of publisher is exist
    //--------------------------------------------------


    //--------------------------------------------------
    // exstract userEmail for subscribe from userID
    //--------------------------------------------------


    //--------------------------------------------------
    // exstract ARN of sns topic, witch the userEmail subscribe to
    //--------------------------------------------------


    //--------------------------------------------------
    // subscribe the userEmail to ARN topic
    //--------------------------------------------------



    return {
        statusCode: 200,
        body: JSON.stringify({msg:"wow"}),
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        }
    };
};