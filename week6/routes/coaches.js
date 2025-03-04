const express = require('express')
const router = express.Router()
const logger = require('../utils/logger')('CoachRouter')
const coachController = require('../controllers/coaches')

// LV2 [GET] 取得教練列表：{url}/api/coaches/?per=?page=?word=?可以透過 query string 篩選資料。
/****第二種作法根據條件再去資料庫撈資料****/
router.get('/', coachController.getCoaches)

// LV2 [GET] 取得教練列表：{url}/api/coaches/?per=?page=?word=?可以透過 query string 篩選資料。
/****第一種作法 資料全部先撈出來，再根據條件篩選資料(資料少還可以, 資料多.....)****/
router.get('/V1', coachController.getCoachesV2)


// LV2 [GET] 取得教練詳細資訊：{url}/api/coaches/:coachId
router.get('/:coachId',coachController.getCoachDetail)

// 取得指定教練課程列表
router.get('/:coachId/courses',coachController.getCoursesByCoachId)


module.exports = router