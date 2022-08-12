const express = require("express");
const app = express();
const cors = require('cors');
const http = require('http');
const server = http.createServer(app);
var io = require('socket.io')(server, {
    cors: {
        origin: "*",
    },
    maxHttpBufferSize: 1e8 // 100Mb
});

app.use(express.json());
app.use(cors());

//var clients = [];
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

        admin.emit('message', `Sistema Connected to Ejecutante: ${client.handshake.query.name}`);
        client.emit('message', `Sistema Connected to Administrador: ${admin.handshake.query.name}`);

        admin.on('message', msg => {
            client.emit('message', `${admin.handshake.query.name} ${msg}`);
        });

        client.on('message', msg => {
            admin.emit('message', `${client.handshake.query.name} ${msg}`);
        });
        
        client.on('img', img => {
            admin.emit('img', `${client.handshake.query.name} ${img}`);
        })

        admin.on('img', img => {
            client.emit('img', `${admin.handshake.query.name} ${img}`)
        })

        admin.on('disconnect', () => {
            client.emit('con', 'Administrador disconnected');
            client.disconnect(true);
        });

        client.on('disconnect', () => {
            if(admin.connected){
                admin.emit('message', `Sistema ${client.handshake.query.name} se ha desconectado`);
                test_admin.push(admin);
            }
        });
    }
}

rooms_test.on('connection', async (client) => {
    if(client.handshake.query.type == 'Ejecutante'){
        test_clt.push(client);
        console.log('Ejecutante connected');
        console.log(test_clt);
    } else if(client.handshake.query.type == 'Administrador') {
        test_admin.push(client);
        console.log('Administrador connected');
        console.log(test_admin);
    } else {
        console.log('Unidentified user');
        //client.disconnect(true);
        client.on("message", msg => {
            client.emit("test", {name: "richard", msg: "Hola"});
        });
    }

    checkCon();

    client.on('disconnect', () => {
        if(client.handshake.query.type == 'Ejecutante'){
            console.log("Ejecutante disconnected");
            if(test_clt.includes(client)){
                test_clt.splice(test_clt.indexOf(client), 1);
            }
            console.log(test_clt);
        } else if (client.handshake.query.type == 'Administrador'){
            console.log("Administrador disconnected");
            if(test_admin.includes(client)){
                test_admin.splice(test_admin.indexOf(client), 1);
            }
            console.log(test_admin);
        }
    })
});

chat.on('connection', (client) => {
    client.join('chat');
    //clients.push(client.id);
    console.log(`Cliente Id: ${client.id} Name: ${client.handshake.query.name} conectado`);
    
    client.on('message', msg => {
        // clients.map((e) => {
        //     if(client.id != e){
        //         client.to(e).emit("message", {
        //             name: client.handshake.query.name,
        //             msg: msg
        //         });
        //       //[${clients_name[clients.indexOf(client)]}] 
        //     }
        // });
        client.to('chat').emit("message", {
            name: client.handshake.query.name,
            msg: msg,
        });
    });

    client.on('img', img => {
        // clients.map((e) => {
        //     if(client.id != e){
        //         client.to(e).emit('img', {
        //             name: client.handshake.query.name,
        //             img: img
        //         });
        //       //[${clients_name[clients.indexOf(client)]}] 
        //     }
        // });
        client.to('chat').emit('img', {
            name: client.handshake.query.name,
            img: img,
        });
    });

    client.on('audio', audio => {
        client.to('chat').emit('audio', {
            name: client.handshake.query.name,
            audio: audio,
        })
    })

    client.on('disconnect', () => {
        console.log(`Cliente Id: ${client.id} Name: ${client.handshake.query.name} desconectado`);
        //clients.splice(clients.indexOf(client.id), 1);
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
