module.exports = {
  logLevel: process.env.LOG_LEVEL || 'debug',
  port: process.env.PORT || 3000,
  signupPwdPattern : /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,16}/,
  pwdSaltRounds : 10
}
