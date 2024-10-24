import http from "http";
import path from "path";
import fs from "fs";
import {ExtendWebSocket} from "./models/models";
import * as dotenv from 'dotenv';
import {WebSocketServer} from "ws";
import {DataBase} from "./database/database";
import {closeWs} from "./actions/close-ws.action";
import {router} from "./router/router";

dotenv.config();

const STATIC_SERVER_PORT = +process.env!.STATIC_SERVER_PORT!;
const WS_SERVER_PORT= +process.env!.WS_SERVER_PORT!;


const httpServer = http.createServer(function (req, res) {
    const __dirname = path.resolve(path.dirname(''));
    const file_path = __dirname + (req.url === '/' ? '/front/index.html' : '/front' + req.url);
    fs.readFile(file_path, function (err, data) {
        if (err) {
            res.writeHead(404);
            res.end(JSON.stringify(err));
            return;
        }
        res.writeHead(200);
        res.end(data);
    });
});

httpServer.listen(STATIC_SERVER_PORT, () => {
    console.log(`Static HTTP server is running on port: ${STATIC_SERVER_PORT}!`);
});

process.on('SIGINT', () => {
    webSocketServer.clients.forEach((client) => client.close());
    webSocketServer.close();
    httpServer.close();
    setTimeout(() => process.exit(0), 1000);
});

const dataBase = new DataBase();
const webSocketServer = new WebSocketServer({port: WS_SERVER_PORT});

webSocketServer.on('listening', () =>
    console.log((`WebSocketServer is running on port: ${WS_SERVER_PORT}!`))
);

webSocketServer.on('error ', (error) => {
    console.log(`Error. ${error.message}`);
});

webSocketServer.on('close', () => {
    console.log(`WebSocketServer close!`);
});

webSocketServer.on('connection', (ws: ExtendWebSocket) => {
    dataBase.addWsClient(ws);
    console.log(`Client connected. Socket ID: ${ws.id}`);

    ws.on('close', async () => {
        console.log(`Client disconnected. Socket ID: ${ws.id}`);
        await closeWs(dataBase, ws);
    });

    ws.on('message', (message) => {
        router(message, ws, dataBase);
    });
});

export function initServer() {

}
