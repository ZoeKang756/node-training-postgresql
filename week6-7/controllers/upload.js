const path = require('path')
const fs = require('fs')
const fs = require('fs')

const { dataSource } = require('../db/data-source')
const config = require('../config/index')
const logger = require('../utils/logger')('UploadController')
const validCheck = require('../utils/validCheck')
const resultHeader = require('../utils/resultHeader');

const formidable = require('formidable')
const firebaseAdmin = require('firebase-admin')

firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(config.get('secret.firebase.serviceAccount')),
    storageBucket: config.get('secret.firebase.storageBucket')
})
const bucket = firebaseAdmin.storage().bucket()

// Firebase 圖片上傳
async function uploadSingle(req, res, next) {
    try {
        const { id } = req.user

        //--檢查使用者--//
        const coachRepo = dataSource.getRepository('Coach')
        const findCoach = await coachRepo.findOne({ where: { user_id: id } })

        if (!findCoach) {
            resultHeader(res, 400, 'failed', { message: '找不到教練' })
            return
        }

        const form = formidable.formidable({
            multiple: false,
            maxFileSize: config.get(web.imageUpload.MAX_FILE_SIZE),
            filter: ({ mimetype }) => {
                return !!config.get(web.imageUpload.ALLOWED_FILE_TYPES)[mimetype]
            }
        })
        const [fields, files] = await form.parse(req)
        const filePath = files.file[0].filepath

        const remoteFilePath = `images/${new Date().toISOString()}-${files.file[0].originalFilename}`

        await bucket.upload(filePath, { destination: remoteFilePath })
        const options = {
            action: 'read',
            expires: Date.now() + 24 * 60 * 60 * 1000
        }
        const [imageUrl] = await bucket.file(remoteFilePath).getSignedUrl(options)

        resultHeader(res, 200, 'success', { data: { image_url: imageUrl } })

    } catch (error) {
        logger.error()
        next(error)
    }
}

// 本地端 圖片上傳
async function LocalUploadSingle(req, res, next) {
    try {
        const { id } = req.user
        const uploadDir = path.join(__dirname,'public/coach');

        //--檢查使用者--//
        const coachRepo = dataSource.getRepository('Coach')
        const findCoach = await coachRepo.findOne({ where: { user_id: id } })

        if (!findCoach) {
            resultHeader(res, 400, 'failed', { message: '找不到教練' })
            return
        }

        const form = formidable.formidable({
            multiple: false,
            maxFileSize: config.get(web.imageUpload.MAX_FILE_SIZE),
            filter: ({ mimetype }) => {
                return !!config.get(web.imageUpload.ALLOWED_FILE_TYPES)[mimetype]
            }
        })
        const [fields, files] = await form.parse(req)
        const filePath = files.file[0].filepath

        const remoteFileName =  `${new Date().toISOString()}-${files.file[0].originalFilename}`
        const remoteFilePath = path.join(uploadDir,`images/${remoteFileName}`)

        fs.rename(filePath, remoteFilePath)

        resultHeader(res, 200, 'success', { data: { image_url: remoteFileName } })

    } catch (error) {
        logger.error()
        next(error)
    }
}

// 圖片網址更新
async function uploadSave(req, res, next) {
    try {
        const { id } = req.user
        const { image_url } = req.body

        const errMsg = []
        if (validCheck.isNotUrl(profile_image_url)) errMsg.push('請輸入正確的大頭貼網址')
        if (validCheck.isNotPng(profile_image_url) && validCheck.isNotJpg(profile_image_url)) errMsg.push('大頭貼須為.png, .jpg格式')

        if (errMsg.length > 0) {
            resultHeader(res, 400, 'failed', { message: '欄位未填寫正確', info: errMsg })
            return
        }

        //--檢查使用者--//
        const coachRepo = dataSource.getRepository('Coach')
        const findCoach = await coachRepo.findOne({ where: { user_id: id } })

        if (!findCoach) {
            resultHeader(res, 400, 'failed', { message: '找不到教練' })
            return
        }

        const result = await coachRepo.update({
            user_id: id
        }, {
            profile_image_url: image_url
        })

        if (!result.affected) {
            resultHeader(res, 400, 'failed', { message: '更新失敗' })
            return
        }

        const findNewCoach = await coachRepo.findOne({ where: { user_id: id } })
        resultHeader(res, 200, 'success', { data: findNewCoach })

    } catch (error) {
        logger.error()
        next(error)
    }
}


module.exports = {
    uploadSingle
}