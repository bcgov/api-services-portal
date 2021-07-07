FROM cypress/base:12.19.0

WORKDIR /app

COPY cypress.json /app
COPY tsconfig.json /app
COPY package.json /app
COPY package-lock.json /app
ADD cypress /app/cypress

RUN npm install

CMD [ "--config-file", "/app/cypress.json" ]

ENTRYPOINT ["npm", "run", "cy:run"]