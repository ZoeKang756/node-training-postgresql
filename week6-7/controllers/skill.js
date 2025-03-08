
const { dataSource } = require('../db/data-source')
const { In } = require('typeorm')
const logger = require('../utils/logger')('SkillController')
const validCheck = require('../utils/validCheck')
const resultHeader = require('../utils/resultHeader');


// [GET] 取得專長列表
async function getAll(req, res, next) {
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
        if (validCheck.isUndefined(name) || validCheck.isNotString(name, 50) || (req.method === 'PUT' && validCheck.isNotUUID(skillId))) {
            resultHeader(res, 400, 'failed', { message: "欄位未填寫正確" })
            return
        }

        const skillRepo = dataSource.getRepository('Skill')
        let checkSkillId = {}

        // 檢查 id 是否存在
        if (req.method === 'PUT' && skillId) {
            checkSkillId = await skillRepo.findOne({ where: { id: skillId } })
            if (!checkSkillId) {
                resultHeader(res, 400, 'failed', { message: "專長Id錯誤" })
                return
            }
        }

        // 檢查資料庫唯一值
        const skillResult = await skillRepo.findOne({ where: { name: name } })

        if ((skillResult && req.method === 'POST') || (req.method === 'PUT' && skillResult.id !== skillId)) {
            resultHeader(res, 409, 'failed', { message: "資料重複" })
            return
        }

        if (skillId) { // 這裡是編輯
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
async function deleteById(req, res, next) {
    try {
        const skillId = req.params.skillId

        // 檢查欄位
        if (validCheck.isNotUUID(skillId)) {
            resultHeader(res, 400, 'failed', { message: "欄位未填寫正確" })
            return
        }

        //--檢查需要刪除的技能是否已經用來開課--//
        const courseRepo = dataSource.getRepository('Course')
        const findCourse = await courseRepo.find({ where: { skill_id: skillId }, relations: { Skill: true } })

        const canNotdeleteItem = {}
        findCourse.forEach(item => {
            canNotdeleteItem[item.Skill.id] = item.Skill.name
        })

        if (Object.keys(canNotdeleteItem).length > 0) {
            resultHeader(res, 400, 'failed', { message: "已有相關開課資訊的技能，不可刪除!", info: canNotdeleteItem })
            return
        }

        //--檢查需要刪除的技能是否已經與教練綁定--//    
        const coachLinkSkillRepo = dataSource.getRepository('CoachLinkSkill')
        const findCoachLinkSkill = await coachLinkSkillRepo.find({ where: { skill_id: skillId } })

        const mapCoachId = []
        findCoachLinkSkill.forEach(item => {
            if (!mapCoachId.includes(item.coach_id)) mapCoachId.push(item.coach_id)
        })

        const coachRepo = dataSource.getRepository('Coach')
        const findCoachData = await coachRepo.find({ where: { id: In(mapCoachId) }, relations: { User: true } })

        const affectCoach = {}
        findCoachData.forEach(item => {
            affectCoach[item.id] = item.User.name
        })

        if (Object.keys(affectCoach).length > 0) {
            resultHeader(res, 400, 'failed', { message: "已有教練綁定的技能，不可刪除!", info: affectCoach })
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