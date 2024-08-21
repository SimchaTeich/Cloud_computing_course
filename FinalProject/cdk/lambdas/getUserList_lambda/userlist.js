/************************************************************************************************************************************
* RESOURCES:                                                                                                                        *
* scan table and unmarshall: https://martin-sobrero-m.medium.com/get-all-result-items-from-the-scan-method-in-dynamodb-cb21f924ad42 *
* ProjectionExpression exmaple: https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/dynamodb-example-query-scan.html  *
* size of json: https://stackoverflow.com/questions/6756104/get-size-of-json-object                                                 *
* filter for 'not equel': https://stackoverflow.com/questions/44998093/why-is-there-no-not-equal-comparison-in-dynamodb-queries     *
*************************************************************************************************************************************/

// Imports
const { DynamoDBClient, ScanCommand }        = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, GetCommand } = require('@aws-sdk/lib-dynamodb');
const { unmarshall }                         = require("@aws-sdk/util-dynamodb");


// DynamoDB clients
const client = new DynamoDBClient();
const docClient = DynamoDBDocumentClient.from(client);


/*
* Function return all items in specific DynamoDB table,
* wihtout a specific userID
*/
async function scanOtherUsers(userID) {
    let input = {
        TableName: process.env.USERS_TABLE_NAME,
        ProjectionExpression: "username, email",
        FilterExpression: 'userID <> :userID',
        ExpressionAttributeValues: {
            ':userID': {'S': userID }
        },
    };

    const command = new ScanCommand(input);
    const response = await client.send(command);
    return response.Items.map(i => unmarshall(i));;
}


exports.handler = async (event) => {
    console.log(event);

    //--------------------------------------------------
    // exstract userID
    if (event.queryStringParameters == null || !event.queryStringParameters.hasOwnProperty('userID')) {
        return {
            statusCode: 404,
            body: JSON.stringify({error: "userID is missing"}),
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
    // check if user doesnt exist
    const params = {
        TableName: process.env.USERS_TABLE_NAME,
        Key: {userID: userID}
    };
    const response = await docClient.send(new GetCommand(params));
    const item = response.Item;
    if (!item) {
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
    }
    //--------------------------------------------------


    //--------------------------------------------------
    // get all other users
    const userList = await scanOtherUsers(userID);
    
    return {
        statusCode: 200,
        body: JSON.stringify({userList: userList, count: Object.keys(userList).length}),
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        }
    };
    //--------------------------------------------------
};