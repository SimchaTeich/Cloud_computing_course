/************************************************************************************************************************************
* RESOURCES:                                                                                                                        *
* publish: https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/sns-examples-publishing-messages.html                  *
/************************************************************************************************************************************/

// Imports
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand } = require('@aws-sdk/lib-dynamodb');
const { SNSClient, PublishCommand } = require("@aws-sdk/client-sns");


// DynamoDB clients
const client = new DynamoDBClient();
const docClient = DynamoDBDocumentClient.from(client);


// sns client
const snsClient = new SNSClient();


/*
* function subscribe email to sns topic
*/
async function publish(topicArn, subject, message)
{
    await snsClient.send(
        new PublishCommand({
          Subject: subject,
          Message: message,
          TopicArn: topicArn
        }),
    );
}


exports.handler = async (event) => {
    console.log(event);

    for (const record of event.Records) {
        const publisherUserID = record.messageAttributes.publisherUserID.stringValue;
        const subject         = record.messageAttributes.Subject.stringValue;
        const message         = record.body;

        //--------------------------------------------------
        // get the topicArn by publisherUserID
        const response = await docClient.send(new GetCommand({
            TableName: process.env.TOPICS_TABLE_NAME,
            Key: {userID: publisherUserID}
        }));
        const topicArn = response.Item.topicArn;
        //--------------------------------------------------
        
        await publish(topicArn, subject, message);
    }
};
