import { defineConfig } from 'cypress'
import { createConnection } from 'node:net'

const haproxySocketHost = process.env.HAPROXY_SOCKET_HOST || '127.0.0.1'
const haproxySocketPort = Number(process.env.HAPROXY_SOCKET_PORT || 9999)

function haproxyCommand(command: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const socket = createConnection({ host: haproxySocketHost, port: haproxySocketPort }, () => {
      socket.write(`${command}\nquit\n`)
    })
    const chunks: Buffer[] = []
    const timer = setTimeout(() => {
      socket.destroy()
      reject(new Error(`HAProxy socket timed out: ${command}`))
    }, 5000)
    socket.on('data', (chunk: Buffer) => chunks.push(chunk))
    socket.on('end', () => {
      clearTimeout(timer)
      const output = Buffer.concat(chunks).toString('utf8')
      if (/no such|unknown command/i.test(output)) {
        reject(new Error(output.trim() || `HAProxy rejected: ${command}`))
        return
      }
      resolve(output)
    })
    socket.on('error', (error) => {
      clearTimeout(timer)
      reject(error)
    })
  })
}

export default defineConfig({
  e2e: {
    setupNodeEvents(on) {
      on('task', {
        haproxyCommand(command: string) {
          return haproxyCommand(command)
        },
      })
    },
    baseUrl: 'http://keycloak.localtest.me:9081',
    specPattern: 'cypress/tests/keycloak-ha/*.cy.ts',
    supportFile: false,
    screenshotOnRunFailure: true,
    screenshotsFolder: 'results/report/assets',
    video: false,
    testIsolation: false,
    watchForFileChanges: false,
    reporter: 'mochawesome',
    reporterOptions: {
      reportDir: 'results',
      html: false,
      json: true,
      overwrite: false,
    },
    chromeWebSecurity: false,
    env: {
      KEYCLOAK_PUBLIC_URL: 'http://keycloak.localtest.me:9081',
      KEYCLOAK_SITE_A_URL: 'http://keycloak-site-a.localtest.me:9081',
      KEYCLOAK_SITE_B_URL: 'http://keycloak-site-b.localtest.me:9081',
      KEYCLOAK_SITE_A_HEALTH: process.env.KEYCLOAK_SITE_A_HEALTH || 'http://127.0.0.1:9001/health/ready',
      KEYCLOAK_SITE_B_HEALTH: process.env.KEYCLOAK_SITE_B_HEALTH || 'http://127.0.0.1:9002/health/ready',
      KEYCLOAK_ISSUER: 'http://keycloak.localtest.me:9081/auth/realms/master',
      // LoadBalancerResource is a JAX-RS resource, so the /auth relative path applies.
      KEYCLOAK_LB_CHECK_PATH: '/auth/lb-check',
    },
    retries: {
      runMode: 0,
      openMode: 0,
    },
  },
})
