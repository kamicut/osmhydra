const knex = require('knex')({
  client: 'sqlite3',
  connection: { filename: 'hydra.db' }
})

module.exports = async function db () {
  try {
    const existsUsers = await knex.schema.hasTable('users')
    if (!existsUsers) {
      await knex.schema.createTable('users', db => {
        db.text('id').primary()
        db.json('profile')
        db.json('manageToken')
        db.text('osmToken')
        db.text('osmTokenSecret')
      })
    }

    const existsPlaces = await knex.schema.hasTable('places')
    if (!existsPlaces) {
      await knex.schema.createTable('places', db => {
        db.increments()
        db.text('user').references('id').inTable('users').onDelete('CASCADE')
        db.json('center')
      })
    }
  } catch (error) {
    console.error(error)
    throw new Error('Could not create database')
  }

  return knex
}