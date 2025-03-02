const generateError = require('../utils/generateError');
/*const FORBIDDEN_MESSAGE = '使用者尚未成為教練'
const PERMISSION_DENIED_STATUS_CODE = 401

function generateError (status = PERMISSION_DENIED_STATUS_CODE, message = FORBIDDEN_MESSAGE) {
  const error = new Error(message)
  error.status = status
  return error
}*/

module.exports = (req, res, next) => {
  if (!req.user || req.user.role !== 'COACH') {
    next(generateError.init(generateError.STATUS_CODE.PERMISSION_DENIED, generateError.STATUS_MSG.FORBIDDEN_IS_NOT_COACH))
    return
  }
  next()
}