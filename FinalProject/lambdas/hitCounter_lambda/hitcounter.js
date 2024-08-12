const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();

exports.handler = async function(event) {
    console.log("requests: ", JSON.stringify(event, undefined, 2));

    try {
        const params = {
          TableName: process.env.HITS_TABLE_NAME,
          Item: {
            "path": event.path,
            "text": "wow"
          }
        }
        await docClient.put(params).promise();
        return {
            statusCode: 200,
            body : 'Successfully created item!'
        };
      } catch (error){
        return {
            statusCode: 500,
            body : 'error' + JSON.stringify(error),
            error: error
        };
    }
};