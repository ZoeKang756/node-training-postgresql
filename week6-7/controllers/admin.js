
const { dataSource } = require('../db/data-source')
const { Not, In, IsNull, Between } = require('typeorm')
const logger = require('../utils/logger')('AdminController')
const validCheck = require('../utils/validCheck')
const resultHeader = require('../utils/resultHeader');
const Coach = require('../entities/Coach');
const User = require('../entities/User');
const CoachLinkSkill = require('../entities/CoachLinkSkill');
const getFormatDateRange = require('../utils/getFormatDateRange');

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
        else if (validCheck.isNotDateTime(start_at)) errMsg.push('課程開始時間格式錯誤')

        if (validCheck.isNotString(end_at)) errMsg.push('課程結束時間為必填')
        else if (validCheck.isNotDateTime(end_at)) errMsg.push('課程結束時間格式錯誤')

        if (!validCheck.isNotDateTime(start_at) && !validCheck.isNotDateTime(end_at)) {
            // --課程開始時間與課程結束時間不可為過去時間
            if (new Date(start_at) < new Date() || new Date(end_at) < new Date()) errMsg.push('課程開始時間與課程結束時間不可為過去')

            // --課程結束時間大於課程開始時間 
            if (new Date(start_at) > new Date(end_at)) errMsg.push('課程結束時間必須大於課程開始時間')
        }

        if (validCheck.isNotInteger(max_participants) || max_participants === 0) errMsg.push('最大上課人數為必填')
        if (meeting_url && validCheck.isNotUrl(meeting_url)) errMsg.push('線上直播網址URL格式錯誤')

        if (errMsg.length > 0) {
            resultHeader(res, 400, 'failed', { message: '欄位未填寫正確', info: errMsg })
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
        const coachRepo = dataSource.getRepository('Coach')
        const findCoach = await coachRepo.findOne({
            where: { user_id: id }, relations: { CoachLinkSkill: true }
        })
        const coachSkillids = []
        findCoach.CoachLinkSkill.forEach(item => {
            coachSkillids.push(item.skill_id)
        })

        if (!coachSkillids.includes(skill_id)) {
            resultHeader(res, 400, 'failed', { message: '教練無相關技能,無法開課!' })
            return
        }

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
        else if (validCheck.isNotDateTime(start_at)) errMsg.push('課程開始時間格式錯誤')

        if (validCheck.isNotString(end_at)) errMsg.push('課程結束時間為必填')
        else if (validCheck.isNotDateTime(end_at)) errMsg.push('課程結束時間格式錯誤')

        if (!validCheck.isNotDateTime(start_at) && !validCheck.isNotDateTime(end_at)) {
            // --課程開始時間與課程結束時間不可為過去時間
            if (new Date(start_at) < new Date() || new Date(end_at) < new Date()) errMsg.push('課程開始時間與課程結束時間不可為過去')

            // --課程結束時間大於課程開始時間 
            if (new Date(start_at) > new Date(end_at)) errMsg.push('課程結束時間必須大於課程開始時間')
        }

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
            resultHeader(res, 400, 'failed', { message: id })
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
        const coachRepo = dataSource.getRepository('Coach')
        const findCoach = await coachRepo.findOne({
            where: { user_id: id }, relations: { CoachLinkSkill: true }
        })

        const coachSkillids = []
        findCoach.CoachLinkSkill.forEach(item => {
            coachSkillids.push(item.skill_id)
        })

        if (!coachSkillids.includes(skill_id)) {
            resultHeader(res, 400, 'failed', { message: '教練無相關技能,無法開課!' })
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
        const { experience_years, description, profile_image_url, skill_ids } = req.body

        //-- 驗證資料--//
        const errMsg = []
        if (validCheck.isNotInteger(experience_years)) errMsg.push('教練年資必須是整數')
        if (validCheck.isNotString(description)) errMsg.push('教練簡介為必填')

        for (let i = 1; i < skill_ids.length; i++) {
            if (validCheck.isNotString(skill_ids[i]) || validCheck.isNotUUID(skill_ids[i])) errMsg.push('專長id錯誤')
            break
        }

        if (profile_image_url) {
            if (validCheck.isNotUrl(profile_image_url)) errMsg.push('請輸入正確的大頭貼網址')
            if (validCheck.isNotPng(profile_image_url) && validCheck.isNotJpg(profile_image_url)) errMsg.push('大頭貼須為.png, .jpg格式')
        }

        if (errMsg.length > 0) {
            resultHeader(res, 400, 'failed', { message: '欄位未填寫正確', info: errMsg })
            return
        }


        // 驗證skill_id是否可用
        const skillRepo = dataSource.getRepository('Skill')
        const findSkill = await skillRepo.find({ where: { id: In(skill_ids) } })

        if (findSkill.length !== skill_ids.length) { // 表示有技能不正確
            resultHeader(res, 400, 'failed', { message: '專長id錯誤' })
            return
        }

        //--取得教練的coachId 以及技能
        const findCoach = await dataSource.getRepository('Coach').findOne({
            where: { user_id: id }, relations: { CoachLinkSkill: true }
        })

        if (!findCoach) {
            resultHeader(res, 400, 'failed', { message: '找不到教練' })
            return
        }

        //--取得教練原本的技能--//
        const existSkillId = []
        const deleteSkillId = []
        findCoach.CoachLinkSkill.forEach(item => {
            existSkillId.push(item.skill_id)
            if (!skill_ids.includes(item.skill_id)) deleteSkillId.push(item.skill_id)
        })

        //--檢查需要刪除的技能是否已經用來開課--//
        const courseRepo = dataSource.getRepository('Course')
        const findCourse = await courseRepo.find({ where: { user_id: id, skill_id: In(deleteSkillId) }, relations: { Skill: true } })

        const canNotdeleteItem = {}
        findCourse.forEach(item => {
            canNotdeleteItem[item.Skill.id] = item.Skill.name
        })

        if (Object.keys(canNotdeleteItem).length > 0) {
            resultHeader(res, 400, 'failed', { message: "已有相關開課資訊的技能，不可刪除!", info: canNotdeleteItem })
            return
        }

        // --需要增加到資料表的技能--//
        const insertSkill = skill_ids.filter((id) => !existSkillId.includes(id));

        const insertData = []
        insertSkill.forEach(item => {
            insertData.push({
                coach_id: findCoach.id,
                skill_id: item
            })
        })

        // 使用交易更新2個資料表
        let resData
        const queryRunner = dataSource.createQueryRunner()
        await queryRunner.connect()
        await queryRunner.startTransaction()

        try {

            await queryRunner.manager.update(Coach, {
                id: findCoach.id,
            }, {
                experience_years: experience_years,
                description: description,
                profile_image_url: profile_image_url,
            })

            // 刪除不在選擇裡的技能id
            if (skill_ids.length) {
                await queryRunner.manager.delete(CoachLinkSkill, { coach_id: findCoach.id, skill_id: Not(In(skill_ids)) })
            }

            //增加沒有選到的技能id
            if (insertData.length) {
                await queryRunner.manager.insert(CoachLinkSkill, insertData);
            }
            await queryRunner.commitTransaction()

            const savedCoach = await dataSource.getRepository('Coach').findOne({
                where: { id: findCoach.id }, relations: { CoachLinkSkill: true }
            })
            const coachSkillId = []
            savedCoach.CoachLinkSkill.forEach(item => {
                coachSkillId.push(item.skill_id)
            })
            resData = {
                experience_years: savedCoach.experience_years,
                description: savedCoach.description,
                profile_image_url: savedCoach.profile_image_url,
                skills: coachSkillId

            }

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
        logger.error()
        next(error)
    }
}

// 取得教練自己的詳細資料 [isCoach]
async function getCoachSelfDetail(req, res, next) {
    try {
        const { id } = req.user

        //--取得教練的coachId 以及技能
        const findCoach = await dataSource.getRepository('Coach').findOne({
            where: { user_id: id }, relations: { CoachLinkSkill: true }
        })

        if (!findCoach) {
            resultHeader(res, 400, 'failed', { message: '找不到教練' })
            return
        }

        const coachSkillId = []
        findCoach.CoachLinkSkill.forEach(item => {
            coachSkillId.push(item.skill_id)
        })

        const resData = {
            id: findCoach.id,
            experience_years: findCoach.experience_years,
            description: findCoach.description,
            profile_image_url: findCoach.profile_image_url,
            skill_ids: coachSkillId
        }

        resultHeader(res, 200, 'success', { data: resData })


    } catch (error) {
        logger.error()
        next(error)
    }
}

// 取得教練自己的月營收資料 [isCoach] api/admin/coaches/revenue/:year??month=
async function getCoachSelfRevenue(req, res, next) {
    try {
        const monthNames = [
            'january', 'february', 'march', 'april', 'may', 'june', 'july', 'august',
            'september', 'october', 'november', 'december'
        ];

        const total = {
            participants: 0,
            revenue: 0,
            course_count: 0
        }

        const { id } = req.user
        const year = req.params.year || new Date().getUTCFullYear()
        const monthStr = req.query.month.toLowerCase() || monthNames[new Date().getUTCMonth()]  // 預設本月份
        const monNum = monthNames.indexOf(monthStr) + 1
        const month = monNum.toString().padStart(2, 0)

        if (month < 0) {
            resultHeader(res, 400, 'failed', { message: '欄位未填寫正確' })
            return
        }

        // 計算日期範圍--//
        const base_date = `${year}-${month}-01`
        const fullDateRange = getFormatDateRange(base_date)

        const startDate = new Date(fullDateRange.start)
        const endDate = new Date(fullDateRange.end)

        //--取得符合區間課程ID的集合--//
        const courseRepo = dataSource.getRepository('Course')
        const findCourse = await courseRepo.createQueryBuilder('course')
            .where('course.start_at >= :startDate', { startDate: startDate })
            .andWhere('course.start_at <= :endDate', { endDate: endDate })
            .andWhere('course.end_at >= :startDate', { startDate: startDate })
            .andWhere('course.end_at <= :endDate', { endDate: endDate })
            .andWhere('course.user_id = :user_id', { user_id: id })
            .getMany();
        const courseIds = findCourse.map(item => item.id)

        if (!courseIds.length) {
            resultHeader(res, 200, 'success', { data: { total: total } })
            return
        }

        //--取得本月學員 Booking 數量(堂數)--//
        const courseBookingRepo = dataSource.getRepository('CourseBooking')
        const findCourseBooking = await courseBookingRepo.createQueryBuilder('course_booking')
            .where('course_booking.cancelled_at IS NULL')
            .andWhere('course_booking.course_id IN (:...courseIds)', { courseIds: courseIds })
            .getMany();
        const courseBookingCount = findCourseBooking.length

        //--計算學員數--//   
        //--計算實際開課堂數 (篩選沒有學員)--//    
        const courseBookingUserIds = []
        const activeCourseIds = []
        findCourseBooking.forEach(item => {
            if (!activeCourseIds.includes(item.course_id)) activeCourseIds.push(item.course_id)
            if (!courseBookingUserIds.includes(item.user_id)) courseBookingUserIds.push(item.user_id)
        })


        //--計算單堂課價格--//
        const creditPurchaseRepo = dataSource.getRepository('CreditPurchase')
        const findCreditPurchase = await creditPurchaseRepo.createQueryBuilder('credit_purchase')
            .select('SUM(purchased_credits)', 'total_credit_amount')
            .addSelect('SUM(price_paid)', 'total_price')
            .getRawOne()

        const perCoursePrice = (findCreditPurchase.total_price / findCreditPurchase.total_credit_amount).toFixed(2)

        total.participants = courseBookingUserIds.length
        total.revenue = Math.floor(courseBookingCount * perCoursePrice)
        total.course_count = activeCourseIds.length

        resultHeader(res, 200, 'success', { data: { total: total } })
        return


    } catch (error) {
        logger.error()
        next(error)
    }
}

// Firebase 圖片上傳
async function uploadSingle(req, res, next){
    try {
        
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