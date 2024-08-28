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

**Part B - Special Features**
* Subscribe:
    * Subscribe to another users
    * Message to my subscribers
* Tagging images:
    * Uploading a post to a public wall
    * Viewing all posts on the public wall, with image tags

### Part A - User system
---
**Registration**
* POST requests goes through **API Gateway**
* Lambda does the following:
    * Checks if user is already exist by email.
    * If not, create new `User ID`
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
* Lambda checks if the user is exist by ID before the creation of the pre-signed url...

![](./readme-pictures/05%20-%20upload%20profile%20image%20diagram.jpg)

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
* GET requests with `user ID` to get the user details & pre-signed url for the profile image.
* Then, using the url and making the GET request to get the image.
* Lambda checks if the user is exist by ID before the creation of the pre-signed url...
* Note: the lambda will not send back the pre-signed url for the image if the user has not uploaded a profile image. In every response of the lambda there is a kind of flag that if its value is True then the pre-signed url is also attached, otherwise it is not attached, and the image will not be displayed in the interface.

![](./readme-pictures/11%20-%20get%20profile%20details.jpg)

For example:

![](./readme-pictures/12%20-%20view%20profile.png)

Using Alice `User ID`
![](./readme-pictures/13%20-%20view%20profile%20of%20alice.png)

After clicking, two things happen. The browser will receive a pre-signed url (with details to represent) to download the image, then doenload it. the next picture contains both two actions together:
![](./readme-pictures/14%20-%20view%20profile%20of%20alice.png)

Of course, cases where the user ID does not exist will be handled as in the previous cases, so from now on I will not mention this case.

**Deleting a user**
* DELETE requests with `User ID`
* Lambda does the following:
    * Checks if user is already exist.
    * user details from `Users` **DynamoDB** table
    * user profile image from `Users` **S3** bucket
    * user **SNS** topic
    * all users posts from `posts` **DynamoDB** table
    * all images of posts of user from `posts` **S3** bucket

![](./readme-pictures/15%20-%20delete%20user%20diagram.jpg)

I will demonstrate the deletion example at the end of part B. Right now I need Alice for the next examples.

### Part B - Special Features
---
Before detailing this part, I will create some new users. A summary of their important details is detailed in the following table:

| Username   | Mail Address            | User ID                              |
|------------|-------------------------|--------------------------------------|
| Alice      | mirog74464@avashost.com | c0cb40f8-f5a1-4468-a91b-f11f75f692ec |
| Bob        | pemit49373@hapied.com   | 65d79d51-18a0-44f9-a980-49fa5cdf2a38 |
| Eve        | doseni9596@avashost.com | c0971ac2-e0d6-43dc-bfe1-43b980dc8bbc |

Let's start!

---
**Subscribe:**</br>
A service that a user can subscribe to another user.

**Subscribe to user**
* GET requests with `User ID` to get list of other users. the lambda for this return all other users, for each one there is a name and email. this lambda sits on user system API
* POST request with `User ID` of the user who subscribes, and the `Mail Address` of the user who subscribes to him to lambda for subscribe in subscribes system API.
* Lambda for subscribe does the following:
    * Check if both users are exist
    * If yes, find the `SNS topic ARN` of of the user who subscribes to him
    * find the `Mail` of the user who subscribes
    * subscribe the user `Mail` to the `SNS topic` by its `ARN`
* After that, the user receives a registration confirmation email to his email box.
* Note: when a new user registers in the system, an SNS topic is created for him, and his ARN is saved in DynamoDB `topics` table with the `User ID`.

![](./readme-pictures/16%20-%20subscribe%20diagram.jpg)


For example, let's make Alice a subscriber of Eve:

![](./readme-pictures/17%20-%20subscribe.png)

Using Alice `User ID`
![](./readme-pictures/18%20-%20subscribe.png)

After clicking, all users other than Alice will appear.
![](./readme-pictures/19%20-%20subscribe.png)

