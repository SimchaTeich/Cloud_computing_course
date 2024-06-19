# Task 5
5th Task - Using CDN for Media File Efficient Distribution

Amazon S3 is a highly scalable and reliable storage solution, but it can become problematic for high through put distribution in a single region due to several reasons.

One key issue is the inherent latency in accessing data over the internet, which can impact performance when dealing with a large number of requests. Additionally, S3's pricing model, which includes charges for data transfer and the number of requests, can become cost-prohibitive at high through put levels.

Furthermore, while S3 is designed to handle high levels of traffic, there can be limitations in bandwidth and request rates that may not meet the needs of extremely high-demand applications, leading to throttling and increased latency.

Finally, optimizing access patterns to reduce latency and costs requires careful management of data storage classes and distribution strategies, adding complexity to high throughput scenarios.

For this task, we will use CloudFront to distribute our video files to end-users.

In order to do that, you might need to change the way that you grant access to your media file in the backend server.

## Implementation
First of all, I created a new distribution in CloudFront.

![](./img/00%20-%20cloudfron%20distribution.png)
![](./img/01%20-%20cloudfron%20distribution.png)
![](./img/02%20-%20cloudfron%20distribution.png)
![](./img/03%20-%20cloudfron%20distribution.png)

Then I went to the **mymp4bucket** bucket and changed its policy:
![](./img/04%20-%20s3%20mymp4bucket%20policy.png)

Then create a private and public key pair using the following commands:

```
openssl genrsa -out private_key.pem
```
```
openssl rsa -pubout -in private_key.pem -out public_key.pem
```

The above commands created the following two files:
* `public_key.pem` - It should be uploaded to CloudFront
* `private_key.pem` - Intended for use in the backend code.

So I uploaded the public key to CloufFront:
![](./img/05%20-%20public%20key.png)

Then I changed the code in the backend, you can find it in [./myAPI](./myAPI/). Then I created the new backend deployment. (Replacing the existing zip in the bucket `simcha-assignment1-backend-deployment` with the zip inside [./backend_deployment](./backend_deployment) folder)

## Results

![](./img/05%20-%20results.png)