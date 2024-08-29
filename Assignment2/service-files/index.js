const express = require('express');
const RestaurantsMemcachedActions = require('./model/restaurantsMemcachedActions');
const { DynamoDBClient, UpdateItemCommand, QueryCommand, GetItemCommand, DeleteItemCommand } = require("@aws-sdk/client-dynamodb");
const client = new DynamoDBClient({ region: 'us-east-1' });

const app = express();
app.use(express.json());

const MEMCACHED_CONFIGURATION_ENDPOINT = process.env.MEMCACHED_CONFIGURATION_ENDPOINT;
const TABLE_NAME = process.env.TABLE_NAME;
const AWS_REGION = process.env.AWS_REGION;
const USE_CACHE = true;// process.env.USE_CACHE === 'true';

const memcachedActions = new RestaurantsMemcachedActions(MEMCACHED_CONFIGURATION_ENDPOINT);



/*
* Helper function to generate a key
* for restraunt inside the cache.
*/
function restaurant_key(name)
{
    return "Restaurant-" + name;
}



/*
* Function to check if an item is exists in DynamoDB.
* return true if restraunt is exist, else return false.
* note: if needed, first check if restruant inside the cashe.
*/
async function checkIfItemExists(name){
    
    // first, check if restaurant is exist in the cache.
    if (USE_CACHE)
    {
        const data = await memcachedActions.getRestaurants(restaurant_key(name));
        if (data){return true;}
    }

    // if restaurant isnt inside the cache, check the DB.
    // so, make the quary parameters.
    const params = {
        TableName: TABLE_NAME,
        Key: {
            'restaurantName': { S: name },
        }
    };

    // then, make the quary and return true if there are any resutls from DB.
    try
    {
        const data = await client.send(new GetItemCommand(params));
        return !!data.Item; // Return true if item exists, false otherwise
    }
    catch (err)
    {
        console.error('Error checking DynamoDB:', err);
        throw err; // Throw error for handling in calling function
    }
}



/*
* Logic for 'GET /'
* return some details about the app
*/
app.get('/', (req, res) => {
    const response = {
        MEMCACHED_CONFIGURATION_ENDPOINT: MEMCACHED_CONFIGURATION_ENDPOINT,
        TABLE_NAME: TABLE_NAME,
        AWS_REGION: AWS_REGION,
        USE_CACHE: USE_CACHE
    };
    res.send(response);
});



/*
* Logic for 'POST /restaurants'
* create a new restraunt and update cache.
* note: if restaurant already exist, return
*       error code 409.
*/
app.post('/restaurants', async (req, res) => {
    const restaurant = req.body;

    try 
    {
        // Check if restaurant already exists
        const exists = await checkIfItemExists(restaurant.name);
        if (exists){ res.status(409).send({ success: false , message: 'Restaurant already exists' });}
        
        // if not, generate the new restraunt
        else {
            // create quary parameters for insert new restraunt.
            const params = {
                TableName: TABLE_NAME,
                Key: {
                    'restaurantName': { S: restaurant.name },
                },
                UpdateExpression: 'SET regionName = :regionName, cuisine = :cuisine, rating = :rating, numOfRates = :numOfRates',
                ExpressionAttributeValues: {
                    ':regionName': { S: restaurant.region },
                    ':cuisine': { S: restaurant.cuisine },
                    ':rating': { N: '0'}, // (avarage)
                    ':numOfRates' : {N: '0'},
                },
            };

            // Perform update operation in the DB
            await client.send(new UpdateItemCommand(params));
            
            // then, update the cache.
            if (USE_CACHE)
            {
                const newRestraunt = {restaurantName: restaurant.name,
                                    regionName: restaurant.region,
                                    cuisine: restaurant.cuisine,
                                    rating: 0,
                                    numOfRates: 0};
                await memcachedActions.addRestaurants(restaurant_key(restaurant.name), newRestraunt);
            }

            // and, return success.
            res.status(200).send({success : true});
        }
    }
    catch (err)
    {
        console.error('Error processing request:', err);
        res.status(500).send({ success: false, message: 'Internal Server Error' });
    }
});



