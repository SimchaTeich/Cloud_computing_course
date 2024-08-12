const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();
const querystring = require('node:querystring'); 

exports.handler = async (event) => {
  console.log(event);

  // parser post parameters data
  const data = event.body;
  const parsedData = querystring.parse(data);
  
  // extract email and username
  const username = parsedData['username'];
  const email = parsedData['email'];
  const password = parsedData['password'];
  
  try{
    const params = {
      TableName: process.env.HITS_TABLE_NAME,
      Item: {
        username: username,
        email: email,
        password: password
      }
    }
    await docClient.put(params).promise();
    
    return {body : 'Successfully created item!'};
  } catch (error) {
    return { 
      statusCode: 200,
      body: "Error, sorry.",
      error: error
    };
  }
};
