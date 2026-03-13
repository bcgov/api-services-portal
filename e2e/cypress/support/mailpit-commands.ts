// Mailpit API utility commands for email testing
// Mailpit API docs: https://github.com/axllent/mailpit/wiki/API

const MAILPIT_API_URL = 'http://mailpit.localtest.me:8025/api/v1'

export interface MailpitMessage {
  ID: string
  MessageID: string
  Read: boolean
  From: {
    Name: string
    Address: string
  }
  To: Array<{
    Name: string
    Address: string
  }>
  Cc: Array<{
    Name: string
    Address: string
  }>
  Bcc: Array<{
    Name: string
    Address: string
  }>
  ReplyTo: Array<{
    Name: string
    Address: string
  }>
  Subject: string
  Created: string
  Size: number
  Attachments: number
  Snippet: string
}

export interface MailpitMessageSummary {
  total: number
  unread: number
  tagged: number
  messages: MailpitMessage[]
}

export interface MailpitMessageDetails extends MailpitMessage {
  Text: string
  HTML: string
  Headers: Record<string, string[]>
}

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Get all messages from Mailpit inbox
       * @example cy.mailpitGetMessages()
       */
      mailpitGetMessages(): Chainable<MailpitMessageSummary>

      /**
       * Get a specific message by ID
       * @example cy.mailpitGetMessage('message-id')
       */
      mailpitGetMessage(messageId: string): Chainable<MailpitMessageDetails>

      /**
       * Delete all messages from Mailpit inbox
       * @example cy.mailpitDeleteAllMessages()
       */
      mailpitDeleteAllMessages(): Chainable<void>

      /**
       * Search for messages by query
       * @example cy.mailpitSearchMessages('to:user@example.com')
       */
      mailpitSearchMessages(query: string): Chainable<MailpitMessageSummary>

      /**
       * Wait for an email to arrive matching the query
       * @example cy.mailpitWaitForEmail('to:user@example.com', 10000)
       */
      mailpitWaitForEmail(query: string, timeout?: number): Chainable<MailpitMessage>

      /**
       * Assert that an email exists with specific criteria
       * @example cy.mailpitAssertEmail({ to: 'user@example.com', subject: 'Welcome' })
       */
      mailpitAssertEmail(criteria: {
        to?: string
        from?: string
        subject?: string
        contains?: string
      }): Chainable<MailpitMessage>
    }
  }
}

Cypress.Commands.add('mailpitGetMessages', () => {
  cy.request({
    method: 'GET',
    url: `${MAILPIT_API_URL}/messages`,
    headers: {
      Accept: 'application/json',
    },
  }).then((response) => {
    expect(response.status).to.eq(200)
    return response.body as MailpitMessageSummary
  })
})

Cypress.Commands.add('mailpitGetMessage', (messageId: string) => {
  cy.request({
    method: 'GET',
    url: `${MAILPIT_API_URL}/message/${messageId}`,
    headers: {
      Accept: 'application/json',
    },
  }).then((response) => {
    expect(response.status).to.eq(200)
    return response.body as MailpitMessageDetails
  })
})

Cypress.Commands.add('mailpitDeleteAllMessages', () => {
  cy.request({
    method: 'DELETE',
    url: `${MAILPIT_API_URL}/messages`,
  }).then((response) => {
    expect(response.status).to.be.oneOf([200, 204])
  })
})

Cypress.Commands.add('mailpitSearchMessages', (query: string) => {
  cy.request({
    method: 'GET',
    url: `${MAILPIT_API_URL}/search`,
    qs: {
      query: query,
    },
    headers: {
      Accept: 'application/json',
    },
  }).then((response) => {
    expect(response.status).to.eq(200)
    return response.body as MailpitMessageSummary
  })
})

Cypress.Commands.add(
  'mailpitWaitForEmail',
  (query: string, timeout: number = 10000) => {
    const startTime = Date.now()

    const checkForEmail = (): Cypress.Chainable<MailpitMessage> => {
      return cy.mailpitSearchMessages(query).then((result) => {
        if (result.messages.length > 0) {
          return cy.wrap(result.messages[0])
        }

        if (Date.now() - startTime > timeout) {
          throw new Error(
            `Timed out waiting for email matching query: ${query}`
          )
        }

        // Wait 500ms and try again
        return cy.wait(500).then(() => checkForEmail())
      })
    }

    return checkForEmail()
  }
)

Cypress.Commands.add('mailpitAssertEmail', (criteria) => {
  let query = ''

  if (criteria.to) {
    query += `to:${criteria.to} `
  }
  if (criteria.from) {
    query += `from:${criteria.from} `
  }
  if (criteria.subject) {
    query += `subject:"${criteria.subject}" `
  }
  if (criteria.contains) {
    query += `${criteria.contains} `
  }

  query = query.trim()

  return cy.mailpitSearchMessages(query).then((result) => {
    expect(
      result.messages.length,
      `Expected to find email matching: ${JSON.stringify(criteria)}`
    ).to.be.greaterThan(0)

    const message = result.messages[0]

    if (criteria.to) {
      const toAddresses = message.To.map((t) => t.Address)
      expect(
        toAddresses,
        `Email should be sent to ${criteria.to}`
      ).to.include(criteria.to)
    }

    if (criteria.from) {
      expect(message.From.Address).to.eq(criteria.from)
    }

    if (criteria.subject) {
      expect(message.Subject).to.include(criteria.subject)
    }

    return cy.wrap(message)
  })
})
