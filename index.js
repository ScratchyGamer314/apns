let express = require('express'),

path = require('path');

var app = express();

let server = require('http').Server(app);

app.get('/', function(req, res, next){
        res.sendStatus(200);
        res.send('Hello World');
        res.end()
});

app.get('/index.js', function(req, res,next){
        res.sendStatus(200);
        res.send('Index.js Called');
});

app.get('/send.js', function(req, res,next){
        var token = req.query.token;
        var message = req.query.message;
        var app = req.query.app;
        sendAPNS(token, message, app);
        res.sendStatus(200);
});

var port = process.env.PORT || 8000;

server.listen(port, function() {
    console.log("Server is listening on port: " + port);
});


function sendAPNS(deviceToken, message, app) {
    
    var apn = require('apn');
    
    // Set up apn with the APNs Auth Key
    var apnProvider = new apn.Provider({
                                       token: {
                                       key: 'apns.p8', // Path to the key p8 file - same path as index.js
                                       keyId: 'KEYID - ADD YOURS', // The Key ID of the p8 file (available at https://developer.apple.com/account/ios/certificate/key)
                                       teamId: 'TEAMID-ADD YOURS' // The Team ID of your Apple Developer Account (available at https://developer.apple.com/account/#/membership/)
                                       },
                                       production: false // Set to true if sending a notification to a production iOS app
                                       });
    
    // Prepare a new notification
    var notification = new apn.Notification();
    
    // Specify your iOS app's Bundle ID (accessible within the project editor)
    notification.topic = app;
    
    // Set expiration to 1 hour from now (in case device is offline)
    notification.expiry = Math.floor(Date.now() / 1000) + 3600;
    
    // Set app badge indicator
    notification.badge = 3;
    
    // Play ping.aiff sound when the notification is received
    notification.sound = 'ping.aiff';
    
    // Display the following message (the actual notification text, supports emoji)
    notification.alert = message;
    
    // Send any extra payload data with the notification which will be accessible to your app in didReceiveRemoteNotification
    notification.payload = {id: 123};
    
    // Actually send the notification
    console.log(deviceToken)
    apnProvider.send(notification, deviceToken).then( (response) => {
        response.sent.forEach( (token) => {
                              console.log("SentOK")
//                           notificationSent(user, token);
                });
        response.failed.forEach( (failure) => {
                             if (failure.error) {
                             // A transport-level error occurred (e.g. network problem)
                            console.log("Transport Error")
                                } else {
                             // `failure.status` is the HTTP status code
                             // `failure.response` is the JSON payload
                            console.log(failure.status)
                            console.log(failure.response)
                                
                                }
                });
     });
    
};
