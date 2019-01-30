/*
    Author: Nathan Howard
    Date: 1.25.19
    Filename: authenticator.js
    Description: Script to handle Oauth from twitter
    Update History:
*/

var OAuth = require('oauth').OAuth;
var config = require('./config.json');

var oauth = new OAuth(
    config.request_token_url, 
    config.access_token_url, 
    config.consumer_key,
    config.consumer_secret,
    config.oauth_version,
    config.oauth_callback,
    config.oauth_signature
);

var twitterCredentials = { //storing the user's twitter credentials
    oauth_token: "",
    oauth_token_secret: "",
    access_token: "",
    access_token_secret: "",
    twitter_id: ""
};

module.exports = {
    redirectToTwitterLoginPage: function (req, res) {
        oauth.getOAuthRequestToken(function(error, oauth_token, oauth_token_secret, results) {
            if (error) {
                console.log(error);        
                res.send("Authentication has failed!");
            } else {
                twitterCredentials.oauth_token = oauth_token;
                twitterCredentials.oauth_token_secret = oauth_token_secret;
                res.redirect(config.authorize_url + '?oauth_token=' + oauth_token);
            }
        });
    },
    authenticate: function (req, res, callback) {
//        twitterCredentials.oauth_token = "";
//        twitterCredentials.oauth_token_secret = "";
        if (!(twitterCredentials.oauth_token && twitterCredentials.oauth_token_secret && req.query.oauth_verifier)) { //make sure it has required keys
            return callback("Request does not have all the required keys");
        }
//        clear the keys from memory
//        twitterCredentials.oauth_token = "";
//        twitterCredentials.oauth_token_secret = "";
        oauth.getOAuthAccessToken(twitterCredentials.oauth_token, twitterCredentials.oauth_token_secret, req.query.oauth_verifier, function (error, oauth_access_token, oauth_access_token_secret, results) { //make sure it gets all of these tokens
            if (error) {
                return callback(error);        
            }
            oauth.get('https://api.twitter.com/1.1/account/verify_credentials.json', oauth_access_token, oauth_access_token_secret, function (error, data) { //verify credentials we got from twitter
                if (error) {
                    console.log(error);
                    return callback(error);
                }
                data = JSON.parse(data);
                //set the variables in twitterCredentials
                twitterCredentials.access_token = oauth_access_token;
                twitterCredentials.access_token_secret = oauth_access_token_secret;
                twitterCredentials.twitter_id = data.id_str;
                console.log(twitterCredentials);
                callback();
            });
        });
    }
}