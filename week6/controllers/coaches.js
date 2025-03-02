const config = require('../config/index')
const { dataSource } = require('../db/data-source')
const logger = require('../utils/logger')('CoachController')
const validCheck = require('../utils/validCheck');
const resultHeader = require('../utils/resultHeader');

// LV2 [GET] 取得教練列表：{url}/api/coaches/?per=?page=?word=?可以透過 query string 篩選資料。
async function getCoaches(req, res, next) {

    let pageRow = (parseInt(req.query.per)) || 6 // 預設6筆
    let currentPage = parseInt(req.query.page) || 1 // 預設在第一頁
    let word = req.query.word || ''

    try {

        // 取得目前總共有幾筆資料
        const coachCount = await dataSource.getRepository('Coach')
            .createQueryBuilder('coach')
            .leftJoinAndSelect("coach.User", "user")
            .where("user.name ILIKE :name", { name: '%' + word + '%' })
            .orWhere("coach.description ILIKE :description", { description: '%' + word + '%' })
            .getCount()


        let totalRow = coachCount
        if (pageRow > totalRow) pageRow = totalRow

        const totalPage = Math.ceil(totalRow / pageRow) || 1
        if (currentPage > totalPage) currentPage = totalPage


        const nextPage = (currentPage + 1 > totalPage) ? totalPage : currentPage + 1
        const prevPage = (currentPage - 1 < 1) ? 1 : currentPage - 1


        //--取得指定範圍資料--//
        const allCoaches = await dataSource.getRepository('Coach')
            .createQueryBuilder('coach')
            .leftJoinAndSelect("coach.User", "user")
            .where("user.name ILIKE :name", { name: '%' + word + '%' })
            .orWhere("coach.description ILIKE :description", { description: '%' + word + '%' })
            .orderBy('coach.created_at', 'DESC')
            .skip(currentPage * pageRow - pageRow)
            .take(pageRow)
            .getMany()

        const filterCoaches = []
        allCoaches.forEach((item, i) => {
            filterCoaches.push({
                id: item.id,
                name: item.User.name,
                experience_years: item.experience_years,
                description: item.description,
                profile_image_url: item.profile_image_url,
                created_at: item.created_at,
            })
        })

        resultHeader(res, 200, 'success', {
            data: {
                items: filterCoaches, pagination: {
                    currentPage,
                    totalPage,
                    totalRow,
                    pageRow,
                    nextPage,
                    prevPage
                }
            }
        })

    } catch (error) {
        logger.error()
        next(error)
    }
}

// LV2 [GET] 取得教練列表：{url}/api/coaches/?per=?page=?word=?可以透過 query string 篩選資料。
async function getCoachesV2(req, res, next) {

    let pageRow = (parseInt(req.query.per)) || 6 // 預設6筆
    let currentPage = parseInt(req.query.page) || 1 // 預設在第一頁
    let word = req.query.word || ''

    try {

        // 取得目前的資料
        const coaches = await dataSource.getRepository('Coach').find({
            relations: {
                User: true
            },
        })

        const allCoaches = []
        coaches.forEach((item, i) => {
            allCoaches.push({
                id: item.id,
                name: item.User.name,
                experience_years: item.experience_years,
                description: item.description,
                profile_image_url: item.profile_image_url,
                created_at: item.created_at
            })
        })

        // 比對搜尋資料
        let pattern = new RegExp(word, 'gi')
        const filterCoaches = []

        allCoaches.forEach((coach) => {
            if (word && (pattern.test(coach.description) || pattern.test(coach.name)) || !word) filterCoaches.push(coach)
        })

        let totalRow = filterCoaches.length
        if (pageRow > totalRow) pageRow = totalRow

        const totalPage = Math.ceil(totalRow / pageRow) || 1
        if (currentPage > totalPage) currentPage = totalPage

        // 計算資料索引範圍
        const minIndex = (currentPage * pageRow) - pageRow + 1
        const maxIndex = (currentPage * pageRow)

        const nextPage = (currentPage + 1 > totalPage) ? totalPage : currentPage + 1
        const prevPage = (currentPage - 1 < 1) ? 1 : currentPage - 1

        const showItem = []
        filterCoaches.forEach((item, i) => {
            let index = i + 1
            if (index >= minIndex && index <= maxIndex) {
                showItem.push(item)
            }
        })

        resultHeader(res, 200, 'success', {
            data: {
                items: showItem, pagination: {
                    currentPage,
                    totalPage,
                    totalRow,
                    pageRow,
                    nextPage,
                    prevPage
                }
            }
        })

    } catch (error) {
        logger.error()
        next(error)
    }

}

// LV2 [GET] 取得教練詳細資訊：{url}/api/coaches/:coachId
async function getCoachDetail(req, res, next) {
    const coachId = req.params.coachId
    if (validCheck.isNotUUID(coachId)) {
        resultHeader(res, 400, 'failed', { message: "欄位未填寫正確" })
        return
    }

    try {

        //--取得使用者資料--//
        const getCoach = await dataSource.getRepository('Coach')
            .createQueryBuilder('coach')
            .leftJoinAndSelect("coach.User", "user")
            .where("coach.id = :coachId", { coachId: coachId })
            .getOne()

        if (!getCoach) {
            resultHeader(res, 400, 'failed', { message: "使用者不存在" })
            return
        }


        const coachData = {}

        coachData.user = {
            name: getCoach.User.name,
            role: getCoach.User.role,
        }

        coachData.coach = {
            id: getCoach.id,
            user_id: getCoach.user_id,
            experience_years: getCoach.experience_years,
            description: getCoach.description,
            profile_image_url: getCoach.profile_image_url,
            created_at: getCoach.created_at,
            updated_at: getCoach.updated_at
        }

        resultHeader(res, 200, 'success', { data: coachData })

    } catch (error) {
        logger.error()
        next(error)
    }
}

module.exports = {
    getCoaches,
    getCoachesV2,
    getCoachDetail

}