/*
* Logic for 'GET /restaurants/:restaurantName'
* return the restaurant by name.
* note: if restraunt inside the cache return it.
*       else, extract from DB, and then save inside the cache.
*/
app.get('/restaurants/:restaurantName', async (req, res) => {
    const restaurantName = req.params.restaurantName;

    // first, check if the restrant is inside the cache.
    if (USE_CACHE)
    {
        const data = await memcachedActions.getRestaurants(restaurant_key(restaurantName));
        if(data)
        {
            res.status(200).send({
                cuisine: data.cuisine,
                name: data.restaurantName,
                rating: data.rating,
                region: data.regionName
            })

            return;
        }
    }

    // if not, try to extract it directly from the DB
    // so first, prepare the quary parameters.
    const params = {
        TableName: TABLE_NAME,
        Key: {
            'restaurantName': { S: restaurantName },
        }
    };

    try
    {
        // then, send the quary to the DB.
        const data = await client.send(new GetItemCommand(params));
        
        // if restraunt is exist, so everything is OK.
        if (!!data.Item)
        {
            res.status(200).send({
                cuisine: data.Item.cuisine.S,
                name: data.Item.restaurantName.S,
                rating: parseFloat(data.Item.rating.N, 10),
                region: data.Item.regionName.S
            });

            // and, if using cache, save the last result
            if (USE_CACHE)
            {
                const existRestraunt = {
                    restaurantName: data.Item.restaurantName.S,
                    regionName: data.Item.regionName.S,
                    cuisine: data.Item.cuisine.S,
                    rating: parseFloat(data.Item.rating.N, 10),
                    numOfRates: parseFloat(data.Item.numOfRates.N, 10)
                };
                await memcachedActions.addRestaurants(restaurant_key(restaurantName), existRestraunt);
            }
        }

        // but if restraunt doesnt exist, return error code.
        else
        {
            res.status(404).send({ success: false , message: 'Restaurant doesnt exists' });
        }
    }
    catch (err)
    {
        console.error('Error checking DynamoDB:', err);
        throw err; // Throw error for handling in calling function
    }
});



/*
* Logic for 'DELETE /restaurants/:restaurantName'
* delete a restaurant from the DB and cache by name.
*/
app.delete('/restaurants/:restaurantName', async (req, res) => {
    const restaurantName = req.params.restaurantName;
    
    // prepare the quary parameters
    const params = {
        TableName: TABLE_NAME,
        Key: {
            'restaurantName': { S: restaurantName },
        }
    };

    // Perform delete operation on DB
    await client.send(new DeleteItemCommand(params));
    
    // Perform delete operation on cache
    if (USE_CACHE)
    {
        await memcachedActions.deleteRestaurants(restaurant_key(restaurantName));
    }

    // and, return success.
    res.status(200).send({success : true});
});



/*
* Logic for 'POST /restaurants/rating'
* add rating to a restaurant.
* note: It's have to be correct rating so
*       first take original from DB, and
*       then update the cache.
*/
app.post('/restaurants/rating', async (req, res) => {
    const restaurantName = req.body.name;
    const rating = parseFloat(req.body.rating, 10);

    var oldRating = 0;
    var oldNumOfRates = 0;
    var newRating = 0;
    var newNumOfRates = 0;

    var existRestraunt = {};

    // Reading oldRating & oldNumOfRates from DB.
    // So, first prepare the quary parameters
    var params = {
        TableName: TABLE_NAME,
        Key: {
            'restaurantName': { S: restaurantName },
        }
    };

    try
    {
        // then run the quary
        const data = await client.send(new GetItemCommand(params));
        
        // if restaurant is exsist, everything is OK.
        if (!!data.Item)
        {
            // get the old values
            oldRating = parseFloat(data.Item.rating.N, 10);
            oldNumOfRates = parseInt(data.Item.numOfRates.N, 10);

            // save original data for cache it later if needed.
            existRestraunt = {
                restaurantName: data.Item.restaurantName.S,
                regionName: data.Item.regionName.S,
                cuisine: data.Item.cuisine.S,
                rating: parseFloat(data.Item.rating.N, 10),
                numOfRates: parseFloat(data.Item.numOfRates.N, 10)
            };
        }

        // but if not, return error code.
        else
        {
            res.status(404).send({ success: false , message: 'Restaurant doesnt exists' });
        }
    }
    catch (err)
    {
        console.error('Error checking DynamoDB:', err);
        throw err; // Throw error for handling in calling function
    }

    // Then, calc the new values
    newRating     = (oldRating * oldNumOfRates + rating) / (oldNumOfRates + 1);
    newNumOfRates = oldNumOfRates + 1;

    // and update DB.
    // So, prepare the quary parameters
    params = {
        TableName: TABLE_NAME,
        Key: {
            'restaurantName': { S: restaurantName },
        },
        UpdateExpression: 'SET rating = :rating, numOfRates = :numOfRates',
        ExpressionAttributeValues: {
            ':rating': { N: String(newRating)},
            ':numOfRates': { N: String(newNumOfRates)},
        },
    };

    // then, perform update operation on DB.
    await client.send(new UpdateItemCommand(params));

    // then, perform update operation on cache
    if (USE_CACHE)
    {
        existRestraunt.rating = newRating;
        existRestraunt.numOfRates = newNumOfRates;
        await memcachedActions.addRestaurants(restaurant_key(restaurantName), existRestraunt);
    }

    // and, return success.
    res.status(200).send({success : true});
});


