import {DataBase} from "../database/database";
import {RoomType} from "../models/models";
import {MESSAGE_TYPE} from "../constants/constants";
import {sendResponseMessage} from "../utils/utils";
import {updateWinners} from "./update-winners.action";

export const finish = async (db: DataBase, room: RoomType, winnerName: string) => {
    try {
        const winPlayer = await db.addWinner(winnerName);
        const clients = await db.getWsClientsByRoom(room);

        if (clients) {
            clients.forEach((ws) => {
                sendResponseMessage(MESSAGE_TYPE.finish, { winPlayer }, ws);
            });
        }

        await updateWinners(db);
        await db.closeRoom(room);
    } catch (error: any) {
        console.log(`FinishError. ${error.message}`);
    }
};
