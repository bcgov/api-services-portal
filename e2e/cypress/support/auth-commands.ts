import * as jwt from 'jsonwebtoken'
import HomePage from '../pageObjects/home'
import LoginPage from '../pageObjects/login'
import request = require('request')
import { method } from 'cypress/types/bluebird'
import { url } from 'inspector'
import { checkElementExists } from '.'

interface formDataRequestOptions {
  method: string
  url: string
}

Cypress.Commands.add('login', (username: string, password: string) => {
  cy.log('< Log in with user ' + username)
  const login = new LoginPage()
  const home = new HomePage()
  cy.get(login.loginButton).click()

  const log = Cypress.log({
    name: 'Login to Dev',
    displayName: 'LOGIN_DEV',
    message: [`🔐 Authenticating | ${username}`],
    autoEnd: false,
  })
  cy.get(login.usernameInput).click().type(username)
  cy.get(login.passwordInput).click().type(password)
  cy.get(login.loginSubmitButton).click()

  if (checkElementExists('.alert')) {
    cy.reload()
    cy.get(login.usernameInput).click().type(username)
    cy.get(login.passwordInput).click().type(password)
    cy.get(login.loginSubmitButton).click()
  }

  log.end()
  cy.get(home.nsDropdown, { timeout: 6000 }).then(($el) => {
    expect($el).to.exist
    expect($el).to.be.visible
    expect($el).contain('No Active Namespace')
  })
  cy.log('> Log in')
})

// Cypress.Commands.add('login', (username: string, password: string) => {
//   cy.log('< Log in with user ' + username)
//   const kcRoot = 'http://keycloak.localtest.me:9080';
//   const kcRealm = 'master';
//   const kcClient = 'aps-portal';
//   const kcRedirectUri = 'http://oauth2proxy.localtest.me:4180/oauth2/callback';
//   const loginPageRequest = {
//     url: `${kcRoot}/auth/realms/${kcRealm}/protocol/openid-connect/auth`,
//     qs: {
//       client_id: kcClient,
//       redirect_uri: kcRedirectUri,
//       state: `${createUUID()}%3A%2Fadmin%2Fsignin`,
//       nonce: createUUID(),
//       response_mode: 'fragment',
//       response_type: 'code',
//       scope: 'openid',
//       approval_prompt: 'force'
//     }
//   };
//   // Open the KC login page, fill in the form with username and password and submit.
//   return cy.request(loginPageRequest)
//     .then(submitLoginForm);
//   ////////////
//   function submitLoginForm(response:any) {
//     const _el = document.createElement('html');
//     _el.innerHTML = response.body;
//     // This should be more strict depending on your login page template.
//     const loginForm = _el.getElementsByTagName('form');
//     const isAlreadyLoggedIn = !loginForm.length;
//     if (isAlreadyLoggedIn) {
//       cy.log('> Already logged in')
//       return;
//     }
//     cy.log('> Log in')
//     return cy.request({
//       form: true,
//       method: 'POST',
//       url: loginForm[0].action,
//       followRedirect: true,
//       body: {
//         username: username,
//         password: password        
//       }
//     });
//   }
//   // Copy-pasted code from KC javascript client. It probably doesn't need to be 
//   // this complicated but I refused to spend time on figuring that out.
//   function createUUID() {
//     var s:any = [];
//     var hexDigits = '0123456789abcdef';
//     for (var i = 0; i < 36; i++) {
//       s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
//     }
//     s[14] = '4';
//     s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);
//     s[8] = s[13] = s[18] = s[23] = '-';
//     var uuid = s.join('');
//     return uuid;
//   }
// })

Cypress.Commands.add('getSession', () => {
  cy.log('< Get Session')
  cy.request({ method: 'GET', url: Cypress.config('baseUrl') + '/admin/session' }).then(
    (res) => {
      cy.wrap(res).as('session')
      expect(res.status).to.eq(200)
      const log = Cypress.log({
        name: 'Session Info',
        displayName: 'SESSION_INFO',
        message: JSON.stringify(res.body),
      })
    }
  )
  cy.log('> Get Session')
})

Cypress.Commands.add('loginByAuthAPI', (username: string, password: string) => {
  const log = Cypress.log({
    displayName: 'AUTH0 LOGIN',
    message: [`🔐 Authenticating | ${username}`],
    autoEnd: false,
  })
  log.snapshot('before')
  cy.request({
    method: 'POST',
    url: Cypress.env('OIDC_ISSUER') + '/protocol/openid-connect/token',
    body: {
      grant_type: 'password',
      username: Cypress.env('DEV_USERNAME'),
      password: Cypress.env('DEV_PASSWORD'),
      Scope: 'openid',
      client_id: Cypress.env('CLIENT_ID'),
      client_secret: Cypress.env('CLIENT_SECRET'),
    },
    form: true,
  }).then(({ body }: any) => {
    const user: any = jwt.decode(body.id_token)
    const userItem = {
      token: body.access_token,
      user: {
        ...user,
      },
    }
    cy.log(JSON.stringify(userItem))
  })
  log.snapshot('after')
  log.end()
})

