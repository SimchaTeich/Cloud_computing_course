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
    var params = {
        MessageAttributes: {
            publisherUserID: {
                DataType: "String",
                StringValue: publisherUserID // from post parameters
            },
            Subject: {
                DataType: "String",
                StringValue: subject // from post parameters
          }
        },
        MessageBody: body, // from post parameters
        QueueUrl: sqsURL
    };

    await client.send(new SendMessageCommand(params));
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

    await send2SQS(sqsURL, publisherUserID, subject, body);//"67c6f532-daf8-484f-abdc-d31966bfa65d", "subject-from-lambda", "body-form-lambda");

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
