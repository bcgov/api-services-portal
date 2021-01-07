const express = require('express')
const session = require('express-session')
const app = express()
const port = 9000

const jwt = require('express-jwt');
const jwksRsa = require('jwks-rsa');

app.set('trust proxy', 1) // trust first proxy

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV == 'production' }
  }))

const jwtCheck = jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: process.env.JWKS_URL
})

app.all('', jwt({ 
    secret: jwtCheck, 
    algorithms: ['RS256'], 
    credentialsRequired: false, 
    requestProperty: 'user', 
    getToken: (req) => ('x-forwarded-access-token' in req.headers) ? req.headers['x-forwarded-access-token'] : null
}))

app.all('', (req, res, next) => {
    if ('user' in req.session && 'user' in req && req.session['user']['sub'] != req['user']['sid']) {
        console.log("Detected different user!  Invalid session")
        req.session.regenerate((err) => {
            req.session.user = req.user
            next()
        })
        return
    }
    if (!('user' in req.session) && 'user' in req) {
        console.log(JSON.stringify(req.user, null, 4))
        console.log("New login, set session")
        req.session.user = req.user
    }
    
    next()
});

app.get('/public', (req, res) => {
    if ('session' in req && 'user' in req.session) {
        res.send(`Unprotected content. Hello ${req.session.user.name} (with email ${req.session.user.email}, username ${req.session.user.preferred_username}) in ${req.session.user.namespace}! <a href="/">Go to protected</a>`)
    } else {
        res.send(`Unprotected content. Anonymous! <a href="/">Signin</a>`)
    }
})

app.get('/', (req, res) => {
    res.send(`Hello ${req.session.user.name} (with email ${req.session.user.email}, username ${req.session.user.preferred_username}) in ${req.session.user.namespace}!  <a href="/oauth2/sign_in">Signout</a>`)
})

app.listen(port, () => {
    console.log(`Listening on port ${port}`)
})

process.on('SIGINT', () => process.exit())