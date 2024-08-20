/************************************************************************************************************************************
* RESOURCES:                                                                                                                        *
* getCommand: https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/example_dynamodb_GetItem_section.html                *
*************************************************************************************************************************************/

// Imports
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand } = require('@aws-sdk/lib-dynamodb');

// DynamoDB clients
const client = new DynamoDBClient();
const docClient = DynamoDBDocumentClient.from(client);


exports.handler = async (event) => {
    console.log(event);

    //--------------------------------------------------
    // exstract userID
    if (!event.queryStringParameters == null || event.queryStringParameters.userID == null) {
        return {
            statusCode: 404,
            body: JSON.stringify({msg: "userID is missing"}),
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            }
        };
    }
    const userID = event.queryStringParameters.userID;
    //--------------------------------------------------


    //--------------------------------------------------
    // get user details by userID
    const params = {
        TableName: process.env.USERS_TABLE_NAME,
        Key: {userID: userID}
    };

    const response = await docClient.send(new GetCommand(params));
    const item = response.Item;
    //--------------------------------------------------
    

    //--------------------------------------------------
    // check if user exist
    if (item)
    {
        //return {statusCode:200, body: JSON.stringify(item)};
        return {
            statusCode: 200,
            body: JSON.stringify({userDetails: item}),
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
              }
        };
    }
    // else..
    return {
        statusCode: 404,
        body: JSON.stringify({error: "userID doesnt exist"}),
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
          }
    };
    //--------------------------------------------------
};
  