// Students TODO: Implement the logic to get top rated restaurants by cuisine
app.get('/restaurants/cuisine/:cuisine', async (req, res) => {
    const cuisine = req.params.cuisine;
    let limit = parseInt(req.query.limit, 10) || 10; // Default limit is 10
  
    // Ensure limit is between 10 and 100
    limit = Math.min(Math.max(limit, 10), 100);

    // Define parameters for the query
    const params = {
        TableName: TABLE_NAME,
        IndexName: 'cuisineIndex',
        KeyConditionExpression: 'cuisine = :cuisine',
        ExpressionAttributeValues: {
        ':cuisine': { S: cuisine },
        },
        ProjectionExpression: 'restaurantName, rating, regionName, cuisine', // Specify attributes to retrieve
        Limit: limit,
        ScanIndexForward: false, // Sort descending by rating
    };

    try {
        const data = await client.send(new QueryCommand(params));
        const restaurants = data.Items.map(item => ({
          name: item.restaurantName.S,
          rating: parseFloat(item.rating.N),
          cuisine: item.cuisine.S,
          region: item.regionName.S
        }));
        res.json(restaurants);
    } catch (err) {
        console.error('Error fetching restaurants:', err);
        res.status(500).json({ error: 'Error fetching restaurants' });
    }
});


// Students TODO: Implement the logic to get top rated restaurants by region
app.get('/restaurants/region/:region', async (req, res) => {
    const region = req.params.region;
    let limit = parseInt(req.query.limit, 10) || 10; // Default limit is 10
  
    // Ensure limit is between 10 and 100
    limit = Math.min(Math.max(limit, 10), 100);

    // Define parameters for the query
    const params = {
        TableName: TABLE_NAME,
        IndexName: 'regionIndex',
        KeyConditionExpression: 'regionName = :regionName',
        ExpressionAttributeValues: {
        ':regionName': { S: region },
        },
        ProjectionExpression: 'restaurantName, rating, regionName, cuisine', // Specify attributes to retrieve
        Limit: limit,
        ScanIndexForward: false, // Sort descending by rating
    };

    try {
        const data = await client.send(new QueryCommand(params));
        const restaurants = data.Items.map(item => ({
          name: item.restaurantName.S,
          rating: parseFloat(item.rating.N),
          cuisine: item.cuisine.S,
          region: item.regionName.S
        }));
        res.json(restaurants);
    } catch (err) {
        console.error('Error fetching restaurants:', err);
        res.status(500).json({ error: 'Error fetching restaurants' });
    }
});


// Students TODO: Implement the logic to get top rated restaurants by region and cuisine
app.get('/restaurants/region/:region/cuisine/:cuisine', async (req, res) => {
    const region = req.params.region;
    const cuisine = req.params.cuisine;
    let limit = parseInt(req.query.limit, 10) || 10; // Default limit is 10
  
    // Ensure limit is between 10 and 100
    limit = Math.min(Math.max(limit, 10), 100);

    // Define parameters for the query
    const params = {
        TableName: TABLE_NAME,
        IndexName: 'regionIndex',
        KeyConditionExpression: 'regionName = :regionName',
        FilterExpression: 'cuisine = :cuisine',
        ExpressionAttributeValues: {
            ':regionName': { S: region },
            ':cuisine': { S: cuisine },
        },
        ProjectionExpression: 'restaurantName, rating, regionName, cuisine', // Specify attributes to retrieve
        Limit: limit,
        ScanIndexForward: false, // Sort descending by rating
    };

    try {
        const data = await client.send(new QueryCommand(params));
        const restaurants = data.Items.map(item => ({
          name: item.restaurantName.S,
          rating: parseFloat(item.rating.N),
          cuisine: item.cuisine.S,
          region: item.regionName.S
        }));
        res.json(restaurants);
        //console.log(restaurants);
    } catch (err) {
        console.error('Error fetching restaurants:', err);
        res.status(500).json({ error: 'Error fetching restaurants' });
    }
});

app.listen(80, () => {
    console.log('Server is running on http://localhost:80');
});

module.exports = { app };