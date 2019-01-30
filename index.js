/*
    Author: Nathan Howard
    Date: 1.17.19
    Filename: index.js
    Description: Create a node server
    Update History:
*/

var express = require('express');
var app = express();
var authenticator = require('./authenticator.js');
var config = require('./config.json'); //gets the configuration file
var url = require('url');

app.use(require('cookie-parser')()); //requires the cookie-parser module and runs the function of the name it automatically gives it and then uses it

app.get('/', function (req, res) {
    res.send("<h3>Hello World!</h3>");
});

app.get('/auth/twitter', authenticator.redirectToTwitterLoginPage);

app.get(url.parse(config.oauth_callback).path, function (req, res) {
    authenticator.authenticate(req, res, function (err) { //This route will handle Oauth as a callback.
        if (err) { //error trapping
            console.log(err);
            res.sendStatus(401);
        } else {
            res.send("Authentication successful!");
        }
    }); 
})

app.listen(config.port, function () { //grabs the port from the config file
    console.log("Server listening on localhost:%s", config.port);
    console.log("OAuth callback:%s " , url.parse(config.oauth_callback).hostname + url.parse(config.oauth_callback).path);
});
