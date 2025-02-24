const validCheck = {

    isUndefined: function (value) {
        return value === undefined
    },
    isNotValidString:function (value, max=0) {
        return typeof value !== 'string' || value.trim().length === 0 || value === '' || ( max > 0 && value.trim().length > max) 
    },
    isNotNoSymbolString:function (value) {
        let pattren = /[^0-9a-zA-Z\u4e00-\u9fa5]/
        return !value.test(pattren) || value.trim().length === 0 || value === ''  
    },
    isNotValidInteger:function (value) {
        return typeof value !== 'number' || value < 0 || value % 1 !== 0
    },
    isNotValidNumeric:function (value) {
        return typeof value !== 'number' || value < 0
    },
    isNotValidEmail:function (value) {
       let pattren = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
       return !value.test(pattren) 
    },
    isNotValidUrl:function (value) {
       let pattren = /http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/
       return !value.test(pattren) 
    },
    isNotPng:function (value) {
        let pattren = /(i).png$/
        return !value.test(pattren)
    },
    isNotJpg:function (value) {
        let pattren = /(i).jpg$/
        return !value.test(pattren)
    },
    isNotVaildStrLen:function(value, min =0, max =0){
        return (value.length > max || value.length < min)
    },
    isNotVaildPwd:function(value, pwdPattern){
        return !pwdPattern.test(value)
    }

}

module.exports = validCheck
