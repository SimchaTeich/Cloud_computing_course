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
    *   Register one foreigner as a subscriber to another
    * Distributing a message to my subscribers
* Tagging posts:
    * Uploading a post to a public wall
    * Viewing all posts on the public wall
