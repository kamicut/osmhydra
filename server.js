const next = require('next')
const bodyParser = require('body-parser')
const api = require('./api')
const { ensureLogin } = require('./api/auth')
const { getLogin } = require('./api/login')
const { getConsent, postConsent } = require('./api/consent')

const dev = process.env.NODE_ENV !== 'production'
const PORT = process.env.PORT || 8989

const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  api.get('/', (req, res) => {
    return app.render(req, res, '/', { user: req.session.user })
  })

  api.get('/clients', ensureLogin(), (req, res) => {
    return app.render(req, res, '/clients', { user: req.session.user })
  })

  api.get('/login', getLogin(app))
  api.get('/consent', getConsent(app))
  api.post('/consent',
    bodyParser.urlencoded({ extended: false }),
    postConsent(app))

  api.get('*', (req, res) => {
    return handle(req, res)
  })

  /**
   * Error handler
   */
  api.use(function (err, req, res, next) {
    res.status(err.status || 500)
    console.error('error', err)
    res.send(err)
  })

  api.listen(PORT, () => {
    console.log(`Starting server on port ${PORT}`)
  })
})
