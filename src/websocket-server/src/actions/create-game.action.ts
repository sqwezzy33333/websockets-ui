import {CreateGameType, ExtendWebSocket} from "../models/models";
import {sendResponseMessage} from "../utils/utils";
import {MESSAGE_TYPE} from "../constants/constants";

export const createGame: CreateGameType = async (db, room) => {
    try {
        const clients = await db.getWsClientsByRoom(room);

        if (clients) {
            clients.forEach((ws: ExtendWebSocket) => {
                const gameData = {
                    idGame: room.roomId,
                    idPlayer: ws.userIndex,
                };

                room.isGameAvailableToJoin = false;
                sendResponseMessage(MESSAGE_TYPE.create_game, gameData, ws);
            });
        }
    } catch (error: any) {
        console.log(`CreateGameError. ${error.message}`);
    }
};
