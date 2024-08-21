/************************************************************************************************************************************
* RESOURCES:                                                                                                                        *
* putCommand: https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/example_dynamodb_PutItem_section.html                *
* uuid: https://www.geeksforgeeks.org/how-to-generate-unique-id-with-node-js/                                                       *
* global secondary index: https://stackoverflow.com/questions/39026851/query-data-without-key-aws-dynamodb-sdk-nodejs               *
* create s3 folder: https://stackoverflow.com/questions/19459893/how-to-create-folder-or-key-on-s3-using-aws-sdk-for-node-js        *
* create sns topic: https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/sns-examples-managing-topics.html             *
* susbstring: https://www.w3schools.com/jsref/jsref_substring.asp                                                                   *
*************************************************************************************************************************************/

// imports
const { DynamoDBClient, QueryCommand}        = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');
const uuid                                   = require('uuid');
const {S3Client, PutObjectCommand}           = require('@aws-sdk/client-s3');
const { SNSClient, CreateTopicCommand }      = require("@aws-sdk/client-sns");


// DynamoDB clients
const client = new DynamoDBClient();
const docClient = DynamoDBDocumentClient.from(client);


// SNS client
const snsClient = new SNSClient();


/*
* function creates a folder on bucket
* Input: Bucket name and folder path
*/
async function createFolder(Bucket, Key) {
  const client  = new S3Client();
  const command = new PutObjectCommand({Bucket, Key});
  return client.send(command);
}


/*
* function creates an sns topic,
* and return its ARN
*/
async function createTopic(topicName) {
  const response = await snsClient.send(
    new CreateTopicCommand({ Name: topicName }),
  );
  return response.TopicArn;
}


exports.handler = async (event) => {
  console.log(event);

  //--------------------------------------------------
  // exstract post parameters data
  const data = JSON.parse(event.body);
 
  const username = data.username;
  const email = data.email;
  const password = data.password;
  //--------------------------------------------------

 
  //------------------------------------------------------------------------------------------
   // check if user is exist by email
  const quarycommand = new QueryCommand({
    TableName: process.env.USERS_TABLE_NAME,
    IndexName: 'emailIndex',
    KeyConditionExpression: 'email = :email',
    ExpressionAttributeValues: {
    ':email': { S: email },
    },
  });

  const response = await client.send(quarycommand);
  if (response.Count == 1)
  {
    return {
      statusCode: 200,
      body: JSON.stringify({error: "Your email is already registered"}),
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
  // else, create a new userID and insert the new user.
  const userID = uuid.v4();
  const putcommand = new PutCommand({
    TableName: process.env.USERS_TABLE_NAME,
    Item: {
      userID: userID,
      email: email,
      username: username,
      password: password
    },
  });
  await docClient.send(putcommand);
  //--------------------------------------------------


  //--------------------------------------------------
  // create the user folder in the s3 bucket
  await createFolder(process.env.BUCKET_NAME, userID+"/");
  //--------------------------------------------------


  //--------------------------------------------------
  // create a sns topic for the new user, and save it's ARN
  // inside the topics table
  const topicArn = await createTopic(username + userID.substring(0,5));
  const putcommand2 = new PutCommand({
    TableName: process.env.TOPICS_TABLE_NAME,
    Item: {
      userID: userID,
      topicArn: topicArn
    },
  });
  await docClient.send(putcommand2);
  //--------------------------------------------------


  return {
    statusCode: 200,
    body: JSON.stringify({
      msg: "Registration was successful",
      userID: userID
    }),
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  };
  //--------------------------------------------------
};
