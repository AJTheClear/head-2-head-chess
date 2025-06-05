import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('users', t => {
        t.increments('id')
        t.string('email').notNullable().unique()
        t.string('username').notNullable().unique()
        t.string('password').notNullable()
        t.timestamp('created_at').defaultTo(knex.fn.now())
        t.integer('elo').notNullable().defaultTo('300')
    });
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable('users');
}