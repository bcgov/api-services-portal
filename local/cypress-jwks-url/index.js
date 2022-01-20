const express = require('express');
var fs = require('fs');
var path = require('path');

const app = express();
const port = 3500

app.use(express.urlencoded( {
    extended: true
}));

app.get('/', function(req,res) {
    res.sendFile(path.join(__dirname, 'keys.json'));
})

app.post('/', function(req, res) {
    var body = req.body;
    saveKeyToFile(body, function(err) {
        if (err) {
            res.status(500).json({'error': 'Error saving key'});
            return;
        }
        res.json({'status': 'success', 'body': body})
    })
});

function saveKeyToFile(key, callback) {
    fs.writeFile('./keys.json', JSON.stringify(key), callback);
}

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`)
});