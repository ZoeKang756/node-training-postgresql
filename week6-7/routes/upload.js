const express = require('express')
const router = express.Router()
const { dataSource } = require('../db/data-source')
const logger = require('../utils/logger')('UploadRouter')
const uploadController = require('../controllers/upload')
const config = require('../config/index')

const auth = require('../middlewares/auth')({
    secret: config.get('secret').jwtSecret,
    userRepository: dataSource.getRepository('User'),
    logger
})

const isCoach = require('../middlewares/isCoach')

// 上傳圖片
router.post('/firebase', auth, isCoach, uploadController.uploadSingle)

// 上傳圖片
router.post('/local', auth, isCoach, uploadController.LocalUploadSingle)

// 圖片更新 type:remote 表示遠端(儲存網址),其他預設本地 (只儲存檔名)
router.post('/save/:type?', auth, isCoach, uploadController.saveFileName)

module.exports = router