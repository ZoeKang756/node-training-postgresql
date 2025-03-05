const express = require('express')
const router = express.Router()
const { dataSource } = require('../db/data-source')
const logger = require('../utils/logger')('SkillRouter')
const skillController = require('../controllers/skill')
const config = require('../config/index')

const auth = require('../middlewares/auth')({
    secret: config.get('secret').jwtSecret,
    userRepository: dataSource.getRepository('User'),
    logger
})
const isAdmin = require('../middlewares/isAdmin')

// [GET] 取得專長列表
router.get('/', skillController.getAll);

//[POST] 新增專長
router.post('/',auth, isAdmin, skillController.post);

//[POST] 編輯專長
router.put('/:skillId?',auth, isAdmin, skillController.post);

//[DELETE] 刪除專長
router.delete('/:skillId?',auth, isAdmin, skillController.deleteById);

module.exports = router