/************************************************************************************************************************************
* RESOURCES:                                                                                                                        *
* scan table and unmarshall: https://martin-sobrero-m.medium.com/get-all-result-items-from-the-scan-method-in-dynamodb-cb21f924ad42 *
* ProjectionExpression exmaple: https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/dynamodb-example-query-scan.html  *
* size of json: https://stackoverflow.com/questions/6756104/get-size-of-json-object                                                 *
*************************************************************************************************************************************/


// Imports
const { DynamoDBClient, ScanCommand } = require("@aws-sdk/client-dynamodb");
const { unmarshall } = require("@aws-sdk/util-dynamodb");

// DynamoDB clients
const client = new DynamoDBClient();
//const docClient = DynamoDBDocumentClient.from(client);


/*
* Function return all items in specific DynamoDB table,
* wihtout a specific userID
*/
async function scanUsers(tableName, userID) {
    let input = {
        TableName: tableName,
        ProjectionExpression: "username, email",
        FilterExpression: '#userID = :userID',
        ExpressionAttributeNames: {
            '#userID': 'userID',
        },
        ExpressionAttributeValues: {
            ':userID': userID,
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
    // get all users
    const userList = await scanUsers(process.env.USERS_TABLE_NAME, userID);
    
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