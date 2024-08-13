exports.handler = async (event) => {
    console.log(event);

    if (event.queryStringParameters && event.queryStringParameters.userID)
    {
        const userID = event.queryStringParameters.userID;
        
        
        return {statusCode:200, body: JSON.stringify({userID: event.queryStringParameters.userID})};
    }
    
    return {statusCode:200, body: JSON.stringify({msg: "userID parameter is missing"})};
  };
  