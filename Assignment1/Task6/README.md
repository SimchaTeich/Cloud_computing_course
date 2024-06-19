# Task 6
6th Task - Deploy your static website to the internet

## Instructions
Now, deploying your static website to the internet should be easy after you successfully deploy the back and allow him to scale the media file. Make sure you populate it to the world so everyone has access without restriction, and you distribute it with CloudFront CDN so it will load fast.

**You may need two different CloudFront stacks, but that’s okay!**

## Implementation

First, I bloked all public access from my web bucket `simcha-assignment1-web-server`:

![](./img/00%20-%20make%20the%20bucket%20private.png)

Then I created a new distribution in CloudFront for the static site:

![](./img/01%20-%20cloudfron%20distribution%20for%20static%20web%20server.png)
![](./img/02%20-%20cloudfron%20distribution%20for%20static%20web%20server.png)
![](./img/03%20-%20cloudfron%20distribution%20for%20static%20web%20server.png)
![](./img/04%20-%20cloudfron%20distribution%20for%20static%20web%20server.png)

Then I went back to the `simcha-assignment1-web-server` bucket and changed the policy:

![](./img/05%20-%20web%20server%20bucket%20policy.png)

## Results
![](./img/06%20-%20results.png)
