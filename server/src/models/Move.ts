import { Model } from "objection";
import { BaseModel } from "./BaseModel";
import { Game } from "./Game"
import { User } from "./User";

export class Move extends BaseModel {

    static readonly tableName = 'moves'

    game_id!: number
    move!: string
    turn!: number
    playedBy!: number

    gamePlayed?: Game
    playedByPlayer?: User

    static get relationMappings() {

        return {
            gamePlayed: {
                relation: Model.BelongsToOneRelation,
                modelClass: Game,
                join: {
                    from: 'moves.game_id',
                    to: 'games.game_id'
                }
            },

            playedByPlayer: {
                relation: Model.BelongsToOneRelation,
                modelClass: User,
                join: {
                    from: 'moves.playeBy',
                    to: 'users.id'
                }
            }
        }
    }
}