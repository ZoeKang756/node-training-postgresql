
const { dataSource } = require('../db/data-source')
const { In, IsNull } = require('typeorm')
const logger = require('../utils/logger')('AdminController')
const validCheck = require('../utils/validCheck')
const resultHeader = require('../utils/resultHeader');
const Coach = require('../entities/Coach');
const User = require('../entities/User');


// [POST] 新增教練課程資料
async function postCoachCourse(req, res, next) {
    try {
        const { id } = req.user
        const { skill_id, name, description, start_at, end_at, max_participants, meeting_url } = req.body

        // 驗證資料正確性  
        const errMsg = []
        if (validCheck.isNotUUID(id) || validCheck.isNotString(id)) errMsg.push('使用者id錯誤')
        if (validCheck.isNotUUID(skill_id) || validCheck.isNotString(skill_id)) errMsg.push('專長ID錯誤')
        if (validCheck.isNotString(name, 100)) errMsg.push('課程名稱為必填,長度100')
        if (validCheck.isNotString(description)) errMsg.push('課程介紹為必填')

        if (validCheck.isNotString(start_at)) errMsg.push('課程開始時間為必填')
        else if (validCheck.isNotDate(start_at)) errMsg.push('課程開始時間格式錯誤')

        if (validCheck.isNotString(end_at)) errMsg.push('課程結束時間為必填')
        else if (validCheck.isNotDate(end_at)) errMsg.push('課程結束時間格式錯誤')

        if (validCheck.isNotInteger(max_participants) || max_participants === 0) errMsg.push('最大上課人數為必填')
        if (meeting_url && validCheck.isNotUrl(meeting_url)) errMsg.push('線上直播網址URL格式錯誤')

        if (errMsg.length > 0) {
            resultHeader(res, 400, 'failed', { message: '欄位未填寫正確', info: errMsg })
            return
        }

        //--檢查使用者id及是否為教練身分--//
        const userRepo = dataSource.getRepository('User')
        const findUser = await userRepo.findOne({
            where: { id: id }
        })

        if (!findUser) {
            resultHeader(res, 400, 'failed', { message: '使用者不存在' })
            return
        }
        else if (findUser.role !== "COACH") {
            resultHeader(res, 400, 'failed', { message: '使用者尚未成為教練' })
            return
        }
        //--檢查skill_id--// 
        const skillRepo = dataSource.getRepository('Skill')
        const findSkill = await skillRepo.findOne({
            where: { id: skill_id }
        })
        if (!findSkill) {
            resultHeader(res, 400, 'failed', { message: '該技能不存在' })
            return
        }

        //--檢查教練是否有該技能--//
        /*const coachLinkSkillRepo = dataSource.getRepository('CoachLinkSkill')
        const findCoachLinkSkill = await coachLinkSkillRepo.find({
            where: { skill_id: skill_id, coach_id: user_id }
        })

        if (!findCoachSkill.length) {
            resultHeader(res, 400, 'failed', { message: '教練無相關技能' })
            return
        }*/


        const courseRepo = dataSource.getRepository('Course')
        const newCourse = courseRepo.create({
            user_id: id,
            skill_id,
            name,
            description,
            start_at,
            end_at,
            max_participants,
            meeting_url
        })
        const result = await courseRepo.save(newCourse)
        resultHeader(res, 201, 'success', { data: { course: result } })

    } catch (error) {
        logger.error(error)
        next(error)
    }
}

