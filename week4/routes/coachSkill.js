const express = require('express')
const router = express.Router()
const AppDataSource = require("../db")
const validCheck = require('../utils/validCheck');
const resultHeader = require('../utils/resultHeader');

// [GET] 取得教練專長列表
router.get('/',async (req, res, next)=>{
    try {
      const skill = await AppDataSource.getRepository("Skill").find({
          select: ["id", "name"]
      })
      resultHeader.code_200_with_data(res,skill)

    } catch (error) {
      resultHeader.code_500(res)
    }
});

//[POST] 新增教練專長
router.post('/',async (req, res, next)=>{
    try {

      const {name} = req.body
            
      if(validCheck.isUndefined(name) || validCheck.isNotValidString(name,50))
      {
          resultHeader.code_400(res)
          return 
      }
    
      // 檢查資料庫唯一值
      const skillRepo = AppDataSource.getRepository('Skill')
      const skillResult = await skillRepo.find({where : {name : name}})

      if(skillResult.length > 0)
      {
          resultHeader.code_409(res)
          return
      }

      const newSkill = skillRepo.create({
              name
      })
      const result = await skillRepo.save(newSkill)
      resultHeader.code_200_with_data(res, result)

    } catch (error) {
        resultHeader.code_500(res)
    }

});

//[DELETE] 刪除教練專長
router.delete('/:skillId?',async (req, res, next)=>{
    try {
      const skillId = req.params.skillId
    
      // 檢查欄位
      if (validCheck.isUndefined(skillId) || validCheck.isNotValidString(skillId)) {
          resultHeader.code_400(res)
          return
      }

      // 刪除資料
      const result = await AppDataSource.getRepository('Skill').delete(skillId)
      if (result.affected === 0) {
          resultHeader.code_400(res, 'ID錯誤')
          return
      }

      resultHeader.code_200(res)

      
    } catch (error) {

        resultHeader.code_500(res)
    }
});

module.exports = router