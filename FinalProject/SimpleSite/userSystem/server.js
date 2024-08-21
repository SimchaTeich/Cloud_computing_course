const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const PORT = 3000;

app.use(bodyParser.urlencoded({extended:false}));

// Route to Homepage
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/static/index.html');
});


app.get('/register', (req, res) => {
    res.sendFile(__dirname + '/static/register.html');
});

app.get('/userDetails', (req, res) => {
    res.sendFile(__dirname + '/static/userDetails.html');
});

app.get('/deleteUser', (req, res) => {
    res.sendFile(__dirname + '/static/deleteUser.html');
});


app.get('/uploadProfile', (req, res) => {
    res.sendFile(__dirname + '/static/uploadProfile.html');
});


app.get('/subscribe', (req, res) => {
    res.sendFile(__dirname + '/static/subscribe.html');
});


app.listen(PORT, () => {
    console.log(`This app is listening on port ${PORT}`);
});