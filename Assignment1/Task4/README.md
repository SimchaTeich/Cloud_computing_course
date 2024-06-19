# Task 4
4th Task- Deploy the backend for scale

## Instructions
Now this is the time to get your backend code from your workspace and package it as an artifact for deployment, for express, you need:
* package.json
* package-lock.json
* server.js

**and** any other source code file and additional files that you wrote, including code folder, etc

Package all of them as zip files, and upload them to the deployment Bucket in s3 (create your own deployment bucket, separated from the movie bucket)

Use your knowledge from the class about Auto Scaling for EC2 and Load balancing to deploy that app with a scale of up to 3 instances if needed.

***we use a max of 3 instances due to the limitation on the Lab for concurrent instance running at the same time.***

## Implementation
Content:
* [Deployment backend bucket](#deployment-backend-bucket)
* [VPC](#vpc)
* [Target Group](#target-group)
* [Security Groups](#security-groups)
* [Load Balancer](#load-balancer)
* [Auto Scaling](#auto-scailing)
* [Deployment Web Client Bucket](#deployment-web-client-bucket)

### Deployment backend bucket
---
First, I taked the API that addresses S3 and turn it into a zip called [package.zip](./backend_deployment/package.zip). This is the same code in the [myAPI folder](../Task3/myAPI/) from the previous task.

Then, I created a private bucket called **simcha-assignment1-backend-deployment**. Then I put the zip in the bucket.

![](./img/00%20-%20backend%20deployment%20bucket.png)
![](./img/01%20-%20backend%20deployment%20bucket.png)


### VPC
---
Second, I created a VPC named **UTube-vpc**.

![](./img/02%20-%20vpc.png)
![](./img/03%20-%20vpc.png)


### Target Group
---
In addition, I created a target group called **UTube-backend-tg**

![](./img/04%20-%20target%20group.png)
* backend port is 3000
* vpc is **UTube-vpc**

![](./img/05%20-%20target%20group.png)
* health check turns to **/videoList** which returns the list of existing movie names.


### Security Groups
---
After that, I created 2 definitions for security groups.

The first one called **UTube-sg-for-backend**
![](./img/06%20-%20backend%20sg.png)
* vpc is **UTube-vpc**

* ![](./img/07%20-%20backend%20sg.png)
* ![](./img/08%20-%20backend%20sg.png)

The second one called **UTube-sg-for-balancer**
![](./img/09%20-%20load%20balancer%20sg.png)
* vpc is **UTube-vpc**

* ![](./img/10%20-%20load%20balancer%20sg.png)
* ![](./img/11%20-%20load%20balancer%20sg.png)


### Load Balancer
---
Now, I could go to create the load balancer, named **UTube-lb**
![](./img/12%20-%20load%20balancer.png)
![](./img/13%20-%20load%20balancer.png)
![](./img/14%20-%20load%20balancer.png)
![](./img/15%20-%20load%20balancer.png)
![](./img/16%20-%20load%20balancer.png)
![](./img/17%20-%20load%20balancer.png)


### Auto Scailing
---
Before I created auto scaling, I first created a launch template called **UTube-lt-for-backend** with the folowing user data:
```bash
#!/bin/bash

# Update the instance
sudo yum update -y

# Install unzip and AWS CLI
sudo yum install unzip aws-cli -y

# Install Node.js (using Node Version Manager)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
nvm install node

# download backend zip from the s3
aws s3 cp s3://simcha-assignment1-backend-deployment/package.zip /home/ec2-user/package.zip
sudo chown ec2-user:ec2-user /home/ec2-user/package.zip

# Unzip the package
mkdir /home/ec2-user/app
sudo chown ec2-user:ec2-user /home/ec2-user/app
unzip /home/ec2-user/package.zip -d /home/ec2-user/app

# Change directory to where the app was unzipped
cd /home/ec2-user/app

# Install NPM packages
npm install

# starts backend API
node index.js
```
![](./img/18%20-%20launch%20template.png)
* sg is **UTube-sg-for-backend**

![](./img/19%20-%20launch%20template.png)

And only after that, I created the auto scaling called **UTube-asg-for-backend**:
![](./img/20%20-%20asg%20for%20backend.png)
![](./img/21%20-%20asg%20for%20backend.png)
* vpc is **UTube-vpc**
* subnets are private.

![](./img/22%20-%20asg%20for%20backend.png)
![](./img/23%20-%20asg%20for%20backend.png)

### Deployment Web Client Bucket
---
Then I took the [html file](./web_client_on_bucket/index.html), and updated it with the addresses to which it fetches, to be the address of the load-balancer http://utube-lb-1300840202.us-east-1.elb.amazonaws.com/.

After that, I created a new public bucket named **simcha-assignment1-web-server** and uploaded the html file into it as a static web server.

![](./img/27%20-%20web%20server%20bucket.png)
![](./img/28%20-%20web%20server%20bucket.png)
![](./img/29%20-%20web%20server%20bucket.png)


## Results

Result of scaling group:
![](./img/24%20-%20results.png)
![](./img/25%20-%20results.png)

Result of load balancer
![](./img/26%20-%20results.png)

Result of web server bucket http://simcha-assignment1-web-server.s3-website-us-east-1.amazonaws.com/ :
![](./img/30%20-%20results.png)
