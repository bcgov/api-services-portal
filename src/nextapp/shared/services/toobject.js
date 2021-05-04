
const toObject = function (object, keys) {
    if (object == null) {
        return object
    }
    keys.map(key => {
        const data = object[key]
        if (data == null || typeof(data) === "undefined" || data === "") {
            object[key] = {}
        } else {
            object[key] = JSON.parse(data)
        }
    })
    return object
}
export default toObject;