After clicking on Eve, a success message will appear asking to look in Alice's mailbox. After we click OK, Eve will disappear from the list of options.
![](./readme-pictures/20%20-%20subscribe.png)

Let's take a look in Alice's mailbox:
![](./readme-pictures/21%20-%20subscribe%20email%20notification.png)
![](./readme-pictures/22%20-%20subscribe%20email%20notification.png)
![](./readme-pictures/23%20-%20subscribe%20email%20notification.png)

Now, when Eve sends a message to all her subscribers, Alice will also receive Eve's message to her own email. And this is done in the following example.

**Message to my subscribers**
* POST requests which contains a user ID and the content of the message to be sent
* Lambda for insert to SQS does the following:
    * Checks user is exist
    * If yes, find `publisher username` and push it with the `entire message` and `user ID` to the SQS
* Lambda for publish message form the SQS does the following:
    * For each msg from the SQS (It can be more than one to handle at some times) finds the SNS topic ARN of the publisher, and publish the message.

![](./readme-pictures/24%20-%20send%20msg%20to%20subscribers%20diagram.jpg)

For example, let's see how Eve sends a message to all her subscribers, and then we'll take a look at Alice's email box (who subscribed) and see what happened:

![](./readme-pictures/25%20-%20send%20msg%20to%20my%20subscribers.png)

Using Eve `User ID`
![](./readme-pictures/26%20-%20send%20msg%20to%20my%20subscribers%20from%20eve.png)
![](./readme-pictures/27%20-%20send%20msg%20to%20my%20subscribers%20from%20eve.png)

Let's take a look again in Alice's mailbox:
![](./readme-pictures/28%20-%20alice%20got%20some%20new%20mail.png)

We can see that the email has also been added who sent it. This is part of the work of the lambda that inserts the message into SQS.
![](./readme-pictures/29%20-%20alice%20got%20some%20new%20mail%20from%20eve.png)

---
**Tagging images:**</br>
Service for uploading posts and tagging the photos on them.

**Uploading a post to a public wall**
* POST request to upload a new post, and get back a pre-signed url to upload the image as well
* PUT request to upload the image with the received url
* Lambda does the follwing:
    * Checks user is exist
    * If yes, create new `Post ID`
    * Inserts post details into `Posts` table in **DynamoDB**
    * Creates an empty folder in the Posts bucket in **S3**. The name of the folder is the `Post ID`
    * Create pre-signed url for image uploading and return it.

![](./readme-pictures/30%20-%20upload%20post%20diagram.jpg)

For example, let's see how Bob uploads a post:

![](./readme-pictures/31%20-%20upload%20post.png)

Using Bob `User ID`
![](./readme-pictures/32%20-%20upload%20post.png)
![](./readme-pictures/33%20-%20upload%20post.png)

In the next example, we will return to Alice and see how she views the posts.

**Viewing all posts on the public wall, with image tags**</br>
* GET requests for all posts
* Lambda does the following:
    * Checks if user is exist
    * If yes, creates a list of all posts.
        * Each post contains a pre-sign url for its image, the publisher's name and other post details. In addition, if there is an image in the post (there is a flag variable that indicates if there is or not) then tags obtained from the **amazon recognition** service are attached to it.
    * Returns the list of posts.
* The browser needs to represent all the post was returned.
* Of course the browser for each post will go to S3 with the pre-sign url (if any) to display the image.

![](./readme-pictures/34%20-%20get%20all%20posts%20diagram.jpg)

For example, let's see how Alice views posts:
![](./readme-pictures/35%20-%20view%20all%20posts.png)

Using Alice `User ID`
![](./readme-pictures/36%20-%20view%20all%20posts.png)

After clicking, you can see that there are tags on the post. These are actually the labels that came back from amazon recognition that worked on the image.
![](./readme-pictures/37%20-%20view%20all%20posts.png)

To make it more interesting, we will upload more posts from more users (including Alice). Now, let's go back and watch them all:



