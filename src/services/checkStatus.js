
function checkStatus(res) {
    if (res.ok) { // res.status >= 200 && res.status < 300
        return res;
    } else {
        console.log("Error - " + res.text())
        throw Error(res.statusText);
    }
}

module.exports = checkStatus
