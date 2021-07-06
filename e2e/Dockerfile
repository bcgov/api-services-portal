FROM cypress/included:7.6.0

COPY cypress.json .
COPY tsconfig.json .
COPY package.json .
COPY package-lock.json .
COPY ./cypress/ cypress

RUN npm ci --production

CMD [ "--config-file", "./cypress.json" ]