const { DateUtils } = require("typeorm/util/DateUtils.js")

const validCheck = {

    isUndefined: function (value) {
        return value === undefined
    },
    isNotString:function (value, max=0) {
        return typeof value !== 'string' || value.trim().length === 0 || value === '' || ( max > 0 && value.trim().length > max) 
    },
    isNotNoSymbolString:function (value) 
    {
        let pattren = /^[0-9a-zA-Z\u4e00-\u9fa5]+$/
        return !pattren.test(value) || value.trim().length === 0 || value === ''  
    },
    isNotInteger:function (value) {
        return typeof value !== 'number' || value < 0 || value % 1 !== 0
    },
    isNotNumeric:function (value) {
        return typeof value !== 'number' || value < 0
    },
    isNotEmail:function (value) {
       let pattren = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
       return !pattren.test(value) 
    },
    isNotUrl:function (value) {
       let pattren = /http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/
       return !pattren.test(value) 
    },
    isNotPng:function (value) {
        let pattren = /(i).png$/
        return !pattren.test(value)
    },
    isNotJpg:function (value) {
        let pattren = /(i).jpg$/
        return !pattren.test(value)
    },
    isNotVaildStrLen:function(value, min =0, max =0){
        return (value.length > max || value.length < min)
    },
    isNotPwd:function(value, pwdPattern){
        return !pwdPattern.test(value)
    },
    isNotUUID:function(value) {
        let pattren = /^[0-9a-f]{8}-[0-9a-f]{4}-[4][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
        return !pattren.test(value);
    },
    isNotDateTime:function(value) {
        let pattren = /^(\d{4})(-|\/)(\d{2})\2(\d{2}) (\d{2}):(\d{2}):(\d{2})$/
        let date = new Date(value)
        return !pattren.test(value) || date.toString() === 'Invalid Date' || isNaN(date)     
    }   

}

module.exports = validCheck
