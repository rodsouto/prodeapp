import { BigInt } from "@graphprotocol/graph-ts";
import { Player, Tournament } from "../types/schema";

export function getMatchID(tournament, question) {
    return tournament.toString() + '-' + question.toString();
}

export function getBetID(tournament, tokenID) {
    return tournament.toString() + '-' + tokenID.toString();
}

export function getOrCreatePlayer(address: { toString: () => string; }): Player {
    let player = Player.load(address.toString())
    if (player === null) {
        player = new Player(address.toString())
        player.amountBeted = BigInt.fromI32(0)
        player.pricesReceived = BigInt.fromI32(0)
        player.save()
    }
    return player
}