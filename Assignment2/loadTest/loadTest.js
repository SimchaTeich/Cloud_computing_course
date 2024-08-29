/*----------------------------------------------------------------------------------------------------
/ Great Thanks to:
/ https://github.com/meni432/ariel-cloud/blob/main/LoadTest/loadTest.js
/ about the auto scaling loading test 
/----------------------------------------------------------------------------------------------------*/
const axios = require('axios');
const http = require('http');

// HTTP and HTTPS agents
const httpAgent = new http.Agent({ keepAlive: true, maxSockets: Infinity });

// Configuration
const endpoint = 'http://Restau-LB8A1-QM9dVUVnbyoi-1327195571.us-east-1.elb.amazonaws.com';
const requestCount = 100; // Total number of requests to send

// some restaurants detils
const cuisines = [`French`, `Moroccan`, `English`, `Belgian`, `Israeli`, `Greek`, `American`];
const regions  = [`North`, `South`, `East`, `West`];



// Function to make an HTTP POST request
const makePostRequest = (url, data) => {
  console.log("Creating restaurant: " + JSON.stringify(data));
  const startTime = Date.now();
  axios.post(url, data, {
    httpAgent,
  })
    .then(response => {
      const endTime = Date.now();
      const duration = endTime - startTime;
      //console.log(`Response status: ${response.status}, Time Taken: ${duration} ms`);
    })
    .catch(error => {
      const endTime = Date.now();
      const duration = endTime - startTime;
      //console.error(`Error: ${error.response ? error.response.status : error.message}, Time Taken: ${duration} ms`);
    });
};



// Function to make an HTTP GET request
const makeGetRequest = (url) => {
  const startTime = Date.now();
  axios.get(url, {
    httpAgent,
  })
    .then(response => {
      const endTime = Date.now();
      const duration = endTime - startTime;
      console.log(`Response status: ${response.status}, Time Taken: ${duration} ms`);
    })
    .catch(error => {
      const endTime = Date.now();
      const duration = endTime - startTime;
      console.error(`Error: ${error.response ? error.response.status : error.message}, Time Taken: ${duration} ms`);
    });
};


/******** Main function to perform the load test. *******/

// create restaurants:
const createRestaurants = () => {
  for (let i = 0; i < requestCount; ++i)
  {
        makePostRequest(endpoint + '/restaurants', {name: "Restaurant_"+String(i), cuisine: cuisines[i%7], region: regions[i%4]});
  }
};

// get exists restaurants:
const getRestaurants = () => {
  for (let i = 0; i < requestCount; ++i)
  {
        makeGetRequest(endpoint + '/restaurants/' + "Restaurant_"+ String(i));
  }
};

/***** Start the load testing ****/
createRestaurants();
getRestaurants();