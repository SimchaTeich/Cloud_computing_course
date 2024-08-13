// src getCommand: https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/example_dynamodb_GetItem_section.html
// src putCommand: https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/example_dynamodb_PutItem_section.html
// src uuid: https://www.geeksforgeeks.org/how-to-generate-unique-id-with-node-js/
// src using global index table: https://stackoverflow.com/questions/39026851/query-data-without-key-aws-dynamodb-sdk-nodejs
const querystring = require('node:querystring'); 
const { DynamoDBClient, QueryCommand} = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');
const uuid = require('uuid');

const client = new DynamoDBClient();
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
  console.log(event);

  // parser post parameters data
  const data = event.body;
  const parsedData = querystring.parse(data);
  console.log(parsedData);

  // check if user is exist by email
  //------------------------
  const quarycommand = new QueryCommand({
    TableName: process.env.USERS_TABLE_NAME,
    IndexName: 'emailIndex',
    KeyConditionExpression: 'email = :email',
    ExpressionAttributeValues: {
    ':email': { S: parsedData['email'] },
    },
  });

  const response = await client.send(quarycommand);
  if (response.Count == 1)
  {
    return {statusCode:200, body: "Your email is already registered"};
  }
  //------------------------
  
  // else, create a new userID and insert the new user.
  const username = parsedData['username'];
  const email = parsedData['email'];
  const password = parsedData['password'];
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
  return {statusCode:200, body: JSON.stringify({msg: "Registration was successful", userID: userID})};
};
