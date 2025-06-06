import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('users', t => {
        t.increments('id')
        t.string('email').notNullable().unique()
        t.string('username').notNullable().unique()
        t.string('password').notNullable()
        t.timestamp('created_at').defaultTo(knex.fn.now())
        t.integer('elo').notNullable().defaultTo('1200')
        t.string('bio').checkLength('<=', 100)
        t.string('country').notNullable()
        t.string('first_name').notNullable()
        t.string('middle_name')
        t.string('last_name').notNullable()
        t.timestamp('password_last_changed_at').defaultTo(knex.fn.now())
        t.string('phone_number')
    });
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable('users');
}