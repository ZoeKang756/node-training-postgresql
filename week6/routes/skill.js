const express = require('express')
const router = express.Router()
const { dataSource } = require('../db/data-source')
const logger = require('../utils/logger')('SkillRouter')
const skillControllers = require('../controllers/skill')
const config = require('../config/index')

const auth = require('../middlewares/auth')({
    secret: config.get('secret').jwtSecret,
    userRepository: dataSource.getRepository('User'),
    logger
})
const isAdmin = require('../middlewares/isAdmin')

// [GET] 取得專長列表
router.get('/', skillControllers.getAll);

//[POST] 新增 / 編輯專長
router.post('/:skillId?',auth, isAdmin, skillControllers.post);

//[DELETE] 刪除專長
router.delete('/:skillId?',auth, isAdmin, skillControllers.deleteById);

module.exports = router