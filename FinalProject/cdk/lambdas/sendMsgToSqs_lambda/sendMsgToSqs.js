/************************************************************************************************************************************
* RESOURCES:                                                                                                                        *
* understand I need sqs url: https://www.youtube.com/watch?v=nhEFJgIhvuk                                                            *
* SQSClient example: https://www.npmjs.com/package/@aws-sdk/client-sqs                                                              *
* SendMessageCommand example: https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/sqs/command/SendMessageCommand/         *
*************************************************************************************************************************************/

// Imports
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand } = require('@aws-sdk/lib-dynamodb');
const { SQSClient, SendMessageCommand  } = require("@aws-sdk/client-sqs");


// DynamoDB clients
const client = new DynamoDBClient();
const docClient = DynamoDBDocumentClient.from(client);


// SQS clients
const sqs_client = new SQSClient();


/*
* function for sending msg into sqs
* input: sqs-url, publisher-usserID, subject (email title) & body (the actual message)
*/
async function send2SQS(sqsURL, publisherUserID, subject, body) {
    await sqs_client.send(new SendMessageCommand({
        MessageAttributes: {
            publisherUserID: {
                DataType: "String",
                StringValue: publisherUserID
            },
            Subject: {
                DataType: "String",
                StringValue: subject
            }
        },
        MessageBody: body,
        QueueUrl: sqsURL
    }));
}


exports.handler = async (event) => {
    console.log(event);

    //--------------------------------------------------
    // exstract post parameters data
    const data = JSON.parse(event.body);
    
    const userID = data.userID;
    const subject = data.subject;
    const body = data.body;
    //--------------------------------------------------


    //--------------------------------------------------
    // get the publisher user name
    const response = await docClient.send(new GetCommand({
        TableName: process.env.USERS_TABLE_NAME,
        Key: {userID: userID}
    }));
    const username = response.Item.username;
    //--------------------------------------------------


    // get the sqs url
    const sqsURL = process.env.SQS_URL;


    await send2SQS(sqsURL, userID, subject, body + `\n\n-----\nFacebook friend ${username} sent you a message!`);

    
    return {
        statusCode: 200,
        body: JSON.stringify({msg: "The message was sent successfully"}),
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        }
    };
};
