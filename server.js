var express = require('express');
var expressWs = require('express-ws');
var expressWs = expressWs(express());
var app = expressWs.app;
const path = require('path');
var moment = require('moment');
bodyParser = require('body-parser');

// loading .env and config variables
require('dotenv').config();
// need for timestamps later
moment().format();

const port = process.env.PORT || 3000;

app.use(express.static('public'));

app.use(bodyParser.json()); // note that bodyparser does not work on WebSockets (only Express routes - parse all WS data)
app.use(bodyParser.urlencoded({ extended: true }));

// HTML - Chat (loads the chat page)
app.get('/', function (req, res, next) {
    res.sendFile(path.join(__dirname, './index.html'));
});

// ----- WebSockets begins here ----- // 
//Secure WebSocket Instance
var aWss = expressWs.getWss('/');

// WebSocket Routes and Handlers (on connection)
app.ws('/:user/:target', function (ws, req) {
    // adding key properties to ws object for each connected client as they connect
    ws.user = req.params.user;
    ws.target = req.params.target;
    ws.native = '';

    // function to log users when they join and leave
    function logUsers() {
        let users = [];
        aWss.clients.forEach((client) => {
            users.push(` ${client.user}`);
        });
        console.log(`Users in Chat: ${users}`);
        users = [];
    };

    // Log when a user joins
    console.log(`${ws.user} has connected on Port ${port} using target language '${ws.target}'`);

    // receive message, translate, and emit to all connected clients
    ws.onmessage = function (msg) {
        // we have to parse json manually bc bodyParser() only works on req.bdoy, which is not available to ws
        msg = JSON.parse(msg.data);
        console.log(`${msg.userName} (${msg.userID}): "${msg.msg}"`);

        // Iterate over each client for targeted translation and message send
        aWss.clients.forEach(client => {

            // ----- Begin Google API ----- //
            async function main(
                projectId = process.env.GOOGLE_CLOUD_PROJECT_ID
            ) {
                // [START translate_quickstart]
                // Imports the Google Cloud client library
                const { Translate } = require('@google-cloud/translate');

                // Instantiates a client
                const translate = new Translate({ projectId });

                // The text to translate
                const text = msg.msg;

                // The target language
                const target = client.target;

                // Translates text into target language
                const [translation] = await translate.translate(text, target);

                // adds translated message to msg object 
                msg.trans = translation;

                // iterate over clients/connected sockets to broadcast message
                client.send(JSON.stringify(msg));
                console.log(`Translated "${msg.msg}" to "${msg.trans}" and sent to clients`)
            }

            const args = process.argv.slice(2);
            main(...args).catch(() => {
                console.error;
                // send original message and alert about failed translation
                msg.trans = `Error occured.  Failed to translate: '${msg.msg}'`;
                client.send(JSON.stringify(msg));
            });
        });
        // ----- End Google API ----- //

        // WebSockets - Close Connection
        ws.on('close', req => {
            // log the status code on disconnect
            console.log(`Staus code: ${req} - user disconnected`);
            // log all connected users in session
            logUsers();
        });
    };

    // log all connected users in session
    logUsers();
});
// -----  WebSockets ends here ----- // 

console.log(`iMMersio listening on Port ${port}`);
app.listen(port);

