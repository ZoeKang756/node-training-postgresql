const express = require('express')
const router = express.Router()
const { dataSource } = require('../db/data-source')
const logger = require('../utils/logger')('Coach')

const validCheck = require('../utils/validCheck');
const resultHeader = require('../utils/resultHeader');



// LV2 [GET] 取得教練列表：{url}/api/coaches/?per=?page=?可以透過 query string 篩選資料。
router.get('/',async (req, res, next)=>{
    const {keyword, per , page} = req.query
    
})


// LV2 [GET] 取得教練詳細資訊：{url}/api/coaches/:coachId
router.get('/:coachId',async (req, res, next)=>{
    const {keyword, per , page} = req.query
    
})

module.exports = router