import './commands'
import 'cypress-xpath'
import './auth-commands'
import './api-commands'

const addContext = require('mochawesome/addContext')

Cypress.on('test:after:run', (test, runnable) => {
  if (test.state === 'failed') {
    const screenshot = `assets/${Cypress.spec.name}/${runnable.parent.title} -- ${test.title} (failed).png`
    addContext({ test }, screenshot)
  }
})

Cypress.Cookies.defaults({
  preserve: [
    '_oauth2_proxy',
    '_oauth2_proxy_csrf',
    'ab547b670fc5c67e38dbef98822b7c8d',
    'keystone.sid',
  ],
})
