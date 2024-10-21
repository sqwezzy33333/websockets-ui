import WebSocket from "ws";
import {AuthRequestUser, User, UserInResponse, UserResponse} from "../models";
import * as fs from "node:fs";

class UserController {
    readonly DATABASE_PATH = './src/websocket-server/src/db/user.db.json';
    ws!: WebSocket;
    users: User[] = [];

    async readDatabase() {
        return new Promise<void>((resolve, reject) => {
            let data = ''
            const stream = fs.createReadStream(this.DATABASE_PATH);
            stream.on('data', (chunk) => {
                data += chunk.toString();
            });
            stream.on('end', () => {
                if (data) {
                    this.users = JSON.parse(data);
                }

                resolve();
            })
        })
    }

    async addUser(body: AuthRequestUser) {
        await this.readDatabase();
        this.users.push(body.data as User);
        await this.updateDatabase();
        const data: UserInResponse = {...body.data as User, error: false, errorText: '', index: 0};
        const responseBody: UserResponse = {...body, data};
        responseBody.data = JSON.stringify(responseBody.data);
        this.ws.send(JSON.stringify(responseBody));
        return;
    }

    async updateDatabase() {
        return new Promise<void>((resolve, reject) => {
            const toString = JSON.stringify(this.users);
            fs.writeFile(this.DATABASE_PATH, toString, (err) => {
                if (err) reject(err);
                resolve();
            })
        })
    }

    existUser(userName: string): User | undefined {
        return this.users.find((user) => user.name === userName);
    }


    checkUserPass(body: User, existUser: User, id: number) {
        const userResponse: UserInResponse = {...body, error: false, errorText: '', index: 0};
        const response: UserResponse = {
            type: 'reg',
            data: userResponse as UserInResponse,
            id
        }
        if (body.password !== existUser.password && typeof response.data === 'object') {
            response.data.error = true;
            response.data.errorText = 'Incorrect password';
        }
        response.data = JSON.stringify(response.data);
        return this.ws.send(JSON.stringify(response));
    }

    async checkUser(user: AuthRequestUser) {
        const body = user.data as User;
        await this.readDatabase();
        const existUser = this.existUser(body.name);
        if (existUser) {
            return this.checkUserPass(body, existUser, user.id);
        }
        return this.addUser(user)
    }

    setWebSocket(ws: WebSocket) {
        this.ws = ws;
        return this;
    }
}

export const userController = new UserController();
