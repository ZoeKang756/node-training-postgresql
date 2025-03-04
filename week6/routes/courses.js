const express = require('express')
const router = express.Router()
const { dataSource } = require('../db/data-source')
const logger = require('../utils/logger')('CourseRouter')
const courseController = require('../controllers/courses')
const config = require('../config/index')

const auth = require('../middlewares/auth')({
    secret: config.get('secret').jwtSecret,
    userRepository: dataSource.getRepository('User'),
    logger
})

// [POST] 報名課程：{url}/api/courses/:courseId
router.post('/:courseId?', auth, courseController.post)

// [GET] 取得課程列表：{url}/api/courses
router.get('/', courseController.getAll)

// [DELETE] 取消課程：{url}/api/courses/:courseId
router.delete('/:courseId?', auth, courseController.deleteCoursesById)

module.exports = router