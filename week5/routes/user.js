const express = require('express')
const bcrypt = require('bcrypt')
const router = express.Router()
const { dataSource } = require('../db/data-source')
const logger = require('../utils/logger')('User')

const validCheck = require('../utils/validCheck');
const resultHeader = require('../utils/resultHeader');
const config = require('../config/index')

// [POST] 註冊使用者：{url}/api/users/signup
router.post('/signup', async (req, res, next) =>{
     try 
     {
          const{name, email, password} =req.body 

          //驗證資料正確性 
          if(validCheck.isNotNoSymbolString(name) || validCheck.isNotVaildStrLen(name,2,10) || validCheck.isNotValidEmail(email))
          {
               resultHeader(res, 400,'failed', {message:"欄位未填寫正確"})
               return
          }

          if(validCheck.isNotVaildPwd(password, config.get("web.signupPwdPattern")) || validCheck.isNotVaildStrLen(password,8,16))
          {
               resultHeader(res, 400,'failed', {message:"密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字"})
               return
          }

          //檢查Email 是否使用過了
          const userRepo = dataSource.getRepository('User')
          const findUser = await userRepo.findOne({
               where:{ email:email}
          })

          if(findUser)
          {
               resultHeader(res, 409,'failed', {message:"Email已被使用"})
               return
          }

          // 密碼記得要加密
          const hashPassword = await bcrypt.hash(password, config.get("web.pwdSaltRounds"))
          const newUser = userRepo.create({
               name,
               email,
               password:hashPassword
          })

          // 新增使用者
          const result = await userRepo.save(newUser)
          const userData = {user:{
               id:result.id,
               name:result.name
          }}  
          resultHeader(res, 200,'success', {data:userData})
          
     } catch (error) {
          logger(error)
          next(error)
          
     }
})

module.exports = router