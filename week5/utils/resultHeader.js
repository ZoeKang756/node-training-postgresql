const resultHeader = {
    code_200:function(res)
    {
        res.status(200).json({
            status : "success"
        })

    },
    code_200_with_data:function(res, data ={})
    {
        res.status(200).json({
            status : "success",
            data: data
        })
    },
    code_400:function(res, message = "欄位未填寫正確")
    {
        res.status(400).json({
            status : "failed",
            message: message
        })
    },
    code_404:function(res, message = "無此網站路由")
    {
        res.status(404).json({
            status : "failed",
            message: message
        })
    },
    code_409:function(res, message = "資料重複"){
        res.status(409).json({
            status : "failed",
            message: message
        })

    },
    code_500:function(res, message = "伺服器錯誤"){
        res.status(500).json({
            status: "error",
            message: message
        })
    }
}

module.exports = resultHeader