
function checkStatus(res) {
    if (res.ok) { // res.status >= 200 && res.status < 300
        return res;
    } else {
        console.log("Error - ")
        res.text().then(t => {
            console.log("ERROR " + t)
        })
        throw Error(res.statusText);
    }
}

module.exports = checkStatus