// [PUT] 編輯教練課程資料
async function putCoachCourse(req, res, next) {
    try {
        const { id } = req.user

        const courseId = req.params.courseId
        const { skill_id, name, description, start_at, end_at, max_participants, meeting_url } = req.body

        // 驗證資料正確性  
        const errMsg = []
        if (validCheck.isNotUUID(courseId) || validCheck.isNotString(courseId)) errMsg.push('課程ID錯誤')
        if (validCheck.isNotUUID(skill_id) || validCheck.isNotString(skill_id)) errMsg.push('技能ID錯誤')
        if (validCheck.isNotString(name)) errMsg.push('課程名稱為必填')
        if (validCheck.isNotString(description)) errMsg.push('課程介紹為必填')

        if (validCheck.isNotString(start_at)) errMsg.push('課程開始時間為必填')
        else if (validCheck.isNotDate(start_at)) errMsg.push('課程開始時間格式錯誤')

        if (validCheck.isNotString(end_at)) errMsg.push('課程結束時間為必填')
        else if (validCheck.isNotDate(end_at)) errMsg.push('課程結束時間格式錯誤')

        if (validCheck.isNotInteger(max_participants) || max_participants === 0) errMsg.push('最大上課人數為必填')
        if (meeting_url && validCheck.isNotUrl(meeting_url)) errMsg.push('線上直播網址URL格式錯誤')

        if (errMsg.length > 0) {
            resultHeader(res, 400, 'failed', { message: '欄位未填寫正確', info: errMsg })
            return
        }

        //--檢查課程id--//
        const courseRepo = dataSource.getRepository('Course')
        const findCourse = await courseRepo.findOne({
            where: { id: courseId, user_id: id }
        })
        if (!findCourse) {
            resultHeader(res, 400, 'failed', { message: '該課程不存在' })
            return
        }

        //--檢查skill_id--// 
        const skillRepo = dataSource.getRepository('Skill')
        const findSkill = await skillRepo.findOne({
            where: { id: skill_id }
        })
        if (!findSkill) {
            resultHeader(res, 400, 'failed', { message: '該技能不存在' })
            return
        }

        const result = await courseRepo.update({
            id: courseId
        }, {
            skill_id,
            name,
            description,
            start_at,
            end_at,
            max_participants,
            meeting_url
        })

        if (result.affected === 0) {
            resultHeader(res, 400, 'failed', { message: '更新課程失敗' })
            return
        }

        // 取得更新後的資料, update 不會回傳資料
        const getNewCourse = await courseRepo.findOne({
            where: { id: courseId }
        })

        resultHeader(res, 200, 'success', { data: { user: getNewCourse } })


    } catch (error) {
        logger.error(error)
        next(error)
    }
}

// [POST] 將使用者變更為教練, profile_image_url 為非必填
async function postCoach(req, res, next) {
    try {
        const userId = req.params.userId
        const { experience_years, description, profile_image_url } = req.body

        // 驗證資料正確性  
        const errMsg = []
        if (validCheck.isNotInteger(experience_years)) errMsg.push('教練年資必須是整數')
        if (validCheck.isNotString(description)) errMsg.push('教練簡介為必填')
        if (validCheck.isNotString(userId) || validCheck.isNotUUID(userId)) errMsg.push('使用者id錯誤')

        if (profile_image_url) {
            if (validCheck.isNotUrl(profile_image_url)) errMsg.push('請輸入正確的大頭貼網址')
            if (validCheck.isNotPng(profile_image_url) && validCheck.isNotJpg(profile_image_url)) errMsg.push('大頭貼須為.png, .jpg格式')
        }

        if (errMsg.length > 0) {
            resultHeader(res, 400, 'failed', { message: '欄位未填寫正確', info: errMsg })
            return
        }

        const userRepo = dataSource.getRepository('User')
        const findUser = await userRepo.findOne({
            select: ['id', 'name', 'role'],
            where: { id: userId }
        })

        if (!findUser) {
            resultHeader(res, 400, 'failed', { message: "使用者不存在" })
            return
        }
        else if (findUser.role === 'COACH') {
            resultHeader(res, 409, 'failed', { message: "使用者已經是教練" })
            return
        }


        // 使用交易更新2個資料表
        const resData = {}
        const queryRunner = dataSource.createQueryRunner()
        await queryRunner.connect()
        await queryRunner.startTransaction()

        try {

            await queryRunner.manager.update(User, {
                id: userId,
                role: 'USER'
            }, {
                role: 'COACH'
            })

            const saveCoach = await queryRunner.manager.save(Coach, {
                user_id: userId,
                experience_years,
                description,
                profile_image_url
            })
            await queryRunner.commitTransaction()


            const savedUser = await dataSource.getRepository('User').findOne({
                select: ['name', 'role'],
                where: { id: userId }
            })
            resData.user = savedUser
            resData.coach = saveCoach

        }
        catch (error) {
            await queryRunner.rollbackTransaction()
            resultHeader(res, 400, 'failed', { message: "更新使用者失敗" })

            logger.error(error)
            next(error)

        }
        finally {
            await queryRunner.release()
        }
        resultHeader(res, 200, 'success', { data: resData })


    } catch (error) {
        logger.error(error)
        next(error)
    }
}

