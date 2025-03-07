
const { dataSource } = require('../db/data-source')
const logger = require('../utils/logger')('CreditPurchaseController')
const validCheck = require('../utils/validCheck')
const resultHeader = require('../utils/resultHeader');

// [POST] 購買方案：{url}/api/credit-purchase/:creditPackageId
async function post(req, res, next) {
    try {
        const { id } = req.user
        const creditPackageId = req.params.creditPackageId


        if(validCheck.isNotUUID(creditPackageId))
        {
            resultHeader(res, 400, 'failed', { message: '購買方案id錯誤' })
            return
        }

        //--驗證資料正確性--//
        const creditPackageRepo = dataSource.getRepository('CreditPackage')
        const findCreditPackage = await creditPackageRepo.findOne({ where: { id: creditPackageId } })

        if (!findCreditPackage) {
            resultHeader(res, 400, 'failed', { message: '購買方案id不存在' })
            return
        }

        //--檢查是否重複購買(重複購買沒關係)--//
        const checkPurchaseRepo = dataSource.getRepository('CreditPurchase')
        /*const checkPurchase = await checkPurchaseRepo.findOne({
            where: {
                credit_package_id: creditPackageId,
                user_id: id
            }
        })

        if (checkPurchase) {
            resultHeader(res, 400, 'failed', { message: '購買方案重複' })
            return
        }*/

        const newPurchase = checkPurchaseRepo.create({
            user_id: id,
            credit_package_id: findCreditPackage.id,
            purchased_credits: findCreditPackage.credit_amount,
            price_paid: findCreditPackage.price
        })
        const saveResult = await checkPurchaseRepo.save(newPurchase)

        if (saveResult) {
            resultHeader(res, 200, 'success', { data: null })
            return
        }
        else {
            resultHeader(res, 400, 'failed', { message: '購買方案失敗' })
            return
        }


    } catch (error) {
        logger.error(error)
        next(error)
    }
}

module.exports = {
    post,
}