FROM cypress/included:7.6.0

WORKDIR /e2e

RUN apt-get install curl

COPY cypress.local.json /e2e
COPY tsconfig.json /e2e
COPY package.json /e2e
COPY package-lock.json /e2e
COPY entrypoint.sh /tmp
ADD cypress /e2e/cypress

RUN npm install --production

ENTRYPOINT ["npm", "run", "cy:run:html"]