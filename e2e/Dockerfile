FROM cypress/included:12.4.0

WORKDIR /e2e

RUN apt-get -y update; apt-get -y install curl

COPY cypress.config.ts /e2e
COPY tsconfig.json /e2e
COPY package.json /e2e
COPY package-lock.json /e2e
COPY entrypoint.sh /tmp
ADD cypress /e2e/cypress

RUN npm install

ENTRYPOINT ["npm", "run", "cy:run:html"]