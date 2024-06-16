# Task 3
3rd Task- Build the entire APP

## Instructions
Throughout this task, we'll be implementing the entire app. Now is the time to expand your app's capabilities. Consider how you can play a video file within JavaScript. Then, based on the file name, figure out how to grant temporary access to an S3 file for the end user in the HTML Client. After granting access, download the file and load it into the media player.

By the end of this task, you should be able to click on a file name and have it automatically play in your application, similar to YouTube.

You should be able to execute this task by extending both the existing Express backend API and your HTML app.

Ensure that your workspace EC2 instance has the LabRole. This will provide the instance with full S3 access.

![](img/00%20-%20instruction's%20illustration.png)

## Implementation
First of all, I added to the API on port 3000 in the file [./myAPI/index.js](./myAPI/index.js) the ability to bring a **pre-sign link** to a video according to its name.

To run it again, you need to enter the folder where it is located and run it. Of course, don't forget the new dependency:

```
npm i @aws-sdk/s3-request-presigner
```
```
node index.js
```

Secondly, we will have to edit the web server that knows how to handle loading a video.<br />
The process will go like this:
* When you enter a page on the website, a list of videos is loaded
* When clicking on the name of a video, a GET HTTP request will be sent to the web server.
* The web server (on port 3001, of course) receives the request and turns to the API on port 3000, which returns a **pre-sign link**
* The server loads a new page with the list of videos and next to them loads the video from the **pre-sign link**.

The following changes can be found in the [./myWebServer/index.js](./myWebServer/index.js) file. Since no new dependency was added, it is now possible (through the appropriate path..) to run the server again:

```
node index.js
```

# Results
Now, by surfing to the address http://ec2-ip:3001 you can click on the names of the videos and watch them. As the following picture illustrates:

![](img/01%20-%20result%20from%20Task%203.png)
