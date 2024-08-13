// src deleteCommand: https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/example_dynamodb_DeleteItem_section.html
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');

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

    // check if user is exist
    const params = {
        TableName: process.env.USERS_TABLE_NAME,
        Key: {userID: userID}
    };
    const response = await docClient.send(new GetCommand(params));
    const item = response.Item;
    if (!item)
    {
        return {statusCode:200, body: JSON.stringify({msg: "UserID doesnt exist"})};
    }

    // else, delete user by userID
    await docClient.send(new DeleteCommand(params));
    return {statusCode:200, body: JSON.stringify({msg: "User deleted successfully"})};
};
  