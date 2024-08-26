const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const PORT = 3000;

app.use(bodyParser.urlencoded({extended:false}));

// Route to Homepage
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});


app.get('/register', (req, res) => {
    res.sendFile(__dirname + '/userSystem/static/register.html');
});

app.get('/userDetails', (req, res) => {
    res.sendFile(__dirname + '/userSystem/static/userDetails.html');
});

app.get('/deleteUser', (req, res) => {
    res.sendFile(__dirname + '/userSystem/static/deleteUser.html');
});


app.get('/uploadProfile', (req, res) => {
    res.sendFile(__dirname + '/userSystem/static/uploadProfile.html');
});


app.get('/uploadPost', (req, res) => {
    res.sendFile(__dirname + '/posts/static/uploadPost.html');
});


app.get('/subscribe', (req, res) => {
    res.sendFile(__dirname + '/subscriptions/static/subscribe.html');
});


app.get('/msg2MySubscribers', (req, res) => {
    res.sendFile(__dirname + '/subscriptions/static/msg2MySubscribers.html');
});


app.listen(PORT, () => {
    console.log(`This app is listening on port ${PORT}`);
});