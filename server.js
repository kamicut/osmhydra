const next = require('next')
const init = require('./api')

const dev = process.env.NODE_ENV !== 'production'
const PORT = process.env.PORT || 8989

const nextApp = next({ dev })

nextApp.prepare().then(() => {
  let api = init(nextApp)

  api.listen(PORT, () => {
    console.log(`Starting server on port ${PORT}`)
  })
})
