/*----------------------------------------------------------------------------------------------------
/ Great Thanks to:
/ https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/javascript_s3_code_examples.html
/ about the listing objects from s3
/----------------------------------------------------------------------------------------------------*/
const { S3Client, ListObjectsV2Command } = require("@aws-sdk/client-s3");
const region     = "us-east-1";
const bucketName = "mymp4bucket";
const client = new S3Client({region});
  
async function get_bucket_objects_list()
{
    const command = new ListObjectsV2Command({
        Bucket: bucketName
    });

    try
    {
        // get list of objects from s3
        const { Contents } = await client.send(command);

        // exstract just the filenames (filename is key)
        const contentsList = Contents.map((c) => `${c.Key}`);
        
        // return a json list (type is string..)
        return JSON.stringify(contentsList);
        
    } catch (err) { console.error(err);}
}



/*----------------------------------------------------------------------------------------------------
/ Great Thanks to:
/ https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-cloudfront-signer/
/ about the using with cloudfront
/----------------------------------------------------------------------------------------------------*/
const { getSignedUrl } = require("@aws-sdk/cloudfront-signer");

async function get_video_URL(video_name) {
    const bucket = "mymp4bucket";
    const privateKeyPath = './private_key.pem'; // Path to your private key file
    const cloudfrontDistributionDomain = "https://dyc51252on3e9.cloudfront.net";

    const url = `${cloudfrontDistributionDomain}/${video_name}`;
    const privateKey = require("fs").readFileSync(privateKeyPath, "utf8");
    const keyPairId = "KHDQEA8FNKD3H";
    
    // Calculate dateLessThan as 1 hour from now
    const expirationTime = new Date();
    expirationTime.setHours(expirationTime.getHours() + 1);
    const dateLessThan = expirationTime.toISOString();

    const signedUrl = getSignedUrl({
    url,
    keyPairId,
    dateLessThan,
    privateKey,
    });

    return signedUrl;
}



/*----------------------------------------------------------------------------------------------------
/ Great Thanks to:
/ https://github.com/meni432/ariel-cloud/blob/main/demos/03-fib-user-data
/ about the express application
/----------------------------------------------------------------------------------------------------*/
const express = require('express');
const app = express();

// Enable CORS for all requests
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.get('/videoList', async (req, res) => {
    let result = await get_bucket_objects_list();
    console.log("GET request for /videoList");
    res.contentType('application/json');
    res.send(result);
});

app.get('/videoLink', async (req, res) => {
    if (req.query.video_name)
    {
        let result = await get_video_URL(req.query.video_name);
        console.log("GET request for /videoLink?video_name="+req.query.video_name);
        console.log(result);
        res.send(result);
    }
    else
    {
        res.send("Error: where is my video_name GET parameter?...");
    }
});



app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
