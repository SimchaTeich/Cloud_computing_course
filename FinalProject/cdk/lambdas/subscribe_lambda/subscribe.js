/************************************************************************************************************************************
* RESOURCES:                                                                                                                        *
* subscribe: https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/sns-examples-subscribing-unubscribing-topics.html    *                                                                                                      *
* subscribe email example: https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/javascript_sns_code_examples.html      *
*************************************************************************************************************************************/

// Imports
const { DynamoDBClient, QueryCommand }       = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, GetCommand } = require('@aws-sdk/lib-dynamodb');
const { unmarshall }                         = require("@aws-sdk/util-dynamodb");
const { SNSClient, SubscribeCommand }        = require("@aws-sdk/client-sns");


// DynamoDB clients
const client = new DynamoDBClient();
const docClient = DynamoDBDocumentClient.from(client);


// sns client
const snsClient = new SNSClient();


/*
* function subscribe email to sns topic
*/
async function subscribe(topicArn, email)
{
    const response = await snsClient.send(
        new SubscribeCommand({
          Protocol: "email",
          TopicArn: topicArn,
          Endpoint: email,
        }),
    );

    return response;
}


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


    //--------------------------------------------------
    // exstract sns topic ARN by publisher-UserID
    response = await docClient.send(new GetCommand({
        TableName: process.env.TOPICS_TABLE_NAME,
        Key: {userID: publisherUserID}
    }));
    const topicArn = response.Item.topicArn;
    //--------------------------------------------------


    //--------------------------------------------------
    // subscribe the subscriber Email (user email) to topic of publisher
    await subscribe(topicArn, subscriberEmail); 
    //--------------------------------------------------

    
    return {
        statusCode: 200,
        body: JSON.stringify({msg: "Subscribed successfully, check your email"}),
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        }
    };
};