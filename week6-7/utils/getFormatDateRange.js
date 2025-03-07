
const getFormatDateRange = function (dateString, showSecond = true) {

    const base_date = new Date(dateString)

    const first_date = new Date(base_date.getFullYear(), base_date.getMonth(), 1).toLocaleDateString();
    const last_date = new Date(base_date.getFullYear(), base_date.getMonth() + 1, 0).toLocaleDateString();

    const first_date_arr = first_date.split("/")
    const last_date_arr = last_date.split("/")

    const first_date_str = `${first_date_arr[0]}-${first_date_arr[1].toString().padStart(2, 0)}-${first_date_arr[2].toString().padStart(2, 0)}`
    const last_date_str = `${last_date_arr[0]}-${last_date_arr[1].toString().padStart(2, 0)}-${last_date_arr[2].toString().padStart(2, 0)}`

    const first_date_full_str = `${first_date_arr[0]}-${first_date_arr[1].toString().padStart(2, 0)}-${first_date_arr[2].toString().padStart(2, 0)} 00:00:00`
    const last_date_full_str = `${last_date_arr[0]}-${last_date_arr[1].toString().padStart(2, 0)}-${last_date_arr[2].toString().padStart(2, 0)} 23:59:59`

    let result = {}

    if (showSecond) {
        result.start = first_date_full_str
        result.end = last_date_full_str
    }
    else {
        result.start = first_date_str
        result.end = last_date_str
    }

    return result
}



module.exports = getFormatDateRange