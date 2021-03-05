
function checkStatus(res) {
    if (res.ok) { // res.status >= 200 && res.status < 300
        return res;
    } else {
        throw Error(res.statusText);
    }
}

module.exports = checkStatus
