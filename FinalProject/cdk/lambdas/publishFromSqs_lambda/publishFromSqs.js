/************************************************************************************************************************************
* RESOURCES:                                                                                                                        *
* publish: https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/sns-examples-publishing-messages.html                  *
/************************************************************************************************************************************/

// Imports
const { SNSClient, PublishCommand } = require("@aws-sdk/client-sns");

// sns client
const snsClient = new SNSClient();

/*
* function subscribe email to sns topic
*/
async function publish(topicArn, event)
{
    const response = await snsClient.send(
        new PublishCommand({
          Subject: event.Records[0].messageAttributes.Subject.stringValue,
          Message: event.Records[0].body,
          TopicArn: topicArn
        }),
    );

    return response;
}

exports.handler = async (event) => {
  const response = await publish('arn:aws:sns:us-east-1:160844318631:test-topic', event);
};
