FROM node:16.14.2-alpine3.15 AS BUILD

COPY package*.json /app/

WORKDIR /app

RUN npm install

COPY *.js ./

ENTRYPOINT ["node", "index.js"]