'use strict';
const http = require('http');
const fileSystem = require('fs');
const path = require('path');

const GlipClient = require('glip-client');

const gc = new GlipClient({
    server: process.env.SERVER,
    appKey: process.env.APP_KEY,
    appSecret: process.env.APP_SECRET,
    appName: 'Glip Bot',
    appVersion: '1.0.0'
});

var groupId=process.env.GROUP;

gc.authorize({
    username: process.env.PHONE,
    extension: process.env.EXTENSION,
    password: process.env.PASSWORD
}).then((response) => {
    console.log('logged in');

    gc.posts().subscribe((message) => {
        console.log("Message arrived");
        console.dir(message);
        groupId = message.groupId;
    });
});


const server = http.createServer((req, res) => {
    if (req.url == "/index.html" || req.url == "/") {
        var filePath = path.join(__dirname, 'index.html');
        var readStream = fileSystem.createReadStream(filePath);
        readStream.pipe(res);
    } else if (req.url == "/translator.js") {
        var filePath = path.join(__dirname, 'translator.js');
        var readStream = fileSystem.createReadStream(filePath);
        readStream.pipe(res);
    } else if (req.url.startsWith("/glip/")) {
        var responseMsg = {groupId: groupId, text: decodeURIComponent(req.url.replace("/glip/", ""))};

        gc.posts().post(responseMsg)
            .then(response => {
                console.log("Sent: ", response);
            });

        res.end("{}");
    }
});

server.on('clientError', (err, socket) => {
    socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
});

server.listen(process.env.PORT || 8000);

