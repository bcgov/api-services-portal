import 'cypress-v10-preserve-cookie'
const YAML = require('yamljs');
const path = require('path');


const listOfCookies = [
  'AUTH_SESSION_ID_LEGACY',
  'KC_RESTART',
  'KEYCLOAK_IDENTITY_LEGACY',
  'KEYCLOAK_LOCALE',
  'KEYCLOAK_REMEMBER_ME',
  'KEYCLOAK_SESSION_LEGACY',
  '_oauth2_proxy',
  '_oauth2_proxy_csrf',
  'keystone.sid',
]

Cypress.Commands.add('preserveCookies', () => {
  cy.log('< Saving Cookies')
  cy.preserveCookieOnce(...listOfCookies)
  Cypress.Cookies.debug(true)
  cy.log('> Saving Cookies')
})

Cypress.Commands.add('preserveCookiesDefaults', () => {
  cy.log('< Saving Cookies as Defaults')
  Cypress.Cookies.defaults({
    preserve: [
      'AUTH_SESSION_ID_LEGACY',
      'KC_RESTART',
      'KEYCLOAK_IDENTITY_LEGACY',
      'KEYCLOAK_LOCALE',
      'KEYCLOAK_LOCALE',
      'KEYCLOAK_SESSION_LEGACY',
      '_oauth2_proxy',
      '_oauth2_proxy_csrf',
      'keystone.sid',
    ],
  })
  Cypress.Cookies.debug(true)
  cy.log('> Saving Cookies')
})

Cypress.Commands.add('saveState', (key: string, value: string, flag?: boolean, isGlobal?: boolean) => {
  cy.log('< Saving State')
  cy.log(key, value)
  let newState
  const keyValue = key.toLowerCase()
  if (isGlobal) {
    let currState: any
    currState = Cypress.env(key)
    // currState[keyValue] = value
    Cypress.env(key, value)
  }
  if (key.includes('>')) {
    let keyItems = key.split('>')
    cy.readFile('cypress/fixtures/state/store.json').then((currState) => {
      let newState = currState
      Cypress._.set(newState, keyItems, value)
      cy.writeFile('cypress/fixtures/state/store.json', newState)
    })
  }
  if (key == 'config.anonymous') {
    cy.readFile('cypress/fixtures/manage-control/kong-plugin-config.json').then(
      (currState) => {
        currState['keyAuth']['config.anonymous'] = value
        cy.writeFile('cypress/fixtures/manage-control/kong-plugin-config.json', currState)
      }
    )
  } else if (flag) {
    cy.readFile('cypress/fixtures/state/regen.json').then((currState) => {
      currState[keyValue] = value
      cy.writeFile('cypress/fixtures/state/regen.json', currState)
    })
  }
  else {
    cy.readFile('cypress/fixtures/state/store.json').then((currState) => {
      currState[keyValue] = value
      cy.writeFile('cypress/fixtures/state/store.json', currState)
    })
  }
  if (key == 'apikey' || key == 'consumernumber') {
    cy.readFile('cypress/fixtures/state/regen.json').then((currState) => {
      currState[keyValue] = value
      cy.writeFile('cypress/fixtures/state/regen.json', currState)
    })
  }

  cy.log('< Saving State')
})

Cypress.Commands.add('getState', (key: string) => {
  if (key.includes('>')) {
    let keyItems = key.split('>')
    cy.readFile('cypress/fixtures/state/store.json').then((state) => {
      return Cypress._.get(state, keyItems)
    })
  } else {
    cy.readFile('cypress/fixtures/state/store.json').then((state) => {
      return state[key]
    })
  }
})

Cypress.Commands.add('resetState', () => {
  cy.readFile('cypress/fixtures/state/store.json').then((currState) => {
    currState = {}
    cy.writeFile('cypress/fixtures/state/store.json', currState)
  })
  cy.log('Test state was reset')
})

