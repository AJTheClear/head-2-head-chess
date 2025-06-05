import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
        await knex.schema.createTable('moves', t => {
        t.string('game_id').references('game_id').inTable('games').notNullable()
        t.string('move').notNullable()
        t.integer('turn').notNullable()
        t.integer('played_by').references('id').inTable('users').notNullable()
        t.timestamp('made_at').notNullable().defaultTo(knex.fn.now())
      });
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable('moves');
}