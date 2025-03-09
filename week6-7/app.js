const express = require('express')
const cors = require('cors')
const path = require('path')
const pinoHttp = require('pino-http')

const logger = require('./utils/logger')('App')
const creditPackageRouter = require('./routes/creditPackage')
const coachRouter = require('./routes/coaches')
const skillRouter = require('./routes/skill')
const usersRouter = require('./routes/users')
const adminRouter = require('./routes/admin')
const coursesRouter = require('./routes/courses')
const creditPurchaseRouter = require('./routes/creditPurchase')
const uploadRouter = require('./routes/upload')

const resultHeader = require('./utils/resultHeader');

const app = express()
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(pinoHttp({
  logger,
  serializers: {
    req(req) {
      req.body = req.raw.body
      return req
    }
  }
}))
app.use(express.static(path.join(__dirname, 'public')))

app.get('/healthcheck', (req, res) => {
  res.status(200)
  res.send('OK')
})
app.use('/api/credit-package', creditPackageRouter)
app.use('/api/coaches/skill', skillRouter)
app.use('/api/users', usersRouter)
app.use('/api/admin', adminRouter)
app.use('/api/coaches', coachRouter)

app.use('/api/courses', coursesRouter)
app.use('/api/credit-purchase', creditPurchaseRouter)
app.use('/api/upload', uploadRouter)

app.use((req, res, next) => {
  resultHeader(res, 404, 'failed', { message: "無此網站路由" })
})

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  req.log.error(err)
  if (err.status) {
    resultHeader(res, 401, 'failed', { message: err.message })
    return
  }
  resultHeader(res, 500, 'failed', { message: "伺服器錯誤" })
})

module.exports = app
