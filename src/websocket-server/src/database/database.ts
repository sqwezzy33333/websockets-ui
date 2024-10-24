import {BoardType, ClientsType, ExtendWebSocket, GameDataType, RoomType, UserType, WinnerType} from "../models/models";
import {BOT_INDEX} from "../constants/constants";
import {generateId, getRandomBoard} from "../utils/utils";

export class DataBase {
    wsClients: ClientsType = new Map();
    users: UserType[] = [];
    nextUserIndex: number = 1;
    winners: WinnerType[] = [];
    rooms: RoomType[] = [];
    nextRoomIndex: number = 1;

    getWsClientsByRoom(room: RoomType) {
        const {roomUsers} = room;

        const usersToGet = roomUsers.filter((user) => user.index !== BOT_INDEX);

        const clients = this.wsClients;
        const clientsToGetId = usersToGet.map(({index}) => index);
        const clientsToGet: ExtendWebSocket[] = [];

        clients.forEach((_, ws) => {
            if (clientsToGetId.includes(ws.userIndex)) {
                clientsToGet.push(ws);
            }
        });

        if (clientsToGet.length === usersToGet.length) {
            return Promise.resolve(clientsToGet);
        } else {
            return Promise.resolve(undefined);
        }
    }

    addWsClient(ws: ExtendWebSocket) {
        const id = generateId();
        ws.id = id;
        this.wsClients.set(ws, undefined);
        return ws;
    }

    async removeWsClient(ws: ExtendWebSocket) {
        this.wsClients.delete(ws);
    }

    async addUser(usernameToAdd: string, password: string) {
        const newUser: UserType = {
            index: this.nextUserIndex,
            username: usernameToAdd,
            password,
        };

        this.nextUserIndex += 1;
        this.users.push(newUser);
        return newUser;
    }

    async findUserByUsername(usernameToFind: string) {
        const user = this.users.find(({username}) => usernameToFind === username);
        return user;
    }

    async getAttacked(roomId: number, userId: string) {
        const room = await this.getRoomByID(roomId);

        if (room) {
            return room.game[userId].attacked;
        }

        return [];
    }

    async addAttacked(roomId: number, userId: string, ...shipIndex: number[]) {
        const room = await this.getRoomByID(roomId);

        if (room) {
            room.game[userId].attacked.push(...shipIndex);
            return room.game[userId].attacked;
        }

        return [];
    }

    async changeNextTurn(roomId: number, nextTurnId: number) {
        const room = await this.getRoomByID(roomId);

        if (room) {
            room.nextTurn = nextTurnId;
            return room.nextTurn;
        }
    }

    async getWinners() {
        return this.winners.sort((a, b) => b.wins - a.wins);
    }

    async getAvailableRooms() {
        const rooms = this.rooms.filter(({isGameAvailableToJoin}) => isGameAvailableToJoin);
        return rooms;
    }

    async getRoomByID(id: number) {
        const room = this.rooms.find(({roomId}) => roomId === id);
        return room;
    }

    async getRoomByUserId(userId: number) {
        const rooms = this.rooms.filter(({roomUsers}) => {
            return roomUsers.some(({index}) => index === userId);
        });

        return rooms;
    }

    async addRoomBoardByUserIndex(
        roomId: number,
        index: number,
        board: BoardType,
        data: GameDataType
    ) {
        const room = await this.getRoomByID(roomId);

        if (room) {
            room.game[index] = board;
            room.data[index] = data;

            return room;
        }
    }

    async addRoom(ws: ExtendWebSocket) {
        const {userIndex: index, userName: name} = ws;
        const availableRooms = await this.getAvailableRooms();
        const userRooms = availableRooms.filter(({roomCreatorIndex}) => roomCreatorIndex === index);

        if (userRooms.length) return;

        const newRoom: RoomType = {
            roomId: this.nextRoomIndex,
            roomUsers: [{name, index}],
            roomCreatorIndex: index,
            nextTurn: index,
            isGameAvailableToJoin: true,
            isClosed: false,
            game: {},
            data: {},
        };

        this.nextRoomIndex += 1;
        this.rooms.push(newRoom);
        return newRoom;
    }

    async closeRoom(room: RoomType) {
        room.isClosed = true;
    }

    async addUserToTheRoom(ws: ExtendWebSocket, indexRoom: number) {
        const {userIndex: index, userName: name} = ws;

        const room = this.rooms.find(({isGameAvailableToJoin, roomId, roomCreatorIndex}) => {
            return isGameAvailableToJoin && roomId === indexRoom && roomCreatorIndex !== index;
        });

        if (room) {
            room.roomUsers.push({name, index});
            room.isGameAvailableToJoin = false;
            return room;
        }
    }

    getWsClient() {
        return Promise.resolve(this.wsClients);
    }

    async checkWinner(roomId: number) {
        const room = await this.getRoomByID(roomId);
        let winnerName: 'Incognito' | string | undefined;

        if (room) {
            Object.entries(room.game).forEach(([id, data]) => {
                const {ships, attacked} = data;
                const shipsIndexes = ships.map(({ship}) => [...ship]);

                if (shipsIndexes.flat().every((shipIndex) => attacked.includes(shipIndex))) {
                    const winner = room.roomUsers.find(({index}) => index !== +id);

                    if (winner) {
                        winnerName =
                            this.users.find(({index}) => index === winner.index)?.username ?? 'Incognito';
                    }
                }
            });
        }

        return winnerName;
    }

    async addWinner(userName: string) {
        const user = await this.findUserByUsername(userName);

        if (!user) {
            return;
        }
        const winner = this.winners.find(({name}) => name === userName);

        if (winner) {
            winner.wins += 1;
        } else {
            this.winners.push({name: userName, wins: 1});
        }

        return user.index;

    }

    async addBotToRoom(roomId: number) {
        const room = await this.getRoomByID(roomId);
        if (room) {
            room.isGameAvailableToJoin = false;
            const index = BOT_INDEX;
            room.roomUsers.push({name: 'bot', index});
            room.game[index] = {
                ships: getRandomBoard(),
                attacked: [],
            };
        }
    }
}
