const knex = require('knex')({
  client: 'sqlite3',
  connection: { filename: 'hydra.db' }
})

module.exports = async function db () {
  try {
    const exists = await knex.schema.hasTable('users')
    if (!exists) {
      await knex.schema.createTable('users', db => {
        db.text('id').primary()
        db.json('manageToken')
        db.text('osmToken')
        db.text('osmTokenSecret')
      })
    }
  } catch (error) {
    console.error(error)
    throw new Error('Could not create database')
  }

  return knex
}