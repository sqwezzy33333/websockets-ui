import {ControllerType, RandomAttackDataType} from "../models/models";
import {getRandomAttackIndex, pipeIndexToXY, parseIncomingData} from "../utils/utils";
import {BOARD_SIZE, MESSAGE_TYPE} from "../constants/constants";
import {attack} from "./attack.action";

export const randomAttack: ControllerType = async (db, incomingMessage, ws) => {
    try {
        const parsedData = parseIncomingData(incomingMessage.data) as RandomAttackDataType;
        const { indexPlayer, gameId } = parsedData;

        const room = await db.getRoomByID(gameId);

        if (room) {
            const { nextTurn } = room;

            if (nextTurn !== indexPlayer) return;

            const opponentId = Object.keys(room.game).find((id) => +id !== indexPlayer);

            if (!opponentId) return;

            const { attacked } = room.game[opponentId];
            const randomIndex = getRandomAttackIndex(attacked, BOARD_SIZE ** 2 - 1);
            const { x, y } = pipeIndexToXY(randomIndex, BOARD_SIZE);
            const data = JSON.stringify({ indexPlayer, gameId, x, y });

            await attack(db, { type: MESSAGE_TYPE.random_attack, data }, ws);
        }
    } catch (error: any) {
        console.log(`RandomAttackError. ${error.message}`);
    }
};
