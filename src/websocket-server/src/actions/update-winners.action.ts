import {MESSAGE_TYPE} from "../constants/constants";
import {DataBase} from "../database/database";
import {sendResponseMessageToAll} from "../utils/utils";

export const updateWinners = async (db: DataBase) => {
    try {
        const winners = await db.getWinners();
        const clients = await db.getWsClient();

        sendResponseMessageToAll(MESSAGE_TYPE.update_winners, winners, clients);
    } catch (error: any) {
        console.log(`UpdateWinnersError. ${error.message}`);
    }
};

