const express = require('express')
const router = express.Router()
const { dataSource } = require('../db/data-source')
const logger = require('../utils/logger')('AdminRouter')
const adminController = require('../controllers/admin')
const config = require('../config/index')

const auth = require('../middlewares/auth')({
    secret: config.get('secret').jwtSecret,
    userRepository: dataSource.getRepository('User'),
    logger
})

const isCoach = require('../middlewares/isCoach')
const isAdmin = require('../middlewares/isAdmin')

// [POST] 新增教練課程資料
router.post('/coaches/courses', auth, isCoach, adminController.postCoachCourse)

// [PUT] 編輯教練課程資料
router.put('/coaches/courses/:courseId', auth, isCoach, adminController.putCoachCourse)

// [POST] 將使用者變更為教練(應該是最高管理員)
// profile_image_url 為非必填
router.post('/coaches/:userId', auth, isAdmin, adminController.postCoach)

// 取得教練自己的課程列表
router.get('/courses', auth, isCoach, adminController.getCoachOwnCourses)

// 取得教練自己的課程詳細資料
router.get('/courses/:courseId', auth, isCoach, adminController.getCoachOwnCourseDetail)

// 變更教練資料
router.put('/', auth, isCoach, adminController.putCoachProfile)

// 取得教練自己的詳細資料
router.get('/', auth, isCoach, adminController.putCoachProfile)

// 取得教練自己的月營收資料
router.get('/', auth, isCoach, adminController.getCoachSelfRevenue)

module.exports = router


