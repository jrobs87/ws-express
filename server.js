var express = require('express');
var expressWs = require('express-ws');
var expressWs = expressWs(express());
var app = expressWs.app;
const path = require('path');

const port = 3000;

bodyParser = require('body-parser');
// support parsing of application/json type post data
app.use(bodyParser.json());
//support parsing of application/x-www-form-urlencoded post data
app.use(bodyParser.urlencoded({ extended: true }));


// HTML - Home
app.get('/', function (req, res, next) {
    console.log('index.html sent to client')
    res.sendFile(path.join(__dirname, './index.html'));
});

// HTML - Chat (loads the chat page)
app.get('/', function (req, res, next) {
    console.log('index.html sent to client')
    res.sendFile(path.join(__dirname, './index.html'));
});

//Secure WebSocket Instance
var aWss = expressWs.getWss('/');

// WebSocket Routes and Handlers
app.ws('/', function (ws, req) {
    console.log(`Socket Connected on ${port}`);

    // receive message, translate, and emit to all connected clients
    ws.onmessage = function (msg) {
        console.log(msg.data);

        // ----- Google API ----- //
        // Place API call here.  
        // Use data.msg for the text 
        // Use data.target for langauge ('es' is hardcoded)
        // ---------------------- //

        // iterate over clients/connected sockets to broadcast message
        aWss.clients.forEach(function (client) {
            client.send(msg.data);
        });
    };
});

app.listen(port);