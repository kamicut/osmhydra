const router = require('express-promise-router')()

const { getClients, createClient, deleteClient } = require('./client')
const { getPlaces, createPlace, deletePlace } = require('./places')
const { login, loginAccept, logout } = require('./login')
const { attachUser, protected } = require('./authz')
const { serverRuntimeConfig } = require('../../next.config')
const session = require('express-session')

/**
 * The manageRouter handles all routes related to the first party
 * management client
 * 
 * @param {Object} nextApp the NextJS Server
 */
function manageRouter (nextApp) {
  /**
   * Attach a user session for these routes
   */
  const SESSION_SECRET = serverRuntimeConfig.SESSION_SECRET || 'super-secret-sessions'
  let sessionConfig = {
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    expires: new Date(Date.now() + (30 * 86400 * 1000))
  }

  const sessionMiddleware = [session(sessionConfig), attachUser()]
  router.use(sessionMiddleware)

  /**
   * Home page
   */
  router.get('/', (req, res) => {
    return nextApp.render(req, res, '/', { user: req.session.user })
  })

  /**
   * Logging in to manage app
   */
  router.get('/login', login)
  router.get('/login/accept',loginAccept)
  router.get('/logout', logout)

  /**
   * List / Create / Delete clients
   */
  router.get('/api/clients', protected(), getClients)
  router.post('/api/clients', protected(), createClient)
  router.delete('/api/clients/:id', protected(), deleteClient)

  /**
   * List / Create / Delete places
   */
  router.get('/api/places', protected(), getPlaces)
  router.post('/api/places', protected(), createPlace)
  router.delete('/api/places/:id', protected(), deletePlace)

  /**
   * Page renders
   */
  router.get('/clients', protected(), (req, res) => {
    const { user, user_picture } = req.session
    return nextApp.render(req, res, '/clients', { user, user_picture })
  })

  router.get('/profile', protected(), (req, res) => {
    const { user, user_picture } = req.session
    return nextApp.render(req, res, '/profile', { user, user_picture })
  })

  return router
}

module.exports = manageRouter
