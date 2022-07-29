const express = require("express");
const app = express();
const cors = require('cors');
const http = require('http');
const server = http.createServer(app);
var io = require('socket.io')(server, {
    cors: {
        origin: "*",
    }
});

app.use(express.json());
app.use(cors());

var clients = [];
var chat = io.of('/chat');
chat.on('connection', (client) => {
    clients.push(client);
    console.log(`Cliente ${clients.length} conectado`);
    console.log(`Id: ${client.id} Name: ${client.handshake.query.name}`);
    client.on('message', msg => {
        console.log(`${client.handshake.query.name} ${msg}`);
        clients.map((e) => {
            if(client != e){
              e.emit("message", `${client.handshake.query.name} ${msg}`);
              //[${clients_name[clients.indexOf(client)]}] 
            }
        });
    });

    client.on('disconnect', () => {
        console.log(`desconectado ${client.id} ${client.handshake.query.name}`)
        clients.splice(clients.indexOf(client), 1);
    });
});

// app.get('/', (req, resp) => {
//     resp.send('<h1>hola</h1>');
// });

server.listen(3000, () => {
    console.log('Servidor corriendo');
});

// const WebSocket = require("ws");

// const wss = new WebSocket.Server({
//     port: 8082,
// });

// wss.on('connection', ws => {
//     console.log('New Client Connected');
//     ws.on('close', () => {
//         console.log('Client Disconnected');
//     });

//     ws.on('message', msg => {
//         console.log(msg);
//     })
// });
