
const toArray = function (object, keys) {
    if (object == null) {
        return object
    }
    keys.map(key => {
        const data = object[key]
        if (data == null || typeof(data) === "undefined" || data === "") {
            object[key] = []
        } else {
            try {
                object[key] = JSON.parse(data)
            } catch (err) {
                console.log("ERR Parsing toArray " + data)
            }
        }
    })
    return object
}
export default toArray;