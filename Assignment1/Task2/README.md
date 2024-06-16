# Task 2
2nd Task- Use the first backend API for your application

## Instructions
In this task, we will focus on the Client Side, which refers to the UI interface of our application. To create the client in our workspace, we need to set up a new project separate from the service. This means creating a new folder in the workspace. We will then make an API call to the API Server (or Service/Server) that we just built. During the workspace time, we will deploy both applications, the client, and the server inside the workspace, so we need to use different ports for them.

For the client side, we will use [Simple HTML](https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web/HTML_basics) and [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API). You can find some inspiration from: [How To Display JSON data on an HTML page using Vanilla JavaScript](https://chrisdevcode.hashnode.dev/how-to-display-json-data-on-an-html-page-using-vanilla-javascript).

HTML Files also need a server in order to make than run, so in order to deploy a basic server in your **workspace for development only**, you can use a library like: [http-server- npm](https://www.npmjs.com/package/http-server).

At the end of the task, you should be able to run your basic app in a browser and
present a list of videos based on the files inside the bucket.

![](img/00%20-%20instruction's%20illustration.png)

## Implementation
First of all, I edited the Security Group and replaced port 3000 with port 3001. The reason for hiding 3000 is because it will be an internal self-using API, while the application itself will (now) run on port 3001.

![](img/01%20-%20the%20edited%20security%20group.png)

Next, I set up the API for the HTTP server on port 3001. Its job now is to list what the internal API is in a nice way for the user. The code can be found in the [myWebServer](./myWebServer/) folder

To run the web server, first you need to make sure that [myAPI/index.js](./myAPI/index.js) is also running (this is exactly the same version of code from [Task 1](../Task1/)). After that, enter the folder where the web server is located, take care of the dependencies and run it with the following commands:

```
npm i express
```
```
node index.js
```

## Results
The result can be seen when browsing the address http://ec2-ip:3001 in the following image:

![](img/02%20-%20final%20result%20for%20Task%202.png)
