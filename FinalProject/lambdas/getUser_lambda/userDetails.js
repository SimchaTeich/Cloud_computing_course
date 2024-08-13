const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient();
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
    console.log(event);

    if (!event.queryStringParameters == null || event.queryStringParameters.userID == null)
    {
        return {statusCode:200, body: JSON.stringify({msg: "userID parameter is missing"})};
    }

    // exstract userID
    const userID = event.queryStringParameters.userID;

    // get user details by userID
    const params = {
        TableName: process.env.USERS_TABLE_NAME,
        Key: {userID: userID}
    };

    const response = await docClient.send(new GetCommand(params));
    const item = response.Item;
    if (item)
    {
        return {statusCode:200, body: JSON.stringify(item)};
    }
    
    return {statusCode:200, body: JSON.stringify({msg: "userID doesnt exist"})};
    // return {statusCode:200, body: JSON.stringify(item)};

};
  