const express = require('express')
const router = express.Router()
const { dataSource } = require('../db/data-source')
const logger = require('../utils/logger')('creditPurchaseRouter')
const creditPurchaseController = require('../controllers/creditPurchase')
const config = require('../config/index')

const auth = require('../middlewares/auth')({
    secret: config.get('secret').jwtSecret,
    userRepository: dataSource.getRepository('User'),
    logger
})

// [POST] 購買方案：{url}/api/credit-purchase/:creditPackageId
router.post('/:creditPackageId?', auth, creditPurchaseController.post)

module.exports = router