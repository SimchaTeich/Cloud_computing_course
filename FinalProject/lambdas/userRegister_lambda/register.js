// src getCommand: https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/example_dynamodb_GetItem_section.html
// src putCommand: https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/example_dynamodb_PutItem_section.html

const querystring = require('node:querystring'); 
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, PutCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient();
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
  console.log(event);

  // parser post parameters data
  const data = event.body;
  const parsedData = querystring.parse(data);

  // check if user is exist
  const getcommand = new GetCommand({
    TableName: process.env.USERS_TABLE_NAME,
    Key: {
      email: parsedData['email'],
    },
  });

  const response = await docClient.send(getcommand);
  const item = response.Item;
  if (item)
  {
    return {statusCode:200, body: "Your email is already registered"};
  }
  
  // else, insert the new user.
  const username = parsedData['username'];
  const email = parsedData['email'];
  const password = parsedData['password'];
  
  const putcommand = new PutCommand({
    TableName: process.env.USERS_TABLE_NAME,
    Item: {
      email: email,
      username: username,
      password: password
    },
  });

  await docClient.send(putcommand);
  return {statusCode:200, body: "Registration was successful"};
};
