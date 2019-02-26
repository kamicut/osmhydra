let cache = null

module.exports = async function db () {
  /**
   * Cached connection
   */
  if (cache) {
    return cache
  }

  const knex = require('knex')({
    client: 'sqlite3',
    connection: { filename: ':memory:' }
  })

  try {
    await knex.schema.createTableIfNotExists('users', db => {
      db.text('id').primary()
      db.json('manageToken')
      db.text('osmToken')
      db.text('osmTokenSecret')
    })
  } catch (error) {
    console.error(error)
    throw new Error('Could not create database')
  }

  cache = knex

  return cache
}