/************************************************************************************************************************************
* RESOURCES:                                                                                                                        *
* understand I need sqs url: https://www.youtube.com/watch?v=nhEFJgIhvuk                                                            *
* SQSClient example: https://www.npmjs.com/package/@aws-sdk/client-sqs                                                              *
* SendMessageCommand example: https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/sqs/command/SendMessageCommand/         *
*************************************************************************************************************************************/

// Imports
const { SQSClient, SendMessageCommand  } = require("@aws-sdk/client-sqs");


// SQS clients
const client = new SQSClient();


/*
* function for sending msg into sqs
* input: sqs-url, publisher-usserID, subject (email title) & body (the actual message)
*/
async function send2SQS(sqsURL, publisherUserID, subject, body) {
    await client.send(new SendMessageCommand({
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
        MessageBody: body + "\n\n-----\nFacebook friend Idan sent you a message!",
        QueueUrl: sqsURL
    }));
}


exports.handler = async (event) => {
    console.log(event);

    //--------------------------------------------------
    // exstract post parameters data
    const data = JSON.parse(event.body);
    
    const publisherUserID = data.userID;
    const subject = data.subject;
    const body = data.body;
    //--------------------------------------------------

    const sqsURL = process.env.SQS_URL;

    await send2SQS(sqsURL, publisherUserID, subject, body);

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
