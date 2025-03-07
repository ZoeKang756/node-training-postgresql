
const { IsNull } = require('typeorm')
const { dataSource } = require('../db/data-source')
const logger = require('../utils/logger')('CourseController')
const validCheck = require('../utils/validCheck')
const resultHeader = require('../utils/resultHeader');

// [POST] 報名課程：{url}/api/courses/:courseId (使用者權限)
async function post(req, res, next) {
    try {
        const { id } = req.user
        const courseId = req.params.courseId

        //--資料驗證--//
        if (validCheck.isNotUUID(courseId)) {
            resultHeader(res, 400, 'failed', { message: '課程id錯誤!' })
            return
        }
        //--檢查是否正確課程id--//
        const courseRepo = dataSource.getRepository('Course')
        const findCourse = await courseRepo.findOne({ where: { id: courseId } })
        if (!findCourse) {
            resultHeader(res, 400, 'failed', { message: '課程id不存在!' })
            return
        }

        //--檢查課程是否過期--//
        // check status
        const start_date = new Date(findCourse.start_at);
        const end_date = new Date(findCourse.end_at);

        let accept_booking = true

        if (start_date.getTime() < Date.now() && end_date.getTime() > Date.now()) {
            accept_booking = true
        } else if (end_date.getTime() <= Date.now()) {
            accept_booking = false
        }

        if (!accept_booking) {
            resultHeader(res, 400, 'failed', { message: "該課程已經過期，無法報名!" })
            return
        }

        //--檢查是否重複報名--//
        let isExtUserBooking = false

        const courseBookingRepo = dataSource.getRepository('CourseBooking')
        const findCourseBooking = await courseBookingRepo.find({ where: [{ user_id: id, cancelled_at: IsNull() }, { course_id: courseId, cancelled_at: IsNull() }] })
        let userTotalBooking = 0
        let courseTotalBooking = 0

        findCourseBooking.forEach(item => {
            if (item.user_id === id && item.course_id === courseId && item.cancelled_at === null) {
                isExtUserBooking = true
            }

            if (item.user_id === id) userTotalBooking++
            if (item.course_id === courseId) courseTotalBooking++
        })


        if (isExtUserBooking) {
            resultHeader(res, 400, 'failed', { message: '已經報名過此課程!' })
            return
        }

        //--驗證可使用堂數--//
        //--取得使用者購買堂數 - 已使用掉的堂數
        const creditPurchaseRepo = dataSource.getRepository('CreditPurchase')
        const totalPurseCreditAmount = await creditPurchaseRepo.sum('purchased_credits', {
            user_id: id
        })

        if (totalPurseCreditAmount <= userTotalBooking) {
            resultHeader(res, 400, 'failed', { message: '已無可使用堂數!' })
            return
        }

        //--檢查最大參加人數--//
        //--取得最大參加人數 - 目前參加人數
        if (findCourse.max_participants <= courseTotalBooking) {
            resultHeader(res, 400, 'failed', { message: '已達最大參加人數，無法參加!' })
            return
        }

        //--新增報名資料--//
        const newCourseBooking = courseBookingRepo.create({
            user_id: id,
            course_id: courseId,
        })
        const saveResult = courseBookingRepo.save(newCourseBooking)
        resultHeader(res, 201, 'success', { data: null })


    } catch (error) {
        logger.error(error)
        next(error)
    }
}

// [GET] 取得課程列表：{url}/api/courses
async function getAll(req, res, next) {
    try {
        const courseRepo = dataSource.getRepository('Course')
        const findCourses = await courseRepo.find({
            relations: {
                User: true,
                Skill: true
            }
        })

        const coursesData = [];
        findCourses.forEach(item => {
            coursesData.push({
                id: item.id,
                coach_name: item.User.name,
                skill_name: item.Skill.name,
                name: item.name,
                description: item.description,
                start_at: item.start_at,
                end_at: item.end_at,
                max_participants: item.max_participants
            })
        })

        resultHeader(res, 200, 'success', { data: coursesData })

    } catch (error) {
        logger.error(error)
        next(error)
    }
}


// [DELETE] 取消課程：{url}/api/courses/:courseId (使用者權限)
async function deleteCoursesById(req, res, next) {
    try {
        const { id } = req.user
        const courseId = req.params.courseId

        //--資料驗證--//
        if (validCheck.isNotUUID(courseId)) {
            resultHeader(res, 400, 'failed', { message: '課程id錯誤!' })
            return
        }

        //--檢查是否正確課程id--//
        const courseRepo = dataSource.getRepository('Course')
        const findCourse = await courseRepo.findOne({ where: { id: courseId } })
        if (!findCourse) {
            resultHeader(res, 400, 'failed', { message: '課程id不存在!' })
            return
        }

        //--檢查是否有報名--//
        const courseBookingRepo = dataSource.getRepository('CourseBooking')
        const findCourseBooking = await courseBookingRepo.find({ where: { user_id: id, course_id: courseId } })
        let isBooking = false
        let cancelledCount = 0

        findCourseBooking.forEach(item => {
            if (item.user_id === id && item.course_id === courseId) {
                if (item.cancelled_at === null) isBooking = true
                else cancelledCount++
            }
        })

        if (!isBooking) {
            resultHeader(res, 400, 'failed', { message: '您沒有報名該課程!' })
            return
        }
        else if (findCourseBooking.length === cancelledCount) {
            resultHeader(res, 400, 'failed', { message: '相關課程已經取消了!' })
            return
        }

        const delResult = await courseBookingRepo.update({
            user_id: id,
            course_id: courseId,
            cancelled_at: IsNull()
        }, {
            cancelled_at: new Date().toString()
        })

        if (delResult.affected === 0) {
            resultHeader(res, 400, 'failed', { message: '取消失敗' })
            return
        }
        resultHeader(res, 200, 'success', { data: null })

    } catch (error) {
        logger.error(error)
        next(error)
    }
}


module.exports = {
    post,
    getAll,
    deleteCoursesById
}