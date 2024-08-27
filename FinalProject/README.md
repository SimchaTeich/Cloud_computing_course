# Final Project
Final project in a cloud computing course.

## Instructions
### Part A - Build a basic user system
You should develop this part using **Lambda**, **CDK**, and **API Gateway**, in addition to S3 and any other AWS Service we present in the class, if necessary, for that part.</br>
We will build our baseline for a Social Network. As with any social network, our network will have a user system.</br>
For this assignment, we will not implement an Authentication / Authorisation system and will not need to authenticate the user in the request.</br>
You can still use API-KEY (the built-in API Gateway feature) for all requests to create user limitations, but it’s not mandatory.

* **Design and Build an API For Creating a new User**</br>
    Design the API you believe is needed to create a new user in our Social Network, implement it, store the users inside a DB, and assign each user a [Unique ID](https://en.wikipedia.org/wiki/Universally_unique_identifier).</br>
Build an API For **Delete a User By ID** and **Get a User By ID**.</br>
Create a Test for this API, including edge cases. For example, what will happen if I try to delete a user who doesn't exist?

* **Design and Build an API for Upload User Profile picture**</br>
    Design the flow for uploading profile pictures for existing users.</br>
    Make sure to do it securely. In our words, the User must send a request with his User ID to an
    API and get temporary access to the bucket to upload his picture (pre-sign URL).</br>
    In addition, we will indicate in the user profile (i.e., Get a User By ID) if the user has a valid profile picture and the URL for the picture.</br>
    We will return the link to that picture **just in case the image is uploaded successfully**.

```
You should submit the flow diagram of that part, including the code, and you will present it during the frontal presentation of your project.
```

### Part B - Build your feature for our Social Network
In this part, you should build your innovative feature on our social media.</br>
This part is more flexible, and we will give you the ability and the flexibility to build non-defined features.

The grade will take into consideration innovation, execution, and teamwork.</br>
You can find the supported services that you can use “free” in the lab [here](https://labs.vocareum.com/web/3341563/2678097.0/ASNLIB/public/docs/lang/en-us/README.html?vockey=e347a6c9683a5ed0ea4bc577940b3f8159e1c4dafcddbccc8869ac250f4b6be5#envOverview).</br>
We will appreciate using services that we didn’t use in the class.

```
To create minimal criteria, you must use:
-   At least two Lambda functions.
-   At least one SQS.
-   At least one Table in any DB.
```
An example of ideas:
*   Interact with social networks by mail and summary
*   mail through Chat GPT (Open AI API).
*   Image upload classification and automatic tags  for image posts.
*   Many more..

Good luck!

## Implementation
Below is my solution to the assignment.

It is described here according to the following parts:

**Part A - User system**</br>
* Registration
* Uploading a profile picture
* Viewing profile details
* Deleting a user

**Part B - Special features**
* Subscribers:
    * Register a user as a subscriber to another
    * Distributing a message to my subscribers
* Tagging posts:
    * Uploading a post to a public wall
    * Viewing all posts on the public wall

### Part A - User system
---
**Registration**
* POST requests goes through **API Gateway**
* Lambda create user ID and
    * Inserts user details into `Users` table in **DynamoDB**
    * Creates an empty folder in the Users bucket in **S3**. The name of the folder is the `User ID`
    * Creates an **SNS Topic** for each user and saves his `user ID` next to the `Topic ARN` in the DB. This will be discussed later regarding subscriptions.

![](./readme-pictures/00%20-%20register.jpg)

For example:

![](./readme-pictures/01%20-%20welcome%20page%20register%20button.png)

![](./readme-pictures/02%20-%20register%20page%20alice.png)

After submit:
![](./readme-pictures/03%20-%20register%20page%20alice.png)

If everything is fine, the user ID will be returned. We will keep it for ourselves so we can work with this user. Of course, in a real case the browser will take care of it, but the purpose of the site is only to demonstrate API usage, so to illustrate a "logged in user", we will send his ID in every request.

Not every registration is valid, for example registering twice with the same email. When we click the button a second time, we will receive the following error returned from the lambda:

![](./readme-pictures/04%20-%20register%20with%20error.png)

Note: all email addresses I will use in all the examples are from [this great service](https://temp-mail.org/en/)

**Uploading a profile picture**
* GET request with `user ID` goes through **API Gateway** to get pre-signed url to PUT requests direct into the **S3** to upload the image.
* Then, using the url and making the PUT request to upload the image.

![](./readme-pictures/05%20-%20upload%20profile%20diagram.jpg)

For example:

![](./readme-pictures/06%20-%20upload%20profile%20picture.png)

Using Alice `User ID`
![](./readme-pictures/07%20-%20upload%20profile%20picture%20alice.png)

After clicking, two things happen. The browser will receive a pre-signed url to upload the image, then upload it:
![](./readme-pictures/08%20-%20upload%20profile%20step%201%20presigned%20url.png)
![](./readme-pictures/09%20-%20upload%20profile%20step%202%20using%20presingned%20url.png)

And of course, it is not possible to upload a profile picture if the user does not exist
![](./readme-pictures/10%20-%20upload%20profile%20with%20id%20doesnt%20exist.png)

**Viewing profile details**

