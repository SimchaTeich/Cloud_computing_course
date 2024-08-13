const AWS = require('aws-sdk');
//const docClient = new AWS.DynamoDB.DocumentClient();
const querystring = require('node:querystring'); 
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand } = require('@aws-sdk/lib-dynamodb');

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
  const command = new GetCommand({
    TableName: process.env.USERS_TABLE_NAME,
    Key: {
      email: email,
    },
  });

  const response = await docClient.send(command);
  const item = response.Item;
  if (item)
  {
    return {statusCode:200, body: "User Already Exist"};
  }
  else
  {
    return {statusCode:200, body: "User doesnt Exist"}; // add user to DB here
  }
  
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
