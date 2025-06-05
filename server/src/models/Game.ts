import { Model } from "objection";
import { BaseModel } from "./BaseModel";
import { User } from "./User"
import { Move } from "./Move"

export class Game extends BaseModel {

    static readonly tableName = 'games'

    player_id_white!: number
    player_id_black!: number
    result!: string
    state!: string

    playerW?: User
    playerB?: User
    moves?: Move[]

    static get relationMappings() {

        return {
            playerW: {
                relation: Model.BelongsToOneRelation,
                modelClass: User,
                join: {
                    from: 'games.player_id_white',
                    to: 'users.id'
                }
            },

            playerB: {
                relation: Model.BelongsToOneRelation,
                modelClass: Game,
                join: {
                    from: 'games.player_id_black',
                    to: 'users.id'
                }
            },

            moves: {
                relation: Model.HasManyRelation,
                modelClass: Move,
                join: {
                    from: 'games.game_id',
                    to: 'moves.game_id'
                }
            }
        }
    }
}