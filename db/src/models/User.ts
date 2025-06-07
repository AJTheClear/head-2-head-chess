import { BaseModel } from "./BaseModel";

export class User extends BaseModel {

    static readonly tableName = 'users'

    email!: string
    username!: string
    password!: string
    elo!: string
    bio?: string
    country!: string
    first_name!: string
    middle_name!: string
    last_name!: string
    phone_number?: string
}