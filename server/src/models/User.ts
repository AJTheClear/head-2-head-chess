import { Model } from "objection";
import { BaseModel } from "./BaseModel";
import { Game } from "./Game"
import { Move } from "./Move"

export class User extends BaseModel {

    static readonly tableName = 'users'

    email!: string
    username!: string
    password!: string
    elo!: string

    gamesWhite?: Game[]
    gamesBlack?: Game[]
    moves?: Move[]

    static get relationMappings() {

        return {
    
            gamesWhite: {
                relation: Model.HasManyRelation,
                modelClass: Game,
                join: {
                from: 'users.id',
                to: 'games.player_id_white'
                }
            },

            gamesBlack: {
                relation: Model.HasManyRelation,
                modelClass: Game,
                join: {
                    from: 'users.id',
                    to: 'games.player_id_black'
                }
            },

            moves: {
                relation: Model.HasManyRelation,
                modelClass: Move,
                join: {
                    from: 'users.id',
                    to: 'moves.playedBy'
                }
            }
        }
    }
}