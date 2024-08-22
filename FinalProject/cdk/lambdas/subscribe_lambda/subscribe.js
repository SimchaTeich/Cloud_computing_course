// Imports
const { DynamoDBClient, QueryCommand }       = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, GetCommand } = require('@aws-sdk/lib-dynamodb');
const { unmarshall }                         = require("@aws-sdk/util-dynamodb");
//const { subscribe } = require("diagnostics_channel");


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
    let response = await docClient.send(new GetCommand(params));
    let item = response.Item;
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
    // else, exstract email to be subscribe
    const subscriberEmail = response.Item.email;
    //--------------------------------------------------


    //------------------------------------------------------------------------------------------
    // check if publisher doesnt exist by publisher email
    const quarycommand = new QueryCommand({
        TableName: process.env.USERS_TABLE_NAME,
        IndexName: 'emailIndex',
        KeyConditionExpression: 'email = :email',
        ExpressionAttributeValues: {
        ':email': { S: publisherEmail },
        },
    });

    response = await client.send(quarycommand);
    if (response.Count == 0)
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
    // else, exstract userID of publisher
    const publisherUserID = response.Items.map(i => unmarshall(i))[0].userID;
    //------------------------------------------------------------------------------------------

    return {
        statusCode: 200,
        body: JSON.stringify({
            subscriberUserID: userID,
            subscriberEmail: subscriberEmail,
            publisherUserID: publisherUserID,
            publisherEmail: publisherEmail
        }),
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        }
    };


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