var express = require('express');
var expressWs = require('express-ws');
var expressWs = expressWs(express());
var app = expressWs.app;
const path = require('path');
var moment = require('moment');
moment().format();

const port = 3000;

bodyParser = require('body-parser');
// support parsing of application/json type post data
app.use(bodyParser.json());
//support parsing of application/x-www-form-urlencoded post data
app.use(bodyParser.urlencoded({ extended: true }));

// HTML - Chat (loads the chat page)
app.get('/', function (req, res, next) {
    console.log('Index.html sent to Client')
    res.sendFile(path.join(__dirname, './index.html'));
});

//Secure WebSocket Instance
var aWss = expressWs.getWss('/');

const thread = [];

// WebSocket Routes and Handlers (on connection)
app.ws('/:user', function (ws, req) {
    ws.user = req.params.user;
    console.log(`${ws.user} has connected on Port ${port}`);
    // console.log(aWss.clients)

    ws.on('close', req => {
        console.log('user disconnected');
        console.log(req)
    });

    // receive message, translate, and emit to all connected clients
    ws.onmessage = function (msg) {
        // we have to parse json manually bc bodyParser() only works on req.bdoy, which is not available to ws
        message = JSON.parse(msg.data)
        console.log(`${message.userName} (${message.userID}): "${message.msg}"`)

        // ----- Google API ----- //
        // Place API call here.  
        // Use data.msg for the text 
        // Use data.target for langauge ('es' is hardcoded)
        // ---------------------- //
        msg.id = 'id';

        // iterate over clients/connected sockets to broadcast message
        aWss.clients.forEach(function (client) {
            client.send(msg.data);
            thread.push(msg.data);
            // console.log(thread);
            // console.log(aWss.clients)
        });
    };
});

app.listen(port);