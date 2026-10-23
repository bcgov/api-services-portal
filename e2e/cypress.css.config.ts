import { defineConfig } from 'cypress'
import { execFileSync } from 'node:child_process'
import { resolve } from 'node:path'

export default defineConfig({
  e2e: {
    specPattern: 'cypress/tests/25-common-sso/*.cy.ts',
    supportFile: false,
    setupNodeEvents(on) {
      on('task', {
        cssContract(input) {
          const output = execFileSync(process.execPath, ['--import', 'tsx', 'test-support/css-contract-harness.ts', JSON.stringify(input)], {
            cwd: resolve(__dirname, '../provisioner-api'),
            encoding: 'utf8',
            env: { ...process.env, ELECTRON_RUN_AS_NODE: '1' },
            timeout: 15000,
          })
          return JSON.parse(output)
        },
      })
    },
  },
  video: false,
})
