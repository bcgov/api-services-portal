FROM node:22.12.0-alpine3.21 AS BUILD

COPY package*.json /app/

WORKDIR /app

RUN npm install

COPY *.js ./

ENTRYPOINT ["node", "index.js"]