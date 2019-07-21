var express = require('express');
var expressWs = require('express-ws');
var expressWs = expressWs(express());
var app = expressWs.app;
const path = require('path');
var moment = require('moment');

require('dotenv').config()

moment().format();

const port = 3000;
app.use(express.static('public'))

bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// HTML - Chat (loads the chat page)
app.get('/', function (req, res, next) {
    res.sendFile(path.join(__dirname, './index.html'));
});

//Secure WebSocket Instance
var aWss = expressWs.getWss('/');

// WebSocket Routes and Handlers (on connection)
app.ws('/:user/:target', function (ws, req) {
    ws.user = req.params.user;
    ws.target = req.params.target;
    ws.native = '';

    function logUsers() {
        let users = [];
        aWss.clients.forEach((client) => {
            users.push(` ${client.user}`);
        });
        console.log(`Users in Chat: ${users}`);
        users = [];
    };

    console.log(`${ws.user} has connected on Port ${port} using target language '${ws.target}'`);

    // receive message, translate, and emit to all connected clients
    ws.onmessage = function (msg) {
        // we have to parse json manually bc bodyParser() only works on req.bdoy, which is not available to ws
        msg = JSON.parse(msg.data);
        console.log(`${msg.userName} (${msg.userID}): "${msg.msg}"`);

        // testing 
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
         
             msg.trans = translation;
         
             // iterate over clients/connected sockets to broadcast message
                 client.send(JSON.stringify(msg));
         }
         
         const args = process.argv.slice(2);
         main(...args).catch(console.error);
         });
          // ----- End Google API ----- //

        ws.on('close', req => {
            console.log(`Staus code: ${req} - user disconnected`);
            logUsers();
        });
    };

    logUsers();
});

app.listen(port);
console.log(`iMMersio listening on Port ${port}`)