const express = require('express')
const router = express.Router()
const { dataSource } = require('../db/data-source')
const logger = require('../utils/logger')('CreditPackageRouter')
const creditPackageController = require('../controllers/creditPackage')
const config = require('../config/index')

const auth = require('../middlewares/auth')({
    secret: config.get('secret').jwtSecret,
    userRepository: dataSource.getRepository('User'),
    logger
})
const isAdmin = require('../middlewares/isAdmin')

// [GET] 取得購買方案列表
router.get('/', creditPackageController.getAll);

//[POST] 新增組合包購買方案 (練習把編輯跟新增寫在一起)(最高管理員)
router.post('/', auth, isAdmin, creditPackageController.postCreditPackage);

//[POST] 編輯組合包購買方案 (練習把編輯跟新增寫在一起)(最高管理員)
router.put('/:packageId?', auth, isAdmin, creditPackageController.postCreditPackage);

//[DELETE] 刪除購買方案(最高管理員)
router.delete('/:creditPackageId?', auth, isAdmin, creditPackageController.delCreditPackage);

module.exports = router