import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('games', t => {
        t.string('game_id').notNullable().unique()
        t.integer('player_id_white').references('id').inTable('users').notNullable()
        t.integer('player_id_black').references('id').inTable('users').notNullable()
        t.timestamp('date_time_played').defaultTo(knex.fn.now())
        t.string('result').notNullable()
        t.string('state').notNullable()
        t.text('moves').notNullable()
    });
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable('games');
}