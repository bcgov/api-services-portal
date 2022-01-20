const fs = require('fs');
const jose = require('node-jose');

describe('Creates an authorization and applies it to a product environment', () => {

  /*
  FS does not work; need to save keys using save state function
  */

  it('Generate keys', () => {
    let keyStore = jose.JWK.createKeyStore()
    keyStore.generate('RSA', 2048, { alg: 'RS256', use: 'sig' }).then((result: any) => {
      fs.writeFileSync('keys.json', JSON.stringify(keyStore.toJSON(true), null, '  '))
      let [key] = keyStore.all({ use: 'sig' })
      console.log(key.toPEM(true))
      console.log(key.toPEM(false))
    })
  })
})
