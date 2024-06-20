const { S3Client, ListObjectsV2Command } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/cloudfront-signer");
const express = require('express');
const cacheController = require('express-cache-controller');
const fs = require('fs').promises;

const region = "us-east-1";
const bucketName = "mymp4bucket";
const privateKeyPath = './private_key.pem'; // Path to your private key file
const cloudfrontDistributionDomain = "https://dyc51252on3e9.cloudfront.net";
const keyPairId = "KHDQEA8FNKD3H";

const client = new S3Client({ region });
const app = express();

// Enable CORS for all requests
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

// Add caching middleware
app.use(cacheController({
    maxAge: 3600, // Cache for 1 hour (in seconds)
    public: true, // Cache is public and can be stored in the browser
}));

// Function to retrieve list of objects from S3
async function get_bucket_objects_list() {
    const command = new ListObjectsV2Command({
        Bucket: bucketName
    });

    try {
        const { Contents } = await client.send(command);
        const contentsList = Contents.map((c) => `${c.Key}`);
        return JSON.stringify(contentsList);
    } catch (err) {
        console.error(err);
        throw err;
    }
}

// Function to generate signed CloudFront URL with expiration time
async function get_video_URL(video_name) {
    try {
        const url = `${cloudfrontDistributionDomain}/${video_name}`;
        const privateKey = await fs.readFile(privateKeyPath, "utf8");

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
    } catch (err) {
        console.error(err);
        throw err;
    }
}

// Route to fetch video list from S3 (cached for 1 hour)
app.get('/videoList', async (req, res) => {
    try {
        const result = await get_bucket_objects_list();
        console.log("GET request for /videoList");
        res.contentType('application/json');
        res.send(result);
    } catch (err) {
        res.status(500).send("Error fetching video list");
    }
});

// Route to generate signed CloudFront URL for a video (cached for 1 hour)
app.get('/videoLink', async (req, res) => {
    try {
        if (req.query.video_name) {
            const result = await get_video_URL(req.query.video_name);
            console.log("GET request for /videoLink?video_name=" + req.query.video_name);
            console.log(result);
            res.send(result);
        } else {
            res.status(400).send("Error: where is my video_name GET parameter?...");
        }
    } catch (err) {
        res.status(500).send("Error generating signed URL");
    }
});

// Start the server
const port = 3000;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
