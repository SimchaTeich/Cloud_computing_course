# Task 1
1st Task - Build the first backend API for your application

## Instructions
* Create an S3 Bucket for video storage in your account
* Upload some sample videos to the bucket
  * for the simplicity of the application, we will support mp4 files only
  * youcandownload some test video from that URL’s:
    1. [BigBuckBunny.mp4](https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4)
    2. [ElephantsDream.mp4](https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4)
    3. [ForBiggerBlazes.mp4](https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4)
    4. [ForBiggerEscapes.mp4](https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4)
    5. [ForBiggerFun.mp4](https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4)
    6. [ForBiggerJoyrides.mp4](https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4)
    7. [ForBiggerMeltdowns.mp4](https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4)
    8. [Sintel.mp4](https://storage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4)
    9. [SubaruOutbackOnStreetAndDirt.mp4](https://storage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4)
    10. [TearsOfSteel.mp4](https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4)
 
 * Create an API in your express App that
   * read the list of items names from that s3 bucket
   * return as a response of JSON Format with an array of the file names, for example:
     * Request<br />
      `GET HTTP://<your-workspace-ip>:3000/videoList`
     * Response
       * Headers<br />
      `Content-Type: application/json`
       * Body
            ```javascript
            ['BigBuckBunny', 'ElephantsDream',
            'ForBiggerBlazes','ForBiggerEscapes', ....,
            'TearsOfSteel']
            ```

 This task will create our first API for our new Media player service. In the next task, we
 will consider how to integrate this service with our app.

 ## Implementation
First thing, I created the bucket for the mp4 files and uploaded them. My bucket is called "mymp4bucket"

![](img/00%20-%20my%20first%20bucket.png)

Next, for the API, I created a machine with an EC2 service. I called it "Workspace"

![](img/01%20-%20my%20first%20EC2%20instance.png)
![](img/02%20-%20important%20details%20about%20my%20first%20ec2.png)
![](img/03%20-%20important%20details%20about%20my%20first%20ec2.png)
![](img/04%20-%20important%20details%20about%20my%20first%20ec2.png)

Then I connected with SSH to the machine (in the VSC IDE), I installed node with the following commands:

```bash
# Update the instance
yum update -y

# Install Node.js (using Node Version Manager)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
nvm install node
```

Then, I wrote the requested API. It can be found in the [myAPI](./myAPI/) folder.

To run index.js, run the following commands in the folder where it is located on the server:

```
npm i @aws-sdk/client-s3
```
```
npm i express 
```
```
node index.js
```

## Results
The result can be seen when browsing the address http://ec2-ip:3000/videoList in the following image:

![](img/05%20-%20The%20API%20result.png)
