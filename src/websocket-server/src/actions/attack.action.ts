import {AttackDataType, BoardShipType, ControllerType} from "../models/models";
import {pipeIndexToXY, parseIncomingData, sendResponseMessage, pipeYXToIndex} from "../utils/utils";
import {ATTACK_STATUS, BOARD_SIZE, BOT_INDEX, MESSAGE_TYPE} from "../constants/constants";
import {turn} from "./turn.action";
import {finish} from "./finish.action";
import {randomAttackBot} from "./bot-random-attack.action";

const createAttackData = (x: number, y: number, currentPlayer: number, status: string) => ({
    position: {
        x,
        y,
    },
    currentPlayer,
    status,
});

export const attack: ControllerType = async (db, incomingMessage, ws) => {
    try {
        const parsedData = parseIncomingData(incomingMessage.data) as AttackDataType;
        const { indexPlayer, gameId, x, y } = parsedData;

        const room = await db.getRoomByID(gameId);

        if (room) {
            const { nextTurn } = room;

            if (nextTurn !== indexPlayer) return;

            const opponentId = Object.keys(room.game).find((id) => +id !== indexPlayer);

            if (!opponentId) return;

            const opponentGameData = room.game[opponentId];
            const shipIndex = pipeYXToIndex(x, y, BOARD_SIZE);

            const alreadyAttacked = await db.getAttacked(gameId, opponentId);

            if (alreadyAttacked.includes(shipIndex)) {
                await turn(db, room);
                return;
            }

            const allAttacked = await db.addAttacked(gameId, opponentId, shipIndex);

            const targetShip = opponentGameData.ships.find((item: BoardShipType) => {
                return item.ship.includes(shipIndex);
            });

            if (targetShip) {
                const isShipKilled = targetShip.ship.every((index: number) => {
                    return allAttacked.includes(index);
                });

                if (isShipKilled) {
                    const data = createAttackData(x, y, indexPlayer, ATTACK_STATUS.KILLED);
                    sendResponseMessage(MESSAGE_TYPE.attack, data, ws);
                    const { aroundShip } = targetShip;

                    aroundShip.forEach((cell: number) => {
                        const { x, y } = pipeIndexToXY(cell, BOARD_SIZE);
                        const data = createAttackData(x, y, indexPlayer, ATTACK_STATUS.MISS);
                        sendResponseMessage(MESSAGE_TYPE.attack, data, ws);
                    });

                    await db.addAttacked(gameId, opponentId, ...aroundShip);
                }

                if (!isShipKilled) {
                    const data = createAttackData(x, y, indexPlayer, ATTACK_STATUS.SHOT);
                    sendResponseMessage(MESSAGE_TYPE.attack, data, ws);
                }

                const winner = await db.checkWinner(gameId);

                if (winner) {
                    await finish(db, room, winner);
                } else {
                    await turn(db, room);

                    if (indexPlayer === BOT_INDEX) {
                        await randomAttackBot(db, gameId);
                    }
                }
            }

            if (!targetShip) {
                const data = createAttackData(x, y, indexPlayer, ATTACK_STATUS.MISS);
                sendResponseMessage(MESSAGE_TYPE.attack, data, ws);
                await db.changeNextTurn(gameId, +opponentId);
                await turn(db, room);

                if (opponentId === BOT_INDEX.toString()) {
                    await randomAttackBot(db, gameId);
                }
            }
        }

        if (!room) return;
    } catch (error: any) {
        console.log(`AttackError. ${error.message}`);
    }
};
