const resultHeader = function(res, code, status="success", dataObj={}){

   const {message, data, info} = dataObj
   const result = {status:status}

   if(message !== undefined) result.message = message
   if(data !== undefined) result.data = data
   if(info !== undefined) result.info = info

   res.status(code).json(result)
}
module.exports = resultHeader