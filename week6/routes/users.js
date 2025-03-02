const express = require('express')
const router = express.Router()
const { dataSource } = require('../db/data-source')
const config = require('../config/index')
const users = require('../controllers/users')
const logger = require('../utils/logger')('UsersRouter')
const auth = require('../middlewares/auth')({
    secret: config.get('secret').jwtSecret,
    userRepository: dataSource.getRepository('User'),
    logger
})

// [POST] 註冊使用者：{url}/api/users/signup
router.post('/signup', users.postSignup)

// [POST] 登入會員：{url}/api/users/login
router.post('/login', users.postLogin)

// [GET] 取得個人資料：{url}/api/users/profile，需設計 auth middleware
router.get('/profile',auth, users.getProfile)

// [PUT] 更新個人資料：{url}/api/users/profile，需設計 auth middleware
router.put('/profile',auth, users.putProfile)

// [PUT] 使用者更新密碼 ,auth
router.put('/password',auth, users.putPassword)

module.exports = router