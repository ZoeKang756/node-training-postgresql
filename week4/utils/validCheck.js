const validCheck = {

    isUndefined: function (value) {
        return value === undefined
    },
    isNotValidString:function (value, max=0) {
        return typeof value !== 'string' || value.trim().length === 0 || value === '' || ( max > 0 && value.trim().length > max) 
    },
    isNotValidInteger:function (value) {
        return typeof value !== 'number' || value < 0 || value % 1 !== 0
    },
    isNotValidNumeric:function (value) {
        return typeof value !== 'number' || value < 0
    }

}

module.exports = validCheck
