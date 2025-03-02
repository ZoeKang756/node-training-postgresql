const express = require('express')
const router = express.Router()
const { dataSource } = require('../db/data-source')
const logger = require('../utils/logger')('AdminRouter')
const admin = require('../controllers/admin')
const config = require('../config/index')

const auth = require('../middlewares/auth')({
    secret: config.get('secret').jwtSecret,
    userRepository: dataSource.getRepository('User'),
    logger
})

const isCoach = require('../middlewares/isCoach')
const isAdmin = require('../middlewares/isAdmin')

// [POST] 新增教練課程資料
router.post('/coaches/courses',auth, isCoach, admin.postCoachCourse )

// [PUT] 編輯教練課程資料
router.put('/coaches/courses/:courseId', auth, isCoach, admin.putCoachCourse)

// [POST] 將使用者變更為教練(應該是最高管理員)
// profile_image_url 為非必填
router.post('/coaches/:userId',auth, isAdmin, admin.postCoach)

module.exports = router


