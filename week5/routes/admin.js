const express = require('express')
const router = express.Router()
const { dataSource } = require('../db/data-source')
const logger = require('../utils/logger')('Admin')

const validCheck = require('../utils/validCheck');
const resultHeader = require('../utils/resultHeader');

// [POST] 將使用者變更為教練
// profile_image_url 為非必填
router.post('/coaches/:userId',async (req, res, next)=>{
    try 
    { 
        // 驗證資料正確性  
        const{userId} = req.params    
        const{experience_years, description, profile_image_url} = req.body
        
        if(validCheck.isNotValidInteger(experience_years) || validCheck.isNotValidString(description) || validCheck.isNotValidString(userId))
        {
            resultHeader(res,400,'failed',{message:"欄位未填寫正確"})
            return
        }

        if(profile_image_url && ( validCheck.isNotValidUrl(profile_image_url) || (validCheck.isNotPng(profile_image_url) && validCheck.isNotJpg(profile_image_url))))
        {
            resultHeader(res,400,'failed',{message:"需為圖片網址(.png, .jpg)"})
            return
        }

        const userRepo = dataSource.getRepository('User')
        const findUser = userRepo.findOne({
            where:{id:userId}
        })

        if(!findUser)
        {
            resultHeader(res,400,'failed',{message:"使用者不存在"})
            return
        }
        else if(findUser.role === 'COACH')
        {
            resultHeader(res,409,'failed',{message:"使用者已經是教練"})
            return
        }
        const coachRepo = dataSource.getRepository('Coach')
        const newCoach =  coachRepo.create({
            userid:userId,
            experience_years,
            description,
            profile_image_url
        })
      
        const queryRunner = dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try
        {
            await queryRunner.manager.save(newCoach);
            await queryRunner.manager.update(userRepo, {
                id: userId,
                role: 'USER'
            }, {
                role: 'COACH'
            });
            await queryRunner.commitTransaction();
        } 
        catch (error) 
        {
          await queryRunner.rollbackTransaction();
          resultHeader(res,400,'failed',{message:"更新使用者失敗"})

          logger(error)
          next(error)
        } 
        finally
        {
          await queryRunner.release();
        }
           
        resultHeader(res,200)
        
        
    } catch (error) {
        logger(error)
        next(error)
    }
})

// [POST] 新增教練課程資料
router.post('/coaches/courses\b',async=>(req, res, next)=>{
    
})

// [PUT] 編輯教練課程資料
router.get('/coaches/courses/:courseId',async=>(req, res, next)=>{
    
})

module.exports = router


