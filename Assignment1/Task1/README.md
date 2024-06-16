# Task 1
1st Task - Build the first backend API for your application
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
            ```json
            ['BigBuckBunny', 'ElephantsDream',
            'ForBiggerBlazes','ForBiggerEscapes', ....,
            'TearsOfSteel']
            ```

 This task will create our first API for our new Media player service. In the next task, we
 will consider how to integrate this service with our app.