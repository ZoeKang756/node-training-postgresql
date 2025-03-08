
const { dataSource } = require('../db/data-source')
const logger = require('../utils/logger')('CreditPackageController')
const validCheck = require('../utils/validCheck')
const resultHeader = require('../utils/resultHeader');

// [GET] 取得購買方案列表
async function getAll(req, res, next) {
    try {
        const packages = await dataSource.getRepository("CreditPackage").find({
            select: ["id", "name", "credit_amount", "price"]
        })
        resultHeader(res, 200, 'success', { data: packages })

    } catch (error) {
        logger.error(error)
        next(error)
    }

}

//[POST] 新增/編輯組合包購買方案 (練習把編輯跟新增寫在一起)
async function postCreditPackage(req, res, next) {

    // 解析接收資料
    const { name, credit_amount, price } = req.body
    const packageId = req.params.packageId
    const errMsg = []

    try {
        // 驗證資料正確性
        if (validCheck.isUndefined(name) || validCheck.isNotString(name, 50)) errMsg.push('購買方案名稱為必填,長度為50')
        if (validCheck.isUndefined(credit_amount) || validCheck.isNotInteger(credit_amount)) errMsg.push('購買方案的課堂數為必填,且為整數')
        if (validCheck.isUndefined(price) || validCheck.isNotNumeric(price)) errMsg.push('購買方案價格為必填,且為數字')

        if(req.method === 'PUT' && validCheck.isNotUUID(packageId))  errMsg.push('組合包方案ID錯誤')

        if (errMsg.length > 0) {
            resultHeader(res, 400, 'failed', { message: "欄位未填寫正確", info: errMsg })
            return
        }

        const creditPackageRepo = dataSource.getRepository('CreditPackage')
        let checkPackage = {}

        //----檢查id是否存在---//
        if (packageId) {
            checkPackage = await creditPackageRepo.findOne({ where: { id: packageId } })

            if (!checkPackage) {
                resultHeader(res, 400, 'failed', { message: "欄位未填寫正確" })
                return
            }
        }

        // 檢查資料庫唯一值
        const packageData = await creditPackageRepo.findOne({ where: { name: name } })

        if ((packageData && req.method === 'POST') || (req.method === 'PUT' && packageData.id !== packageId)) {
            resultHeader(res, 409, 'failed', { message: "資料重複" })
            return
        }

    

        if (packageId) // 這裡是編輯
        {
            const result = await creditPackageRepo.update({
                id: packageId
            }, { name, credit_amount, price })

            if (!result.affected) {
                resultHeader(res, 400, 'failed', { message: "資料更新失敗!" })
                return
            }

            //----取得回傳資料---//
            const saveData = await creditPackageRepo.findOne({ where: { id: packageId } })
            resultHeader(res, 200, 'success', { data: saveData })
        }
        else { // 這裡是新增

            const newCreditPackage = creditPackageRepo.create({
                name, credit_amount, price
            })
            const result = await creditPackageRepo.save(newCreditPackage)

            resultHeader(res, 201, 'success', { data: result })
        }


    } catch (error) {
        logger.error(error)
        next(error)
    }

}

//[DELETE] 刪除購買方案
async function delCreditPackage(req, res, next) {
    try {
        const creditPackageId = req.params.creditPackageId

        // 檢查欄位
        if (validCheck.isNotUUID(creditPackageId)) {
            resultHeader(res, 400, 'failed', { message: "欄位未填寫正確" })
            return
        }

        //--判斷該購買方案是否已有使用者下單--//
        const purchaseRepo = dataSource.getRepository('CreditPurchase')
        const findPurchase = await purchaseRepo.find({ where: { credit_package_id: creditPackageId } })
        if (findPurchase.length > 0) {
            resultHeader(res, 400, 'failed', { message: "已有學員購買該方案，不可刪除!"})
            return
        }

        // 刪除資料
        const result = await dataSource.getRepository('CreditPackage').delete(creditPackageId)
        if (result.affected === 0) {
            resultHeader(res, 400, 'failed', { message: "ID錯誤" })
            return
        }
        resultHeader(res, 200)


    } catch (error) {

        logger.error(error)
        next(error)
    }


}


module.exports = {
    getAll,
    postCreditPackage,
    delCreditPackage

}