// 取得教練自己的課程列表 [isCoach]
async function getCoachOwnCourses(req, res, next) {
    try {
        const { id } = req.user

        //--取得課程資料--//
        const courseRepo = dataSource.getRepository('Course')
        const findCourse = await courseRepo.find({ where: { user_id: id } })

        const getAllBookingCount = []
        findCourse.forEach(item => {
            getAllBookingCount[item.id] = 0
        })


        //--取得已報名人數--//
        const courseBookingRepo = dataSource.getRepository('CourseBooking')
        const findCourseBookingData = await courseBookingRepo.find({ select: ['course_id'], where: { course_id: In(Object.keys(getAllBookingCount)), cancelled_at: IsNull() } })

        findCourseBookingData.forEach(item => {
            getAllBookingCount[item.course_id]++
        })


        const courseData = []
        findCourse.forEach(item => {
            // check status
            const start_date = new Date(item.start_at);
            const end_date = new Date(item.end_at);

            let item_status = '尚未開始'

            if (start_date.getTime() < Date.now() && end_date.getTime() > Date.now()) {
                item_status = '報名中'
            } else if (end_date.getTime() <= Date.now()) {
                item_status = '已結束'
            }

            courseData.push({
                id: item.id,
                status: item_status,
                name: item.name,
                start_at: item.start_at,
                end_at: item.end_at,
                max_participants: item.max_participants,
                participants: getAllBookingCount[item.id]
            })
        })

        resultHeader(res, 200, 'success', { data: courseData })

    } catch (error) {
        logger.error()
        next(error)
    }
}

// 取得教練自己的課程詳細資料 [isCoach]
async function getCoachOwnCourseDetail(req, res, next) {
    try {
        const { id } = req.user
        const courseId = req.params.courseId

        if (validCheck.isNotUUID(courseId)) {
            resultHeader(res, 400, 'failed', { message: '欄位未填寫正確' })
            return
        }

        //--取得課程資料--//
        const courseRepo = dataSource.getRepository('Course')
        const findCourse = await courseRepo.findOne({ where: { user_id: id, id: courseId }, relations: { Skill: true } })

        if (!findCourse) {
            resultHeader(res, 400, 'failed', { message: '課程id錯誤' })
            return
        }

        //--取得已報名人數--//
        const courseBookingRepo = dataSource.getRepository('CourseBooking')
        const findCourseBookingCount = await courseBookingRepo.count({ where: { course_id: courseId, cancelled_at: IsNull() } })

        // check status
        const start_date = new Date(findCourse.start_at);
        const end_date = new Date(findCourse.end_at);

        let course_status = '尚未開始'

        if (start_date.getTime() < Date.now() && end_date.getTime() > Date.now()) {
            course_status = '報名中'
        } else if (end_date.getTime() <= Date.now()) {
            course_status = '已結束'
        }

        const courseData = {
            id: findCourse.id,
            status: course_status,
            skill_name: findCourse.Skill.name,
            name: findCourse.name,
            description: findCourse.description,
            start_at: findCourse.start_at,
            end_at: findCourse.end_at,
            max_participants: findCourse.max_participants,
            participants: findCourseBookingCount
        }

        resultHeader(res, 200, 'success', { data: courseData })


    } catch (error) {
        logger.error()
        next(error)
    }
}

// 變更教練資料 [isCoach]
async function putCoachProfile(req, res, next) {
    try {
        const { id } = req.user
    } catch (error) {
        logger.error()
        next(error)
    }
}

// 取得教練自己的詳細資料 [isCoach]
async function getCoachSelfDetail(req, res, next) {
    try {
        const { id } = req.user
    } catch (error) {
        logger.error()
        next(error)
    }
}

// 取得教練自己的月營收資料 [isCoach]
async function getCoachSelfRevenue(req, res, next) {
    try {
        const { id } = req.user
    } catch (error) {
        logger.error()
        next(error)
    }
}


module.exports = {
    postCoachCourse,
    putCoachCourse,
    postCoach,
    getCoachOwnCourses,
    getCoachOwnCourseDetail,
    putCoachProfile,
    getCoachSelfDetail,
    getCoachSelfRevenue
}