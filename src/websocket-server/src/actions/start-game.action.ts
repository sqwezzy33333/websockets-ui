import {ExtendWebSocket, StartGameType} from "../models/models";
import {sendResponseMessage} from "../utils/utils";
import {MESSAGE_TYPE} from "../constants/constants";

export const startGame: StartGameType = async (db, room) => {
    try {
        const clients = await db.getWsClientsByRoom(room);

        if (clients) {
            clients.forEach((ws: ExtendWebSocket) => {
                const { userIndex } = ws;
                const gameData = room.data[userIndex];
                sendResponseMessage(MESSAGE_TYPE.start_game, gameData, ws);
            });
        }
    } catch (error: any) {
        console.log(`Start game error. ${error.message}`);
    }
};
