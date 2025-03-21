
require("dotenv").config()
const express = require('express')
const http = require("http")
const AppDataSource = require("./db")
const cors = require('cors')

const app = express()
const creditPackageRouter = require('./routes/creditPackage')
const coachSkillRouter = require('./routes/coachSkill')
const resultHeader = require('./utils/resultHeader');

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.use('/api/credit-package',creditPackageRouter )
app.use('/api/coaches/skill',coachSkillRouter )
app.use((req,res,next)=>{
   resultHeader.code_404(res)
})

const server = http.createServer(app)

async function startServer() {
  await AppDataSource.initialize()
  console.log("資料庫連接成功")
  server.listen(process.env.PORT)
  console.log(`伺服器啟動成功, port: ${process.env.PORT}`)
  return server;
}

module.exports = startServer();