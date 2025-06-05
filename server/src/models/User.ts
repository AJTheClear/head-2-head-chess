import { Model } from "objection";
import { BaseModel } from "./BaseModel";
import { Game } from "./Game"

export class User extends BaseModel {

    static readonly tableName = 'users'

    email!: string
    username!: string
    password!: string
    elo!: string

    gamesWhite?: Game[]
    gamesBlack?: Game[]

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
            }
        }
    }
}