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
        resultHeader.code_200_with_data(res,packages)

    } catch (error) {
        logger.error(error)
        next(error)
    }

});

//[POST] 新增購買方案
router.post('/',async (req, res, next)=>{

    try {

        const{name, credit_amount, price} = req.body
               
        if(validCheck.isUndefined(name) || validCheck.isNotValidString(name,50) || validCheck.isUndefined(credit_amount) || validCheck.isNotValidInteger(credit_amount) ||  validCheck.isUndefined(price) || validCheck.isNotValidNumeric(price))
        {
            resultHeader.code_400(res)
            return 
        }
       
        // 檢查資料庫唯一值
        const creditPackageRepo = dataSource.getRepository('CreditPackage')
        const packageData = await creditPackageRepo.find({where : {name : name}})
    
        if(packageData.length > 0)
        {
            resultHeader.code_409(res)
            return
        }

        const newCreditPackage = creditPackageRepo.create({
                name,credit_amount,price
        })
        const result = await creditPackageRepo.save(newCreditPackage)
        resultHeader.code_200_with_data(res, result)
 
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
            resultHeader.code_400(res)
            return
        }

        // 刪除資料
        const result = await dataSource.getRepository('CreditPackage').delete(creditPackageId)
        if (result.affected === 0) {
            resultHeader.code_400(res, 'ID錯誤')
            return
        }

        resultHeader.code_200(res)

        
    } catch (error) {

        logger.error(error)
        next(error)
    }
    

});

module.exports = router