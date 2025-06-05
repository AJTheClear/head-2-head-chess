import { Model } from "objection";
import { BaseModel } from "./BaseModel";
import { User } from "./User"

export class Game extends BaseModel {

    static readonly tableName = 'games'

    player_id_white!: number
    player_id_black!: number
    result!: string
    state!: string
    moves!: string
    playerW?: User
    playerB?: User

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
            }
        }
    }
}