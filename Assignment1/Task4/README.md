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