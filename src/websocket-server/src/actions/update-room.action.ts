import {sendResponseMessageToAll} from "../utils/utils";
import {MESSAGE_TYPE} from "../constants/constants";
import {DataBase} from "../database/database";

export const updateRoom = async (db: DataBase) => {
    try {
        const rooms = await db.getAvailableRooms();
        const clients = await db.getWsClient();
        sendResponseMessageToAll(MESSAGE_TYPE.update_room, rooms, clients);
    } catch (error: any) {
        console.log(`UpdateRoomError. ${error.message}`);
    }
};
