
const { dataSource } = require('../db/data-source')
const logger = require('../utils/logger')('SkillController')
const validCheck = require('../utils/validCheck')
const resultHeader = require('../utils/resultHeader');

// [GET] 取得專長列表
async function getAll(req, res, next){
    try {
        const skill = await dataSource.getRepository("Skill").find({
            select: ["id", "name"]
        })
        resultHeader(res, 200, 'success', { data: skill })

    } catch (error) {
        logger.error(error)
        next(error)
    }
}

//[POST] 新增 / 編輯專長
async function post(req, res, next) {
    const { name } = req.body
    const skillId = req.params.skillId

    try {
        // 驗證資料正確性
        if (validCheck.isUndefined(name) || validCheck.isNotString(name, 50) || (skillId && validCheck.isNotUUID(skillId))) {
            resultHeader(res, 400, 'failed', { message: "欄位未填寫正確" })
            return
        }

        const skillRepo = dataSource.getRepository('Skill')
        let checkSkillId = {}

        // 檢查 id 是否存在
        if (skillId) {

            checkSkillId = await skillRepo.findOne({ where: { id: skillId } })
            if (!checkSkillId) {
                resultHeader(res, 400, 'failed', { message: "專長Id錯誤" })
                return
            }
        }

        // 檢查資料庫唯一值
        const skillResult = await skillRepo.find({ where: { name: name } })

        if (skillResult.length > 0 && (!skillId || (skillId && !validCheck.isUndefined(checkSkillId.id) && checkSkillId.id !== skillId))) {
            resultHeader(res, 409, 'failed', { message: "資料重複" })
            return
        }


        if (skillId) {
            const update = await skillRepo.update({ id: skillId }, { name })

            if (!update.affected) {
                resultHeader(res, 400, 'failed', { message: "資料更新失敗" })
                return
            }

            //----取得回傳資料---//
            const newSkill = await skillRepo.find({ where: { id: skillId } })
            resultHeader(res, 200, 'success', { data: newSkill })

        }
        else {
            const newSkill = skillRepo.create({
                name
            })
            const result = await skillRepo.save(newSkill)
            resultHeader(res, 200, 'success', { data: result })
        }



    } catch (error) {
        logger.error(error)
        next(error)
    }

}

//[DELETE] 刪除專長
async function deleteById(req, res, next){
    try {
        const skillId = req.params.skillId

        // 檢查欄位
        if (validCheck.isNotUUID(skillId)) {
            resultHeader(res, 400, 'failed', { message: "欄位未填寫正確" })
            return
        }

        // 刪除資料
        const result = await dataSource.getRepository('Skill').delete(skillId)
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
    post,
    deleteById

}