Cypress.Commands.add('updateJsonValue', (filePath: string, jsonPath: string, newValue: string, index?: any) => {
  cy.readFile('cypress/fixtures/' + filePath).then(currState => {

    const keys = jsonPath.split('.'); // Split the keyPath using dot notation
    let currentObj = currState;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!currentObj.hasOwnProperty(key) || typeof currentObj[key] !== 'object') {
        return; // If any intermediate key doesn't exist or is not an object, return without updating
      }
      currentObj = currentObj[key];
    }

    const lastKey = keys[keys.length - 1];
    currentObj[lastKey] = newValue;

    cy.writeFile('cypress/fixtures/' + filePath, currState)
  })


})

Cypress.Commands.add('executeCliCommand', (command: string) => {
  cy.exec(command, { timeout: 9000, failOnNonZeroExit: false }).then((response) => {
    return response
  });
})

Cypress.Commands.add('replaceWordInJsonObject', (targetWord: string, replacement: string, fileName: string) => {
  cy.readFile('cypress/fixtures/' + fileName).then((content: any) => {
    let regex = new RegExp(targetWord, 'g');
    let modifiedString = content.replace(regex, replacement);

    let obj = YAML.parse(modifiedString)

    const yamlString = YAML.stringify(obj, 'utf8');
    cy.writeFile('cypress/fixtures/' + fileName, yamlString)
  })

})

Cypress.Commands.add('gwaPublish', (type: string, fileName: string) => {
  cy.exec('gwa publish '+type+' --input ./cypress/fixtures/test_data/'+fileName, { timeout: 3000, failOnNonZeroExit: false }).then((response) => {
    return response
  });
})
// cypress/support/commands.js

Cypress.Commands.add('deleteFileInE2EFolder', (fileName: string) => {
  const currentDirectory = Cypress.config('fileServerFolder'); // Get the current working directory
  const filePath = path.join(currentDirectory, fileName)
  try {
    cy.exec(`rm -f ${filePath}`);
    cy.log(`File '${fileName}' has been deleted from the e2e folder.`);
  } catch (error) {
    cy.log(`Error deleting file '${fileName}' from the e2e folder`);
  }
});

Cypress.Commands.add('addToGlobalList', (item) => {
  cy.readFile('cypress/fixtures/state/scanID.json').then((fileContent) => {
    // Initialize the list if it doesn't exist
    const items = fileContent.items || [];

    // Append the new item to the list
    items.push(item);

    // Create an object with the updated list
    const updatedData = { items };

    // Write the updated object back to the file
    cy.writeFile('cypress/fixtures/state/scanID.json', updatedData);
  });
});

Cypress.Commands.add('replaceWord', (originalString: string, wordToReplace: string, replacementWord: string)=> {
  // Create a regular expression with the 'g' flag for global search
  let replacedString : any
  const regex = new RegExp(wordToReplace, 'g');

  // Use the 'replace()' method to replace all occurrences of the word
  replacedString = originalString.replace(regex, replacementWord);

  return replacedString;
})

Cypress.Commands.add('checkAstraScanResultForVulnerability', () => {
  let aggregatedData = {};
  let existingData: any = [];
  let flag = false
  cy.readFile('cypress/fixtures/state/scanID.json').then((fileContent) => {
    fileContent.items.forEach((item: string) => {
      // Perform an action based on each item in the array
      cy.makeAPIRequestForScanResult(item).then((response) => {
        const newResponse = JSON.parse(JSON.stringify(response.body));
        existingData.push(newResponse);
      });
    });
  }).then(() => {
    cy.writeFile('cypress/fixtures/state/scanResult.json', JSON.stringify(existingData))
    for (var i = 0; i < existingData.length; i++) {
      var jsonObject = existingData[i];
      for (var j = 0; i < jsonObject.length; i++) {
        if (jsonObject[j].hasOwnProperty("impact") &&
          ["High", "Medium"].includes(jsonObject[j]["impact"])) {
          flag = true;
        }
      }
    }
  }).then(()=>{
    if (flag){
      assert.fail("Some of the results have high or medium severity security vulnerabilities. Please check the result file for more details.");
    }
  })
})