const { DataSource } = require('typeorm')
const config = require('../config/index')

const CreditPackage = require('../entities/CreditPackages')
const Skill = require('../entities/Skill')
const Course = require('../entities/Course')
const Coach = require('../entities/Coach')
const User = require('../entities/User')

const dataSource = new DataSource({
  type: 'postgres',
  host: config.get('db.host'),
  port: config.get('db.port'),
  username: config.get('db.username'),
  password: config.get('db.password'),
  database: config.get('db.database'),
  synchronize: config.get('db.synchronize'),
  poolSize: 10,
  entities: [
    CreditPackage, Skill, Course, Coach, User
  ],
  ssl: config.get('db.ssl')
})

module.exports = { dataSource }
