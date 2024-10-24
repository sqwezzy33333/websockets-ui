import {DataBase} from "../database/database";
import {BOARD_SIZE, BOT_INDEX, MESSAGE_TYPE} from "../constants/constants";
import {getRandomAttackIndex, pipeIndexToXY} from "../utils/utils";
import {attack} from "./attack.action";

export const randomAttackBot = async (db: DataBase, gameId: number) => {
    try {
        const room = await db.getRoomByID(gameId);
        const indexPlayer = BOT_INDEX;

        if (room) {
            const { nextTurn } = room;

            if (nextTurn !== indexPlayer) return;

            const opponentId = Object.keys(room.game).find((id) => +id !== indexPlayer);

            if (!opponentId) return;

            const { attacked } = room.game[opponentId];
            const randomIndex = getRandomAttackIndex(attacked, BOARD_SIZE ** 2 - 1);
            const { x, y } = pipeIndexToXY(randomIndex, BOARD_SIZE);
            const data = JSON.stringify({ indexPlayer, gameId, x, y });

            await attack(db, { type: MESSAGE_TYPE.random_attack, data }, undefined);

            console.log(`Bot attack x: ${x}, y: ${y}`);
        }
    } catch (error: any) {
        console.log(`RandomAttackBotError. ${error.message}`);
    }
};
