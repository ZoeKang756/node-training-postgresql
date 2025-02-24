const express = require('express')
const router = express.Router()
const { dataSource } = require('../db/data-source')
const logger = require('../utils/logger')('CreditPackage')

const validCheck = require('../utils/validCheck');
const resultHeader = require('../utils/resultHeader');

// [GET] 取得購買方案列表
router.get('/',async (req, res, next)=>{
    try {
        const packages = await dataSource.getRepository("CreditPackage").find({
            select: ["id", "name", "credit_amount", "price"]
        })
        resultHeader(res, 200, 'success', {data:packages})

    } catch (error) {
        logger.error(error)
        next(error)
    }

});

//[POST] 新增購買方案
router.post('/',async (req, res, next)=>{

    try {
        // 解析接收資料
        const{name, credit_amount, price} = req.body
          
        // 驗證資料正確性
        if(validCheck.isUndefined(name) || validCheck.isNotValidString(name,50) || validCheck.isUndefined(credit_amount) || validCheck.isNotValidInteger(credit_amount) ||  validCheck.isUndefined(price) || validCheck.isNotValidNumeric(price))
        {
            resultHeader(res, 400, 'failed', {message:"欄位未填寫正確"})
            return 
        }
       
        // 檢查資料庫唯一值
        const creditPackageRepo = dataSource.getRepository('CreditPackage')
        const packageData = await creditPackageRepo.find({where : {name : name}})
    
        if(packageData.length > 0)
        {
            resultHeader(res, 409, 'failed', {message:"資料重複"})
            return
        }

        const newCreditPackage = creditPackageRepo.create({
                name,credit_amount,price
        })
        const result = await creditPackageRepo.save(newCreditPackage)
        resultHeader(res, 200, 'success', {data:result})
 
    } catch (error) {
        logger.error(error)
        next(error)
    }

});

//[DELETE] 刪除購買方案
router.delete('/:creditPackageId?',async (req, res, next)=>{
    try {
        const creditPackageId = req.params.creditPackageId
       
        // 檢查欄位
        if (validCheck.isUndefined(creditPackageId) || validCheck.isNotValidString(creditPackageId)) {
            resultHeader(res, 400, 'failed', {message:"欄位未填寫正確"})         
            return
        }

        // 刪除資料
        const result = await dataSource.getRepository('CreditPackage').delete(creditPackageId)
        if (result.affected === 0) {           
            resultHeader(res, 400, 'failed', {message:"ID錯誤"})
            return
        }
        resultHeader(res, 200)

        
    } catch (error) {

        logger.error(error)
        next(error)
    }
    

});

module.exports = router