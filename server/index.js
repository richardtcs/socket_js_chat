const express = require("express");
const app = express();
const cors = require('cors');
const http = require('http');
const { Socket } = require("dgram");
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
var rooms_test = io.of('/test');

var test_clt = [];
var test_admin = [];

function checkCon(){
    if(test_admin.length > 0 && test_clt.length > 0){
        var admin = test_admin[0];
        var client = test_clt[0];
        //con.set(admin.id, client.id);
        test_admin.shift();
        test_clt.shift();

        admin.emit('message', `Sistema Connected to User ${client.handshake.query.name}`);
        client.emit('message', `Sistema Connected to Admin ${admin.handshake.query.name}`);

        admin.on('message', msg => {
            client.emit('message', `${admin.handshake.query.name} ${msg}`);
        });

        client.on('message', msg => {
            admin.emit('message', `${client.handshake.query.name} ${msg}`);
        });

        admin.on('disconnect', () => {
            client.emit('con', 'Admin disconnected');
            client.disconnect(true);
        });

        client.on('disconnect', () => {
            admin.emit('con', 'Client disconnected');
            admin.disconnect(true);
        });
    }
}

rooms_test.on('connection', async (client) => {
    if(client.handshake.query.type == 'User'){
        test_clt.push(client);
        console.log('User connected');
        console.log(test_clt);
    } else if(client.handshake.query.type == 'Admin') {
        console.log('Admin connected');
        test_admin.push(client);
        console.log(test_admin);
    } else {
        console.log('Unidentified user');
        client.disconnect(true);
    }

    checkCon();

    client.on('disconnect', () => {
        if(client.handshake.query.type == 'User'){
            if(test_clt.includes(client)){
                test_clt.splice(test_clt.indexOf(client), 1);
            }
        } else if (client.handshake.query.type == 'Admin'){
            if(test_admin.includes(client)){
                test_admin.splice(test_admin.indexOf(client), 1);
            }
        }
        console.log(test_clt);
    })
});

chat.on('connection', (client) => {
    clients.push(client.id);
    console.log(`Cliente ${clients.length} conectado`);
    console.log(`Id: ${client.id} Name: ${client.handshake.query.name}`);
    
    client.on('message', msg => {
        console.log(`${client.handshake.query.name} ${msg}`);
        clients.map((e) => {
            if(client.id != e){
              client.to(e).emit("message", `${client.handshake.query.name} ${msg}`);
              //[${clients_name[clients.indexOf(client)]}] 
            }
        });
    });

    client.on('disconnect', () => {
        console.log(`desconectado ${client.id} ${client.handshake.query.name}`)
        clients.splice(clients.indexOf(client.id), 1);
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