Cypress.Commands.add('logout', () => {
  cy.log('< Logging out')
  cy.getSession().then(() => {
    cy.get('@session').then((res: any) => {
      cy.get('[data-testid=auth-menu-user]').find("div[role='img']").should('have.attr', 'aria-label', res.body.user.name)
      cy.get('[data-testid=auth-menu-user]').click()
      cy.contains('Sign Out').click()
      cy.removeCookies()
    })
  })
  cy.log('> Logging out')
})

Cypress.Commands.add('getAccessToken', (client_id: string, client_secret: string) => {
  cy.log('< Get Token')
  cy.request({
    method: 'POST',
    url: Cypress.env('TOKEN_URL'),
    body: {
      grant_type: 'client_credentials',
      scope: 'openid',
      client_id,
      client_secret,
    },
    form: true,
  }).then((res) => {
    cy.wrap(res).as('accessTokenResponse')
    expect(res.status).to.eq(200)
  })
  cy.log('> Get Token')
})

Cypress.Commands.add('publishApi', (fileName: string) => {
  cy.log('< Publish API')
  const requestName: string = 'publishAPI'
  cy.fixture('state/store').then((creds: any) => {
    const serviceAcctCreds = JSON.parse(creds.credentials)
    cy.getAccessToken(serviceAcctCreds.clientId, serviceAcctCreds.clientSecret).then(
      () => {
        cy.get('@accessTokenResponse').then((res: any) => {
          const options = {
            method: 'PUT',
            url: Cypress.env('GWA_API_URL') + '/namespaces/platform/gateway',
          }
          formDataRequest(options, res.body.access_token, fileName, requestName)
          cy.wait(`@${requestName}`).then((res: any) => {
            cy.wrap(res.response).as('publishAPIResponse')
          })
        })
      }
    )
  })
})

// Cypress.Commands.add('deleteAllCookies', () => {
//   cy.log("Delete coockie started")
//   var cookies = document.cookie.split(";");
//     for (var i = 0; i < cookies.length; i++) {
//         var cookie = cookies[i];
//         var eqPos = cookie.indexOf("=");
//         var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
//         document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
//     }
//     cy.log("Delete coockie completed")
// })

// Cypress.Commands.add('deleteAllCookies', () => {
//   cy.log("Delete coockie started")
//   var cookies = document.cookie.split("; ");
//   for (var c = 0; c < cookies.length; c++) {
//       var d = window.location.hostname.split(".");
//       while (d.length > 0) {
//           var cookieBase = encodeURIComponent(cookies[c].split(";")[0].split("=")[0]) + '=; expires=Thu, 01-Jan-1970 00:00:01 GMT; domain=' + d.join('.') + ' ;path=';
//           var p = location.pathname.split('/');
//           document.cookie = cookieBase + '/';
//           while (p.length > 0) {
//               document.cookie = cookieBase + p.join('/');
//               p.pop();
//           };
//           d.shift();
//       }
//   }
//   cy.log("Delete coockie completed")
// })

// Cypress.Commands.add('deleteAllCookies', () => {
//   cy.log("Delete coockie started")
//   const cookies = document.cookie.split(";");
//   for (const cookie of cookies) {
//     const eqPos = cookie.indexOf("=");
//     const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
//     document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
//   }
//   cy.log("Delete coockie completed")
// })

Cypress.Commands.add('deleteAllCookies', () => {
  cy.clearCookie('keystone.sid')
  cy.clearCookie('_oauth2_proxy') 
  var cookies = document.cookie.split(";");
  for (var i = 0; i < cookies.length; i++) {
      var cookie = cookies[i];
      var eqPos = cookie.indexOf("=");
      var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
  }
})

const formDataRequest = (
  options: formDataRequestOptions,
  accessToken: string,
  fileName: string,
  requestName: string
) => {
  const data = new FormData()
  data.append('hasHeader', 'true')
  cy.intercept(options.method, options.url)
    .as(requestName)
    .window()
    .then((win) => {
      cy.fixture(fileName, 'binary')
        .then((bin) => Cypress.Blob.binaryStringToBlob(bin))
        .then((blob) => {
          const xhr = new win.XMLHttpRequest()
          data.set('configFile', blob, fileName)
          data.set('dryRun', 'false')
          xhr.open(options.method, options.url)
          xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`)
          xhr.send(data)
        })
    })
}
