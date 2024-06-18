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

### VPC

![](./img/00%20-%20vpc.png)

### Target Group
![](./img/01%20-%20target%20group.png)
* vpc is **UTube-vpc**

### Security Group
For the ec2 instances:
![](./img/02%20-%20security%20group.png)
* vpc is **UTube-vpc**

For the load balancer later:
![](./img/05%20-%20security%20group%20for%20load%20balancer.png)
* vpc is **UTube-vpc**


### Load Balancer
![](./img/03%20-%20load%20balancer.png)
* vpc is **UTube-vpc**

![](./img/04%20-%20load%20balancer%20more%20details.png)
* security group is **UTube-sg-for-lb**


### Auto Scailing
create launch-template named **UTube-lt** with the folowing user data:
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

# Replace '<your-bucket-name>' with your actual S3 bucket name
# and 'your-package-path' with the path to your package.zip in S3
aws s3 cp s3://simcha-deployment-bucket/package.zip /home/ec2-user/package.zip
sudo chown ec2-user:ec2-user /home/ec2-user/package.zip

# Unzip the package
mkdir /home/ec2-user/app
sudo chown ec2-user:ec2-user /home/ec2-user/app
unzip /home/ec2-user/package.zip -d /home/ec2-user/app

# Change directory to where the app was unzipped
cd /home/ec2-user/app

# Install NPM packages in myAPI
cd ./myAPI
npm install
cd ..

# Install NPM packages in myWebServer
cd ./myWebServer
npm install
cd ..

# starts the API in port 3000
node ./myAPI/index.js &

# start the web server in port 3001
node ./myWebServer/index.js &
```
![](./img/06%20-%20launch%20template.png)

Then, create the auto scailing:
![](./img/07%20-%20auto%20scaling.png)
![](./img/08%20-%20auto%20scaling%20more%20details.png)
![](./img/09%20-%20auto%20scaling%20more%20details.png)

## Results

![](./img/10%20-%20load%20balancer%20after%20auto%20scaling.png)

![](./img/11%20-%20new%20instances%20made%20by%20auto%20scaling.png)

![](./img/12%20-%20site%20with%20load%20balancer%20url.png)
