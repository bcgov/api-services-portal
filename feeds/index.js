const express = require('express')
const fetch = require('node-fetch')
const YAML = require('yaml')
const app = express()
const port = 6000

app.get('/health', (req, res) => {
  res.send('up')
})

app.get('/poke/:entity/:id', (req, res) => {

})

const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`)
})

process.on('SIGINT', () => server.close())
