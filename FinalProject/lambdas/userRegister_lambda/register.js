// src getCommand: https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/example_dynamodb_GetItem_section.html
// src putCommand: https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/example_dynamodb_PutItem_section.html

const AWS = require('aws-sdk');
//const docClient = new AWS.DynamoDB.DocumentClient();
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
  
  // extract email and username
  const username = parsedData['username'];
  const email = parsedData['email'];
  const password = parsedData['password'];

  // check if user is exist
  const getcommand = new GetCommand({
    TableName: process.env.USERS_TABLE_NAME,
    Key: {
      email: email,
    },
  });

  const response = await docClient.send(getcommand);
  const item = response.Item;
  if (item)
  {
    return {statusCode:200, body: "User Already Exist"};
  }
  
  // else, insert the new user
  const putcommand = new PutCommand({
    TableName: process.env.USERS_TABLE_NAME,
    Item: {
      email: email,
      username: username,
      password: password
    },
  });

  const response2 = await docClient.send(putcommand);
  //console.log(response2);
  return {statusCode:200, body: JSON.stringify(response2)};

  // try{
  //   const params = {
  //     TableName: process.env.HITS_TABLE_NAME,
  //     Item: {
  //       username: username,
  //       email: email,
  //       password: password
  //     }
  //   }
  //   await docClient.put(params).promise();
    
  //   return {body : 'Successfully created item!'};
  // } catch (error) {
  //   return { 
  //     statusCode: 200,
  //     body: "Error, sorry.",
  //     error: error
  //   };
  // }
};
