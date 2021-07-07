FROM cypress/included:7.6.0

WORKDIR /e2e

COPY cypress.json /e2e
COPY tsconfig.json /e2e
COPY package.json /e2e
COPY package-lock.json /e2e
ADD cypress /e2e/cypress

RUN npm install --production

CMD [ "--config-file", "/e2e/cypress.json" ]

ENTRYPOINT ["npm", "run", "cy:run"]